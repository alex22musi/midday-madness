# FOR RYAN — start here
**This work is yours (assigned Nov 10, 2026 by Alex).** Everything below is the full handoff: where the site stands, what's parked (don't build it), and the scoped Phase 4 + Phase 5 work. Alex's brief for all of it: **faster — but also super smooth and simple to use.**

## How we avoid stepping on each other
- **Work on the branch `phase-4-5`** (create it off `main`) and open PRs back to `main`. `main` is the LIVE site (GitHub Pages serves it) — nothing experimental lands there directly.
- **One writer per area:** Muse (via the "podcast" workflow) only touches `main` for show-day fixes and the Oct 21/28 episode-data wiring already in flight. Episode data files are Muse's until that wiring lands; everything Phase 4/5 is yours.
- **Pull before you push**, sync `main` into your branch regularly, and keep PRs small and single-purpose — one issue per PR, link the issue.
- GitHub Issues are the work queue: each scoped item below has an issue assigned to you. Claim order = issue order (measurements first).
- Questions or design calls: they're Alex's. Flag them in the issue; don't guess on anything user-facing.

---
# Midday Madness Website — Handoff
**Written: Tuesday, Nov 10, 2026, ~9:00 PM ET** · For Alex (and any session picking this back up)
**Site:** alex22musi.github.io/midday-madness · **Repo:** ~/workspace/mm-site · **Full plan:** WEBSITE-NEXT-PHASE-PLAN.md (same folder)

## Alex's direction for the remaining work
**Faster — but also super smooth and simple to use.** Those two are the whole brief for Phases 4 and 5. Any change that makes the site heavier or more complicated needs a very good reason; anything that makes it lighter, smoother, or simpler wins ties.

## Where things stand (shipped and live)
- **Live show page + producer console** are live and hardened: spam/bot protection on Ask the Hosts (burst window 3/45s, length caps, executable-link + shortener blocking, flood + duplicate guards, no CAPTCHA — Alex's call). Supabase backend restored after an auto-pause; keep-alive ping runs Mon + Wed ~9:39 AM ET.
- **Episode player:** 10 episodes wired (six Fall 2025 + Sep 16 / Sep 23 / Oct 7 / Nov 4, 2026), numbered titles in Alex's locked format — "N. \<Date\> Midday Madness" — and the **P5 ALL EPISODES picker** (season-grouped sheet, current row gold). Custom clip controls (center gold play, bottom bar, fullscreen only — PiP removed at Alex's request). One-sound guard: clips and episode audio never overlap.
- **Listen Live button:** L2 design (dark pill, gold ring, pulsing red dot) in both spots.
- **Clips:** 12 live, including the three restored Sep 16 clips. Every clip's "watch in episode" jump lands on the exact second.
- **Drive archive reorganized:** all recordings in "Full Episodes" under one naming scheme — `YYYY-MM-DD — Midday Madness.<ext>`; clips labeled per episode in their own folders; one consolidated Archive folder for superseded renders. Convention written up: ~/workspace/podcast/drive-organization.md. Transcripts are being filed next to each recording in Full Episodes — the show's searchable memory.
- **Show-day setup for Wed Nov 11:** USC segment agenda doc built (private, Alex-only per his rule); 11:00 AM ET email cron sends Alex the agenda + producer console links; live show 1–2 PM ET is the live-fire test.

## Resolved later the same night (Nov 10, after the first draft of this handoff)
- **Phase 2 archive: DOWN and verified.** Rows pulled from production; parked in the backlog with Alex's centered-text note. (commit ccc3960 era)
- **P5 picker: LIVE and verified.** Restored the same evening after the brief mis-aimed park; in production exactly as Alex approved it.
- **Player quick wins: SHIPPED.** Full Media Session lock-screen controls with scrubber + ±10s (commit faaee36, jsdom 14/14) and resume-where-you-left-off (commit 5aaa04b: localStorage per episode, <90% rule, clip jumps / ?t= links always win, jsdom 6/6).

## Still in flight (check these first when resuming)
1. **Oct 21 + Oct 28 episodes** — Alex confirmed the mapping (New Recording 43 = Oct 21, 44 = Oct 28). Renames + web encodes running; when done, podcast chat wires them in as Episodes 10 and 11, Nov 4 becomes 12 → player reaches 12 episodes.
2. **Title-options pack** — being built from full transcripts (recap + 3 title options + one-line why, per episode). **On landing: email it to Alex + Ryan (pre-authorized by Alex).** Picks append creative titles to the locked numbered format.
3. **Clip-tier transcription upgrade** — large-model + name-glossary re-transcription for clip windows, benchmarked against a verified clip; build + honest benchmark report owed.

