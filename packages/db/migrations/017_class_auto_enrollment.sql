alter table classes add column if not exists program_id uuid references programs(id) on delete set null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='classes_cohort_id_fkey') then
    alter table classes add constraint classes_cohort_id_fkey foreign key(cohort_id) references cohorts(id) on delete set null;
  end if;
end $$;
create index if not exists classes_cohort_program_idx on classes(cohort_id,program_id);

create or replace function pmmi_auto_enroll_student_classes()
returns trigger language plpgsql as $$
begin
  if NEW.status='ACTIVE' and NEW.cohort_id is not null then
    insert into enrollments(class_id,student_user_id,status)
    select c.id,NEW.user_id,'active'
    from classes c
    where c.cohort_id=NEW.cohort_id
      and (c.program_id is null or c.program_id=NEW.program_id)
    on conflict(class_id,student_user_id) do update set status='active';
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_auto_enroll_student_classes') then
    create trigger trg_auto_enroll_student_classes
    after insert or update of cohort_id,program_id,status on students
    for each row execute function pmmi_auto_enroll_student_classes();
  end if;
end $$;

create or replace function pmmi_auto_enroll_class_students()
returns trigger language plpgsql as $$
begin
  if NEW.cohort_id is not null then
    insert into enrollments(class_id,student_user_id,status)
    select NEW.id,s.user_id,'active'
    from students s
    where s.status='ACTIVE'
      and s.cohort_id=NEW.cohort_id
      and (NEW.program_id is null or NEW.program_id=s.program_id)
    on conflict(class_id,student_user_id) do update set status='active';
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_auto_enroll_class_students') then
    create trigger trg_auto_enroll_class_students
    after insert or update of cohort_id,program_id on classes
    for each row execute function pmmi_auto_enroll_class_students();
  end if;
end $$;
