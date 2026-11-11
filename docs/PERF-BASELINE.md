# Live player performance baseline

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
