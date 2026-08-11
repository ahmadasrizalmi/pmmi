-- PMMI lifecycle, outbox and automatic provisioning triggers.

do $$ begin
  if not exists(select 1 from pg_constraint where conname='classes_cohort_id_fk') then
    alter table classes add constraint classes_cohort_id_fk foreign key(cohort_id) references cohorts(id) on delete set null;
  end if;
exception when undefined_column then null; end $$;

create or replace function pmmi_new_application_admin_outbox() returns trigger language plpgsql as $$
declare admin_id uuid;
begin
  for admin_id in select id from users where role='ADMIN' and is_active=true loop
    insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
    values('admission.new_application','application',new.id::text,
      jsonb_build_object('userId',admin_id,'applicationId',new.id,'applicantName',new.applicant_name,'email',new.email,'phone',new.phone),
      'new-application:'||new.id::text||':'||admin_id::text) on conflict do nothing;
  end loop;
  return new;
end $$;
drop trigger if exists trg_new_application_admin_outbox on applications;
create trigger trg_new_application_admin_outbox after insert on applications for each row execute function pmmi_new_application_admin_outbox();

create or replace function pmmi_application_status_outbox() returns trigger language plpgsql as $$
declare event_name text;
begin
  if old.status is distinct from new.status then
    event_name:=case new.status::text
      when 'ADMIN_VERIFIED' then 'admission.admin_verified'
      when 'SCREENING' then 'admission.screening'
      when 'INTERVIEW' then 'admission.interview'
      when 'ACCEPTED' then 'admission.accepted'
      when 'WAITLISTED' then 'admission.waitlisted'
      when 'REJECTED' then 'admission.rejected'
      when 'ENROLLED' then 'admission.enrolled'
      else null end;
    if event_name is not null then
      insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
      values(event_name,'application',new.id::text,
        jsonb_build_object('applicationId',new.id,'applicantName',new.applicant_name,'email',new.email,'phone',new.phone,'status',new.status::text),
        'application-status:'||new.id::text||':'||new.status::text) on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_application_status_outbox on applications;
create trigger trg_application_status_outbox after update of status on applications for each row execute function pmmi_application_status_outbox();

create or replace function pmmi_auto_enroll_cohort_classes() returns trigger language plpgsql as $$
begin
  if new.status='ACTIVE' and new.cohort_id is not null then
    insert into enrollments(class_id,student_user_id,status)
      select id,new.user_id,'active' from classes where cohort_id=new.cohort_id
      on conflict(class_id,student_user_id) do update set status='active';
  end if;
  return new;
end $$;
drop trigger if exists trg_auto_enroll_cohort_classes on students;
create trigger trg_auto_enroll_cohort_classes after insert or update of cohort_id,status on students for each row execute function pmmi_auto_enroll_cohort_classes();

create or replace function pmmi_student_lifecycle_outbox() returns trigger language plpgsql as $$
begin
  if old.status is distinct from new.status then
    if new.status in ('DROPOUT','SUSPENDED','INACTIVE') then
      insert into pending_communications(user_id,event_type,source_type,source_id,title,body)
      values(new.user_id,'student.lifecycle','student',new.id::text,'Pemberitahuan status santri','Status santri berubah menjadi '||new.status::text||'. Admin wajib meninjau dan menyesuaikan pesan ini sebelum dikirim.');
    else
      insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
      values('student.lifecycle','student',new.id::text,jsonb_build_object('userId',new.user_id,'studentId',new.id,'from',old.status::text,'to',new.status::text),
        'student-lifecycle:'||new.id::text||':'||new.status::text||':'||extract(epoch from now())::bigint::text);
    end if;
    if new.status in ('GRADUATED','ALUMNI','DROPOUT','INACTIVE','SUSPENDED') then
      insert into hermes_build_jobs(hermes_profile_id,job_type)
        select id,'ARCHIVE' from hermes_profiles where user_id=new.user_id and status not in('ARCHIVED','FAILED')
        and not exists(select 1 from hermes_build_jobs j where j.hermes_profile_id=hermes_profiles.id and j.job_type='ARCHIVE' and j.status in('PENDING','RUNNING'));
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trg_student_lifecycle_outbox on students;
create trigger trg_student_lifecycle_outbox after update of status on students for each row execute function pmmi_student_lifecycle_outbox();

create or replace function pmmi_assignment_outbox() returns trigger language plpgsql as $$
declare student_id uuid;
begin
  for student_id in select student_user_id from enrollments where class_id=new.class_id and status='active' loop
    insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
    values('assignment.created','assignment',new.id::text,jsonb_build_object('userId',student_id,'assignmentId',new.id,'title',new.title,'dueAt',new.due_at),
      'assignment:'||new.id::text||':'||student_id::text) on conflict do nothing;
  end loop;
  return new;
