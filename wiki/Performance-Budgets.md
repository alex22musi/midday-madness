# Performance Budgets

These are acceptance tests, not aspirations.

| Budget | Target |
|---|---|
| Initial page payload | **≤ 500 KB**, usable in **< 3s on Slow 4G** |
| Time-to-audio after tap — clips | **< 1.5s** |
| Time-to-audio after tap — episodes | **< 2s** |
| Time-to-audio after tap — live | **< 3s** |

## Regression rule
No feature ships if it breaks a budget. If a Phase 5 item costs speed, **the item waits, not the budget.**

## Enforced automatically
CI measures the raw initial payload of `index.html` (HTML + referenced local CSS/JS/images) against 500 KB, warns within 10%, and fails on `autoplay` or `preload="auto"` media. Run it locally: `node scripts/ci/check-site.cjs`. Real timings (Lighthouse mobile + a real iPhone) are measured by hand — see [[Roadmap-Phase-4-and-5]].

## Smoothness
- Zero layout shift (fixed aspect boxes where media loads)
- Transform/opacity animations only — 60 fps on a mid-range phone
- Skeleton states so nothing pops in
- Scroll stays smooth (the watermark fade is the pattern to keep)

## Asset sizing
Clips ~2–5 MB (720p faststart), posters under 150 KB, no image larger than its display size, fonts subset with `font-display: swap`.
