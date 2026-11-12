#!/usr/bin/env node
// Static-site checks for Midday Madness (no build step, no dependencies).
// Run locally:  node scripts/ci/check-site.cjs
// Errors fail CI; warnings are printed but do not.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const exists = (p) => fs.existsSync(path.join(root, p));
const size = (p) => fs.statSync(path.join(root, p)).size;

// ---- 1. Forbidden tracked files / secrets -------------------------------
const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const FORBIDDEN = /(^|\/)\.env($|\.[^.]*$)|\.log$|(^|\/)node_modules\/|\.DS_Store$|\.takeout\.zip$/;
for (const f of tracked) if (FORBIDDEN.test(f) && !/\.env\.example$/.test(f)) err(`Forbidden tracked file: ${f}`);

// The Supabase anon key is public by design (it ships in live-shared.js).
// A service-role key or any secret key must NEVER be committed.
const SECRET = /sb_secret_[A-Za-z0-9]{16,}|sk_live_[A-Za-z0-9]{16,}|service_role['"]?\s*[:=]\s*['"]eyJ/;
const TEXT = /\.(html|js|cjs|css|json|md|sql|yml|yaml|txt|xml)$/;
for (const f of tracked.filter((f) => TEXT.test(f))) {
  if (f === 'scripts/ci/check-site.cjs') continue;
  if (SECRET.test(fs.readFileSync(path.join(root, f), 'utf8'))) err(`Secret-looking value in ${f}`);
}

// GitHub rejects files over 100 MB; warn well before that.
for (const f of tracked) if (size(f) > 90 * 1024 * 1024) err(`File over 90 MB (GitHub limit is 100 MB): ${f}`);

// ---- 2. Data files ------------------------------------------------------
function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(path.join(root, p), 'utf8')); }
  catch (e) { err(`${p} is not valid JSON: ${e.message}`); return null; }
}
const episodes = loadJson('data/episodes.json');
const clips = loadJson('data/clips.json');
loadJson('data/episodes-draft.json');

if (Array.isArray(episodes)) {
  const TITLE = /^(\d+)\. ([A-Z][a-z]{2} \d{1,2}, \d{4}) Midday Madness(\b.*)?$/; // creative titles may be appended
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let prev = '';
  episodes.forEach((e, i) => {
    const at = `episodes.json[${i}] (${e.date})`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) err(`${at}: bad date`);
    if (e.date <= prev) err(`${at}: episodes must be in ascending date order, no duplicates`);
    prev = e.date;
    if (e.date) {
      const [y, m, d] = e.date.split('-').map(Number);
      const want = `${MONTHS[m - 1]} ${d}, ${y}`;
      if (e.label !== want) err(`${at}: label "${e.label}" should be "${want}"`);
    }
    const t = TITLE.exec(e.title || '');
    if (!t) err(`${at}: title must match "N. Mon D, YYYY Midday Madness" (got "${e.title}")`);
    else {
      if (Number(t[1]) !== i + 1) err(`${at}: numbered ${t[1]} but is position ${i + 1}`);
      if (t[2] !== e.label) err(`${at}: title date "${t[2]}" does not match label "${e.label}"`);
    }
    if (!(e.durationSec > 0)) err(`${at}: durationSec missing`);
    if (!e.audioFile || !exists(e.audioFile)) err(`${at}: audioFile missing on disk: ${e.audioFile}`);
    else if (e.audioFile !== `assets/episodes/ep-${e.date}${path.extname(e.audioFile)}`) warn(`${at}: audio file does not follow ep-YYYY-MM-DD naming: ${e.audioFile}`);
  });
}

