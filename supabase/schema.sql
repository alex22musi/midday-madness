-- =====================================================================
-- Midday Madness — live experience schema
-- Run once in the Supabase SQL editor (see SUPABASE_SETUP.md).
-- Tables: shows (one row per air date), segments (live rundown),
--         questions (ask-the-hosts queue).
-- =====================================================================

create table if not exists shows (
  id uuid primary key default gen_random_uuid(),
  show_date date not null unique,
  title text not null default 'Midday Madness',
  is_live boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists segments (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  position int not null default 0,
  title text not null,
  status text not null default 'pending'
    check (status in ('pending', 'live', 'done')),
  started_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists segments_show_idx on segments (show_id, position);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  name text,
  body text not null,
  upvotes int not null default 0,
  status text not null default 'open'
    check (status in ('open', 'answered', 'dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists questions_show_idx on questions (show_id, status, upvotes desc);

-- =====================================================================
-- Row Level Security.
-- v1 tradeoff, read this: the site is fully static (GitHub Pages), so the
-- only key the browser can hold is the anon key. These policies let the
-- listener page read everything, let anyone submit/upvote questions, and
-- let the (unlinked, crew-only) producer page drive the show. That means
-- a determined visitor COULD open producer.html and push segments live.
-- For a college show v1 this is acceptable; to lock it down later, either
--   a) put producer.html behind simple auth (e.g. Cloudflare Access), or
--   b) revoke anon write on shows/segments and drive the console through
--      an Edge Function that checks a shared secret.
-- =====================================================================

alter table shows enable row level security;
alter table segments enable row level security;
alter table questions enable row level security;

-- Reads: everyone (listener page needs these with no login).
create policy "anon read shows"
  on shows for select to anon using (true);
create policy "anon read segments"
  on segments for select to anon using (true);
create policy "anon read questions"
  on questions for select to anon using (true);

-- Questions: anyone may submit and upvote; producer marks answered/dismissed.
create policy "anon insert questions"
  on questions for insert to anon with check (true);
create policy "anon update questions"
  on questions for update to anon using (true) with check (true);

-- Producer console: create/update shows and manage segments.
create policy "anon manage shows"
  on shows for all to anon using (true) with check (true);
create policy "anon manage segments"
  on segments for all to anon using (true) with check (true);

-- =====================================================================
-- Realtime: the listener/producer pages subscribe to postgres_changes on
-- these tables. Enable it (also available under Database → Replication).
-- =====================================================================
alter publication supabase_realtime add table shows;
alter publication supabase_realtime add table segments;
alter publication supabase_realtime add table questions;
