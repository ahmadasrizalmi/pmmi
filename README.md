# PMMI Digital Campus

PMMI is evolving from the public Pondok Multimedia website into a self-hosted digital campus for `pondokmultimedia.id`.

## Phase 1 foundation

This branch introduces the first backend foundation while preserving the existing public React/Vite site at the repository root.

- `apps/api` — Fastify API service and health endpoint.
- `apps/worker` — lightweight background worker foundation.
- `packages/db/migrations` — PostgreSQL schema for identity, admission, student lifecycle, resource entitlements, and audit logs.
- `infra/docker` — application containers that connect to the home server's existing PostgreSQL and MinIO services.

### Planned product boundaries

- Public web: `pondokmultimedia.id`
- Dashboard: `app.pondokmultimedia.id`
- AI gateway: `ai.pondokmultimedia.id`

Hermes Agent and 9Router are intentionally not installed in Phase 1. Their integrations will sit behind PMMI services after identity, lifecycle, resource policy, and audit foundations are stable.

## Local development

Requirements: Node.js 22+, PostgreSQL.

```bash
npm install
npm run dev:web
npm run dev:api
```

API health check: `GET http://localhost:3001/health`.

For the home-server deployment, copy `infra/docker/.env.example` to `.env` and point `DATABASE_URL` and MinIO settings at the existing services.
