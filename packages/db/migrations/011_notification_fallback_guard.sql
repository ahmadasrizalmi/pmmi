-- Protect per-route fallback semantics even if a worker tries to skip all fallback rows after
-- one primary route succeeds. A fallback may only be skipped as "another route succeeded"
-- when its own fallback_for parent delivery actually succeeded.
create or replace function pmmi_guard_fallback_skip()
returns trigger language plpgsql as $$
begin
  if NEW.is_fallback = true
     and NEW.status = 'SKIPPED'
     and NEW.last_error = 'another route succeeded'
     and not exists (
       select 1 from notification_deliveries parent
       where parent.notification_id = NEW.notification_id
         and parent.channel = NEW.fallback_for
         and parent.status in ('SENT','DELIVERED')
     ) then
    return OLD;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_guard_notification_fallback_skip') then
    create trigger trg_guard_notification_fallback_skip
    before update of status,last_error on notification_deliveries
    for each row execute function pmmi_guard_fallback_skip();
  end if;
end $$;
