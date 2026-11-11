# Local Preview and Deploy

## Preview
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
Live-mode previews on the homepage: `?preview=live` and `?preview=soon`.

## Checks before you push
```bash
node scripts/ci/check-site.cjs
```
The same script runs in CI on every PR and push to `main`. It checks: valid JSON, episode numbering and title format, that every audio/clip/poster file exists, no secrets or junk files, and the 500 KB initial-payload budget.

## Branching
- `main` is the live site — nothing experimental lands there directly.
- Work on a branch, open a PR, link the issue, one issue per PR.
- Pull before you push; sync `main` into your branch often.

## Large media
Files over 10 MB (full episodes, big clips) should be committed **one file per commit** — pushes with several large files at once get rejected. GitHub's hard per-file limit is 100 MB (CI errors at 90 MB).

## Hosting
Vercel serves the site. Pushing to `main` deploys it. Always verify the live URL after a deploy that touches media or data.