if (Array.isArray(clips)) {
  const ids = new Set();
  const dates = new Set((episodes || []).map((e) => e.date));
  clips.forEach((c, i) => {
    const at = `clips.json[${i}] (${c.id})`;
    if (ids.has(c.id)) err(`${at}: duplicate id`);
    ids.add(c.id);
    for (const k of ['file', 'poster']) if (!c[k] || !exists(c[k])) err(`${at}: ${k} missing on disk: ${c[k]}`);
    if (!dates.has(c.episodeDate)) err(`${at}: episodeDate ${c.episodeDate} has no matching episode`);
    if (!(c.startSec >= 0) || !(c.durationSec > 0)) err(`${at}: startSec/durationSec invalid`);
    const mm = Math.floor(c.startSec / 60), ss = String(c.startSec % 60).padStart(2, '0');
    if (c.timestampLabel !== `${mm}:${ss}`) err(`${at}: timestampLabel "${c.timestampLabel}" should be "${mm}:${ss}"`);
    if (c.poster && exists(c.poster) && size(c.poster) > 150 * 1024) warn(`${at}: poster is ${(size(c.poster) / 1024) | 0} KB (target under 150 KB)`);
  });
  // every clip appears in its episode's clips list when that list is used
  for (const e of episodes || []) {
    const n = clips.filter((c) => c.episodeDate === e.date).length;
    if (Array.isArray(e.clips) && e.clips.length && e.clips.length !== n) warn(`episode ${e.date}: clips list has ${e.clips.length}, clips.json has ${n}`);
  }
}

// ---- 3. Local references in the HTML pages exist ------------------------
const pages = tracked.filter((f) => /^[^/]+\.html$/.test(f));
for (const p of pages) {
  const html = fs.readFileSync(path.join(root, p), 'utf8');
  for (const m of html.matchAll(/(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref) || ref.startsWith('/')) continue;
    if (!exists(ref)) err(`${p}: references missing file ${ref}`);
  }
}

// ---- 4. Performance budget: initial payload of index.html ---------------
// Budget (docs/HANDOFF.md): initial page payload <= 500 KB, no media before a tap.
// Counts index.html + the local CSS/JS/images it references directly (not audio/video, not fetched data).
const BUDGET = 500 * 1024;
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const parts = new Set(['index.html']);
for (const m of indexHtml.matchAll(/<(?:link|script|img)[^>]+(?:href|src)=["']([^"'#?]+)/g)) {
  if (!/^(https?:|\/\/|data:)/.test(m[1]) && exists(m[1]) && !/\.(mp3|m4a|mp4)$/.test(m[1])) parts.add(m[1]);
}
const total = [...parts].reduce((n, p) => n + size(p), 0);
console.log(`Initial payload (raw): ${(total / 1024).toFixed(0)} KB of ${BUDGET / 1024} KB — ${[...parts].join(', ')}`);
if (total > BUDGET) err(`Initial payload ${(total / 1024) | 0} KB exceeds the 500 KB budget`);
else if (total > BUDGET * 0.9) warn('Initial payload is within 10% of the 500 KB budget');
for (const m of indexHtml.matchAll(/<(?:video|audio)[^>]*>/g)) {
  if (/\bautoplay\b/.test(m[0]) || /preload=["']auto["']/.test(m[0])) err('index.html: media must not autoplay or preload="auto" (nothing downloads before a tap)');
}

// ---- 5. Fonts: a webfont may never ship without font-display: swap -----
// The site uses a system font stack only (styles.css) — no @font-face, no
// font files, no remote font requests. If a webfont is ever introduced, the
// HANDOFF.md asset diet requires subsetting plus font-display: swap, so text
// never blocks on a font download. Enforce the swap half here; subsetting
// stays a review-time check (a file-size rule cannot tell a subset apart).
const FONT_TEXT = /\.(html|css|js)$/;
const REMOTE_FONT = /https?:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|cdn\.fontsource\.org)[^\s"'\)]*/gi;
for (const f of tracked.filter((f) => FONT_TEXT.test(f))) {
  if (f === 'scripts/ci/check-site.cjs') continue; // this file names the hosts in its own regex
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  for (const m of src.matchAll(/@font-face\s*\{[^}]*\}/g)) {
    if (!/font-display\s*:\s*swap\b/.test(m[0])) err(`${f}: @font-face without font-display: swap`);
  }
  for (const m of src.matchAll(REMOTE_FONT)) warn(`${f}: remote font reference ${m[0]} (subset it and keep font-display: swap)`);
}
for (const f of tracked) if (/\.(woff2?|ttf|otf|eot)$/i.test(f)) warn(`Font file tracked: ${f} (subset it; keep it small)`);

// ---- Report -------------------------------------------------------------
warnings.forEach((w) => console.log(`::warning::${w}`));
errors.forEach((e) => console.log(`::error::${e}`));
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
