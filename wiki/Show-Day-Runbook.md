# Show-Day Runbook (Wednesdays)

Show: **1:00–2:00 PM ET**, WIUX 99.1 FM. The site is the live-fire test every week.

## Before
- Morning: agenda doc refreshed and sent to the hosts; producer console and live page checked.
- Supabase **not paused** (keep-alive runs Mon + Wed ~9:39 AM ET).
- No merges to `main` for the 12:30–2:00 PM window unless it's a show-day fix.

## During
- 12:30 the lobby countdown appears automatically; 1:00 "ON AIR NOW".
- Producer drives segments and the question queue.
- If the stream stutters, the player reconnects to the live edge automatically.

## After
- Fix **only what the show broke** that day.
- Log clip candidates while the show is fresh → [[Weekly-Clip-Workflow]].
- Add the episode → [[Episode-Pipeline]].

## No-show weeks
Set `LIVE_OVERRIDE = false` in `index.html` (breaks and holidays).
