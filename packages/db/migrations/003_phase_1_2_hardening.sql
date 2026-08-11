-- Phase 1+2 hardening: activation, upload intents, lifecycle metadata

create table if not exists account_activation_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_activation_user on account_activation_tokens(user_id, expires_at desc);

create table if not exists submission_upload_intents (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_user_id uuid not null references users(id) on delete cascade,
  bucket text not null,
  object_key text not null unique,
  original_name text not null,
  content_type text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_upload_intents_user on submission_upload_intents(student_user_id, expires_at desc);

create unique index if not exists applications_period_email_uq
  on applications(admission_period_id, lower(email));

alter table grades
  add constraint grades_score_nonnegative check (score is null or score >= 0);

create index if not exists idx_enrollments_student_status on enrollments(student_user_id, status);
create index if not exists idx_classes_teacher on classes(teacher_user_id);
create index if not exists idx_certificates_student on certificates(student_user_id, issued_at desc);
