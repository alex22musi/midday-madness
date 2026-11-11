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
  name text check (name is null or char_length(name) <= 40),
  body text not null check (char_length(body) between 1 and 280),
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

-- Questions (hardened 2026-11-10, see hardening.sql): anyone may submit
-- (length + no-link rules enforced in the policy AND table checks);
-- upvotes and producer status changes go ONLY through the SECURITY
-- DEFINER RPCs below — there is deliberately NO anon update policy.
create policy "anon insert questions"
  on questions for insert to anon with check (
    char_length(body) between 1 and 280
    and (name is null or char_length(name) <= 40)
    and body !~* '(https?://|www\.)[^[:space:]]*/[^[:space:]]*\.(exe|msi|scr|bat|cmd|com|jar|vbs|js|apk|dmg|pkg)([?#][^[:space:]]*)?([[:space:]]|$)'
    and (name is null or name !~* '(https?://|www\.)[^[:space:]]*/[^[:space:]]*\.(exe|msi|scr|bat|cmd|com|jar|vbs|js|apk|dmg|pkg)([?#][^[:space:]]*)?([[:space:]]|$)')
    and body !~* '(^|[[:space:]])(https?://)?(www\.)?(bit\.ly|tinyurl\.com|rb\.gy|cutt\.ly|is\.gd|v\.gd|shorturl\.at|t\.ly)(/[^[:space:]]*)?([[:space:]]|$)'
    and (name is null or name !~* '(^|[[:space:]])(https?://)?(www\.)?(bit\.ly|tinyurl\.com|rb\.gy|cutt\.ly|is\.gd|v\.gd|shorturl\.at|t\.ly)(/[^[:space:]]*)?([[:space:]]|$)')
  );

-- Flood + duplicate guard on question inserts.
create or replace function questions_flood_guard() returns trigger
language plpgsql as $$
begin
  if (select count(*) from questions
        where show_id = new.show_id
          and created_at > now() - interval '60 seconds') >= 15 then
    raise exception 'flood limit: too many questions at once'
      using errcode = 'P0001';
  end if;
  if exists (select 1 from questions
        where show_id = new.show_id
          and lower(body) = lower(new.body)
          and created_at > now() - interval '2 minutes') then
    raise exception 'duplicate question'
      using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists questions_flood_guard on questions;
create trigger questions_flood_guard
  before insert on questions
  for each row execute function questions_flood_guard();

-- The only anon write paths for existing questions.
create or replace function increment_upvote(p_question_id uuid) returns void
language sql security definer set search_path = public as $$
  update questions set upvotes = upvotes + 1
   where id = p_question_id and status = 'open';
$$;
create or replace function set_question_status(p_question_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('open', 'answered', 'dismissed') then
    raise exception 'bad status: %', p_status using errcode = 'P0001';
  end if;
  update questions set status = p_status where id = p_question_id;
end $$;
grant execute on function increment_upvote(uuid) to anon;
grant execute on function set_question_status(uuid, text) to anon;

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
