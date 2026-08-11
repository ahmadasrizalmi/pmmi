-- Phase 2: Academic Core

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  cohort_id uuid,
  teacher_user_id uuid references users(id) on delete set null,
  name text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  student_user_id uuid not null references users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','withdrawn')),
  enrolled_at timestamptz not null default now(),
  unique (class_id, student_user_id)
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  max_score numeric(6,2) not null default 100,
  allow_late boolean not null default true,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_user_id uuid not null references users(id) on delete cascade,
  status text not null default 'submitted' check (status in ('draft','submitted','revision_requested','resubmitted','graded')),
  notes text,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_user_id)
);

create table if not exists submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  bucket text not null,
  object_key text not null,
  original_name text not null,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references submissions(id) on delete cascade,
  score numeric(6,2),
  feedback text,
  revision_required boolean not null default false,
  revision_due_at timestamptz,
  graded_by uuid references users(id) on delete set null,
  graded_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references users(id) on delete cascade,
  title text not null,
  certificate_no text not null unique,
  bucket text,
  object_key text,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references users(id) on delete cascade,
  submission_id uuid references submissions(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  featured boolean not null default false,
  published_at timestamptz,
  featured_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_assignments_class_due on assignments(class_id, due_at);
create index if not exists idx_submissions_student on submissions(student_user_id, updated_at desc);
create index if not exists idx_portfolio_featured on portfolio_projects(featured, published_at desc);
