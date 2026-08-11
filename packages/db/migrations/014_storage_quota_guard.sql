-- Enforce storage policy when an uploaded object is attached to durable application data.
create or replace function pmmi_guard_submission_storage_quota()
returns trigger language plpgsql as $$
declare
  v_user uuid;
  v_quota bigint;
  v_used bigint;
begin
  select s.student_user_id into v_user
  from submissions s where s.id = NEW.submission_id;

  if v_user is null then
    raise exception 'submission owner not found' using errcode = '23503';
  end if;

  select storage_quota_bytes into v_quota
  from resource_entitlements where user_id = v_user;

  if v_quota is null then
    raise exception 'storage entitlement not found' using errcode = '23514';
  end if;

  select coalesce(sum(sf.size_bytes),0) into v_used
  from submission_files sf
  join submissions s on s.id = sf.submission_id
  where s.student_user_id = v_user
    and (TG_OP <> 'UPDATE' or sf.id <> NEW.id);

  if v_used + coalesce(NEW.size_bytes,0) > v_quota then
    raise exception 'student storage quota exceeded'
      using errcode = '23514',
            detail = format('used=%s incoming=%s quota=%s',v_used,coalesce(NEW.size_bytes,0),v_quota);
  end if;
  return NEW;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_guard_submission_storage_quota') then
    create trigger trg_guard_submission_storage_quota
    before insert or update of size_bytes,submission_id on submission_files
    for each row execute function pmmi_guard_submission_storage_quota();
  end if;
end $$;

alter table application_documents
  drop constraint if exists application_documents_size_limit;
alter table application_documents
  add constraint application_documents_size_limit
  check (size_bytes is null or size_bytes between 0 and 52428800);

alter table submission_files
  drop constraint if exists submission_files_nonnegative_size;
alter table submission_files
  add constraint submission_files_nonnegative_size
  check (size_bytes is null or size_bytes >= 0);
