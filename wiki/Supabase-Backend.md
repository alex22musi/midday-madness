# Supabase Backend

Free-tier Supabase powers only the live show. Setup steps are in `SUPABASE_SETUP.md` in the repo.

## Tables
`shows`, `segments`, `questions` — with realtime enabled. Schema: `supabase/schema.sql`. Spam hardening: `supabase/hardening.sql`.

## Keys
The **anon key is public by design** — it ships in `live-shared.js`. Read it from there, never from notes. A service-role/secret key must never be committed (CI blocks the patterns).

## Ask the Hosts spam protection
- Body length 1–280, name ≤ 40, enforced in the database.
- Links allowed **except** executable-download URLs and anonymizing shorteners.
- Duplicate guard: identical text within 2 minutes.
- Client burst limit: 3 per 45 seconds; the DB keeps a global flood cap.
- No CAPTCHA — a deliberate call by Alex.
- Public writes go through RPCs (`increment_upvote`, `set_question_status`, …) with server-side checks.

## Applying SQL
`hardening.sql` runs in two stages in the Supabase SQL editor: **Stage A** is safe while the site is live; **Stage B** only after the updated `live.html` and `producer.html` are deployed (it drops the wide-open update policy). Rollback SQL is at the bottom of the file. Stage A is idempotent.

## Keep-alive
Free projects auto-pause after inactivity (it happened once). A keep-alive ping runs **Monday and Wednesday ~9:39 AM ET**. Do a monthly "not paused" check.
