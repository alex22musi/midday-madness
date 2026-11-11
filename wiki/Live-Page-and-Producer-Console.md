# Live Page and Producer Console

## Automatic live mode (every Wednesday, Indianapolis time)
- **12:30–1:00 PM ET:** "LIVE SOON" countdown lobby.
- **1:00–2:00 PM ET:** "ON AIR NOW" takeover.
- Configured in `live-shared.js` (`SHOW_TZ`, `SHOW_WEEKDAY`, `SHOW_START_MIN`, `SHOW_END_MIN`).

## Listener page (`live.html`)
- Stream player with a **Listen Live** button (dark pill, gold ring, pulsing red dot).
- Live segment timeline driven by the producer.
- **Ask the Hosts** with upvoting, plus a live listener count.
- Works without any backend: the player, countdown and a static rundown still run; realtime features show a graceful "coming soon" state.

## Stream reliability
Primary: a TuneIn MP3 relay (plays on iPhones). Fallback: the station's direct HE-AAC feed (desktop only — iOS Safari can't decode it). The player auto-reconnects with exponential backoff and a stall watchdog. Radio can't be time-shifted: play always reconnects to the **live edge** — that's by design.

## Producer console (`producer.html`)
Unlinked crew page: run segments, work the question queue. Keep it exactly as simple as it is.
## Testing
`?preview=live` / `?preview=soon` on the homepage; `?teststream=1` on the live page plays a known-good public stream, muted, when the station is off air; the Wednesday show is the real live-fire test.