end $$;
drop trigger if exists trg_assignment_outbox on assignments;
create trigger trg_assignment_outbox after insert on assignments for each row execute function pmmi_assignment_outbox();

create or replace function pmmi_submission_outbox() returns trigger language plpgsql as $$
declare teacher_id uuid;
begin
  select c.teacher_user_id into teacher_id from assignments a join classes c on c.id=a.class_id where a.id=new.assignment_id;
  if teacher_id is not null then
    insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
    values('submission.created','submission',new.id::text,jsonb_build_object('userId',teacher_id,'submissionId',new.id,'studentUserId',new.student_user_id),
      'submission:'||new.id::text||':'||new.status) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_submission_outbox on submissions;
create trigger trg_submission_outbox after insert or update of status on submissions for each row execute function pmmi_submission_outbox();

create or replace function pmmi_grade_outbox() returns trigger language plpgsql as $$
declare student_id uuid;
begin
  select student_user_id into student_id from submissions where id=new.submission_id;
  insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
  values(case when new.revision_required then 'submission.revision_required' else 'submission.graded' end,'submission',new.submission_id::text,
    jsonb_build_object('userId',student_id,'submissionId',new.submission_id,'score',new.score,'feedback',new.feedback,'revisionDueAt',new.revision_due_at),
    'grade:'||new.submission_id::text||':'||extract(epoch from new.updated_at)::bigint::text) on conflict do nothing;
  return new;
end $$;
drop trigger if exists trg_grade_outbox on grades;
create trigger trg_grade_outbox after insert or update on grades for each row execute function pmmi_grade_outbox();

create or replace function pmmi_certificate_outbox() returns trigger language plpgsql as $$
begin
  insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
  values('certificate.issued','certificate',new.id::text,jsonb_build_object('userId',new.student_user_id,'title',new.title,'certificateNo',new.certificate_no),
    'certificate:'||new.id::text) on conflict do nothing;
  return new;
end $$;
drop trigger if exists trg_certificate_outbox on certificates;
create trigger trg_certificate_outbox after insert on certificates for each row execute function pmmi_certificate_outbox();

create or replace function pmmi_portfolio_outbox() returns trigger language plpgsql as $$
begin
  if new.featured=true and new.published_at is not null and (tg_op='INSERT' or old.featured is distinct from new.featured or old.published_at is distinct from new.published_at) then
    insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
    values('portfolio.featured','portfolio_project',new.id::text,jsonb_build_object('userId',new.student_user_id,'title',new.title,'slug',new.slug),
      'portfolio:'||new.id::text) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_portfolio_outbox on portfolio_projects;
create trigger trg_portfolio_outbox after insert or update of featured,published_at on portfolio_projects for each row execute function pmmi_portfolio_outbox();

create or replace function pmmi_achievement_outbox() returns trigger language plpgsql as $$
declare reward_name text;
begin
  select name into reward_name from rewards where id=new.reward_id;
  insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
  values('reward.earned','achievement',new.id::text,jsonb_build_object('userId',new.user_id,'rewardName',reward_name),
    'achievement:'||new.id::text) on conflict do nothing;
  return new;
end $$;
drop trigger if exists trg_achievement_outbox on achievements;
create trigger trg_achievement_outbox after insert on achievements for each row execute function pmmi_achievement_outbox();

create or replace function pmmi_class_session_outbox() returns trigger language plpgsql as $$
declare student_id uuid; event_name text; event_title text; event_body text;
begin
  event_name:=case when new.status='CANCELLED' then 'class.session_cancelled' when tg_op='UPDATE' then 'class.session_rescheduled' else 'class.session_scheduled' end;
  event_title:=case when new.status='CANCELLED' then 'Kelas dibatalkan: '||new.title when tg_op='UPDATE' then 'Jadwal kelas diperbarui: '||new.title else 'Jadwal kelas: '||new.title end;
  event_body:='Waktu: '||to_char(new.starts_at at time zone 'Asia/Jakarta','DD Mon YYYY HH24:MI')||case when new.location is not null then '. Lokasi: '||new.location else '' end||'.';
  for student_id in select student_user_id from enrollments where class_id=new.class_id and status='active' loop
    insert into notification_outbox(event_type,source_type,source_id,payload,dedupe_key)
    values(event_name,'class_session',new.id::text,jsonb_build_object('userId',student_id,'sessionId',new.id,'title',event_title,'body',event_body,'startsAt',new.starts_at,'location',new.location,'channels',jsonb_build_array('IN_APP','WHATSAPP')),
      'class-session:'||new.id::text||':'||student_id::text||':'||new.status||':'||extract(epoch from new.updated_at)::bigint::text) on conflict do nothing;
  end loop;
  return new;
end $$;
drop trigger if exists trg_class_session_outbox on class_sessions;
create trigger trg_class_session_outbox after insert or update of starts_at,status,location on class_sessions for each row execute function pmmi_class_session_outbox();
