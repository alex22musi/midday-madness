# Midday Madness — Website

One-page site for **Midday Madness**, IU's midday sports talk show.
Live: https://alex22musi.github.io/midday-madness/

- Show: every Wednesday at 1 PM on WIUX 99.1 FM, Bloomington
- Hosts: [Alex Musicus](https://www.linkedin.com/in/alexander-musicus) & [Sam Singer](https://www.linkedin.com/in/samuelsinger1029)

## Repo layout

```
├── index.html          # page structure: hero, clips, full episode, about, tune-in
├── styles.css          # navy/gold theme + custom audio player
├── assets/
│   ├── logo.jpg        # podcast logo — also favicon + OpenGraph/Twitter share image
│   ├── clip1.mp4 / clip2.mp4 / clip3.mp4   # latest vertical clips (1080×1920)
│   ├── poster1.jpg / poster2.jpg / poster3.jpg  # clip thumbnails (made in Canva)
│   ├── full-show.m4a   # latest full episode audio
│   ├── alex-headshot.jpg / sam-headshot.jpg
└── docs/
    └── CLIP_WORKFLOW.md  # how new clips get made every week
```

## Local preview

```bash
cd /path/to/midday-madness
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages serves the **`main` branch root**. Push/commit to `main` → live in about a minute.

> **Large media files (>10 MB)** — `clipN.mp4`, `full-show.m4a` — must be uploaded
> through the GitHub web UI ("Add file → Upload files"), **one file per commit**.
> Commits with several large files at once get rejected.

## Updating content

- **New clips**: replace `assets/clipN.mp4` and `assets/posterN.jpg`, then update the
  card's `<h3>` title, `.meta` duration, and description in `index.html`.
- **New full episode**: replace `assets/full-show.m4a` and update the `.player-title`
  date in `index.html` (the player reads duration automatically).
- **Logo**: replace `assets/logo.jpg`. It is also the favicon, Apple touch icon,
  and the `og:image` / Twitter card image, so sharing previews update automatically.
  Keep the logo centered in its canvas — an off-center logo looks broken on the
  spinning record in clips and in the player artwork.
- **Bios**: host cards live in the `#about` section of `index.html`.

## Custom audio player

The Full Episode section uses a bespoke player (no native `<audio>` controls),
styled after Apple Podcasts / Spotify:

- **Header row**: show logo artwork + "Latest episode" kicker + episode title/date.
- **Scrubber**: current time / total time with a draggable progress bar and
  buffered indicator (knob appears on hover/focus).
- **Transport**: circular −15s / +30s skip buttons (Apple-style curved-arrow icons
  with the seconds inside) flanking a large gold play/pause button.
- **Tools row**: segmented speed control (1×, 1.25×, 1.5×, 2×) and a volume slider
  (desktop only; hidden on small screens).
- Keyboard: `←`/`→` on the scrubber skip ∓15s.

All player logic lives in the `<script>` at the bottom of `index.html`;
all styling under `/* ---------- full episode ---------- */` in `styles.css`.

## Brand

- Navy `#0a0e1c` / `#10162a`, gold `#e3a83c`, soft gold `#f2c66d`
- Logo wording: orange "MIDDAY", blue "MADNESS"
- Clip rendering spec: see `docs/CLIP_WORKFLOW.md`

## Troubleshooting

- **Page shows old content**: hard refresh (Cmd/Ctrl+Shift+R) — GitHub Pages can
  take ~1 minute and browsers cache aggressively.
- **Clip won't play on the site**: confirm the MP4 is H.264 + AAC
  (`ffprobe assets/clip1.mp4`) and under GitHub's 100 MB file limit.
- **Share preview shows the old logo**: scrapers cache `og:image` — use each
  platform's debugger (e.g. Facebook Sharing Debugger) to re-scrape.
