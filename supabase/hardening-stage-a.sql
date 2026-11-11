-- ---------------------------------------------------------------------
-- TIER 1a — length constraints (existing rows verified compliant
-- 2026-11-10: questions table was empty, so plain ADD is safe).
-- ---------------------------------------------------------------------
alter table questions drop constraint if exists questions_body_len;
alter table questions
  add constraint questions_body_len check (char_length(body) between 1 and 280);
alter table questions drop constraint if exists questions_name_len;
alter table questions
  add constraint questions_name_len check (name is null or char_length(name) <= 40);

-- ---------------------------------------------------------------------
-- TIER 1b — anon insert policy: length caps + dangerous-link blocks.
-- Normal links pass. Blocked:
--   * URLs whose path ends in an executable/script extension
--     (.exe .msi .scr .bat .cmd .com .jar .vbs .js .apk .dmg .pkg)
--   * anonymizing shortener domains
--     (bit.ly tinyurl.com rb.gy cutt.ly is.gd v.gd shorturl.at t.ly)
-- Questions render as escaped plain text everywhere, so a posted link
-- is inert text — these blocks are defense in depth, not the only wall.
-- ---------------------------------------------------------------------
drop policy if exists "anon insert questions" on questions;
create policy "anon insert questions"
  on questions for insert to anon with check (
    char_length(body) between 1 and 280
    and (name is null or char_length(name) <= 40)
    and body !~* '(https?://|www\.)[^[:space:]]*/[^[:space:]]*\.(exe|msi|scr|bat|cmd|com|jar|vbs|js|apk|dmg|pkg)([?#][^[:space:]]*)?([[:space:]]|$)'
    and (name is null or name !~* '(https?://|www\.)[^[:space:]]*/[^[:space:]]*\.(exe|msi|scr|bat|cmd|com|jar|vbs|js|apk|dmg|pkg)([?#][^[:space:]]*)?([[:space:]]|$)')
    and body !~* '(^|[[:space:]])(https?://)?(www\.)?(bit\.ly|tinyurl\.com|rb\.gy|cutt\.ly|is\.gd|v\.gd|shorturl\.at|t\.ly)(/[^[:space:]]*)?([[:space:]]|$)'
    and (name is null or name !~* '(^|[[:space:]])(https?://)?(www\.)?(bit\.ly|tinyurl\.com|rb\.gy|cutt\.ly|is\.gd|v\.gd|shorturl\.at|t\.ly)(/[^[:space:]]*)?([[:space:]]|$)')
  );

-- ---------------------------------------------------------------------
-- TIER 1c — BEFORE INSERT flood + duplicate guard.
--   flood:     >= 15 questions for one show in the last 60 seconds
--   duplicate: identical lower(body) for the same show in last 2 minutes
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- TIER 2 — write-path RPCs (SECURITY DEFINER; the ONLY ways anon can
-- change upvotes or status once the update policy is dropped).
-- ---------------------------------------------------------------------
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

