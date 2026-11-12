# Performance Baseline (Phase 4.1)

**Measured:** Nov 10, 2026 (night) · **Against:** production on GitHub Pages, https://alex22musi.github.io/midday-madness/ (see the host note below) · **Tool:** Lighthouse 12, mobile emulation, simulated throttling (Lighthouse's default Slow-4G profile), headless Chrome, one run per page.

> Single runs on a laptop; treat scores as ±5. Re-run 3x and take the median before judging a change smaller than that.

> **Host.** The numbers in this document were first taken on GitHub Pages. **Vercel (`https://midday-madness.vercel.app/`) is the primary host going forward** (confirmed Nov 11, 2026), so re-measure there before judging a change. A same-day re-run of the home page on both hosts (Wed Nov 11, about 12:50 PM ET, same Lighthouse settings):
>
> | Home | Score | FCP | LCP | CLS | Total transfer | Requests |
> |---|---|---|---|---|---|---|
> | Vercel | 99 | 1.0 s | 2.2 s | 0 | 686 KB | 13 |
> | GitHub Pages | 99 | 1.0 s | 2.0 s | 0 | 601 KB | 13 |
>
> These differ from the Tuesday-night run below (CLS 0 vs 0.057, total transfer 601–686 KB vs 1,038 KB). The cause was not investigated (a deploy in between, the time of day, or ordinary run-to-run variance), so the Tuesday figures stay as the baseline of record. Time-to-audio below was also measured on Pages and should be repeated on Vercel.

## Results

