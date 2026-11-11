# Work Queue — Ryan (Phase 4 + 5)

Assigned Nov 10, 2026 by Alex. Work in order; check items off in PRs. Full context: `docs/HANDOFF.md` and `docs/NEXT-PHASE-PLAN.md`.

**Branch:** `phase-4-5` off `main` · one item per PR · pull before you push · `main` is the live site.

## - [ ] START HERE — rules of the road

**Start with `docs/HANDOFF.md` in this repo** — it's the full handoff: site state, what's parked, and the rules below in detail. `docs/NEXT-PHASE-PLAN.md` has the complete plan.

Alex's brief for everything here: **faster — but also super smooth and simple to use.**

## Rules of the road (conflict prevention)
- Work on branch **`phase-4-5`** (create off `main`), PR back to `main`. `main` = the live site.
- Muse only touches `main` for show-day fixes + the Oct 21/28 episode-data wiring already in flight. Episode data files are Muse's until that lands; Phase 4/5 is yours.
- Pull before you push; sync `main` into your branch often; one issue per PR, link it.
- Work the issues in order — measurements first, they gate the rest.
- User-facing design calls are Alex's — flag in the issue, don't guess.

## The queue
1. Phase 4.1 — Measure first: performance baseline
2. Phase 4.2 — Asset diet
3. Phase 4.3 — Code diet (incl. stripping parked-feature code from production)
4. Phase 4.4 — Smoothness pass (zero layout shift, 60fps)
5. Phase 4.5 — Caching review (GitHub Pages limits)
6. Phase 5 — Media Session completeness + real-device verification

**Parked — do NOT build:** Phase 2 archive page, mini-player, Up Next. All faded by Alex; details in the handoff.

## - [ ] Phase 4.1 — Measure first: performance baseline

**Goal:** a published baseline every later change is judged against.

Budgets (acceptance tests, from the plan):
- Initial page payload **≤ 500 KB**, usable **< 3s on Slow 4G**
- Time-to-audio after tap: **clips < 1.5s · episodes < 2s · live < 3s**

Do:
- Lighthouse runs (mobile) for: homepage, live page, one episode page.
- A real-device pass on an iPhone if you have one (or the best available emulation) — note which.
- Post the numbers in this issue and in a `docs/PERF-BASELINE.md`: payload KB per page, LCP, CLS, and measured time-to-audio for a clip, an episode, and the live stream.
- Flag anything already over budget — that's the priority list for 4.2/4.3.

Branch: `phase-4-5`. Docs-only PR is fine for this one.

## - [ ] Phase 4.2 — Asset diet

**Goal:** every byte a visitor downloads earns its place.

Do:
- Audit all images/posters: nothing ships larger than its display size; re-compress what fails (the logo already went 153 KB → 38 KB — same treatment everywhere).
- Fonts: subset + `font-display: swap`; drop unused weights.
- Verify the standing rule: **no media downloads before a tap** — audit network on page load for home, live, and episode pages.
- Report before/after payload per page in the PR, measured against the 4.1 baseline.

Budget guardrail: initial payload ≤ 500 KB. If a change would break it, stop and flag it here.

## - [ ] Phase 4.3 — Code diet (strip parked features from production)

**Goal:** production ships only code that runs.

Do:
- Defer or drop non-critical JS; nothing blocks first render that doesn't have to.
- **Remove parked-feature code from production entirely:** the Phase 2 archive and the mini-player are faded (see handoff) — their code should not be downloaded by visitors. Keep it recoverable in git history, not in the live bundle.
- CSS pass: dead rules left over from the design iterations (mockups, parked features, old picker variants).
- Report before/after JS/CSS KB per page in the PR against the 4.1 baseline.

Careful: the live page (live.html) is show-critical — test playback + Media Session after any change there.

## - [ ] Phase 4.4 — Smoothness pass (zero layout shift, 60fps)

**Goal:** the site feels instant and never jumps. Alex's words: "super smooth."

Do:
- **Zero layout shift:** fixed aspect boxes / reserved space everywhere media or rows load in. CLS should be ~0 on home, live, episode pages.
- Animations on **transform/opacity only** — 60fps on a mid-range phone. Audit the watermark fade, picker sheet, and any hover/tap states.
- Skeleton/loading states so nothing pops in (episode player loading states shipped Nov 10 — extend the pattern, don't reinvent it).
- Scroll performance check on the longest page (homepage with clips grid).

Report CLS + any jank found/fixed in the PR.

## - [ ] Phase 4.5 — Caching review (never serve a stale live page)

**Goal:** aggressive caching that can NEVER serve a stale live page on show day (Wednesdays 1 PM).

Do:
- Review what GitHub Pages lets us control (fingerprinted asset filenames for long cache lifetimes where the setup allows).
- A service worker for the static shell + episode metadata is on the table **only** with a hard guarantee the live page and its data always fetch fresh — if that guarantee isn't clean, skip the SW and say why in this issue. Simple beats clever.
- Whatever ships: verify the live page still goes LIVE correctly in a test after the change.

## - [ ] Phase 5 — Media Session completeness + real-device verification

**Goal:** one consistent, working lock-screen / Control Center experience across all three playback contexts.

Already shipped (Nov 10): full Media Session on the episode player (scrubber + ±10s), loading/error states, keyboard shortcuts, resume-where-you-left-off.

Do:
- Audit Media Session across **live, episodes, and clips**: correct title, correct artwork, working play/pause/seek in each context. Fix gaps.
- Real-device verification pass (iPhone) of the Nov 10 quick wins + resume: lock-screen scrubber actually scrubs, ±10 lands right, resume restores under 90% and does NOT override clip jumps or ?t= links.
- Simplicity guardrails: no new visible buttons unless one is removed; no settings screens; if a feature needs explaining, it's cut.

**Not in scope:** mini-player and Up Next — both faded by Alex.
