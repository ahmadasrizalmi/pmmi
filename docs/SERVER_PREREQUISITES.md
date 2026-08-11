# PMMI Server Prerequisites

Repository code is validated in CI against the following baseline:

- Node.js 22
- PostgreSQL 16 in CI; production minimum PostgreSQL 15
- MinIO with S3-compatible presigned PUT/GET support
- Docker Engine + Docker Compose v2
- Linux host for the production runbook

PostgreSQL 15+ is required because PMMI notification idempotency uses `UNIQUE ... NULLS NOT DISTINCT` so applicant notifications (`user_id IS NULL`) remain concurrency-safe while using the same `ON CONFLICT` contract as registered users.

Before deployment, run:

```bash
node --version
psql --version
docker --version
docker compose version
mc --version
```

If the existing PostgreSQL installation is older than 15, upgrade/restore it to a supported version before running PMMI migrations. Do not point production PMMI at an unsupported database and hope migrations succeed.

For real Hermes Agent execution, additionally verify the official Hermes CLI/runtime and the chosen per-agent sandbox policy. For 9Router, verify the current production release and provider configuration at deployment time.
