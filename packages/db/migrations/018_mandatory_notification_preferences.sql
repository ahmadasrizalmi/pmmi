create or replace function pmmi_guard_mandatory_notification_preferences()
returns trigger language plpgsql as $$
begin
  if lower(NEW.category) in ('ops','security','lifecycle') then
    NEW.enabled := true;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_guard_mandatory_notification_preferences') then
    create trigger trg_guard_mandatory_notification_preferences
    before insert or update of category,enabled on notification_preferences
    for each row execute function pmmi_guard_mandatory_notification_preferences();
  end if;
end $$;
