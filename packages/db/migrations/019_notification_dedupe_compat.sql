-- Migration 010 normalized NULL user_id in the main dedupe index, but worker INSERTs rely on
-- PostgreSQL inferring the historical (user_id,dedupe_key) partial index for ON CONFLICT.
-- Restore that exact index and handle applicant/user-less dedupe separately.
drop index if exists notifications_user_dedupe_idx;
create unique index notifications_user_dedupe_idx
  on notifications(user_id,dedupe_key)
  where dedupe_key is not null;

create unique index if not exists notifications_applicant_dedupe_idx
  on notifications(dedupe_key)
  where user_id is null and dedupe_key is not null;

create or replace function pmmi_dedupe_userless_notification()
returns trigger language plpgsql as $$
begin
  if NEW.user_id is null and NEW.dedupe_key is not null and exists (
    select 1 from notifications n
    where n.user_id is null and n.dedupe_key=NEW.dedupe_key
  ) then
    return null;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_dedupe_userless_notification') then
    create trigger trg_dedupe_userless_notification
    before insert on notifications
    for each row execute function pmmi_dedupe_userless_notification();
  end if;
end $$;
