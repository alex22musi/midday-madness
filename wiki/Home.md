# Midday Madness — Site Wiki

The website for **Midday Madness**, IU's midday sports talk show — every Wednesday at 1 PM ET on WIUX 99.1 FM, Bloomington. Hosts: Alex Musicus & Sam Singer.

**Live site:** https://midday-madness.vercel.app

> **The brief for everything on this site: faster — but also super smooth and simple to use.** Anything that makes the site heavier or more complicated needs a very good reason. Anything lighter, smoother or simpler wins ties.

## Start here
- [[Site-Architecture]] — what's in the repo and how the pages fit together
- [[Local-Preview-and-Deploy]] — run it locally, ship it
- [[Conventions]] — naming, titles, file rules (the locked ones)

## Running the show
- [[Show-Day-Runbook]] — Wednesday live show
- [[Live-Page-and-Producer-Console]] — the realtime layer
- [[Supabase-Backend]] — tables, RLS, spam protection, keep-alive

## Content pipeline
- [[Episode-Pipeline]] — adding a full episode
- [[Weekly-Clip-Workflow]] — Wednesday show → clips on the site
- [[Player-and-Media-Session]] — clips, episodes, lock-screen controls

## Quality
- [[Performance-Budgets]] — the acceptance tests
- [[Roadmap-Phase-4-and-5]] — what's left and in what order
- [[Parked-Features]] — faded by Alex; don't build

## Working on the repo
- Issues are the work queue. Templates: bug, feature, task, new episode, weekly clips, backlog.
- Branch off `main`, one issue per PR, pull before you push. `main` is the live site.
- CI runs `node scripts/ci/check-site.cjs` (data, media references, secrets, payload budget).
- User-facing design calls are **Alex's** — flag with the `alex-call` label, don't guess.
