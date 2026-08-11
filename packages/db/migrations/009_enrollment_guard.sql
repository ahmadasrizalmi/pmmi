-- Enforce the blueprint state invariant: ACCEPTED -> registration -> ENROLLED.
create or replace function pmmi_require_registration_before_enrollment()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'ENROLLED'::application_status
     and OLD.status is distinct from 'ENROLLED'::application_status then
    if not exists (
      select 1 from registrations r
      where r.application_id = NEW.id
        and r.program_id is not null
        and r.cohort_id is not null
        and r.status <> 'CANCELLED'
    ) then
      raise exception 'registration with program and cohort is required before enrollment'
        using errcode = '23514';
    end if;
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_require_registration_before_enrollment') then
    create trigger trg_require_registration_before_enrollment
    before update of status on applications
    for each row execute function pmmi_require_registration_before_enrollment();
  end if;
end $$;
