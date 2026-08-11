# PMMI Home Server Deployment

Runbook ini dipakai **setelah** repository blueprint sudah code-complete + CI-verified. Keep Tailscale enabled; PMMI tidak membutuhkan PostgreSQL, MinIO admin, atau SSH dibuka ke internet untuk menjalankan aplikasi.

## Required host services/tools

- Ubuntu Server + Docker + Docker Compose
- Existing PostgreSQL
- Existing MinIO
- Reverse proxy / TLS termination
- Tailscale untuk maintenance/private operations
- PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`)
- MinIO client `mc`
- `curl`, `jq`, `sha256sum`
- 9Router installed once and bound to private/local interface
- Hermes Agent installed once only when AI Agent provisioning is enabled

Immich tetap service terpisah dan bukan PMMI primary object storage.

## Filesystem layout

```text
/srv/pmmi/
  current/        # repository checkout
  .env            # production secrets; never commit
  workspaces/     # Hermes workspaces
  hermes-home/    # PMMI-only Hermes state when host worker is enabled
  backups/        # backup output; preferably HDD/off-host copy
```

Gunakan SSD untuk app/runtime/DB hot data bila memungkinkan dan HDD untuk bulk/archive/backups. Jangan menganggap backup pada disk fisik yang sama sebagai satu-satunya salinan aman.

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

Reverse proxy mapping:

- `pondokmultimedia.id` -> `127.0.0.1:8080`
- `app.pondokmultimedia.id` -> `127.0.0.1:8081`
- `ai.pondokmultimedia.id` -> `127.0.0.1:3001`

Public website memakai BrowserRouter dan SPA fallback sudah disediakan untuk Docker nginx/Vercel. Jangan expose PostgreSQL, MinIO admin, Docker socket, atau host-management ports ke public internet.

## Bootstrap admin

Set `BOOTSTRAP_ADMIN_TOKEN`, buat admin pertama melalui `POST /v1/auth/bootstrap-admin`, lalu hapus/rotate bootstrap token setelah admin tersedia.

## Programs, cohorts, and enrollment

Sebelum enrollment production:

1. buat program dan cohort;
2. buat/scoping class sesuai cohort/program bila ingin automatic class enrollment;
3. applicant harus Accepted;
4. applicant menyelesaikan registration dengan program + cohort;
5. baru admin menjalankan Enrollment.

PostgreSQL menolak enrollment tanpa registration/program/cohort dan menolak admission transition ilegal/capacity overflow.

## 9Router

Set `NINE_ROUTER_URL` ke endpoint OpenAI-compatible 9Router yang hanya dapat dijangkau PMMI/trusted network. Provider credentials tetap berada di 9Router, bukan account santri.

PMMI API adalah gateway/auth/accounting layer. Client memakai PMMI `/v1/models` dan `/v1/chat/completions`, bukan mengakses 9Router langsung.

Gunakan release 9Router yang current dan memiliki seluruh security fix yang tersedia saat deployment.

## Hermes

Keep `HERMES_ENABLED=false` sampai shared Hermes runtime dan isolation policy selesai diuji di host.

Build Agent **tidak meng-install Hermes**. API hanya membuat profile/workspace/build-job PMMI; worker memakai Hermes CLI yang sudah terpasang sekali.

Saat mengaktifkan Hermes:

1. buat `/srv/pmmi/workspaces` dan `/srv/pmmi/hermes-home` milik service account `pmmi`;
2. install/test official Hermes CLI sekali;
3. build worker pada host (`npm install && npm run build:worker`) atau siapkan image/runtime yang memiliki Hermes CLI;
4. **stop/disable Docker `worker`** sebelum mengaktifkan host `pmmi-worker-hermes.service`; jangan biarkan worker Docker tanpa Hermes mengambil `hermes.profile.build` jobs;
5. install/enable `infra/systemd/pmmi-worker-hermes.service` atau equivalent hardened runtime;
6. set `HERMES_ENABLED=true`, `HERMES_WORKSPACE_ROOT=/srv/pmmi/workspaces`;
7. lakukan adversarial isolation test sebelum memberi akses agent ke santri.

Profile + `terminal.cwd` **bukan OS sandbox**. Hardened service contoh membatasi service secara umum, tetapi production harus membuktikan agent tidak dapat membaca `/etc`, admin/root home, database/provider secrets, atau workspace santri lain. Bila host-level per-profile isolation tidak cukup, gunakan container/process sandbox per running agent dengan shared image/runtime—tetap bukan install Hermes baru per santri.

## Notifications

Set `NOTIFICATION_TRANSPORT=live` hanya setelah provider production siap.

- Resend: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`
- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`
- WhatsApp/Baileys sidecar: `WHATSAPP_PROVIDER=baileys`, `BAILEYS_GATEWAY_URL`
- Meta-compatible adapter: `WHATSAPP_PROVIDER=meta`, URL/token

Provider outage tidak membatalkan transaksi akademik; delivery tetap berada di PostgreSQL dengan retry/fallback/circuit-breaker policy.

## Operations monitor

Install `infra/systemd/pmmi-ops-monitor.service` dan `.timer` setelah `OPS_TOKEN` tersedia. Monitor memeriksa API readiness, disk utilization, dan reachability 9Router lalu menulis ops event ke PMMI.

Default warning/critical disk threshold dapat diubah melalui `DISK_WARN_PERCENT` / `DISK_CRITICAL_PERCENT`.

## Backups

Install contoh systemd `pmmi-backup.service` + `.timer`. Script melakukan PostgreSQL dump, MinIO mirror, checksum, dan mencatat `backup_runs`. Failure menghasilkan CRITICAL ops event.

Backup baru dianggap operationally verified setelah restore drill sukses ke database/bucket non-production:

```bash
CONFIRM_RESTORE=YES \
DATABASE_URL='postgresql://...' \
MINIO_ENDPOINT='http://...' \
MINIO_ACCESS_KEY='...' \
MINIO_SECRET_KEY='...' \
infra/scripts/restore.sh /srv/pmmi/backups/<timestamp>
```

## Upgrade

```bash
cd /srv/pmmi/current
git pull --ff-only

docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml build
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d migrate
docker compose --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d api web dashboard

# Start exactly one worker strategy:
# A) Docker worker while Hermes is disabled, OR
# B) hardened host/custom worker with shared Hermes runtime.

infra/scripts/health-check.sh
```

Selalu pastikan backup terakhir valid sebelum migration production.
