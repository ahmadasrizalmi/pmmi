-- PMMI Digital Campus — remaining blueprint domains
-- Phase 3+ completion: admissions detail, schedules/attendance, notifications, AI, Hermes, rewards, ops.

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year integer not null,
  starts_at date,
  ends_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(name, year)
);

alter table students add column if not exists program_id uuid references programs(id) on delete set null;
alter table students add column if not exists cohort_id uuid references cohorts(id) on delete set null;

-- Admissions detail
create table if not exists application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  kind text not null,
  bucket text not null,
  object_key text not null unique,
  original_name text not null,
  content_type text,
  size_bytes bigint,
  verified_at timestamptz,
  verified_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  reviewer_user_id uuid not null references users(id) on delete cascade,
  status text not null check (status in ('PENDING','APPROVED','NEEDS_FIX','REJECTED')) default 'PENDING',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(application_id, reviewer_user_id)
);

create table if not exists selection_scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  category text not null,
  score numeric(6,2) not null check (score >= 0),
  max_score numeric(6,2) not null check (max_score > 0),
  notes text,
  scored_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(application_id, category)
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  location text,
  meeting_url text,
  interviewer_user_id uuid references users(id) on delete set null,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED','COMPLETED','NO_SHOW','CANCELLED')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admission_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references applications(id) on delete cascade,
  decision text not null check (decision in ('ACCEPTED','WAITLISTED','REJECTED')),
  reason text,
  decided_by uuid references users(id) on delete set null,
  decided_at timestamptz not null default now()
);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references applications(id) on delete cascade,
  program_id uuid references programs(id) on delete set null,
  cohort_id uuid references cohorts(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING','COMPLETE','CANCELLED')),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Academic schedule and attendance
create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  meeting_url text,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED','COMPLETED','CANCELLED')),
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references class_sessions(id) on delete cascade,
  student_user_id uuid not null references users(id) on delete cascade,
  status text not null check (status in ('PRESENT','LATE','EXCUSED','ABSENT')),
  notes text,
  marked_by uuid references users(id) on delete set null,
  marked_at timestamptz not null default now(),
  unique(session_id, student_user_id)
);

-- Notification center / channels / outbox
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  category text not null default 'general',
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  recipient jsonb not null default '{}'::jsonb,
  priority text not null default 'NORMAL' check (priority in ('LOW','NORMAL','HIGH','CRITICAL')),
  source_type text,
  source_id text,
  action_url text,
  dedupe_key text,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists notifications_user_dedupe_uq on notifications(user_id, dedupe_key) where dedupe_key is not null;
create index if not exists notifications_user_created_idx on notifications(user_id, created_at desc);

create table if not exists notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references notifications(id) on delete cascade,
  channel text not null check (channel in ('IN_APP','EMAIL','WHATSAPP','TELEGRAM')),
  status text not null default 'PENDING' check (status in ('PENDING','SENDING','SENT','DELIVERED','FAILED','SKIPPED')),
  attempt_count integer not null default 0,
  provider_message_id text,
  last_error text,
  next_attempt_at timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(notification_id, channel)
);
create index if not exists notification_delivery_pending_idx on notification_deliveries(status, next_attempt_at);

create table if not exists notification_preferences (
  user_id uuid not null references users(id) on delete cascade,
  category text not null,
  channel text not null check (channel in ('IN_APP','EMAIL','WHATSAPP','TELEGRAM')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(user_id, category, channel)
);

create table if not exists notification_templates (
  key text not null,
  channel text not null check (channel in ('IN_APP','EMAIL','WHATSAPP','TELEGRAM')),
  subject text,
  body text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key(key, channel)
);

create table if not exists user_notification_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  channel text not null check (channel in ('EMAIL','WHATSAPP','TELEGRAM')),
  address_or_external_id text not null,
  verified_at timestamptz,
  enabled boolean not null default true,
  priority integer not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, channel, address_or_external_id)
);