## Parked by Alex's call (Nov 10) — do not ship, do not re-nudge
- **Phase 2 archive presentation** (commit dbf8204): backlogged. His note: doesn't love the **centered text**. Fix direction when revived: left-aligned rows.
- **Phase 5 mini-player**: faded outright by Alex ("no miniplayer actually fade that idea"). The M1/M2/M3 mockups were pulled from the live site the same night (commit 60e4c52).
- **Up Next auto-advance (Phase 5.5)**: faded alongside the mini-player — its surface was the bar. Do not revive.
- All are recoverable from git history. Nothing from the backlog ships without Alex reviving it himself.

## Remaining work — Phase 4: Speed & reliability (scoped)

Budgets (from the plan; these are the acceptance tests, not aspirations):
- Initial page payload **≤ 500 KB**; usable in **< 3s on Slow 4G**
- Time-to-audio: **clips < 1.5s · episodes < 2s · live < 3s** after tap

Work items:
1. **Measure first (Nov 13 checkpoint):** Lighthouse + a real-iPhone pass on home, live page, and one episode page. Publish the baseline numbers in the plan doc; every later change is judged against them.
2. **Asset diet:** posters and images re-compressed (logo already went 153 KB → 38 KB; keep going), no image ships larger than its display size, fonts subset + `font-display: swap`, nothing downloads media before a tap (already the rule — audit it).
3. **Code diet:** defer or drop non-critical JS; **remove the parked features' code from production** (archive + mini-player code should not ship to visitors at all); CSS pass for dead rules left by the design iterations.
4. **Smoothness pass (Alex's second half of the brief):** zero layout shift (fixed aspect boxes everywhere media loads), animations on transform/opacity only (60fps on a mid-range phone), skeleton states so nothing pops in, scroll stays butter (the watermark fade already does this — keep the pattern).
5. **Caching within GitHub Pages limits:** long-cache static assets via fingerprinted filenames where the build allows; a cautious service worker for the static shell + episode metadata is allowed ONLY if it can never serve a stale live page on show day — otherwise skip it. Simple beats clever.
6. **Reliability:** dual-source stream failover already live; encode-integrity check (full decode + duration match) is in the episode SOP — keep it; Supabase keep-alive is set — keep the monthly "not paused" check.
7. **Regression rule:** no feature ships if it breaks a budget. If a Phase 5 item costs speed, the item waits, not the budget.

## Remaining work — Phase 5: Player upgrades (scoped; mini-player excluded)

1. **Quick wins — SHIPPED Nov 10 night** (see above): lock-screen scrubber + ±10s, loading/error states, keyboard shortcuts, resume-where-you-left-off. Remaining: a real-device (iPhone) verification pass by the Nov 13 checkpoint.
2. **Up Next auto-advance: FADED** with the mini-player (see Parked). Not in scope.
3. **Media Session completeness:** one consistent lock-screen experience across live, episodes, and clips (right title, right artwork, working controls in all three). Mostly polish on top of the quick wins. This is the main open Phase 5 item.
4. **Simplicity guardrails (apply to every Phase 5 item):** one-thumb operation; no new visible buttons unless one is removed; no settings screens; if a feature needs explaining, it's cut. The producer console stays exactly as simple as it is.
5. **Explicitly NOT in scope:** mini-player (faded), fake waveform, title ticker, discovery modal, any framework rewrite.

## Schedule to launch
- **Wed Nov 11:** show day — live-fire test; fix only what the show breaks.
- **Fri Nov 13 (checkpoint):** Phase 4 baseline measurements + quick-wins iPhone verification + title picks status.
- **Mon–Tue Nov 16–17:** Phase 4 deep pass (asset + code diet) + Media Session completeness polish.
- **Tue Nov 17 (checkpoint):** budgets re-measured; anything over budget gets cut or fixed, not waived.
- **Wed Nov 18:** freeze except fixes.
- **Thu Nov 19: LAUNCH.** Fri Nov 20 is buffer (Thanksgiving travel day).

## Gotchas for whoever resumes
- Supabase anon key: always read it from `live-shared.js` — it was rotated once; never from memory or notes.
- The live player always reconnects to the live edge on play — radio can't be time-shifted; that's by design, not a bug.
- Producer console has NO password (PRODUCER_KEY is '') — Alex knows; don't "fix" it unasked.
- Site pushes go through the podcast chat's flow; main chat relays Alex's decisions, it doesn't edit the repo in parallel.
- Creative titles are a data-only change once picks land — no player rebuild needed.
- Oct 14, 2026 has no recording and never will (Alex confirmed it got messed up) — the archive simply skips it.
