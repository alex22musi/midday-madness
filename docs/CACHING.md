# Caching review (Phase 4.5, issue #6)

**Goal from the issue:** aggressive caching that can never serve a stale live page on show day.
**Short answer:** the site is already served fresh by the host that matters; one small, safe header rule is added for media and images; fingerprinted filenames and a service worker are **not** worth it. Reasons below.

Measured Wed Nov 11, 2026 with `curl -I`.

## Two hosts, same content

`index.html`, `live.html`, `styles.css`, `live-shared.js` and both JSON files are byte-identical on both hosts and match `main`.

| | Vercel (`midday-madness.vercel.app`) | GitHub Pages (`alex22musi.github.io/midday-madness`) |
|---|---|---|
| Role | Canonical: the repo's share links, `og:` tags and lock-screen artwork point here (commit `481410d`: "Vercel is the host now") | Mirror. It once returned "Site not found" (commit `a69972a`) |
| HTML / JS / CSS / JSON | `max-age=0, must-revalidate` + ETag: always revalidated, never stale | `max-age=600` + ETag: up to 10 min stale |
| Images / audio / video | same as above (revalidated on every use) | `max-age=600` |
| Compression | brotli | gzip |
| Can we change headers? | **Yes**, with `vercel.json` | **No** (Pages sets them) |

`docs/HANDOFF.md` and the README still call GitHub Pages "the live site". Worth confirming with Alex which host is primary, because the Phase 4.1 baseline was measured on Pages. A re-run on Vercel was close (home 99 vs 99, CLS 0 on both, LCP 2.2 s vs 2.0 s).

## Show-day staleness

- Whether the live page **goes live** never depends on a cached file: the state comes from the visitor's own clock (Wed 1-2 PM ET) in the page's script.
- What *can* be stale is the code itself after a deploy. On Vercel that is zero (always revalidated). On Pages it is up to 10 minutes, so on that host **don't deploy anything within 10 minutes of 1 PM**.
- The data files (`clips.json`, `episodes.json`) are fetched with the default cache mode, so they follow the same rules. Neither is live-critical.

## What this PR does

`vercel.json`: `/assets/*` gets `Cache-Control: public, max-age=3600`.

- Covers clip videos, posters, episode audio, logos and headshots. Repeat visitors within the hour skip a revalidation round trip for each one, and seeking inside an already-fetched part of an episode should no longer re-check the server (expected from the header, not yet measured).
- HTML, JS, CSS and JSON are deliberately **not** touched, so the live page and its code stay always-fresh.
- Worst case: a file replaced under the same name (for example a re-encoded clip or a new `logo.jpg`) can show the old copy for up to an hour. Episode and clip files have unique names per date/slug, so a new episode is unaffected.
- Pages ignores this file. No effect there.

To verify after deploy:

```bash
curl -sI https://midday-madness.vercel.app/assets/logo.jpg | grep -i cache-control   # public, max-age=3600
curl -sI https://midday-madness.vercel.app/live.html      | grep -i cache-control   # public, max-age=0, must-revalidate
```

## What this PR deliberately does not do

- **Fingerprinted filenames.** There is no build step, and on Pages they would gain nothing (the 10-minute header is fixed). On Vercel they would let us use `immutable`, but only by renaming files on every change, which adds a step that can be forgotten. The repeat-visit saving is a few round trips. Not worth it. The existing `?v=` tags on CSS/JS already bust the cache when bumped.
- **A service worker.** The issue allows one only with a hard guarantee the live page can never be stale. A worker would have to exclude `live.html`, `live-shared.js` and the data files, and then it would only speed up repeat visits to a site whose first visit is already about 400 KB of non-media. The risk is a returning visitor running an old copy of the home page script after a show-day fix, until the worker updates and they reload. That guarantee is not clean, so it is skipped.
- **`cache: 'no-cache'` on the JSON fetches.** Would force a revalidation on every load for data that is not live-critical. Slower for no show-day gain.
