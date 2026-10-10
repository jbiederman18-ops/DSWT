/* Dicksharter push relay — a Cloudflare Worker.

   When a host opens a room for a crew, the site POSTs /notify. This worker
   checks Firebase that the crew really has that game going live right now,
   then sends a Web Push notification to every phone that turned on Alerts.

   Pushes must be signed with a private key (VAPID), which can't live in a
   public web page — that's the only reason this exists.

   Setup (dashboard only, no command line):
     1. Paste this file into a new Worker and Deploy.
     2. Open <worker url>/setup and copy the key it shows.
     3. Worker → Settings → Variables and Secrets → add a Secret named
        VAPID_JWK, paste the key, Deploy.
   Optional variable DB_URL points it at a different Firebase database.

   Endpoints:
     GET  /key     public key the site subscribes with
     GET  /setup   one-time key generator (refuses once VAPID_JWK is set)
     POST /notify  {crew, room, from, site}
*/
const DEFAULT_DB = "https://dswt-eff47-default-rtdb.firebaseio.com";
const SUBJECT = "https://github.com/jbiederman18-ops/DSWT";
const LIVE_WINDOW = 10 * 60 * 1000;   // only announce a game opened in the last 10 minutes
const MIN_GAP = 3 * 60 * 1000;        // and not more often than this per crew

const enc = new TextEncoder();
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type"
};

function b64u(bytes){
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64u(s){
  s = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function concat(...parts){
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let k = 0;
  for (const p of parts){ out.set(p, k); k += p.length; }
  return out;
}
async function hmac(key, data){
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

/* the public half, as browsers want it: 0x04 || x || y, base64url */
function publicKey(jwk){ return b64u(concat(new Uint8Array([4]), unb64u(jwk.x), unb64u(jwk.y))); }

/* RFC 8291 + RFC 8188 (aes128gcm), one record */
async function encryptPayload(sub, text){
  const ua = unb64u(sub.keys.p256dh);
  const auth = unb64u(sub.keys.auth);
  const mine = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", mine.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, mine.privateKey, 256));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const prkKey = await hmac(auth, shared);
  const ikm = (await hmac(prkKey, concat(enc.encode("WebPush: info\0"), ua, asPub, new Uint8Array([1])))).slice(0, 32);
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, concat(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, concat(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);

  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key,
                                                         concat(enc.encode(text), new Uint8Array([2]))));
  const head = new Uint8Array(21);
  head.set(salt, 0);
  new DataView(head.buffer).setUint32(16, 4096);
  head[20] = asPub.length;
  return concat(head, asPub, ct);
}

async function vapidHeader(endpoint, jwk){
  const h = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const p = b64u(enc.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: SUBJECT
  })));
  const key = await crypto.subtle.importKey("jwk", { kty: "EC", crv: "P-256", d: jwk.d, x: jwk.x, y: jwk.y },
                                            { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(h + "." + p));
  return "vapid t=" + h + "." + p + "." + b64u(sig) + ", k=" + publicKey(jwk);
}

async function sendPush(sub, text, jwk){
  const body = await encryptPayload(sub, text);
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Authorization": await vapidHeader(sub.endpoint, jwk),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      "TTL": "1800",
      "Urgency": "high"
    },
    body: body
  });
  return res.status;
}

function json(obj, status, extra){
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ "content-type": "application/json" }, CORS, extra) });
}
function text(t, status, type){
  return new Response(t, { status: status || 200, headers: Object.assign({ "content-type": type || "text/plain; charset=utf-8" }, CORS) });
}

