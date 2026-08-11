-- Operational guards: quota enforcement, compatibility balance sync, and provider circuit breaker.

create or replace function pmmi_enforce_submission_storage_quota() returns trigger language plpgsql as $$
declare quota bigint; used bigint; owner_id uuid;
begin
  select s.student_user_id into owner_id from submissions s where s.id=new.submission_id;
  if owner_id is null then return new; end if;
  select storage_quota_bytes into quota from resource_entitlements where user_id=owner_id;
  if quota is null or quota<=0 then raise exception 'storage quota is not configured for user %',owner_id using errcode='P0001'; end if;
  select coalesce(sum(sf.size_bytes),0) into used from submission_files sf join submissions s on s.id=sf.submission_id where s.student_user_id=owner_id;
  if used+coalesce(new.size_bytes,0)>quota then raise exception 'storage quota exceeded for user %',owner_id using errcode='P0001'; end if;
  return new;
end $$;
drop trigger if exists trg_submission_storage_quota on submission_files;
create trigger trg_submission_storage_quota before insert on submission_files for each row execute function pmmi_enforce_submission_storage_quota();

create or replace function pmmi_sync_ai_wallet_compat() returns trigger language plpgsql as $$
begin
  update resource_entitlements set ai_credit_balance=new.balance,updated_at=now() where user_id=new.user_id;
  return new;
end $$;
drop trigger if exists trg_sync_ai_wallet_compat on ai_credit_wallets;
create trigger trg_sync_ai_wallet_compat after insert or update of balance on ai_credit_wallets for each row execute function pmmi_sync_ai_wallet_compat();

create or replace function pmmi_defer_provider_jobs_on_circuit() returns trigger language plpgsql as $$
begin
  if new.disabled_until is not null and new.disabled_until>now() then
    update notification_jobs j set available_at=greatest(j.available_at,new.disabled_until)
    from notification_deliveries d
    where d.id=j.delivery_id and d.channel=new.channel and j.locked_at is null;
  end if;
  return new;
end $$;
drop trigger if exists trg_provider_circuit_defer on notification_provider_health;
create trigger trg_provider_circuit_defer after insert or update of disabled_until on notification_provider_health for each row execute function pmmi_defer_provider_jobs_on_circuit();

create or replace function pmmi_prevent_delivery_during_open_circuit() returns trigger language plpgsql as $$
declare until_at timestamptz;
begin
  select disabled_until into until_at from notification_provider_health h join notification_deliveries d on d.channel=h.channel where d.id=new.delivery_id;
  if until_at is not null and until_at>new.available_at then new.available_at:=until_at; end if;
  return new;
end $$;
drop trigger if exists trg_notification_job_circuit on notification_jobs;
create trigger trg_notification_job_circuit before insert or update of delivery_id on notification_jobs for each row execute function pmmi_prevent_delivery_during_open_circuit();
