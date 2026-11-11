# Roadmap: Phase 4 + 5

Tracked as GitHub issues (#1 is the handoff). Work in order — measurements gate the rest. **Launch target: Thu Nov 19, 2026**; freeze Wed Nov 18 except fixes; Fri Nov 20 is buffer.

## Phase 4 — Speed and reliability
1. **Measure first** (checkpoint Fri Nov 13): Lighthouse (mobile) for home, live, one episode page + a real-iPhone pass. Publish the baseline.
2. **Asset diet:** re-compress posters/images, right-size, subset fonts, audit "nothing before a tap".
3. **Code diet:** defer or drop non-critical JS; **remove parked-feature code from production**; prune dead CSS.
4. **Smoothness pass:** zero layout shift, 60 fps, skeletons.
5. **Caching** within host limits: fingerprinted filenames where possible. A service worker is allowed **only** if it can never serve a stale live page on show day — otherwise skip it. Simple beats clever.
6. **Reliability:** keep the stream failover, the encode-integrity check, and the Supabase keep-alive.
7. **Regression rule:** budgets outrank features.

## Phase 5 — Player upgrades
Quick wins are shipped (lock-screen scrubber, ±10s, loading/error states, keyboard shortcuts, resume). Open: **Media Session completeness** across live, episodes and clips, plus a real-device verification pass.

## Checkpoints
- **Fri Nov 13:** baseline measurements + iPhone verification.
- **Mon–Tue Nov 16–17:** deep pass; **Tue Nov 17:** re-measure — over-budget items get cut or fixed, never waived.
- **Wed Nov 18:** freeze. **Thu Nov 19: launch.**

See also [[Parked-Features]].
