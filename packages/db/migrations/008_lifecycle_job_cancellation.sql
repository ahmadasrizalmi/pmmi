-- Lifecycle shutdown must cancel not-yet-provisioned agents and queue archive only for live agents.
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
      update hermes_build_jobs j set status='FAILED',completed_at=now(),last_error='cancelled by student lifecycle',locked_at=null,locked_by=null
      where j.status in ('PENDING','RUNNING') and j.job_type in ('BUILD','START')
        and j.hermes_profile_id in(select id from hermes_profiles where user_id=new.user_id and status in('PENDING','BUILDING'));

      update ai_api_keys set revoked_at=coalesce(revoked_at,now())
      where id in(select ai_api_key_id from hermes_profiles where user_id=new.user_id and status in('PENDING','BUILDING') and ai_api_key_id is not null);
      update hermes_workspaces set archived_at=coalesce(archived_at,now())
      where hermes_profile_id in(select id from hermes_profiles where user_id=new.user_id and status in('PENDING','BUILDING'));
      update hermes_profiles set status='ARCHIVED',updated_at=now(),last_error='cancelled by student lifecycle'
      where user_id=new.user_id and status in('PENDING','BUILDING');

      insert into hermes_build_jobs(hermes_profile_id,job_type)
        select id,'ARCHIVE' from hermes_profiles hp where hp.user_id=new.user_id and hp.status in('READY','STOPPED')
        and not exists(select 1 from hermes_build_jobs j where j.hermes_profile_id=hp.id and j.job_type='ARCHIVE' and j.status in('PENDING','RUNNING'));
    end if;
  end if;
  return new;
end $$;
