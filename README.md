# JoshChat

Group chats for the crew: end-to-end encrypted, with photo themes, reactions,
replies and push alerts, and a party game built in.

The game is **Dicksharter (Working Title)**, about crowdfunding hubris. You show
the room a real campaign page with the money blacked out. Everyone guesses two
numbers — how much it has raised, and how much it is asking for. Then you
reveal both. When someone hosts, every chat they announce it to lights up with
a **Join now** banner (and a push alert). The game tools are one tap away under
**Games**.

**Install it like an app.** On iPhone: open the site in Safari → Share → **Add
to Home Screen**. On Android: Chrome's menu → **Install app** (or **Add to Home
screen**). It opens full screen with its own icon and splash, and that's also
what lets iPhones receive push alerts. Long-press the icon on Android for
shortcuts to your chats, joining a game, or starting one.

One HTML file. No build step, no server, no install. Drop it on GitHub Pages
and it works.

---

## How a game goes

Opening the page gives you the **crew chat** (if you're in one) and four doors: **start a new game**, **load a saved
game** by its six-character code, **join on your phone** if someone else is
hosting, or **host a remote game** for friends who aren't in the room.


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
- Cuts the page into slides at its own natural breaks. It builds an occupancy
  map of every line of text, every picture and every blackout bar, and only
  cuts where there is whitespace — so a slide starts at a heading rather than
  halfway through a sentence, and a picture is never sliced in half. Large
  images get a slide to themselves. Site nav, the legal footer and near-blank
  slices start switched off.
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

The campaign goes up as **one continuous page**: the slides you kept in the
suite, joined top to bottom, filling the width of the screen so it reads from
across the room. Scroll it, zoom into a sentence, and draw on it. When a room is
open, a sidebar on the right shows the room code and everyone who has joined,
ticking each name green the moment they lock in. It never shows guesses or
amounts.

Keyboard: `↑` `↓` scroll a little · `Space` / `Page Down` a screenful · `+` `−`
zoom · `0` fit the width · `Home` `End` · `R` reveal · `I` info card · `N` next
round. The mouse wheel scrolls; Ctrl + wheel (or a trackpad pinch) zooms.

The bar along the bottom has the pens (black, blue, red, green), a
highlighter, an eraser that removes a whole line at a touch, undo (your own last
line) and **Clear** (tap twice). ✋ goes back to moving the page.

**Zooming stays sharp.** Once the page is bigger on screen than the stored
pictures, the TV redraws the part you're looking at straight from the PDF at
the screen's full resolution, 4K included, and paints the blackout bars back
on top before it's shown. Only the TV does this; phones only ever get the
already blacked-out pictures.

**Lines stay for the whole game.** Each campaign keeps its own drawings, so
going back a round brings them back. They're gone when the room closes.

### Drawing on the TV from your phone

1. On the TV, click **📱 Draw from phone** at the top. (It opens a room if one
   isn't open yet.) A six-character code comes up.
2. On your phone, open the game → **Draw on the TV**, and type the code. Or open
   the link shown under the code.

The phone shows the page with the TV's edges marked, so you can see exactly what
the room sees. One finger draws (or moves the page, with ✋); two fingers pinch to
zoom and drag to scroll, whatever tool is picked. **Info**, **Reveal** and
**Next round** at the top run the TV, and it shows how many have locked in.

The phone never gets the answers: it only knows what every player's phone knows,
until the reveal. The code works for 15 minutes and is used up as soon as a phone
connects. **Disconnect** in the same window cuts a phone off.

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

The built-in database is reached through Firebase's own JavaScript SDK, loaded
straight from Google's CDN, so there is still nothing to build and nothing to
install. Everything (every read, write and live listener) shares one
WebSocket. The app used to use plain REST with one `EventSource` per live part
of a chat, but browsers allow only about six connections to one site, and an
open chat needed eight: past six, sending and starting chats waited forever.
A database you point it at yourself is still reached over plain REST.

**Accounts and the rules.** Every phone signs itself in with an anonymous
Firebase account the first time it opens the app; nobody fills anything in.
Chats also need a signed-in account (Google or an email link) and are end-to-end
encrypted: see **Signing in and end-to-end encryption** below.
The rules in [`firebase-rules.json`](firebase-rules.json) use that account to
decide who can do what:

- **A crew's chat, name, members, photos and live game** can only be read by its
  members. The invite link or code only lets someone **ask** to join: their
  request shows up for everyone in the chat as "Sam wants to join · Not now /
  Let in", and nothing is visible to them until someone lets them in. People you
  add from **New chat** (because they're already in another chat with you) go
  straight in. Anyone in a chat can remove someone from **Chat settings →
  People**, and they lose access at once.
- **Messages:** you can only post as yourself, and only edit or delete your own.
  You can react to anything, but only as yourself.
- **Alert subscriptions** can't be read by anyone except the push relay, and
  the relay only alerts people who are still in the chat.
- **Invitations** from **New chat** can be withdrawn by anyone in the chat, and
  removing someone withdraws theirs, so an unused invitation can't be used to
  walk back in.
- **Game rooms** need a signed-in phone, and the code is the key. The room
  belongs to whoever opened it: only the host can start rounds, reveal, score or
  close it, and each player can only write their own name and their own guesses.
- **Photos** must be pictures, and an edited message stays with whoever wrote it.
- **Saved games** need a signed-in phone, and the code is the key, as before. The answers are never written to a room until the moment you
  reveal them, so a player poking at the raw data finds nothing worth cheating
  with.

Sign-in only applies to the built-in database. If you point the app at your own
database, it uses no sign-in, and your database needs open rules.

#### Turning accounts on (once, in this order)

Order matters: the new rules refuse anyone who isn't signed in, so the app has
to be signing people in before the rules go on.

1. **Firebase console → Build → Authentication → Get started → Sign-in method →
   Anonymous → Enable → Save.**
2. **Project settings** (the gear) **→ General → Web API key.** Copy it into
   `FB_API_KEY` near the top of the sign-in section of `index.html` and push to
   GitHub. The key is meant to be public; it only identifies the project.
3. Wait for GitHub Pages to update (a minute or two) and open the app once.
   From then on every phone signs in on its own the next time it opens the app.
   Old messages keep their names, and still count as yours on the phone that
   sent them.
4. If you run the push relay: **Project settings → Service accounts → Generate new
   private key.** In the Worker, paste the latest `push/worker.js`, then add a
   **Secret** named `FIREBASE_SA` holding the whole downloaded file. The relay's
   address should now say "database login set".
5. **Realtime Database → Rules:** paste `firebase-rules.json`, **Publish**.

If something is refused after step 5, paste the previous rules back from the
Rules tab's history; nothing in the database is lost either way.

The free Spark tier is far more than a party needs. If you want to be tidy,
delete old games from the Firebase console now and then.

---

### Remote — friends in other cities

For when nobody is in the same room. There is no TV: every phone shows the
campaign itself, there's a chat running beside it, and the host runs the game
from any phone or laptop without playing.

1. **Build the game on a computer** as usual (PDFs in, blackouts checked,
   answers right).
2. Click **Remote game… → Publish for remote play**. It uploads each round's
   slides and info card and gives you a six-character **host code**. Keep that
   code to yourself — it's the one that unlocks the answers.
3. **Host** from that computer (**Host from this computer**) or from your phone:
   open the page, tap **Host a remote game**, type the host code, then
   **Open a room**.
4. Tap **Share the invite link** and send it to the group. Their phone opens
   straight to the join screen with the room code filled in.

What players get:

- The campaign as one page that follows the host: wherever the host scrolls,
  zooms or draws, every phone goes too. Drag or pinch to look around on your
  own; **Follow the host** snaps back. The info card sits underneath.
- A guess box pinned to the bottom. `150k` and `1.2m` work, and it shows the
  dollar figure as you type. You can change a guess until the reveal.
- A chat (a pull-up sheet on phones, a side column on wider screens) with
  one-tap reactions and an unread badge. The host's round starts and reveals
  drop into the chat as dividers, so the log reads like a game.
- After each reveal: both amounts, your points, and everyone's guesses side by
  side, best first.
- The final standings on every phone at once.

What the host gets: the room code and who's joined, who has locked in, one
big button for whatever comes next (start / reveal / next round / final
results), a round list for jumping around or replaying a round, running
standings, and the same chat. Starting a round opens **the board**: the
campaign with the same pens, highlighter, eraser and zoom as the TV, and a strip
with how many have locked in and Reveal / next round. **‹ Console** goes back.
The answers aren't shown anywhere, the host's screen included, until the
reveal.

If the host's phone dies or the page reloads, **Host a remote game → Rejoin
room** picks the room back up with scores and chat intact. Players who drop off
rejoin with the same code and keep their points.

**Where the data goes:** publishing writes under `/saves`. Each round's slides sit under their own random
code, and a player only ever learns the code for the round being played, never
the host code that holds the answers. A published game is mostly JPEG slides,
roughly 1–3 MB a round. **Close this room** at the end deletes the room, its
chat and its drawings; published decks stay until you delete them from the
Firebase console.

**Drawings and the page view** live under `/boards/<room code>`, apart from the
room, so a pen stroke going up several times a second doesn't wake everything
else. Only the room's host, and phones the TV has let in with a code, can write
there. Codes from the TV sit under `/penkeys`, readable only by someone who
already has the code. **After updating to this version, paste
[`firebase-rules.json`](firebase-rules.json) into the Rules tab again and
Publish**, or the pen and the board will be refused.

### Chats

JoshChat opens to **your chats**: every group you're in, newest first, with
the latest message, how many you haven't read, and a red dot when one of them
has a game live. **Search chats** filters the list. On a laptop the list and the
open chat sit side by side. **Games** at the top goes to the game tools, and
your avatar opens your profile.

- **New chat:** name it (or don't), tick people from your other chats, and
  **Start chat**. They find it at the top of their list and join with one tap.
  You also get an invite link for anyone else; **Join with a code** takes one.
  Either way, someone new asks to join and anyone already in the chat lets them in.
- **Chat settings** (tap the chat's name, or ⓘ): rename it, pick a **theme**
  (Mint, Redacted, Stretch goal, Backer, Grape, Neon, Night) or a **scene**, an
  **icon** (an emoji, initials, or a photo), and **nicknames** for anyone in it.
  **Your photo** turns any picture into the chat's theme: it fills the
  background, the bubbles and buttons take their colours from it, and anyone can
  give the theme a name. Everyone in the chat can change all of this, everyone
  sees the changes, and the chat says who made them. **People** lists everyone
  in the chat, with a button to remove someone. The invite link and code, and
  **Leave chat**, are here too.
- **Look:** tap your avatar → **Look** to choose **Daylight** (always light), **Night Shift** (always dark), or **Auto**, which follows your phone.
- **Scenes** restyle the whole chat (background, header, bubbles, the font
  for names, the send button and the one-tap emoji row):
  - **Ink & Omen:** a cursed notebook with parchment bubbles on dark ruled paper.
  - **Pole Position:** race day, with a checkered header, livery stripes and
    messages that streak in.
  - **Main Event:** an arena with a spotlight, neon corners, ring ropes and
    messages that slam in.
  - **Pep Rally of the Dead:** zombie green against cheer pink.
  - **Family Weekend:** blue velvet and lamplight.
  - **Eugene:** dusk over the ridgelines and downtown's colours.

- **Tap any message** to react (😂 🤑 💀 🙄 🔥 👀 ❤️ 👍), **Reply**, **Copy**, or
  **Edit** / **Delete** your own. Reaction counts show under the bubble; tap a
  pill to add or take back yours, press and hold (or hover) to see who reacted.
  A reply quotes the original; tap the quote to jump to it. Edited messages say
  so, and a deleted one leaves "Message deleted" for everyone.
- **@mentions:** type `@` for a list of the crew. A message that mentions you is
  outlined, and can alert you even when the rest of the chat doesn't.
- **Photos:** the 📷 button. Pictures are shrunk to 1600px before they go up
  (about 150–400 KB each); a small GIF stays animated. Tap one to see it full
  screen.
- **Links** are clickable, and a message can run to 2,000 characters.
- **Who's around:** "Sam is typing…" under the chat, "2 online" at the top, and
  "Seen by …" under your newest message.
- **Real names and nicknames:** everyone has a real name, set once and then
  locked: it comes from your Google account, or you type it once if you signed
  in by email. Your nickname is what people see first, with your real name small
  beside it, so a name change never leaves anyone guessing. Anyone in a chat can
  also give someone a nickname just for that chat (**Chat settings → People**).
- **Profiles:** tap your avatar → **Your profile** sets your nickname, a colour
  and an avatar: an emoji, or a photo of you (the camera button). The profile
  belongs to your account: it's kept in your entry in each of your chats
  (encrypted like everything else), so another phone you sign in on picks it up
  as soon as it opens one of them.
- **Chat photo:** in **Chat settings**, tap the chat's picture at the top (or the
  camera button in the icon row) to choose a photo; tap it again to change it.
- **More than one crew:** **⋯** lists your crews to switch between, and **+ Join
  or start another**. Leaving one takes you to the next.
- **No signal:** the app still opens, a message you send waits with
  "Not sent" and goes by itself when you're back online, even if you closed
  the app in between.
- **Going live:** when you host a remote game, tick **Announce it to the crew**
  (on by default). Everyone in the crew gets a red **Game going live — Join
  now** banner on whatever screen they're on, and one tap puts them in the
  room. The crew chat carries on into the game, so the whole night is one
  conversation, with rounds, reveals and the winner dropped in as dividers. The
  banner clears when the game ends.
- **Push alerts:** the chat list asks once whether to **Turn on** notifications.
  Say yes and that phone gets real notifications for every chat you're in,
  including ones you join later, even with the app closed: new messages, and
  games going live. Tap one and you land in that chat (with **Join now**
  waiting for a game). Each chat's **🔔** bell sets that chat on its own:
  **Every message**, **Only when I'm @mentioned**, **Only games going live**,
  or **Mute this chat** (🔕). A muted chat stays muted, and tapping its bell
  turns it back on. **Turn off notifications for all chats** is at the bottom
  of the same sheet. A busy chat stacks into one notification per chat rather
  than a flood.
  - **Android / computers:** tap **Turn on**, allow notifications. Done.
  - **iPhone (iOS 16.4+):** Apple only allows this for apps on the home
    screen. In Safari the prompt walks you through it: Share → Add to Home
    Screen → open JoshChat from the icon → sign in → tap **Turn on**.
  - Whoever hosts doesn't get pinged by their own game.
- **⋯** shows the crew code and lets you leave.
- **Existing chats after this update:** everyone already in a chat stays in.
  Old invite links still work, but now as a request someone has to approve.

#### Signing in and end-to-end encryption

**Chats need a signed-in account.** Opening the chats asks you to sign in with
**Google** or with a **link sent by email** (no passwords). Signing in links
the account the phone already had, so everyone keeps their place in their
chats; on a new phone, the same sign-in brings back the same chats. Game rooms
don't need an account: anyone with a room code can still play.

**Chats are end-to-end encrypted.** Each phone makes its own private key when
it first signs in; it never leaves that phone's browser. Each chat has a key of
its own, and a copy of it is locked to every member's every phone. Messages,
replies, reactions, photos, names, nicknames, the chat's name, its photo theme
and its picture are all encrypted on the phone before they're sent, so the
database only ever holds scrambled text. Not Firebase, not Google, and not you
as the owner of the database can read them.

- **New members and new phones are unlocked automatically.** Whenever anyone in
  the chat has the app open, their app hands the chat's key to any member phone
  that doesn't have it yet. Until then, the new phone shows "Unlocking this chat
  on this phone".
- **Removing someone** switches the chat to a new key; they can't read anything
  sent after that, even if they somehow got back into the database.
- **Messages from before encryption** are re-encrypted by each person's own app
  the first time they sign in. Messages from someone who never signs in again
  stay as they were.
- **Push alerts** can't show what was said (the relay can't read it), so they say
  "New message" instead.

**What stays readable** in the database, because the app needs it to work:
which accounts are in which chat, when things were sent, colours and which
scene a chat uses, the names of people asking to join (until someone answers),
and game rooms (players' names, guesses, scores) and saved games.

**The one thing to know:** the keys live in phones' browsers. If *every* person
in a chat signs out or clears their browser data at the same time, nobody holds
the key any more and that chat's history can't be read again. As long as one
phone in the chat still has it, everyone else gets unlocked again.

**Turning it on (once, in this order).** Do steps 1–3 before publishing the
rules; once the rules are on, the chats ask everyone to sign in.

1. **Firebase console → Authentication → Sign-in method → Add new provider →
   Email/Password.** Turn on **Email link (passwordless sign-in)** and save.
2. **Same page → Add new provider → Google**, enable it, pick a support email,
   save. Then open Google again, expand **Web SDK configuration**, copy the
   **Web client ID** into `GOOGLE_CLIENT_ID` near the top of the "Accounts"
   section of `index.html`, and push to GitHub. (Leave it empty to offer email
   only.)
3. **Authentication → Settings → Authorized domains → Add domain:**
   `jbiederman18-ops.github.io`. Then in the
   [Google Cloud console](https://console.cloud.google.com/apis/credentials)
   for the same project, open the **Web client (auto created by Google
   Service)** and add `https://jbiederman18-ops.github.io` under **Authorized
   JavaScript origins**.
4. **Realtime Database → Rules:** paste `firebase-rules.json`, **Publish**.

**On iPhone, from the home screen:** an email link opens in Safari, not the
app. The sign-in screen says what to do: press and hold the link in the email,
copy it, and paste it into the app. Google sign-in may also open a separate
window there; email always works.

#### Setting up push alerts (once)

Sending a push needs a private signing key, which can't live in a public web
page, so a tiny free relay does it: [`push/worker.js`](push/worker.js), a
Cloudflare Worker. No credit card, no command line.

1. Make a free account at <https://dash.cloudflare.com>.
2. **Workers & Pages → Create → Create Worker**, name it `dswt-push`,
   **Deploy**.
3. **Edit code**, delete what's there, paste all of `push/worker.js`,
   **Deploy**.
4. Visit `https://dswt-push.<your-subdomain>.workers.dev/setup` and copy the
   key it shows.
5. Back in the Worker: **Settings → Variables and Secrets → Add**, type
   **Secret**, name `VAPID_JWK`, paste the key, **Deploy**.
6. Put the Worker's address in `PUSH_URL` near the top of the push section in
   `index.html` and push to GitHub.

If the app lives anywhere other than `https://jbiederman18-ops.github.io/`, add a
plain variable named `SITE` to the Worker with its address. Alerts only ever
link there, so nobody can use the relay to send the crew somewhere else.

Until step 6 the bell falls back to an in-tab notification on computers, and
the in-app banner works everywhere regardless.

Once accounts are on, the relay also needs its own database login — step 4 of
**Turning accounts on**, above.

The relay only sends when the crew really has a game that opened in the last
ten minutes, announces each game once, and drops subscriptions from phones
that have uninstalled or revoked permission. Subscriptions are stored under
`/saves/<crew code>/crew/push`. A chat someone added you to waits under
`/users/<you>/chats` until you open it.

The chat lives under `/saves/<crew code>/crew`; photos sit beside it under
`crew/media`, so they only download when they scroll into view. The free
Firebase plan holds 1 GB and serves 10 GB a month, which is a few thousand
photos for a group of friends. Opening the chat loads the newest 60 messages; scroll up and earlier ones load
60 at a time, back to the start. The crew's name, members and live game come
in as separate small streams, so the app stays quick however long the history
gets, and phones never download anyone's push subscription.

### Results and the winner

With a live room open, everyone's name sits in a strip across the top of the TV. A name lights up green the moment that phone locks in, and after the reveal each name shows the points it just earned, with a star on whoever was closest.

On the last round the **Next round** button becomes **Final results** (there's also a **Results** button any time). The TV counts the table up from last place, holds on "And the winner is…", then puts the winner's name up in letters you can read from the back of the room. Every phone gets the announcement at the same instant, along with the full table and where that player finished. A tie announces joint winners. Space skips the build-up; **Run the reveal again** does it all over.

### House rules

"Bippity boppity" is banned. Type it — or paste it, or spell it b1ppity-B0PPITY, or try "bibbidi bobbidi" — into any box in the app and the box empties and the screen tells you, in very large red letters, to STOP THAT THIS INSTANT. A name that gets into the room some other way is struck out on the TV and the TV says the same thing.

## Cloud save

Prepare a game on one computer, play it on another. **Cloud save…** uploads the
source PDFs plus every decision you've made — answers, blackout bars, slide
order, what the info card shows — and gives you a six-character code. Enter it
on the other machine and the game comes back exactly as you left it, still
fully editable.

**Restoring in front of people.** Loading a game from the menu raises a
spoiler shield automatically: rounds rebuild without showing their campaign,
title, filename or either amount, the answer fields are masked, and opening the
game master suite asks you to confirm nobody can see the screen. Toggle it with
the **Shield** button. Play itself is unaffected.

It saves the PDFs rather than the rendered slides because that is both smaller
(6.6 MB against 10.3 MB for one campaign) and keeps the game editable, since
rendering is deterministic and lands in the same place on any machine. The
trade-off is that loading re-renders: allow a few seconds a round.

The decisions themselves are about 3 KB per round, so what you are really
uploading is the PDFs.

---

## Hosting it

GitHub Pages: **Settings → Pages → Source: deploy from branch → `main` / root**.
It'll be at `https://<you>.github.io/DSWT/`.

Anything that serves a static file works just as well — Netlify, a USB stick,
opening the file off your desktop. The only requirement for live play is that
every phone can reach the same URL.

---

## Built with

Nothing, really. [PDF.js](https://mozilla.github.io/pdf.js/) from a CDN does the
PDF reading. Everything else is one file of plain HTML, CSS and JavaScript.

MIT licensed.
