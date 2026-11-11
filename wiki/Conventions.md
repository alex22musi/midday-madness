# Conventions

Locked decisions — change them only with Alex.

## Episode titles
Format: **`N. Mon D, YYYY Midday Madness`** — e.g. `12. Nov 4, 2026 Midday Madness`. Numbers are sequential in date order. Creative titles, once picked, are *appended* to this format and are a data-only change (no player rebuild). CI enforces the format and numbering.

## Files
- Episodes: `assets/episodes/ep-YYYY-MM-DD.<ext>`
- Clips: `assets/clips/clip-YYYY-MM-DD-slug.mp4` and `.jpg`
- Source recordings: `YYYY-MM-DD — Midday Madness.<ext>`

## Gaps
Oct 14, 2026 has no recording and never will — the archive simply skips it.

## Brand
Navy/gold, podcast logo centered in its canvas (an off-center logo looks broken on the spinning record). Clip byline: `by Alex Musicus & Sam Singer`. Footer: `Every Wednesday at 1 PM • WIUX 99.1`.

## Code rules
- Vanilla JS, no framework.
- Animations on `transform` / `opacity` only.
- Fixed aspect boxes anywhere media loads (zero layout shift).
- Nothing downloads media before a tap.
- Read the Supabase anon key from `live-shared.js` — never from notes or memory (it has been rotated once).

## Collaboration
- One writer per area; pull before you push.
- User-facing design calls are Alex's. Flag with `alex-call`.
- Nothing from the backlog ships until Alex revives it.
