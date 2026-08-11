create or replace function pmmi_guard_application_transition()
returns trigger language plpgsql as $$
declare
  valid boolean := false;
  v_capacity integer;
  v_enrolled integer;
begin
  if OLD.status is not distinct from NEW.status then
    return NEW;
  end if;

  valid := case OLD.status
    when 'DRAFT' then NEW.status in ('SUBMITTED')
    when 'SUBMITTED' then NEW.status in ('ADMIN_VERIFIED','REJECTED')
    when 'ADMIN_VERIFIED' then NEW.status in ('SCREENING','INTERVIEW','REJECTED')
    when 'SCREENING' then NEW.status in ('INTERVIEW','ACCEPTED','WAITLISTED','REJECTED')
    when 'INTERVIEW' then NEW.status in ('ACCEPTED','WAITLISTED','REJECTED')
    when 'WAITLISTED' then NEW.status in ('ACCEPTED','REJECTED')
    when 'ACCEPTED' then NEW.status in ('ENROLLED')
    else false
  end;

  if not valid then
    raise exception 'invalid application transition: % -> %',OLD.status,NEW.status
      using errcode='23514';
  end if;

  if NEW.status='ENROLLED' then
    select capacity into v_capacity from admission_periods where id=NEW.admission_period_id;
    if v_capacity is not null then
      select count(*)::integer into v_enrolled
      from applications
      where admission_period_id=NEW.admission_period_id
        and status='ENROLLED'
        and id<>NEW.id;
      if v_enrolled >= v_capacity then
        raise exception 'admission period capacity exceeded'
          using errcode='23514', detail=format('capacity=%s enrolled=%s',v_capacity,v_enrolled);
      end if;
    end if;
  end if;

  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_guard_application_transition') then
    create trigger trg_guard_application_transition
    before update of status on applications
    for each row execute function pmmi_guard_application_transition();
  end if;
end $$;
