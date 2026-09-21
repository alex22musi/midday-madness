# Midday Madness — Weekly Clip Workflow

How clips go from Wednesday's show to the website and socials, the same way every week.
Owner: Alex. Last updated: 2026-09-21.

## -1. Pre-show: the agenda (Tuesday + Wednesday morning)

- Build the show agenda in **Google Docs** before the show; refresh it **morning-of**.
- **Email it to Alex and Sam** ([emails on file]) so both can make edits and prep.
- Keep a copy in `~/workspace/your_files/sports-podcast-agenda/` for the archive.

## 0. Pick the moments (Wednesday after the show)

- Log timestamps in the Clip Log doc while the show is fresh (3–4 candidates).
- Aim for 30–60 second clips with one clear take.
- Give each clip a punchy title (e.g. "Another Ryan Day Choke Job") — the title
  appears on the thumbnail, in the clip itself, and on the website card.

## 1. Thumbnails FIRST (Canva)

Thumbnails are designed **before** the clip is cut, so the clip's look is locked early.

- Canvas: **1080 × 1920** (9:16 vertical).
- Brand: navy `#0a0e1c` background, gold `#e3a83c` accents, podcast logo.
  Source of truth for the logo is the **"M" design in Canva** (page 4, primary badge,
  transparent PNG export) — always re-export from there, never from a screenshot.
- Include the clip title big and readable at phone size.
- Make **2–3 variations per clip**; at least one variation includes the host names
  ("Alex Musicus & Sam Singer").
- Export as JPG, name them `poster1.jpg`, `poster2.jpg`, `poster3.jpg`
  (match the clip number).
- The chosen thumbnail becomes the clip's `poster` on the website.
- Thumbnail style (locked 2026-09-21 from Alex's feedback): byline
  `by Alex Musicus & Sam Singer` sits **below the logo** (not on it), smaller
  size, higher-flare font; logo brightened. A-style direction: navy/gold.
- One **recurring 1080 × 1920 clip background** is used behind every clip
  (Canva export, PNG): `MIDDAY MADNESS` header, clean title space, footer
  `Every Wednesday at 1 PM • WIUX 99.1`, correct M badge.

## 2. Cut the audio

- Export the segment from the full-show recording (keep a few seconds of room tone
  on each end; the renderer trims/pads to the exact `start`/`end`).
- Note exact `start` / `end` timestamps.

## 3. Transcribe with word timings

- Transcribe the segment and produce per-word `start`/`end` timings
  (e.g. `clipN_words.json`: `[{"w": "Ryan", "start": 1.2, "end": 1.5}, …]`).
- **Re-verify every player/coach name** before rendering (past corrections:
  Ryan Day, Caleb Williams, Ben Johnson, Patrick Mahomes, John Mateer).
  Add new names to this list as they appear.

## 4. Configure the render

Edit `clips.json`:

```json
{"file": "clip1.mp4", "title": "Another Ryan Day Choke Job", "start": "10:04", "end": "11:00"}
```

The renderer (`~/workspace/podcast/render_clips_v3.py`) reads `clips.json` plus
`clipN_words.json` and writes `~/workspace/your_files/podcast-clips/clipN.mp4`.

## 5. Render

```bash
cd ~/workspace/podcast
python3 render_clips_v3.py
```

### Render spec (do not change without updating this doc)

- Canvas **1080 × 1920**, 30 fps, H.264 + AAC.
- Background: navy gradient + soft gold radial glow.
- Spinning record: podcast logo as a vinyl record, **one full rotation per 10 s**.
  The logo source is `show-logo-centered.png` (transparent Canva export); the
  renderer crops to the logo's opaque bounding box automatically, so the record
  stays centered even if the art changes. Record hole/spindle drawn at center.
- Persistent header: `MIDDAY MADNESS` (gold) at top.
- Clip title: top of frame in a dark pill with gold outline (**never over the logo**).
- Byline under the title: `by Alex Musicus & Sam Singer`.
- Karaoke captions: two lines max, active word highlighted gold, names verified.
- Waveform: gold bars, bottom third. Footer: `Every Wednesday at 1 PM • WIUX 99.1`.

## 6. Verify

- `ffprobe`: 1080×1920, H.264/AAC, duration matches `clips.json`.
- Spot-check frames: title pill at top (clear of the header), record spinning and
  centered, captions timed, names spelled right.
- Watch once through at 1× before shipping.

## 7. Ship

- **Website**: replace `assets/clipN.mp4` + `assets/posterN.jpg` (one file per commit
  via GitHub web UI for files >10 MB), update titles/durations in `index.html`,
  confirm the live page plays them.
- **Socials**: post the MP4 + thumbnail per the Instagram plan
  (`~/workspace/your_files/midday-madness-instagram-plan.md`).
  Posting cadence (locked 2026-09-21): **college football clips on Fridays and
  Saturdays, NFL clips on Sundays and Mondays.** Website clips section follows
  the same split.
- **Drive**: upload approved finals to the episode folder.
- **Wednesday live mode is automatic**: the site shows a "LIVE SOON" countdown
  12:30–1:00 PM ET and an "ON AIR NOW" takeover 1:00–2:00 PM ET every Wednesday
  (America/Indiana/Indianapolis). No action needed on show day. For no-show weeks
  (breaks/holidays), set `LIVE_OVERRIDE = false` in `index.html`; preview with
  `?preview=live` / `?preview=soon`.

## 8. Roll to next week

- Archive this week's `clipN_words.json` / config, reset `clips.json` for the new show.
- New full episode: replace `assets/full-show.m4a`, update the `.player-title` date
  in `index.html`.
