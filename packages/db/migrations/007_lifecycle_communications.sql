create table if not exists lifecycle_communications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  lifecycle_status student_status not null,
  title text not null,
  body text not null,
  channels text[] not null default array['EMAIL']::text[],
  status text not null default 'APPROVED' check (status in ('APPROVED','QUEUED','CANCELLED')),
  approved_by uuid not null references users(id) on delete restrict,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists lifecycle_communications_student_idx on lifecycle_communications(student_id,created_at desc);
