# PMMI Digital Campus

PMMI (Pondok Multimedia Munzalan Indonesia) is evolving from a public multimedia-pondok website into a self-hosted Digital Campus for admissions, academics, AI access, student portfolios, notifications, rewards, and per-user AI agents.

## Product surfaces

- `pondokmultimedia.id` — public website, admissions, featured portfolio
- `app.pondokmultimedia.id` — Admin / Ustadz / Santri dashboard
- `ai.pondokmultimedia.id` — PMMI API + OpenAI-compatible AI Gateway

## Repository

```text
apps/
  api/        Fastify API, auth/RBAC, admissions, academic, AI/Hermes/ops
  worker/     PostgreSQL outbox, notifications, reminders, rewards, Hermes jobs
  dashboard/  role-based Digital Campus dashboard
packages/
  db/         tracked PostgreSQL migrations
infra/
  docker/     production images + Compose
  scripts/    backup, restore, health and ops monitoring
  systemd/    backup/ops/Hermes worker service examples
docs/
  BLUEPRINT_IMPLEMENTATION_STATUS.md
  DEPLOYMENT.md
```

The existing React/Vite public website remains at the repository root.

## Local development

Requirements: Node.js 22+, PostgreSQL, and MinIO.

```bash
npm install
npm run db:migrate
npm run dev:web
npm run dev:dashboard
npm run dev:api
npm run dev:worker
```

Use `infra/docker/.env.example` as the configuration inventory. Never commit production secrets.

## Validation

The `PMMI Blueprint CI` workflow runs PostgreSQL + MinIO integration tests, the canonical Digital Campus API journey, worker/outbox tests, TypeScript builds, public/dashboard builds, operational-script checks, Compose validation, and production Docker image builds.

See [`docs/BLUEPRINT_IMPLEMENTATION_STATUS.md`](docs/BLUEPRINT_IMPLEMENTATION_STATUS.md) for the exact code-complete contract and [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the home-server runbook.

## External runtimes

9Router and Hermes are intentionally external runtimes. PMMI sits in front of 9Router for auth/credits/accounting. Hermes is installed once; Build AI Agent creates PMMI profile/workspace/job state and uses the shared runtime only after host isolation is verified.
