# Midday Madness — Weekly Clip Workflow

How clips go from Wednesday's show to the website and socials, the same way every week.
Owner: Alex. Last updated: 2026-09-21.

## 0. Pick the moments (Wednesday after the show)

- Log timestamps in the Clip Log doc while the show is fresh (3–4 candidates).
- Aim for 30–60 second clips with one clear take.

## 1. Thumbnails FIRST (Canva)

Thumbnails are designed **before** the clip is cut, so the clip's look is locked early.

- Canvas: **1080 × 1920** (9:16 vertical).
- Brand: navy `#0a0e1c` background, gold `#e3a83c` accents, podcast logo.
- Include the clip title big and readable at phone size.
- Make **2–3 variations per clip**; at least one variation includes the host names
  ("Alex Musicus & Sam Singer").
- Export as JPG, name them `poster1.jpg`, `poster2.jpg`, `poster3.jpg`
  (match the clip number).
- The chosen thumbnail becomes the clip's `poster` on the website.

## 2. Cut the audio

- Export the segment from the full-show recording (keep a few seconds of room tone
  on each end; the renderer trims/pads to the exact `start`/`end`).
- Note exact `start` / `end` timestamps.

## 3. Transcribe with word timings

- Transcribe the segment and produce per-word `start`/`end` timings
  (e.g. `clipN_words.json`: `[{"w": "Ryan", "start": 1.2, "end": 1.5}, …]`).
- **Re-verify every player/coach name** before rendering: Ryan Day, Caleb Williams,
  Ben Johnson, Patrick Mahomes, John Mateer, … (add new names as they appear).

## 4. Configure the render

Edit `clips.json`:

```json
{"file": "clip1.mp4", "title": "Another Ryan Day Choke Job", "start": "10:04", "end": "11:00"}
```

## 5. Render

```bash
cd ~/workspace/podcast
python3 render_clips_v3.py
```

Output: `~/workspace/your_files/podcast-clips/clipN.mp4`

### Render spec (do not change without updating this doc)

- Canvas **1080 × 1920**, 30 fps, H.264 + AAC.
- Background: navy gradient + soft gold radial glow.
- Spinning record: podcast logo as a vinyl record, **one full rotation per 10 s**,
  record hole centered between the football and the helmet in the logo art.
- Persistent header: `MIDDAY MADNESS` (gold) at top.
- Clip title: top of frame in a dark pill with gold outline (never over the logo).
- Byline under the title: `by Alex Musicus & Sam Singer`.
- Karaoke captions: two lines max, active word highlighted gold, names verified.
- Waveform: gold bars, bottom third. Footer: `Every Wednesday at 1 PM • WIUX 99.1`.

## 6. Verify

- `ffprobe`: 1080×1920, H.264/AAC, duration matches `clips.json`.
- Spot-check frames: title pill at top, record spinning, captions timed, names spelled right.
- Watch once through at 1× before shipping.

## 7. Ship

- **Website**: replace `assets/clipN.mp4` + `assets/posterN.jpg` (one file per commit
  via GitHub web UI for files >10 MB), update titles/durations in `index.html`,
  confirm the live page plays them.
- **Socials**: post the MP4 + thumbnail per the Instagram plan.
- **Drive**: upload approved finals to the episode folder.

## 8. Roll to next week

- Archive this week's `clipN_words.json` / config, reset `clips.json` for the new show.
- New full episode: replace `assets/full-show.m4a`, update the date in `index.html`.
