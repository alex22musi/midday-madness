# Midday Madness Website — Next Phase Plan
**Goal:** All three upgrades live by **Thursday, Nov 19, 2026** (before Thanksgiving break; Fri Nov 20 is travel/buffer only).
**Site:** alex22musi.github.io/midday-madness (repo: github.com/alex22musi/midday-madness)
**Rule that holds throughout:** nothing pushes to main without Alex's approval at each phase checkpoint.

## Where we start (verified Nov 10)
- Clips section is **3 hardcoded cards** in `index.html` (clip1–3.mp4 + posters in `assets/`). No data file — every clip change is a hand edit.
- Episode player plays **only the latest episode** (`assets/full-show.m4a`, 25 MB, swapped each week). No archive, no seek-by-clip.
- The live page is **PUSHED and live** (Nov 10, commits 33a1664 + 10cdde9 + 1332d1c header fix + 2476e4e producer tightening): live.html player, producer console, Supabase backend. Stream chain verified end-to-end Nov 10: TuneIn MP3 relay primary (works around the WIUX HE-AAC stream iPhones can't decode), WIUX stream fallback; time-to-audio <5s, 3-min stability pass, resume jumps to live edge. **Alex's iPhone self-test still outstanding** (real live-fire test: Wed Nov 11 show).
- Episode audio on hand (Drive "Full Episodes", verified Nov 10 6:29 PM): **Sep 16, Sep 23, Oct 7, Nov 4** — four episodes. **Oct 21 + Oct 28: Alex said he added them Nov 10 evening, but a Drive-wide check at 6:29 PM found no trace of them** (upload in progress or landed elsewhere — re-check pending; expected ~77 MB each). **Oct 14 is permanently lost** (recording messed up, per Alex Nov 10). Sep 30 unknown (may not have aired); nothing pre–Sep 16 found anywhere. Episode packs built for Sep 16, Sep 23, Nov 4.

---

## Phase 1 — Clips grid with timestamps and jump-to-moment
**Build: Thu Nov 12 – Fri Nov 13**
**Status Nov 10 (built early, in the `podcast` side chat):** DONE on branch `phase1-preview` (pushed to GitHub, NOT main). Data-driven grid renders 6 cards + Show More → 9; every card has date, duration, blurb, and a "▶ at M:SS in the episode" chip; chips load the right episode audio (new web encodes: Sep 16 / Sep 23 / Nov 4, ~48 kbps mono faststart, ~20 MB each), seek to the exact second, and play; episode picker dropdown in the player; `?ep=&t=` deep links work. Media budgets met: clips 2.1–4.4 MB (720p faststart), posters 67–79 KB. Verified locally via DOM test (grid count, both jumps landed on the exact second) + all 21 assets return 200. NOT visually verified — the cloud browser can't reach the local server and public GitHub CDN mirrors 403 on the media files, so no screenshot pass exists yet. Shipped to main Nov 10 evening at Alex's request and browser-verified live (6→9 cards, jump landed at exactly 12:02 and played). Then tightened the same evening per Alex's mockup picks: P3 stepper episode picker (replaces dropdown), J2 footer-strip jump buttons, compact cards (2-line blurb, hidden on phones), two-up mobile grid, player hint text removed. Mockups page deleted after selection.

1. Create `clips.json` — one entry per clip: title, episode date, **timestamp in the episode (seconds)**, duration, video file, poster.
2. Rebuild the Clips section as a data-driven grid: **9 clips per page** (responsive 3-col desktop / 2-col tablet / 1-col phone), **"Show more"** button loads the next 9.
3. Every card shows: title, episode date, and a **timestamp chip (e.g. "at 32:15")**. Clicking the chip (or a "▶ Hear it in the episode" link) loads that episode in the player, seeks to the timestamp, and plays.
4. Backfill the library: current 3 (Nov 4) + Sep 23 and Sep 16 clips from the Drive Archive folders, using the timestamps already logged in the Clips Log sheet and episode packs. Target: grid launches with 9+ real clips, not 3.
5. Sort: newest first. Clip files keep the existing naming/SOP (Drive folder + Clips Log stay in sync).

**Testing checklist — Phase 1**
- [ ] Grid renders 9 cards, "Show more" reveals the rest, no duplicates or gaps
- [ ] Each card's date and timestamp match the Clips Log sheet
- [ ] Timestamp jump works for at least 3 clips across 2 different episodes (player loads the right episode, lands within ±2 sec of the moment, plays)
- [ ] Videos play inline on iPhone Safari, Android Chrome, desktop Chrome/Safari (playsinline, posters show, no autoplay sound)
- [ ] Page weight sane: videos `preload="metadata"` only — homepage doesn't pull full MP4s on load
- [ ] Layout check at phone width: no side black bars, cards stay 9:16

**Checkpoint 1 (Fri Nov 13):** Alex reviews the grid + one timestamp jump end-to-end before Phase 2 starts.

---

## Phase 2 — Full episode archive (August → now)
**Build: Mon Nov 16 – Tue Nov 17**
**Status Nov 10 (built early):** all 10 episodes wired into the player (2025 six + Sep 16/Sep 23/Oct 7/Nov 4, 2026); P5 picker shipped (Alex's pick); archive presentation built Nov 10 evening — season-grouped rows under the player with EP tiles, numbered titles, descriptions where in data, clip chips, Play buttons. Remaining for full Phase 2 close-out: final descriptions for the 2026 episodes (land with the main-chat recap/title pass), creative title suffixes if Alex picks them, Oct 21/28 episodes IF recordings surface (Drive check from main chat pending), and the Phase 2 testing checklist pass.

1. **Episode inventory — DONE Nov 10:** four episodes verified with audio (Sep 16, Sep 23, Oct 7, Nov 4 in Drive "Full Episodes"); Oct 21 + Oct 28 reportedly added by Alex Nov 10 evening but not yet visible in Drive (re-check pending). Oct 14 permanently lost; Sep 30/pre–Sep 16 none found. The archive launches with what we verifiably have; the rest gets added the moment files actually arrive.
2. Create `episodes.json`: date, **episode title**, 1–2 line description (the week's topics/hooks — the "marketing material"), artwork (episode poster built from the show logo + date/title), audio file, duration, and links to that episode's clips.
3. **Titles:** Muse drafts a specific title per episode from its transcript/topics (e.g. "Hoover on a Short Rope? — Nov 4"), Alex approves or tweaks the full list in one pass before build.
4. Archive UI: an **Episodes** section listing every episode chronologically (newest first, with the full history scrollable back to August). Each row: artwork, title, date, description, duration, Play button, and its clips linked.
5. Player upgrade: the existing custom player becomes the archive player — selecting any episode loads it; supports the Phase 1 timestamp seek and shareable deep links (`?ep=2026-11-04&t=1935`).
6. Audio sizing: episodes standardized to spoken-word bitrate (~20–25 MB each, matching the current file). Running total checked against GitHub Pages limits (~1 GB repo soft cap; we're at ~190 MB now) — if the archive pushes past budget, oldest episodes get a second compression pass before anything is cut.

**Testing checklist — Phase 2**
- [ ] Every episode in the inventory appears exactly once, in correct chronological order, with the right date
- [ ] Each episode plays start-to-finish (spot-check first 30 sec, one mid-point seek, last 30 sec)
- [ ] Titles/descriptions match the approved list word-for-word; no placeholder text anywhere
- [ ] Clip → episode timestamp jumps still work after the player upgrade (regression test Phase 1)
- [ ] Deep link opens the right episode at the right time on a fresh browser
- [ ] Missing-audio episodes are either present (file arrived) or visibly absent from the list — never listed with a dead player
- [ ] Mobile: episode list is scannable, tap targets work, player controls usable one-handed

**Checkpoint 2 (Tue Nov 17):** Alex approves the full episode list + titles as they appear on the staging preview.

---

## Phase 3 — Live WIUX player on the site (no leaving the page)
**Build: Wed Nov 18 (show day — built-in live test) – Thu Nov 19**

1. Promote the local live build into the homepage: during **Wednesdays 1:00–2:00 PM ET**, the site flips to live mode — sticky "ON AIR NOW" banner + live player card at the top; before the show (from midnight Wed) the countdown card shows, with the live player ready.
2. Stream chain: **TuneIn MP3 relay primary** (the iPhone-compatible path), WIUX HE-AAC stream as automatic fallback, and if both fail, an honest message + "Listen on wiux.org" link instead of endless reconnecting. Nobody gets bounced off the site in the normal case — the current "Listen live" button that leaves for wiux.org is replaced by in-page play.
3. Lock screen / Control Center shows Midday Madness artwork + show name (Media Session, already built locally — retest).
4. The funnel Alex wants: live listeners land on the page with the clips grid and episode archive directly below the player — so the live section is placed above/adjacent to Clips, not on an orphan page.
5. Manual override flag stays (holiday/no-show weeks).

**Testing checklist — Phase 3**
- [ ] **Live-fire test during the Wed Nov 18 show (1–2 PM ET):** stream plays in-page on desktop and on Alex's iPhone over cellular (not just Wi-Fi)
- [ ] Play/pause from lock screen works; artwork and show name display correctly
- [ ] Fallback test: with the primary stream blocked, the page falls back or shows the honest message + wiux.org link (no infinite spinner)
- [ ] Live mode turns on at 1:00 PM sharp and off at 2:00 PM; countdown shows correctly that morning; a non-Wednesday visit shows no live UI
- [ ] Listening test: 10 continuous minutes with no drop/rebuffer loop
- [ ] After the show, the same page plays archived episodes and clips normally (no state leaks from live mode)

**Checkpoint 3 / launch (Thu Nov 19):** full-site regression pass (all three checklists), Alex sign-off, push to main, verify live on the real URL, then update Drive + Clips Log per SOP.

---

## Phase 4 — Speed & reliability (Alex's fourth goal, added Nov 10)
**Cross-cutting: built into Phases 1–3, then a dedicated pass Thu Nov 19 before launch. Launch gate: the budgets below must pass, not just the features.**

The headline metric, in Alex's words: **click play → hear audio, as fast as possible** — for clips, episodes, and live. Plus: the page itself must load fast and stay usable on bad Wi-Fi, with no edge-case errors.

**Baseline measured Nov 10 (what we're fixing):**
- Clips are 1080×1920 at ~1.9 Mbps → **13–16 MB per ~50-second clip**. Heavy on bad Wi-Fi.
- Poster images are **274–595 KB each** — several times too big for a thumbnail.
- Full episode is 25 MB (fine-ish for audio, still trimmable). Page shell itself is light (HTML 20 KB, CSS 15 KB) — media is the problem, not the code.

**Performance budgets (the pass/fail numbers):**
- Initial page payload (HTML/CSS/JS/images, before any media plays): **≤ 500 KB**, usable and tappable in **< 3 sec on simulated bad Wi-Fi** (400 kbps / 400 ms latency profile).
- **Time-to-audio after tapping play:** clips **< 1.5 sec**, episodes **< 2 sec**, live **< 3 sec** on a Slow-4G throttle; also spot-checked on a real phone on real Wi-Fi/cellular.
- No media file starts downloading before the user taps play (metadata/posters only).

**How we get there:**
1. **Clip re-encode pipeline (built with Phase 1):** web copies at 720×1280, ~1 Mbps H.264 + AAC, **faststart** (index at the front of the file, so playback starts on the first bytes instead of after a full download), target ≤ 7 MB per clip. The 1080 master stays in Drive per SOP — the site gets the fast copy.
2. **Posters/images:** recompressed to ≤ 80 KB each (resized to card size, quality-tuned); headshots/logo already small, leave alone. Below-the-fold images lazy-load.
3. **Episodes:** standardized spoken-word encode (~48 kbps mono, faststart) → ~18 MB per episode and near-instant start; player fetches nothing until play is tapped.
4. **Live:** stream connects **only on tap** (no pre-loading burn), the audio element is created and cued in advance so the tap goes straight to connecting; honest "connecting…" state within 100 ms of the tap so it never looks dead while it buffers.
5. **Page:** only the first 9 clips exist in the initial DOM (the Phase 1 "Show more" design doubles as the performance design); all videos `preload="metadata"` or less; no new frameworks or external requests added — zero third-party calls on the homepage beyond the stream itself.
6. **Edge-case hardening (no mistakes, no dead ends):** double-tapping play, switching episodes mid-load, seeking before an episode has loaded, locking the phone mid-play, losing Wi-Fi mid-stream (live: auto-reconnect once, then honest message; episodes/clips: resume from position, never restart to 0), and backgrounding the tab. Every failure state shows a human message and a working next step.

**Testing checklist — Phase 4 (all must pass before launch)**
- [ ] Throttled test (Chrome DevTools bad-Wi-Fi profile): page usable < 3 sec, budgets above measured with click→'playing' timing for one clip, one episode, and (Wed Nov 18) the live stream
- [ ] Lighthouse performance run on the homepage; any red metric investigated and either fixed or explicitly accepted by Alex
- [ ] Posters ≤ 80 KB and clip files ≤ 7 MB verified on disk for every item in the grid
- [ ] Nothing auto-downloads media on page load (Network tab: zero MP4/M4A requests before a tap)
- [ ] Edge cases: double-tap play, mid-load episode switch, seek-before-load, phone lock, Wi-Fi drop mid-play — each behaves per #6 above, no console errors
- [ ] Real-device pass on Alex's iPhone: load, tap each player type, confirm time-to-audio feels instant

## Schedule at a glance
| Date | Work |
|---|---|
| Tue Nov 10 | This plan; Alex approves scope |
| Wed Nov 11 | Show day. Episode inventory (have/missing) built; Alex drops missing recordings; Nov 11 episode captured for the pipeline |
| Thu Nov 12 | Phase 1 build (clips.json, grid, show-more) + clip re-encode pipeline (Phase 4) |
| Fri Nov 13 | Phase 1 finish (timestamp seek) + **Checkpoint 1**; episode titles drafted for approval |
| Mon Nov 16 | Phase 2 build (episodes.json, archive UI, audio prep) |
| Tue Nov 17 | Phase 2 finish (player upgrade, deep links) + **Checkpoint 2** |
| Wed Nov 18 | Phase 3 integration; **live test during the show**; fixes that afternoon |
| Thu Nov 19 | Phase 4 performance pass (budgets are a launch gate), final QA, **launch**, verify live, SOP bookkeeping |
| Fri Nov 20 | Buffer only — travel day; critical fixes only |

## Risks & dependencies
- **Missing episode audio is the #1 risk.** Oct 7/14/21/28 and pre-Sep 16 episodes can't be archived until the files reach Muse (Drive/chat upload — SharePoint is a dead end). If some never surface, the archive launches with what exists and backfills later; it does not block Phases 1 or 3.
- **Approvals:** three checkpoints (Nov 13, 17, 19). A slow checkpoint moves launch, not quality — checklists don't get skipped.
- **TuneIn relay is third-party.** If it dies mid-show, fallback + wiux.org link is the safety net; the long-term fix remains asking WIUX engineering for a direct MP3 mount.
- **Repo size:** episodes ~25 MB each × ~14 = ~350 MB plus clips. Within limits, but checked explicitly in Phase 2.

- FULL QA 2026-11-10 (Impeccable + every-page/every-button browser pass): live + producer pages all pass incl. cross-tab reaction sync; homepage passed except a stale 'Jumped to 0:00' banner on manual episode switches, a rapid-switch race, and stale time readouts — all fixed and shipped the same evening. Clip fullscreen could not be verified in the test browser (native controls; check on a real phone). One unreproduced pause quirk. Known cosmetic: the giant ON AIR clock watermark slides under the sticky header on the live page when scrolled.
- QA resolutions (same night, Nov 10): clip fullscreen CONFIRMED working on Alex's iPhone (test-browser sandbox was the blocker — closed). Live-page clock watermark now fades out on scroll (shipped). One-sound-at-a-time guard shipped: any clip/episode starting pauses all other media on the homepage. Listen Live button redesigned per Alex's pick: L2 Live dot (dark pill, gold ring, pulsing dot, no broadcast-arcs icon).
- Phase 2 prep started Nov 10 evening in main chat: all 10 episode recordings (4 from 2026 + Oct 21/28 + four 2025 shows) being encoded to web versions + archive titles/descriptions drafted for Alex's approval. Archive UI + title approval still pending — that's the main remaining build.

---

## Phase 5 — Player upgrade (patterns borrowed from Ryan OS player, reviewed 2026-11-10)

Source: Ryan Goldstein's Ryan OS podcast player (zip shared by Alex 2026-11-10). It's React/Next — nothing drops in as code; the PATTERNS port to our vanilla static site. Ryan's core architecture (one central owner for a single audio element) matches what we already enforce with the one-sound guard on the homepage.

**Borrow (in priority order):**
1. **Persistent mini-player.** Slim bar pinned to the bottom of the viewport (logo art, episode title, play/pause, mini progress + times) that appears once an episode starts and follows the listener while they scroll the clips grid / archive. Tapping it scrolls back to / expands the full player. Fixes our known gap: start an episode, scroll away, lose the controls. Applies to the live stream too (live.html already keeps audio in-page; the bar pattern unifies both).
2. **Resume where you left off.** Save position per episode to localStorage every ~5s while playing; on load, offer/restore position when <90% through. (Ryan's is server-backed; localStorage is the right scope for a public static site.)
3. **Full Media Session for the EPISODE player.** Lock screen / Control Center: artwork + title (already on live page), PLUS position state (lock-screen scrubber) and seek ±10 handlers. Copy Ryan's podcast-media-session.ts logic nearly verbatim (it's framework-free TS).
4. **Loading + error states in the episode player.** Spinner while buffering; specific human messages per failure (network / decode / unsupported format) instead of silent failure. Closes the Phase 4 edge-case item.
5. **Up Next / auto-advance.** When an episode ends, surface (and optionally auto-load) the next episode in the archive order. Depends on Phase 2 archive data (episodes.json ordering). Pairs with the stepper we already have.
6. **Keyboard shortcuts.** Space = play/pause, arrows = seek, only when not typing in a field. Cheap; desktop nicety.

**Explicitly NOT taking:**
- Fake waveform visualizer (random bars, not real audio data) and scrolling title ticker — decoration against the no-helper-fluff direction.
- Popular-podcasts discovery modal + data — Ryan OS feature, not ours.
- React/Next/shadcn/framer-motion stack — patterns only; our site stays zero-framework.
- His full-player modal layout (text at 8-10px, cramped) — we keep our player card; the mini bar + scroll-back covers the need.

**Sequencing:** items 3+4 are independent and can land anytime. Item 1 (mini bar) is the headline build — schedule after Phase 2 archive ships, since the bar + Up Next (5) both feed off the archive data model. Item 2 lands with item 1 (same state owner).

### Phase 5 scoping (Nov 10, 2026)

Architecture note: today's site has two independent players (homepage episode player + live.html stream) plus clip videos, held together by the one-sound guard. Ryan's model centralizes state in one owner. On a multi-page static site the pragmatic equivalent is: one shared player module (live-shared.js) that owns episode playback state + persistence, used by index.html; the live page keeps its own stream logic (different beast: live edge, reconnect) but adopts the same mini-bar UI and media-session code.

| # | Item | Scope | Effort | Depends on | Risk / notes |
|---|------|-------|--------|-----------|--------------|
| 5.3 | Media Session for episode player (lock-screen scrubber + seek actions) | Port podcast-media-session logic into the episode player: metadata on loadEpisode, position state on timeupdate (throttled ~1s), seekto/seekbackward/seekforward handlers | S (~1-2 h) | Nothing | Low. Test on Alex's iPhone (lock screen) during a non-show day |
| 5.4 | Loading + error states in episode player | Spinner/buffering state on the play button, human error line with retry on network/decode/src errors | S (~1 h) | Nothing | Low. Also closes the last Phase 4 edge-case item |
| 5.2 | Resume where you left off | localStorage map date→seconds, save on timeupdate (5s throttle) + pause; restore in loadEpisode when <90% and no explicit seek (clip jumps/deep links always win) | S (~1 h) | Nothing | Low. Must NOT fight the J2 clip-jump seek — explicit seek takes precedence (rule written into the loader) |
| 5.1 | Persistent mini-player (headline) | Fixed bottom bar on index.html: logo thumb, title + sub, play/pause, mini progress; appears after first episode play; tap → scroll to player; dismiss button stops + hides. Live page gets the same bar for the stream in a follow-up | M (~half day incl. device QA) | 5.2 + 5.3 share its state plumbing — build them first or together | Medium: layout collisions (clips grid bottom padding, iOS safe-area), must never cover the ask-a-question UI on live page; one-sound guard already prevents clip/episode overlap |
| 5.5 | Up Next / auto-advance | On episode end: toast/bar prompt "Up next: EP n+1" with Play; NO silent autoplay (data/battery courtesy) — or auto-load paused at 0:00 | S (~1 h) | 5.1 mini bar is the natural surface for the prompt | Low |
| 5.6 | Keyboard shortcuts | Space/arrows on desktop when player on page and not typing | XS (~20 min) | Nothing | Trivial; bundle with 5.3/5.4 |

**Recommended order:** 5.3 + 5.4 + 5.6 in one small commit ("player polish"), then 5.2, then 5.1 + 5.5 together ("mini-player build"). All of it is post-launch-safe: none of it touches the live-show path except the optional live-page mini bar, which should wait until after the Nov 11 live-fire test proves the current live page.

**FADED (Alex, 2026-11-10 ~21:00):** the mini-player idea is dead, superseding the post-Nov 13 timing gate below. Mockups page removed from the live site the same night (commit 60e4c52). 5.1 is in the Backlog as faded; 5.5 (Up Next) is shelved with it — its surface was the bar. Do not revive without Alex bringing it back himself.

**Status 2026-11-10 night:** 5.3 + 5.4 + 5.6 shipped (commit faaee36, jsdom 14/14); 5.2 shipped (commit 5aaa04b, jsdom 6/6 incl. explicit-seek-wins and >90% cases).

**Mini-player mockups (built 2026-11-10, removed same night when the idea was faded):**
- **M1 — Slim bar.** Bottom-pinned thin bar: logo thumb, title + time, play/pause, close; progress as a 2px gold hairline on the bar's top edge. Least screen, least code. Vlad's recommendation (matches Alex's super-simple player rule).
- **M2 — Floating card.** Rounded card floating 10px above the bottom: art, title + season sub, play/pause, close, in-card progress bar + times. Most app-like, biggest thumb target.
- **M3 — Full controls.** Bottom bar with seek slider + −15/+30 skips + times. Never need the full player; tallest, most chrome.
- Shared behavior for whichever wins: appears only after an episode first plays; hides again when the full player is scrolled back into view; tap on non-button area scrolls to the player; close stops playback and hides until the next play; body gets bottom padding while visible so it never covers content; iOS safe-area inset respected; the one-sound guard already keeps clips from colliding. Up Next (5.5) rides on the same bar after the pick.
**Not scoped (explicitly out):** cross-device/server-side resume (needs accounts — no), queue/playlists beyond Up Next, playback speed per-episode memory (could fold into 5.2 cheaply if Alex wants it).

---

## Backlog (parked, not killed)

- **Phase 2 archive presentation (season-grouped episode rows under the player) — PARKED 2026-11-10 (Alex's call).** Built and shipped the same evening (commits dbf8204 + 10bd24c), then pulled down before the Nov 11 show: Alex's words — "put this in backlog, dont have it up tmrw for when people will be on for the episode, dont think I love the centered text" / "fade phase 2 archive for now." The centered text is the specific design problem to fix if it returns (direction: left-aligned rows). Code recoverable from git history (commit dbf8204). NOTE: an initial relay aimed this at the wrong target and briefly took down the P5 picker instead — corrected the same evening; the P5 ALL EPISODES picker (commits 87afa17 + 0c435a7) is Alex-approved ("picker looks good") and stays live.
- **Persistent mini-player (Phase 5.1) + Up Next (5.5) — FADED 2026-11-10 (Alex's call: "no miniplayer actually fade that idea").** Scoped from Ryan Goldstein's Ryan OS player patterns; three mockups (M1 slim bar / M2 floating card / M3 full controls) were built the same evening and then removed from the live site within the hour (commits e1e7164 → 60e4c52) when Alex killed the idea outright rather than just gating it past Nov 13. Up Next (5.5) is shelved with it — the bar was its surface. Do not revive, re-mock, or nudge unless Alex brings it back himself. The polish bundle (5.3/5.4/5.6) and resume (5.2) are unaffected and stay live.