async function notify(req, env){
  let b = null;
  try { b = JSON.parse(await req.text()); } catch (e){}
  if (!b) return json({ error: "bad request" }, 400);
  const crew = String(b.crew || ""), room = String(b.room || ""), from = String(b.from || "");
  const site = String(b.site || "");
  if (!/^[A-Z0-9]{6}$/.test(crew) || !/^[A-Z0-9]{4}$/.test(room)) return json({ error: "bad codes" }, 400);
  if (!/^https?:\/\/[^\s"<>#]+$/.test(site)) return json({ error: "bad site" }, 400);

  const db = String(env.DB_URL || DEFAULT_DB).replace(/\/+$/, "");
  const base = db + "/saves/" + crew + "/crew";
  const get = k => fetch(base + "/" + k + ".json").then(r => r.ok ? r.json() : null);
  const [live, sent, subs, meta] = await Promise.all([get("live"), get("pushSent"), get("push"), get("meta")]);

  if (!live || live.room !== room || Date.now() - Number(live.at || 0) > LIVE_WINDOW) return json({ skipped: "that game isn't live" }, 409);
  if (sent && sent.room === room) return json({ skipped: "already announced" });
  if (sent && Date.now() - Number(sent.at || 0) < MIN_GAP) return json({ skipped: "too soon" }, 429);
  await fetch(base + "/pushSent.json", { method: "PUT", body: JSON.stringify({ room: room, at: Date.now() }) });

  const jwk = JSON.parse(env.VAPID_JWK);
  const crewName = String((meta && meta.name) || "Your crew").slice(0, 60);
  const n = Number(live.rounds) || 0;
  const payload = JSON.stringify({
    title: "\u{1F534} " + crewName + " is going live",
    body: "Room " + room + (n ? " · " + n + " campaign" + (n === 1 ? "" : "s") : "") + ". Tap to join.",
    url: site + "#crew=" + crew,
    tag: "ds-live-" + crew
  });

  const out = { sent: 0, gone: 0, failed: 0 };
  await Promise.all(Object.keys(subs || {}).map(async pid => {
    if (pid === from) return;
    const sub = (subs[pid] || {}).sub;
    if (!sub || !sub.endpoint || !sub.keys) return;
    try {
      const status = await sendPush(sub, payload, jwk);
      if (status >= 200 && status < 300) out.sent++;
      else if (status === 404 || status === 410){
        out.gone++;
        await fetch(base + "/push/" + pid + ".json", { method: "DELETE" });
      } else out.failed++;
    } catch (e){ out.failed++; }
  }));
  return json(out);
}

async function setupPage(env){
  if (env.VAPID_JWK) return text("Already set up. Nothing to do here.");
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const j = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const secret = JSON.stringify({ kty: "EC", crv: "P-256", d: j.d, x: j.x, y: j.y });
  const html = '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Push setup</title>' +
    '<body style="font:16px/1.5 system-ui,sans-serif;max-width:640px;margin:2rem auto;padding:0 1rem">' +
    '<h1>One step left</h1><p>This key was made just now and isn’t stored anywhere. Copy it, then in Cloudflare open this Worker → ' +
    '<b>Settings → Variables and Secrets → Add</b>. Choose type <b>Secret</b>, name it <code>VAPID_JWK</code>, paste the key, and Deploy.</p>' +
    '<textarea readonly style="width:100%;height:8rem;font:13px monospace" onclick="this.select()">' + secret + '</textarea>' +
    '<p><button onclick="navigator.clipboard.writeText(document.querySelector(\'textarea\').value).then(()=>this.textContent=\'Copied\')">Copy the key</button></p>' +
    '<p style="color:#666">Reloading this page makes a different key. Use whichever one you paste; don’t share it.</p>';
  return text(html, 200, "text/html; charset=utf-8");
}

export default {
  async fetch(req, env){
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (url.pathname === "/setup") return setupPage(env);
    if (url.pathname === "/key"){
      if (!env.VAPID_JWK) return text("not set up yet — visit /setup", 503);
      return text(publicKey(JSON.parse(env.VAPID_JWK)));
    }
    if (url.pathname === "/notify" && req.method === "POST"){
      if (!env.VAPID_JWK) return json({ error: "not set up yet" }, 503);
      return notify(req, env);
    }
    return text("Dicksharter push relay. " + (env.VAPID_JWK ? "Ready." : "Not set up yet — visit /setup."));
  }
};

