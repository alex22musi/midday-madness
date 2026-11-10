# Midday Madness — live backend setup (one time, ~10 minutes)

The live page (`live.html`) and producer console (`producer.html`) work **without any backend**: the WIUX player, countdown lobby, and a static segment rundown all run fine. This setup unlocks the realtime layer — live segment timeline driven by the producer, ask-the-hosts with upvoting, and the live listener count.

## What you need

- A free Supabase account (supabase.com). No credit card for the free tier.

## Steps

1. **Create a project** at [supabase.com](https://supabase.com) → New project. Name it `midday-madness`. Save the database password it generates (you won't need it for the site, but keep it somewhere safe).

2. **Run the schema.** In the Supabase dashboard, open the **SQL editor** (left sidebar), click **New query**, paste the entire contents of `supabase/schema.sql` from this repo, and click **Run**. You should see "Success. No rows returned" — that means the `shows`, `segments`, and `questions` tables plus their realtime/realtime-security settings were created.

3. **Copy two keys.** Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://xyzcompany.supabase.co`)
   - **anon public key** (the long `eyJ…` string under "Project API keys")

4. **Paste them into the site config.** Open `live-shared.js` (repo root) and fill in the two constants at the top:
   ```js
   SUPABASE_URL: 'https://xyzcompany.supabase.co',
   SUPABASE_ANON_KEY: 'eyJ…',
   ```
   Commit and push. That's it — both pages pick the config up automatically.

5. **Verify.** Open `live.html` — the "Ask the hosts" box should now accept questions instead of showing "unlocks soon." Open `producer.html` (unlinked crew page) — you should see the show controls instead of the setup notice. Submit a test question on the live page and watch it appear in the producer's queue.

## The WIUX stream URL (already configured)

The live player's stream URL is the other one-line config value, same file, top of `live-shared.js`:

```js
WIUX_STREAM_URL: 'https://ice25.securenetsystems.net/WIUXLP',
```

This is verified working (2026-09-23, AAC+ 64 kbps, confirmed live audio). No verified mirror URL exists, so the player's retry/reconnect logic (exponential backoff + stall watchdog + friendly error state) is the reliability layer — if the stream drops, listeners get automatic reconnects, not a dead player.

## Optional: gate the producer console

`producer.html` is unlinked (not in the nav) for v1. If you want a light key gate on top, set `PRODUCER_KEY: 'some-secret'` in `live-shared.js` — the console will ask for it once per browser session. Note this is obscurity, not real security; see the comment block at the top of `supabase/schema.sql` for the v1 tradeoff and how to lock it down properly later.

## If something looks wrong

- **"Ask the hosts" still says "unlocks soon"** → the URL/key didn't deploy yet, or there's a typo. Hard-refresh the page.
- **Questions submit but never appear** → check the Supabase dashboard → Table editor → `questions` to see if rows land; if they do, realtime replication may not be enabled for the table (the schema enables it, but double-check under Database → Replication).
- **Producer console shows the setup notice** → same as the first bullet: config missing or not deployed.
