-- Alumni/graduated/suspended/dropout/inactive accounts may retain read access, but academic
-- submission writes are only legal for ACTIVE students.
create or replace function pmmi_require_active_student_submission()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from students s
    where s.user_id = NEW.student_user_id
      and s.status = 'ACTIVE'
  ) then
    raise exception 'student must be ACTIVE to submit academic work'
      using errcode = '42501';
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_require_active_student_submission') then
    create trigger trg_require_active_student_submission
    before insert or update on submissions
    for each row execute function pmmi_require_active_student_submission();
  end if;
end $$;

create or replace function pmmi_require_active_student_upload_intent()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from students s
    where s.user_id = NEW.student_user_id
      and s.status = 'ACTIVE'
  ) then
    raise exception 'student must be ACTIVE to upload assignment files'
      using errcode = '42501';
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_require_active_student_upload_intent') then
    create trigger trg_require_active_student_upload_intent
    before insert on submission_upload_intents
    for each row execute function pmmi_require_active_student_upload_intent();
  end if;
end $$;
