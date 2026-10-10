# Dicksharter (Working Title)

A party game about crowdfunding hubris. You show the room a real campaign page
with the money blacked out. Everyone guesses two numbers — how much it has
raised, and how much it is asking for. Then you reveal both.

One HTML file. No build step, no server, no install. Drop it on GitHub Pages
and it works.

---

## How a game goes

1. Save some crowdfunding pages as PDFs (any browser's Print → Save as PDF).
2. Open the page and drop them all in at once. Each file becomes a round: every
   dollar figure gets blacked out and the campaign's own claims get pulled into
   an info card.
3. Click **Work through 2 rounds** and the suite walks you through them one at a
   time, ticking each off as you go. Reorder rounds with the arrows, drop one
   with the ✕, or add more PDFs at any point.
4. The room guesses. You reveal. Somebody is wrong by an order of magnitude.

---

## What it does to a page

It reads the PDF's real text layer, so it knows exactly where every word sits.

- Finds the funding line — `$3,015 pledged of $150,000` — and blacks out both
  figures **everywhere they appear**, including a `$150K` restatement buried in
  the blurb twenty thousand pixels down the page.
- Lays one solid band across the whole stats strip, which takes the progress
  bar with it.
- Flags other amounts that are still readable. A campaign that says
  "costs $400,000, I've put in $250,000" gives away a $150,000 goal by
  subtraction, so it offers to hide those too.
- Cuts the page into slides and switches off the site nav, the legal footer and
  any near-blank slice.
- Pulls out the title, creator, category, location, deadline, reward range, the
  campaign's most quotable claims, and whatever is worth noticing in the risks
  section. Money is scrubbed out of all of it.

Kickstarter, Indiegogo and GoFundMe phrasings are handled. If it can't read the
numbers, you type them in.

### The one thing it cannot do

**It cannot read text inside a picture.** Campaigns routinely print their goal
into their own infographic, and no text-layer tool will ever catch that.

So the blackout editor has a **check images** button that steps through every
picture on the page, and the slide grid tags anything risky: a red `$2` means
two dollar amounts are still readable on that slide, a yellow `img` means it
contains a picture worth a look. Drag a bar over anything incriminating.

---

## The game master suite

Click **Edit slides** on any round.

| | |
|---|---|
| Click a slide | Drops it from the round |
| `‹` `›` | Moves it earlier or later |
| Right panel | Ticks what the crew sees — pitch, each fact, each claim, each flag, each photo |
| Top bar | Title and both answers, editable |
| Blackout… | The bar editor |
| Preview | Jumps straight into play |

**Download slides** writes one PNG per shown slide, in order, plus a separate
answer key. They drop straight into PowerPoint if you'd rather present there.

---

## Playing

Keyboard: `←` `→` slides · `R` reveal · `I` info card · `N` next round.

Phones can play along in two ways.

### Offline — nothing to set up

Click **Get the join code**, send it to everyone. Each phone keeps its own
guesses and scores itself when you reveal. Works with no internet beyond the
page itself.

### Live — everyone's phone, in real time

Everyone guesses on their phone while the TV shows the slides. The TV shows a
quiet `3/8 in` tally in the corner so you know when the room is ready.

**It is already set up.** A database is baked into the app, so there is nothing
to configure: click **Live play…**, then **Open a room**, and read the
four-letter code out to the room. Players just tap **Join a game** and type it.

If you want to point it at your own database instead, there is a URL field in
that same panel. Create a project at <https://console.firebase.google.com>, add
a **Realtime Database** (not Firestore), paste
[`firebase-rules.json`](firebase-rules.json) into its Rules tab, and put the
database URL in the field. Leaving the field empty returns to the built-in one.

No SDK and no API key — the app talks to Firebase over plain REST, writing with
`fetch` and reading with an `EventSource`. That is why there is nothing to
build and nothing to install.

**On the rules:** they let anyone read and write under `/games/<code>`. That is
deliberate — your friends' phones aren't signed into your Google account. The
answers are never written to the database until the moment you reveal them, so
a player poking at the raw data finds names and guesses and nothing worth
cheating with. Don't reuse this database for anything that matters.

The free Spark tier is far more than a party needs. If you want to be tidy,
delete old games from the Firebase console now and then.

---

## Hosting it

GitHub Pages: **Settings → Pages → Source: deploy from branch → `main` / root**.
It'll be at `https://<you>.github.io/dicksharter/`.

Anything that serves a static file works just as well — Netlify, a USB stick,
opening the file off your desktop. The only requirement for live play is that
every phone can reach the same URL.

---

## Built with

Nothing, really. [PDF.js](https://mozilla.github.io/pdf.js/) from a CDN does the
PDF reading. Everything else is one file of plain HTML, CSS and JavaScript.

MIT licensed.
