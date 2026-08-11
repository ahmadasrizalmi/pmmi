# PMMI Home Server Deployment (after blueprint merge)

Deployment is intentionally separated from code completion. The target server remains private behind Tailscale; do not disable Tailscale just to deploy PMMI.

## Target topology

- `pondokmultimedia.id` -> existing public site on `127.0.0.1:3000`.
- `pondokmultimedia.id/daftar` and `/portfolio*` -> public extensions on `127.0.0.1:3003`.
- `app.pondokmultimedia.id` -> dashboard on `127.0.0.1:3002`.
- `app.pondokmultimedia.id/api/*` or `ai.pondokmultimedia.id/v1/*` -> final API on `127.0.0.1:3001`.
- Resend webhook route -> webhook service on `127.0.0.1:3011/resend`.
- WhatsApp provider stays loopback-only on `127.0.0.1:3010`.
- PostgreSQL, MinIO, Immich, 9Router and Hermes remain host/existing services and must not be exposed publicly.

## Install sequence

1. Clone/update the repository into `/srv/pmmi/current`.
2. Copy `infra/docker/.env.blueprint.example` to `/etc/pmmi/pmmi.env` and replace every placeholder with production secrets/addresses.
3. Install Node.js 22 and run `npm install --no-audit --no-fund` once on the host for the host jobs worker.
4. Install 9Router and confirm its private OpenAI-compatible endpoint.
5. Install one Hermes runtime/CLI for the `pmmi` OS user. Do not install Hermes once per santri.
6. Build workspaces and start `infra/docker/compose.production.yml`.
7. Install `infra/systemd/pmmi-jobs-final.service` for host-level jobs/Hermes execution.
8. Install `pmmi-backup.service` + `pmmi-backup.timer` after installing `pg_dump`, `psql` and MinIO `mc`.
9. Configure reverse proxy/TLS and keep database/object-store/admin surfaces private.
10. Pair the PMMI WhatsApp number through the local Baileys provider and configure Resend/Telegram webhook secrets.
11. Run `infra/scripts/smoke-test.sh`.
12. Run one backup and perform a restore drill before calling the deployment production-verified.

## Required real-world verification

CI intentionally cannot prove real provider/account connectivity. Deployment is not complete until these are verified on the physical Ubuntu server:

- real PostgreSQL/MinIO migration and file permissions;
- real 9Router provider request through PMMI credit accounting;
- real Hermes profile BUILD -> READY -> STOP/START -> ARCHIVE;
- real Resend email + signed callback;
- real Telegram linking and send;
- real Baileys pairing and a low-volume transactional WhatsApp send;
- lifecycle archive behavior;
- SSD/HDD backup placement and restore;
- domain/TLS/reverse proxy and Tailscale/firewall policy.
