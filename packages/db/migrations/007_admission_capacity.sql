-- Prevent accepted/enrolled applications from exceeding admission-period capacity.
create or replace function pmmi_enforce_admission_capacity() returns trigger language plpgsql as $$
declare cap integer; occupied integer;
begin
  if new.status in ('ACCEPTED','ENROLLED') and old.status not in ('ACCEPTED','ENROLLED') then
    select capacity into cap from admission_periods where id=new.admission_period_id for update;
    if cap is not null then
      select count(*) into occupied from applications
      where admission_period_id=new.admission_period_id and id<>new.id and status in ('ACCEPTED','ENROLLED');
      if occupied>=cap then
        raise exception 'admission period capacity reached' using errcode='P0001';
      end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_admission_capacity on applications;
create trigger trg_admission_capacity before update of status on applications for each row execute function pmmi_enforce_admission_capacity();
