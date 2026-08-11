-- PMMI Digital Campus — Developer/API credentials
-- Developer Keys are user-visible once at creation/rotation.
-- Agent Keys use the same storage model but are provisioned by the Hermes setup flow later.

create table if not exists ai_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  kind text not null default 'DEVELOPER' check (kind in ('DEVELOPER','AGENT','SERVICE')),
  key_prefix text not null,
  key_hash text not null unique,
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists ai_api_keys_user_idx on ai_api_keys(user_id, created_at desc);
create index if not exists ai_api_keys_active_hash_idx on ai_api_keys(key_hash) where revoked_at is null;
