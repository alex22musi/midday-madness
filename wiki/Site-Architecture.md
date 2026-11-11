# Site Architecture

A static site: plain HTML, CSS and vanilla JS. **No framework, no build step, no npm.** (A framework rewrite is explicitly out of scope.)

## Pages
| File | What it is |
|---|---|
| `index.html` | Home: hero, clips grid, full-episode player, about, tune-in. Fetches `data/clips.json` and `data/episodes.json`. |
| `live.html` + `live.css` | Listener page for the live show: lobby countdown, WIUX stream player, segment timeline, Ask the Hosts, listener count. |
| `producer.html` | Unlinked crew console that drives the live page (segments, question queue). |
| `live-shared.js` | Shared module for live + producer: config, stream player, Media Session, Supabase client. |
| `privacy.html`, `404.html`, `robots.txt`, `sitemap.xml` | Housekeeping. |
| `styles.css` | Navy / gold theme and the custom audio player. |

## Data
- `data/episodes.json` — one entry per full episode: `date`, `label`, numbered `title`, `description`, `durationSec`, `audioFile`.
- `data/clips.json` — one entry per clip: `id`, `title`, `episodeDate`, `startSec`, `timestampLabel`, `durationSec`, `file`, `poster`, `blurb`.
- `data/episodes-draft.json` — scratch data; not served to visitors.

Clips link into episodes: the "watch in episode" jump loads the episode and seeks to `startSec`. Deep links work too: `?ep=<date>&t=<seconds>`.

## Assets
- `assets/episodes/ep-YYYY-MM-DD.<ext>` — web encodes of full shows.
- `assets/clips/clip-YYYY-MM-DD-slug.mp4` + `.jpg` — vertical 720p clips and posters.
- `assets/logo.jpg` (also favicon + share image), `assets/og-card.jpg`, host headshots.

## Backend
Only the live show uses a backend: Supabase (free tier) for realtime segments, questions and listener count. Everything else is static. See [[Supabase-Backend]].

## Hosting
The site is hosted on **Vercel** (`midday-madness.vercel.app`); the repo also still has GitHub Pages history. See [[Local-Preview-and-Deploy]].

## Design tokens
Navy `#0a0e1c` background, gold `#e3a83c` accents (`--navy`, `--gold` in `styles.css`).
