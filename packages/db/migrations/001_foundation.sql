-- PMMI Digital Campus — Phase 1 foundation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('ADMIN','USTADZ','SANTRI');
CREATE TYPE student_status AS ENUM ('ACTIVE','GRADUATED','ALUMNI','DROPOUT','SUSPENDED','INACTIVE');
CREATE TYPE application_status AS ENUM ('DRAFT','SUBMITTED','ADMIN_VERIFIED','SCREENING','INTERVIEW','ACCEPTED','WAITLISTED','REJECTED','ENROLLED');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  full_name text NOT NULL,
  role user_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admission_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cohort_year integer NOT NULL,
  opens_at timestamptz,
  closes_at timestamptz,
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_period_id uuid NOT NULL REFERENCES admission_periods(id),
  applicant_name text NOT NULL,
  email text NOT NULL,
  phone text,
  status application_status NOT NULL DEFAULT 'DRAFT',
  submitted_at timestamptz,
  decision_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX applications_status_idx ON applications(status);

CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  application_id uuid UNIQUE REFERENCES applications(id),
  student_number text UNIQUE NOT NULL,
  cohort_year integer NOT NULL,
  status student_status NOT NULL DEFAULT 'ACTIVE',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  graduated_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX students_status_idx ON students(status);

CREATE TABLE resource_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id),
  ai_credit_balance bigint NOT NULL DEFAULT 0 CHECK (ai_credit_balance >= 0),
  hermes_agent_slots integer NOT NULL DEFAULT 0 CHECK (hermes_agent_slots >= 0),
  storage_quota_bytes bigint NOT NULL DEFAULT 0 CHECK (storage_quota_bytes >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
