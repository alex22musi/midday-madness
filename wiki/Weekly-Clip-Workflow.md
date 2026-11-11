# Weekly Clip Workflow

Show → clips on the site and socials, the same way every week. Use the **Weekly clips** issue template.

## 1. Pick the moments (Wednesday after the show)
Log 3–4 candidate timestamps while the show is fresh. Aim for 30–60 seconds with one clear take and a punchy title (the title appears on the thumbnail, in the clip, and on the site card).

## 2. Thumbnails first
Designed in Canva **before** the clip is cut, so the look is locked early.
- 1080 × 1920 (9:16), navy `#0a0e1c` + gold `#e3a83c`, podcast logo.
- Byline `by Alex Musicus & Sam Singer` **below** the logo, smaller.
- 2–3 variations per clip; one includes the host names.
- Export JPG; the chosen one becomes the clip poster.

## 3. Cut, caption, render
- Cut the audio; transcribe; fix captions. **Re-verify every player and coach name** before rendering.
- Render spec: 1080×1920, 30 fps, H.264 + AAC; spinning-record logo (one rotation per 10s); gold `MIDDAY MADNESS` header; title in a dark pill at the top (never over the logo); karaoke captions, two lines max; gold waveform in the bottom third.
- Verify with `ffprobe`, spot-check frames, watch once at 1×.

## 4. Web encode
Clips for the site are **720p faststart, ~2–5 MB**; posters **under 150 KB**.

## 5. Ship to the site
- Save as `assets/clips/clip-YYYY-MM-DD-slug.mp4` / `.jpg`.
- Add an entry to `data/clips.json` (`startSec` must match `timestampLabel`).
- Run `node scripts/ci/check-site.cjs`.
- Confirm the "watch in episode" jump lands on the exact second.

## 6. Socials cadence (locked)
College football clips on **Fridays and Saturdays**, NFL clips on **Sundays and Mondays**. The site's clips section follows the same split.

## No-show weeks
Wednesday live mode is automatic. For breaks and holidays set `LIVE_OVERRIDE = false` in `index.html`.
