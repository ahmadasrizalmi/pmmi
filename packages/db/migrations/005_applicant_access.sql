-- Applicant self-service access for admission documents.
create table if not exists application_access_tokens (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists application_access_token_app_idx on application_access_tokens(application_id,expires_at desc);

create table if not exists application_document_upload_intents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  kind text not null,
  bucket text not null,
  object_key text not null unique,
  original_name text not null,
  content_type text,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
