# PMMI Home Server Deployment

This is the deployment runbook for the PMMI Ubuntu home server. Keep Tailscale enabled; the repository does not require exposing PostgreSQL or MinIO administration publicly.

## Required host services

- Docker + Docker Compose
- Existing PostgreSQL
- Existing MinIO
- Reverse proxy / TLS termination
- Tailscale for private operations
- 9Router installed once and bound to a private/local interface
- Hermes Agent installed once when AI Agent provisioning is enabled

Immich remains an independent service and is not used as PMMI application object storage.

## Filesystem layout

Suggested layout:

```text
/srv/pmmi/
  current/        # repository checkout
  .env            # production secrets; not committed
  workspaces/     # Hermes workspaces
  backups/        # backup output, preferably moved/synced to HDD
```

Keep application/runtime/DB hot data on SSD where possible and bulk backups/workspaces on the HDD according to available capacity.

## Initial deployment

```bash
cd /srv/pmmi/current
cp infra/docker/.env.example /srv/pmmi/.env
# edit /srv/pmmi/.env with real secrets/endpoints

docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml build
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d migrate
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d api web dashboard worker

API_URL=http://127.0.0.1:3001 \
WEB_URL=http://127.0.0.1:8080 \
DASHBOARD_URL=http://127.0.0.1:8081 \
infra/scripts/health-check.sh
```

The reverse proxy should map:

- `pondokmultimedia.id` -> `127.0.0.1:8080`
- `app.pondokmultimedia.id` -> `127.0.0.1:8081`
- `ai.pondokmultimedia.id` -> `127.0.0.1:3001`

Do not expose PostgreSQL, MinIO admin or host-management ports to the public internet.

## Bootstrap

Set `BOOTSTRAP_ADMIN_TOKEN`, create the first admin through `POST /v1/auth/bootstrap-admin`, then remove/rotate the bootstrap token after the admin exists.

## 9Router

Set `NINE_ROUTER_URL` to the private/local 9Router OpenAI-compatible endpoint. Configure provider credentials inside 9Router; PMMI does not store provider credentials in student accounts.

Before production use, install a current 9Router release containing all published security fixes and keep it reachable only from trusted PMMI services/Tailscale where practical.

## Hermes

Keep `HERMES_ENABLED=false` until the shared Hermes runtime has been installed and tested on the host. Build Agent does not install Hermes. It creates PMMI profile/workspace/job state, and the worker uses the already-installed Hermes CLI to create per-user profiles.

When enabling it:

1. create `/srv/pmmi/workspaces` owned by the PMMI service account;
2. install/test the official Hermes CLI once;
3. run the worker where that CLI is available (host service or a custom worker image containing the same shared runtime);
4. set `HERMES_ENABLED=true` and `HERMES_WORKSPACE_ROOT=/srv/pmmi/workspaces`;
5. enforce host filesystem/process/credential restrictions. A Hermes profile and `terminal.cwd` are not an OS sandbox.

Do not create one Docker/Hermes installation per santri unless a later isolation design explicitly requires it.

## Notifications

Configure only the providers in use:

- Resend: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`
- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`
- WhatsApp/Baileys sidecar: `WHATSAPP_PROVIDER=baileys` + `BAILEYS_GATEWAY_URL`
- Meta Cloud adapter: `WHATSAPP_PROVIDER=meta` + URL/token

Set `NOTIFICATION_TRANSPORT=live` in production. Provider outages are retried from PostgreSQL and do not roll back academic transactions.

## Backups

The backup scripts require PostgreSQL client tools and MinIO `mc` on the host.

Install the example systemd files from `infra/systemd/` and make scripts executable. A backup is not considered operationally verified until a restore drill succeeds on a non-production database/bucket.

## Upgrade

For each release:

```bash
git pull --ff-only
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml build
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d migrate
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d api web dashboard worker
infra/scripts/health-check.sh
```

Review database backups before applying migrations to production.