| Metric | Budget | Home (`/`) | Live (`/live.html`) |
|---|---|---|---|
| Performance score | n/a | 93 | 84 |
| Initial payload, HTML/CSS/JS/images (the plan's definition; media excluded) | ≤ 500 KB | ~400 KB (passes) | 113 KB |
| Total transfer incl. media (Lighthouse's number) | n/a | 1,038 KB | 113 KB |
| LCP | usable < 3 s | **3.1 s — OVER** | 2.1 s |
| FCP | n/a | 1.0 s | 1.9 s |
| CLS | ~0 | **0.057** | **0.274 — OVER** |
| TBT | n/a | 0 ms | 0 ms |
| Requests | n/a | 17 | 11 |

### Home payload by type
Image 380 KB · **Media 639 KB** · Stylesheet 6 KB · Document 11 KB · Fetch 3 KB.
No JS file on home (inline script only).

### Live payload by type
Script 55 KB (48 KB is `supabase-js` from jsDelivr, the only third-party call) · Image 38 KB · Stylesheet 9 KB · Document 9 KB.

## Over budget or needs attention — priority list for 4.2 / 4.3 / 4.4

1. **Home downloads 639 KB of media before any tap.** The plan allows metadata-only preload, but the clip mp4s pulled 80–176 KB each, far more than metadata, which competes with the hero logo (LCP) and the posters. The 500 KB budget itself counts HTML/CSS/JS/images only (about 400 KB on home), so it is not over budget on that definition; an earlier version of this doc wrongly said it was.
   - Episode audio: `<audio id="player-audio" preload="metadata" ...>` (`index.html:79`) pulled ~208 KB of the m4a. Metadata-only preload still fetches a lot when the m4a has its index at the end or the server ignores the range; check faststart and consider `preload="none"` plus a hardcoded duration.
   - Clips: ~430 KB of mp4 fetched on load (three clips at 80–176 KB each). The grid renders `preload="none"` with `data-src` (`index.html:624`), but the `IntersectionObserver` (`index.html:~690-697`) assigns `src` and `preload = 'metadata'` to every video within 600 px of the viewport, so the first rows download before any tap. Defer that to tap.
2. **Clip poster images ~74–77 KB each** (380 KB of images on home). Right at the 80 KB target in the plan, but the budget counts all of them; lazy-load below the fold and shrink to card size.
3. **Home LCP 3.1 s** is the hero logo (`img.hero-logo`, 38 KB). It is competing with the media above for bandwidth, so fixing item 1 should move this. Candidates: `fetchpriority="high"` on the logo, and `<link rel="preload">` only if still needed after item 1.
4. **Live CLS 0.274.** The shifting element is the countdown block (`#countdown-wrap`). Reserve its height (fixed min-height / aspect box) so it does not resize when the countdown text or state resolves.
5. **Home CLS 0.057** is under Lighthouse's 0.1 "good" line, but the goal is ~0. Likely clips grid rows rendering in from JS. Handle in 4.4.
6. **Live FCP 1.9 s vs home 1.0 s.** Render path is a render-blocking `supabase-js` script from a CDN (`live.html`). Add `defer` or load it after first paint. Show-critical page, so test playback after any change.

## Time-to-audio (measured Nov 10 night)

**Method:** Playwright/Chromium (desktop, not a phone) against production, CDP network throttle 1.6 Mbps down / 150 ms latency (Lighthouse's Slow-4G), cache disabled. Timer starts at the tap (`click()` on the play button) and stops at the media element's `playing` event. 3 trials each.

| Case | Budget | Result | Verdict |
|---|---|---|---|
| Clip, tap ~0.3 s after DOMContentLoaded (first card) | < 1.5 s | **3.2 s, 4.5 s, 5.4 s** | **OVER** |
| Episode, tap ~0.3 s after DOMContentLoaded | < 2 s | 0.87 s, 0.89 s, 0.89 s | Pass |
| Clip, tap after the page has settled (~3 s) | < 1.5 s | ~0 s in 2 of 3 trials (already buffered); 2.9 s in the third (video not loaded yet) | Inconsistent |
| Episode, tap after the page has settled | < 2 s | ~0 s in 3 of 3 (already buffered) | Pass |
| Live | < 3 s | not measured | See below |

How to read this:
- **The page's pre-tap downloading is what makes "settled" taps look instant.** The settled-episode result is fast only because `preload="metadata"` has already pulled the start of the file. If 4.2 moves to a true no-media-before-tap rule, expect the cold numbers (episode ~0.9 s, clip 3-5 s) to be the real ones, so the clip number is the one to fix first.
- **What triggers the clip downloads:** the `IntersectionObserver` in `index.html` (~line 690) sets `src` and `preload = 'metadata'` for every video within 600 px of the viewport, so the first row of clips downloads without a tap.
- **Clips are the problem, episodes are fine.** Clips are ~13-16 MB 1080p files per the plan; the clip re-encode (720p, ~1 Mbps, faststart, <= 7 MB) is what should bring the clip number under 1.5 s.
- Trial counts are small (3). Treat the clip range as "3-5 s", not a precise figure.
- A fourth case I tried (tap on a clip far down the grid that was never scrolled into view) timed out in all 3 trials with no `src` set. I'm not counting it: my harness probably isn't triggering the same path a real tap does. Needs a manual check.

## Not yet measured (still owed for the Fri Nov 13 checkpoint)

- **Live time-to-audio** (< 3 s). The stream is only meaningful near/during a show (Wed 1 PM ET); measure on show day.
- **Real-iPhone pass** (home, live, one episode). No device run yet; Lighthouse above is emulation only.
- **Separate episode page:** there is none. The episode player is the `#episode` section of the home page, so "episode" numbers are covered by the Home column; its time-to-audio is the open item above.
- **Fixed budget profile:** the plan's bad-Wi-Fi profile (400 kbps / 400 ms) differs from Lighthouse's default mobile profile. Numbers above use the Lighthouse default only.

## How to re-run

```bash
npx -y lighthouse@12 https://midday-madness.vercel.app/ \
  --form-factor=mobile --only-categories=performance \
  --output=json --output-path=./home.json --chrome-flags="--headless=new"
```
Swap the URL for `.../live.html`, and prefer `https://midday-madness.vercel.app/` (the primary host). Run it against production or a deployed branch preview, since localhost has no real network cost.

## Live tap-to-audio baseline (iPhone, Nov 11 — from PR #18)

Metric: time from tapping "TAP TO LISTEN LIVE" on `live.html` to audible playback
(measured with an on-page timer, Safari Web Inspector attached over cable).
Build measured: current production on Vercel, before the Media Session PR (#12).

## iPhone (Safari, private tab)

Corrected from memory: both Wi-Fi and cellular were about 2 s per tap.
Exact per-try values were not captured (an earlier draft listed 0.6-1.1 s;
that was wrong and is withdrawn). Re-measure to get exact numbers.

| Network  | Typical |
|----------|---------|
| Wi-Fi    | ~2 s    |
| Cellular | ~2 s    |

## Desktop (Chrome)

About 0.7 s on both stream hosts.

## Notes

- iPhone is roughly 3x slower than desktop (~0.7 s) on both networks, so the
  delay is not network-bound; worth investigating (iOS audio start/buffering).
- Stream host and "buffered at tap" were not recorded for the iPhone runs
  (expected: `tunein-live-e.cdnstream1.com`, the relay iOS is kept on).
- Lock-screen (Now Playing) check: not yet recorded.
