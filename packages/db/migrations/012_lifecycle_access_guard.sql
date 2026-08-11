-- Lifecycle access is a data invariant, not only an API convention.
-- A suspended/dropout/inactive student must never end up with an active login.
create or replace function pmmi_guard_student_user_activation()
returns trigger language plpgsql as $$
begin
  if NEW.is_active = true and exists (
    select 1 from students s
    where s.user_id = NEW.id
      and s.status in ('SUSPENDED','DROPOUT','INACTIVE')
  ) then
    NEW.is_active := false;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_guard_student_user_activation') then
    create trigger trg_guard_student_user_activation
    before update of is_active on users
    for each row execute function pmmi_guard_student_user_activation();
  end if;
end $$;

-- Ensure profile/runtime shutdown is always queued when a student leaves ACTIVE access,
-- even if the lifecycle change was performed outside the HTTP route.
create or replace function pmmi_queue_hermes_lifecycle_archive()
returns trigger language plpgsql as $$
begin
  if OLD.status is distinct from NEW.status
     and NEW.status in ('GRADUATED','ALUMNI','DROPOUT','SUSPENDED','INACTIVE') then
    insert into outbox_events(topic,aggregate_type,aggregate_id,payload,dedupe_key)
    values(
      'hermes.user.archive',
      'student',
      NEW.id::text,
      jsonb_build_object('studentId',NEW.id,'userId',NEW.user_id,'status',NEW.status),
      'hermes-lifecycle:' || NEW.id::text || ':' || NEW.status::text || ':' || txid_current()::text
    )
    on conflict(dedupe_key) do nothing;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_queue_hermes_lifecycle_archive') then
    create trigger trg_queue_hermes_lifecycle_archive
    after update of status on students
    for each row execute function pmmi_queue_hermes_lifecycle_archive();
  end if;
end $$;
