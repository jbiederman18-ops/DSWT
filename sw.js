/* DS(WT) Crew service worker.
   1. Push alerts.
   2. Opening with no signal: the app's own files are fetched from the network
      first (so it is always the latest version) and only fall back to the copy
      kept here when the network fails. Nothing from the database or any other
      site is cached. */
const SHELL = "dswt-shell-v1";
const OWN = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(OWN)).catch(() => {}));
});
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        /* the database, fonts, PDF.js: untouched */
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const rel = url.pathname.slice(scope.pathname.length);
  const page = req.mode === "navigate";
  if (!page && !OWN.includes(rel)) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res.ok){
        const copy = res.clone();
        caches.open(SHELL).then(c => c.put(page ? "index.html" : req, copy)).catch(() => {});
      }
      return res;
    } catch (err){
      const hit = await caches.match(page ? "index.html" : req, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (err){ d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "DS(WT) Crew", {
    body: d.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: d.tag || "ds-live",
    renotify: true,
    data: { url: d.url || "./" }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  /* only ever open this app: a link to anywhere else in a push is ignored */
  let url = (e.notification.data && e.notification.data.url) || "./";
  try {
    const u = new URL(url, self.registration.scope);
    url = u.origin === self.location.origin ? u.href : self.registration.scope;
  } catch (err){ url = self.registration.scope; }
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins){
      if ("focus" in w){
        try { await w.navigate(url); } catch (err){}
        return w.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
