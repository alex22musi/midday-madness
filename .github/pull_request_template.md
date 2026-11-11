## Pre-merge checklist

- [ ] `main` pulled into this branch; `node scripts/ci/check-site.cjs` exits 0 on the result
- [ ] Checked on a phone-width viewport (real iPhone if the change touches the player, Media Session or live page)
- [ ] **Budgets still met**: initial payload ≤ 500 KB · time-to-audio clips < 1.5s, episodes < 2s, live < 3s · or re-measured numbers pasted below
- [ ] Nothing downloads media before a tap; clips and episode audio never play at the same time (one-sound guard)
- [ ] No parked feature code added back: archive page, mini-player, Up Next
- [ ] Supabase anon key read from `live-shared.js`, not copied from notes; no service-role/secret key anywhere
- [ ] Large media files (>10 MB) are one file per commit
- [ ] Not a Wednesday 1–2 PM ET merge unless it's a show-day fix (the show is live)

## What changed

<!-- One or two sentences. Link the file(s)/area if useful. -->

## Why

<!-- The problem or goal, not a restatement of the diff. Faster, smoother, or simpler? -->

## Validation

<!-- What you actually ran/checked: devices, browsers, Lighthouse, jsdom tests. Be specific. -->

## Screenshots / recording

<!-- Required for user-visible changes: phone + desktop, captioned with page/state/device. Delete for non-visual work. -->

## Alex's call?

- [ ] This changes something user-facing that Alex hasn't approved → flagged in the linked issue with `alex-call`, not decided here
- [ ] Not user-facing, or Alex already approved (link where)

## Risk / rollback

<!-- Blast radius if wrong; usually "revert this commit". Anything that could serve a stale live page on show day? -->

## Docs impact

<!-- Wiki page(s) to update (Episode Pipeline, Performance Budgets, etc.) — or "none". -->

## Linked issue

Closes #
