-- PMMI Digital Campus: remaining blueprint domains
-- Safe extension of Phase 1-2 schema.

create table if not exists programs (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, description text,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists cohorts (
  id uuid primary key default gen_random_uuid(), program_id uuid references programs(id) on delete set null,
  name text not null, cohort_year integer not null, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(program_id,cohort_year,name)
);
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references users(id) on delete cascade,
  bio text, specialization text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

alter table applications add column if not exists program_id uuid references programs(id) on delete set null;
alter table students add column if not exists program_id uuid references programs(id) on delete set null;
alter table students add column if not exists cohort_id uuid references cohorts(id) on delete set null;

create table if not exists application_access_tokens (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz not null, used_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists application_document_uploads (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id) on delete cascade,
  token_hash text not null unique, document_type text not null, bucket text not null, object_key text not null,
  original_name text not null, content_type text, expires_at timestamptz not null, consumed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists application_documents (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id) on delete cascade,
  document_type text not null, bucket text not null, object_key text not null, original_name text not null, content_type text,
  size_bytes bigint, verification_status text not null default 'PENDING' check(verification_status in('PENDING','VERIFIED','REJECTED')),
  verified_by uuid references users(id) on delete set null, verified_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists application_reviews (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id) on delete cascade,
  reviewer_user_id uuid references users(id) on delete set null, verdict text not null check(verdict in('PASS','FAIL','NEEDS_INFO')),
  notes text, created_at timestamptz not null default now()
);
create table if not exists selection_scores (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id) on delete cascade,
  criterion text not null, score numeric(8,2) not null, max_score numeric(8,2) not null default 100,
  scored_by uuid references users(id) on delete set null, notes text, created_at timestamptz not null default now(),
  check(score>=0 and score<=max_score)
);
create table if not exists interviews (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references applications(id) on delete cascade,
  scheduled_at timestamptz not null, location_or_url text, interviewer_user_id uuid references users(id) on delete set null,
  status text not null default 'SCHEDULED' check(status in('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists admission_decisions (
  id uuid primary key default gen_random_uuid(), application_id uuid not null unique references applications(id) on delete cascade,
  decision text not null check(decision in('ACCEPTED','WAITLISTED','REJECTED')), reason text,
  decided_by uuid references users(id) on delete set null, decided_at timestamptz not null default now()
);
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(), application_id uuid not null unique references applications(id) on delete cascade,
  status text not null default 'PENDING' check(status in('PENDING','COMPLETED','CANCELLED')), metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz, updated_by uuid references users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists portfolio_assets (
  id uuid primary key default gen_random_uuid(), portfolio_project_id uuid not null references portfolio_projects(id) on delete cascade,
  bucket text not null, object_key text not null, asset_type text not null default 'file', alt_text text, sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid references users(id) on delete cascade,
  recipient_email text, recipient_phone text, type text not null, category text not null default 'general', title text not null, body text not null,
  data jsonb not null default '{}'::jsonb, priority text not null default 'NORMAL' check(priority in('LOW','NORMAL','HIGH','CRITICAL')),
  source_type text, source_id text, action_url text, dedupe_key text, read_at timestamptz, expires_at timestamptz, created_at timestamptz not null default now()
);
create unique index if not exists notifications_user_dedupe_idx on notifications(user_id,dedupe_key) where user_id is not null and dedupe_key is not null;
create table if not exists notification_deliveries (
  id uuid primary key default gen_random_uuid(), notification_id uuid not null references notifications(id) on delete cascade,
  channel text not null check(channel in('IN_APP','EMAIL','WHATSAPP','TELEGRAM')), status text not null default 'PENDING' check(status in('PENDING','SENDING','SENT','DELIVERED','FAILED')),
  attempt_count integer not null default 0, provider_message_id text, last_error text, sent_at timestamptz, delivered_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(notification_id,channel)
);
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  category text not null, channel text not null check(channel in('IN_APP','EMAIL','WHATSAPP','TELEGRAM')), enabled boolean not null default true,
  digest boolean not null default false, quiet_hours jsonb not null default '{}'::jsonb, unique(user_id,category,channel)
);
create table if not exists notification_templates (
  id uuid primary key default gen_random_uuid(), event_type text not null, channel text not null, locale text not null default 'id', subject text, body text not null,
  is_active boolean not null default true, updated_at timestamptz not null default now(), unique(event_type,channel,locale)
);
create table if not exists user_notification_channels (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  channel text not null check(channel in('EMAIL','WHATSAPP','TELEGRAM')), address_or_external_id text not null,
  verified_at timestamptz, enabled boolean not null default true, priority integer not null default 100, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,channel,address_or_external_id)
);
create table if not exists notification_outbox (
  id bigserial primary key, event_type text not null, source_type text, source_id text, payload jsonb not null default '{}'::jsonb,
  dedupe_key text unique, occurred_at timestamptz not null default now(), processed_at timestamptz, error text
);
create table if not exists notification_jobs (
  id bigserial primary key, delivery_id uuid not null unique references notification_deliveries(id) on delete cascade,
  attempts integer not null default 0, max_attempts integer not null default 5, available_at timestamptz not null default now(),
  locked_at timestamptz, locked_by text, last_error text, created_at timestamptz not null default now()
);
create table if not exists notification_provider_health (
  channel text primary key, consecutive_failures integer not null default 0, last_success_at timestamptz, last_failure_at timestamptz,
  last_error text, disabled_until timestamptz, updated_at timestamptz not null default now()
);
create table if not exists telegram_link_tokens (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique, expires_at timestamptz not null, used_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists notification_webhook_events (
  provider text not null, event_id text not null, event_type text not null, payload jsonb not null, received_at timestamptz not null default now(), primary key(provider,event_id)
);

create table if not exists ai_credit_wallets (
  user_id uuid primary key references users(id) on delete cascade, balance bigint not null default 0 check(balance>=0), updated_at timestamptz not null default now()
);
create table if not exists ai_credit_ledger (
  id bigserial primary key, user_id uuid not null references users(id) on delete cascade, delta bigint not null, balance_after bigint not null check(balance_after>=0),
  reason text not null, source_type text, source_id text, idempotency_key text unique, created_at timestamptz not null default now()
);
create table if not exists ai_usage_logs (
  id bigserial primary key, user_id uuid not null references users(id) on delete cascade, request_id uuid not null unique, model text not null,
  input_tokens bigint, output_tokens bigint, total_tokens bigint, reserved_credits bigint not null default 0, charged_credits bigint,
  status text not null check(status in('RESERVED','SUCCEEDED','FAILED')), error text, created_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists ai_model_policies (
  id uuid primary key default gen_random_uuid(), role user_role not null, model_pattern text not null, enabled boolean not null default true,
  created_at timestamptz not null default now(), unique(role,model_pattern)
);
create table if not exists ai_api_keys (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  key_hash text not null unique, key_prefix text not null, label text not null, last_used_at timestamptz, expires_at timestamptz, revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists hermes_profiles (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, profile_name text not null unique,
  role text not null default 'general', description text, status text not null default 'PENDING' check(status in('PENDING','BUILDING','READY','STOPPED','FAILED','ARCHIVED')),
  ai_api_key_id uuid references ai_api_keys(id) on delete set null, last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists hermes_workspaces (
  id uuid primary key default gen_random_uuid(), hermes_profile_id uuid not null unique references hermes_profiles(id) on delete cascade,
  workspace_path text not null unique, quota_bytes bigint not null default 0 check(quota_bytes>=0), archived_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists hermes_build_jobs (
  id uuid primary key default gen_random_uuid(), hermes_profile_id uuid not null references hermes_profiles(id) on delete cascade,
  job_type text not null check(job_type in('BUILD','START','STOP','ARCHIVE')), status text not null default 'PENDING' check(status in('PENDING','RUNNING','SUCCEEDED','FAILED')),
  attempts integer not null default 0, max_attempts integer not null default 3, available_at timestamptz not null default now(), locked_at timestamptz, locked_by text,
  last_error text, created_at timestamptz not null default now(), completed_at timestamptz
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, description text, ai_credits bigint not null default 0 check(ai_credits>=0),
  agent_slots integer not null default 0 check(agent_slots>=0), badge text, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists reward_rules (
  id uuid primary key default gen_random_uuid(), reward_id uuid not null references rewards(id) on delete cascade, event_type text not null,
  criteria jsonb not null default '{}'::jsonb, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  reward_rule_id uuid references reward_rules(id) on delete set null, reward_id uuid not null references rewards(id) on delete restrict,
  source_type text not null, source_id text not null, metadata jsonb not null default '{}'::jsonb, earned_at timestamptz not null default now()
);
create unique index if not exists achievements_rule_source_idx on achievements(user_id,reward_rule_id,source_type,source_id) where reward_rule_id is not null;

create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(), class_id uuid not null references classes(id) on delete cascade, title text not null, starts_at timestamptz not null,
  ends_at timestamptz, location text, status text not null default 'SCHEDULED' check(status in('SCHEDULED','RESCHEDULED','CANCELLED','COMPLETED')),
  created_by uuid references users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(ends_at is null or ends_at>starts_at)
);
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(), session_id uuid not null references class_sessions(id) on delete cascade,
  student_user_id uuid not null references users(id) on delete cascade, status text not null check(status in('PRESENT','ABSENT','LATE','EXCUSED')),
  notes text, marked_by uuid references users(id) on delete set null, marked_at timestamptz not null default now(), unique(session_id,student_user_id)
);

create table if not exists pending_communications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade, event_type text not null, source_type text, source_id text,
  title text not null, body text not null, proposed_channels jsonb not null default '["IN_APP","EMAIL","WHATSAPP"]'::jsonb,
  status text not null default 'DRAFT' check(status in('DRAFT','APPROVED','CANCELLED')), reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists service_heartbeats (
  service text primary key, instance_id text not null, metadata jsonb not null default '{}'::jsonb, last_seen_at timestamptz not null default now()
);
create table if not exists system_health_events (
  id bigserial primary key, service text not null, severity text not null check(severity in('INFO','WARNING','CRITICAL')), event_type text not null,
  message text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), resolved_at timestamptz
);
create table if not exists backup_runs (
  id uuid primary key default gen_random_uuid(), status text not null default 'RUNNING' check(status in('RUNNING','SUCCEEDED','FAILED')),
  database_path text, object_storage_path text, error text, started_at timestamptz not null default now(), completed_at timestamptz
);

create index if not exists notification_outbox_pending_idx on notification_outbox(processed_at,occurred_at);
create index if not exists notification_jobs_ready_idx on notification_jobs(available_at) where locked_at is null;
create index if not exists ai_usage_user_created_idx on ai_usage_logs(user_id,created_at desc);
create index if not exists hermes_jobs_ready_idx on hermes_build_jobs(available_at) where status='PENDING';
create index if not exists class_sessions_time_idx on class_sessions(class_id,starts_at);
