# Player and Media Session

## Rules that hold everywhere
- **One-sound guard:** clips and episode audio never play at the same time.
- Nothing downloads media before a tap.
- One-thumb operation; no new visible buttons unless one is removed; no settings screens.

## Clips
Custom controls: center gold play, bottom bar, fullscreen only (picture-in-picture was removed at Alex's request). Each card has a "watch in episode" jump that loads the right episode and seeks to the exact second.

## Episodes
- Custom player (no native `<audio>` controls): artwork, scrubber with buffered indicator, −15s / +30s skips.
- **All Episodes picker**: season-grouped sheet, current row in gold.
- **Resume where you left off:** stored per episode in `localStorage`; ignored past 90% played; clip jumps and `?t=` links always win.
- Keyboard shortcuts, loading and error states.

## Lock screen (Media Session)
Shipped: lock-screen scrubber and ±10s. **Still open (Phase 5):** one consistent lock-screen experience across live, episodes and clips — right title, right artwork, working controls in all three — plus a real-iPhone verification pass.

## Deep links
`?ep=<date>&t=<seconds>` loads an episode at a moment.
