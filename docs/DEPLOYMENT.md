# PMMI Home Server Deployment

Runbook ini dipakai **setelah** repository blueprint code-complete + CI-verified. Keep Tailscale enabled; PMMI tidak membutuhkan PostgreSQL, MinIO admin, atau SSH dibuka ke internet.

## Required host services/tools

- Ubuntu Server + Docker + Docker Compose
- Existing PostgreSQL 15+ (16 recommended)
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

Public website memakai BrowserRouter dan SPA fallback sudah disediakan. Jangan expose PostgreSQL, MinIO admin, Docker socket, Baileys service port, atau host-management ports ke public internet.

Set `CORS_ORIGINS=https://pondokmultimedia.id,https://app.pondokmultimedia.id` (tambahkan origin lain hanya bila memang dibutuhkan). Konfigurasikan MinIO bucket CORS secara terpisah agar presigned upload hanya dapat dipakai dari origin PMMI yang diperlukan.

## Bootstrap admin

Set `BOOTSTRAP_ADMIN_TOKEN`, buat admin pertama melalui `POST /v1/auth/bootstrap-admin`, lalu hapus/rotate bootstrap token setelah admin tersedia.

## Programs, cohorts, and enrollment

Semua setup ini tersedia dari Admin Role Tools:

1. buat admission period;
2. buat program dan cohort;
3. buat/scoping class sesuai cohort/program bila ingin automatic enrollment;
4. applicant harus Accepted;
5. applicant menyelesaikan registration dengan program + cohort;
6. admin menjalankan Enrollment Queue -> Enroll & Provision.

PostgreSQL menolak enrollment tanpa registration/program/cohort dan menolak transition ilegal/capacity overflow.

Akun staff/santri dapat diaktifkan melalui public `/activate?token=...`.

## 9Router

Set `NINE_ROUTER_URL` ke endpoint OpenAI-compatible 9Router yang hanya dapat dijangkau PMMI/trusted network. Provider credentials tetap berada di 9Router, bukan account santri.

PMMI API adalah auth/accounting gateway. Client memakai PMMI `/v1/models` dan `/v1/chat/completions`, bukan mengakses 9Router langsung.

Gunakan release 9Router current dan seluruh security fix yang tersedia saat deployment.

## Hermes

Keep `HERMES_ENABLED=false` sampai shared Hermes runtime dan isolation policy selesai diuji di host.

Build Agent **tidak meng-install Hermes**. API hanya membuat profile/workspace/job PMMI; worker memakai Hermes CLI yang sudah terpasang sekali. Dashboard menyediakan Build/Start/Stop/Archive, tetapi command baru boleh dieksekusi setelah sandbox policy lolos.

Saat mengaktifkan Hermes:

1. buat `/srv/pmmi/workspaces` dan `/srv/pmmi/hermes-home` milik service account `pmmi`;
2. install/test official Hermes CLI sekali;
3. build worker pada host (`npm install && npm run build:worker`) atau siapkan runtime yang memiliki Hermes CLI;
4. **stop/disable Docker `worker`** sebelum mengaktifkan host `pmmi-worker-hermes.service`; jangan biarkan worker Docker tanpa Hermes mengambil job Hermes;
5. install/enable `infra/systemd/pmmi-worker-hermes.service` atau equivalent hardened runtime;
6. set `HERMES_ENABLED=true`, `HERMES_WORKSPACE_ROOT=/srv/pmmi/workspaces`;
7. lakukan adversarial isolation test sebelum memberi akses agent ke santri.

Profile + `terminal.cwd` **bukan OS sandbox**. Production harus membuktikan agent tidak dapat membaca `/etc`, admin/root home, database/provider secrets, atau workspace santri lain. Bila perlu, gunakan container/process sandbox per running agent dengan shared image/runtime—tetap bukan install Hermes baru per santri.

## Notifications

Set `NOTIFICATION_TRANSPORT=live` hanya setelah provider production siap.

- Resend: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`
- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`
- Meta-compatible WhatsApp: `WHATSAPP_PROVIDER=meta`, URL/token
- Baileys: `WHATSAPP_PROVIDER=baileys`, `BAILEYS_SERVICE_TOKEN`, persistent auth volume

### Baileys pairing

Baileys adalah optional isolated Compose profile. Gunakan satu akun WhatsApp PMMI khusus; jangan gunakan untuk spam/bulk unsolicited messaging.

```bash
# generate a strong BAILEYS_SERVICE_TOKEN first, then:
docker compose --profile baileys --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d whatsapp

curl -sS -H "Authorization: Bearer $BAILEYS_SERVICE_TOKEN" \
  http://127.0.0.1:3010/session | jq

curl -sS -X POST \
  -H "Authorization: Bearer $BAILEYS_SERVICE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"phone":"628123456789"}' \
  http://127.0.0.1:3010/pairing-code | jq
```

Masukkan pairing code pada WhatsApp account PMMI. Setelah `/session` menunjukkan `open`, worker dapat memakai `BAILEYS_GATEWAY_URL=http://whatsapp:3010`. Port `3010` tetap loopback/internal dan tidak boleh dipublish melalui reverse proxy.

Provider outage tidak membatalkan transaksi akademik; delivery tetap di PostgreSQL dengan retry/fallback/circuit-breaker policy.

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

Backup Baileys auth volume juga perlu dilindungi sebagai secret; jangan commit atau menaruhnya di storage publik.

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

# If Baileys is used:
docker compose --profile baileys --env-file /srv/pmmi/.env -f infra/docker/compose.yml up -d whatsapp

infra/scripts/health-check.sh
```

Selalu pastikan backup terakhir valid sebelum migration production.
