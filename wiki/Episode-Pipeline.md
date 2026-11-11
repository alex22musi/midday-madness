# Episode Pipeline

How a Wednesday recording becomes an episode in the player. Use the **New episode** issue template — it carries this checklist.

1. **Recording** is filed in the Full Episodes folder as `YYYY-MM-DD — Midday Madness.<ext>`.
2. **Web encode:** ~48 kbps mono, faststart (target ≈ 20 MB for a ~1 hour show). Save as `assets/episodes/ep-YYYY-MM-DD.<ext>`.
3. **Integrity check:** fully decode the encode and confirm its duration matches the source. A truncated encode is the classic silent failure.
4. **Data:** add an entry to `data/episodes.json` — `date`, `label` (`Nov 4, 2026`), numbered `title`, `description`, `durationSec`, `audioFile`. Keep date order.
5. **Check:** `node scripts/ci/check-site.cjs` — verifies numbering, label/title/date agreement, and the file exists.
6. **Ship:** commit the media one file per commit, then the data change.
7. **Verify live:** open the episode from the picker on a phone; time-to-audio should be under 2s.

## The player
The episode picker is a season-grouped sheet ("All Episodes") with the current row in gold. Episodes resume where you left off (see [[Player-and-Media-Session]]).

## Creative titles
After the title-options pack, picks are appended to the locked format by editing `title` in `data/episodes.json`. Data only.
