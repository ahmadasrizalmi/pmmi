-- PMMI Digital Campus - password reset & graduated pending lifecycle

alter type student_status add value if not exists 'GRADUATED_PENDING';

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_password_reset_user on password_reset_tokens(user_id, used_at, expires_at desc);