create table if not exists channel_link_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  channel text not null check (channel in ('TELEGRAM','WHATSAPP')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists outbox_events (
  id bigserial primary key,
  topic text not null,
  aggregate_type text,
  aggregate_id text,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text unique,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  attempt_count integer not null default 0,
  last_error text,
  locked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists outbox_pending_idx on outbox_events(processed_at, available_at, id);

-- AI accounting / gateway
create table if not exists ai_credit_wallets (
  user_id uuid primary key references users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists ai_credit_ledger (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  delta bigint not null,
  balance_after bigint not null check (balance_after >= 0),
  reason text not null,
  reference_type text,
  reference_id text,
  idempotency_key text unique,
  actor_user_id uuid references users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_ledger_user_idx on ai_credit_ledger(user_id, created_at desc);

create table if not exists ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  model text not null,
  provider text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  credits_charged bigint not null default 0,
  status text not null check (status in ('RESERVED','SUCCEEDED','FAILED')),
  latency_ms integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists ai_model_permissions (
  role user_role not null,
  model_pattern text not null,
  enabled boolean not null default true,
  max_requests_per_hour integer,
  primary key(role, model_pattern)
);

-- Hermes profile/workspace provisioning
create table if not exists hermes_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  profile_name text not null unique,
  display_name text not null,
  status text not null default 'PENDING' check (status in ('PENDING','BUILDING','READY','FAILED','ARCHIVED')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index if not exists hermes_profiles_user_idx on hermes_profiles(user_id, status);

create table if not exists hermes_workspaces (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references hermes_profiles(id) on delete cascade,
  path text not null unique,
  quota_bytes bigint not null default 1073741824 check (quota_bytes >= 0),
  status text not null default 'PENDING' check (status in ('PENDING','READY','ARCHIVED','FAILED')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hermes_build_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references hermes_profiles(id) on delete cascade,
  status text not null default 'QUEUED' check (status in ('QUEUED','RUNNING','SUCCEEDED','FAILED')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

-- Rewards / achievements
create table if not exists reward_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  trigger_type text not null,
  ai_credits bigint not null default 0 check (ai_credits >= 0),
  hermes_slots integer not null default 0 check (hermes_slots >= 0),
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  reward_rule_id uuid not null references reward_rules(id) on delete cascade,
  source_type text,
  source_id text,
  granted_by uuid references users(id) on delete set null,
  granted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id, reward_rule_id, source_type, source_id)
);

-- Operational health and backup records
create table if not exists ops_events (
  id bigserial primary key,
  kind text not null,
  severity text not null check (severity in ('INFO','WARN','ERROR','CRITICAL')),
  source text not null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists backup_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  status text not null check (status in ('RUNNING','SUCCEEDED','FAILED')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  artifact_path text,
  size_bytes bigint,
  checksum text,
  last_error text
);

-- Seed programs and baseline model access.
insert into programs(code,name,description) values
  ('PROGRAMMER','Programmer','Pemrograman dan pengembangan produk digital'),
  ('CONTENT_CREATOR','Content Creator','Produksi konten, desain, foto, dan video')
on conflict(code) do nothing;

insert into ai_model_permissions(role,model_pattern,enabled) values
  ('ADMIN','*',true),('USTADZ','*',true),('SANTRI','*',true)
on conflict do nothing;

-- Keep wallet synchronized on new enrollment; wallet becomes source of truth for AI usage.
insert into ai_credit_wallets(user_id,balance)
select user_id, ai_credit_balance from resource_entitlements
on conflict(user_id) do nothing;

-- Helper trigger: transactional outbox.
create or replace function pmmi_emit_event() returns trigger language plpgsql as $$
declare
  event_topic text := TG_ARGV[0];
  aggregate text := TG_ARGV[1];
  entity_id text;
  body jsonb;
begin
  entity_id := coalesce(NEW.id::text, '');
  body := to_jsonb(NEW);
  insert into outbox_events(topic,aggregate_type,aggregate_id,payload,dedupe_key)
  values(event_topic,aggregate,entity_id,body,event_topic || ':' || entity_id || ':' || extract(epoch from clock_timestamp())::text);
  return NEW;
end $$;

-- Domain event triggers. Fine-grained routing is handled by the worker.
do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_assignment_created_event') then
    create trigger trg_assignment_created_event after insert on assignments for each row execute function pmmi_emit_event('assignment.created','assignment');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_submission_changed_event') then
    create trigger trg_submission_changed_event after insert or update on submissions for each row execute function pmmi_emit_event('submission.changed','submission');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_grade_changed_event') then
    create trigger trg_grade_changed_event after insert or update on grades for each row execute function pmmi_emit_event('grade.changed','grade');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_certificate_created_event') then
    create trigger trg_certificate_created_event after insert on certificates for each row execute function pmmi_emit_event('certificate.issued','certificate');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_portfolio_created_event') then
    create trigger trg_portfolio_created_event after insert on portfolio_projects for each row execute function pmmi_emit_event('portfolio.featured','portfolio_project');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_application_changed_event') then
    create trigger trg_application_changed_event after update of status on applications for each row when (OLD.status is distinct from NEW.status) execute function pmmi_emit_event('admission.status_changed','application');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_student_status_event') then
    create trigger trg_student_status_event after update of status on students for each row when (OLD.status is distinct from NEW.status) execute function pmmi_emit_event('student.lifecycle_changed','student');
  end if;
  if not exists (select 1 from pg_trigger where tgname='trg_session_created_event') then
    create trigger trg_session_created_event after insert or update on class_sessions for each row execute function pmmi_emit_event('class.session_changed','class_session');
  end if;
end $$;
