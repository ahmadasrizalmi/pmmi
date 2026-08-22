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

Deploy produksi aktual (home server):

```text
/home/pmmiserver/pmmi/
  current/        # repository checkout (git pull --ff-only di sini)
  .env            # production secrets; never commit
  nginx/          # mounted ke nginx-proxy container (/etc/nginx/conf.d)
```

Output backup: `/data/pmmi-backups/` (disk HDD terpisah 465G di `/data`, tempat postgres/minio data juga berada).

Hermes workspace root (`HERMES_WORKSPACE_ROOT`, blueprint default `/srv/pmmi/workspaces`) dan state Hermes dibuat saat fase G4 (Hermes). PostgreSQL (compose `/opt/ai-server/docker-compose.yml`, container `postgres`), Redis, MinIO (`docker run`, volume `/data/minio`) dan Immich adalah service host terpisah di luar compose PMMI.

Gunakan SSD untuk app/runtime/DB hot data bila memungkinkan dan HDD untuk bulk/archive/backups. Jangan menganggap backup pada disk fisik yang sama sebagai satu-satunya salinan aman.

## Initial deployment

```bash
cd /home/pmmiserver/pmmi/current
# .env berada di /home/pmmiserver/pmmi/.env (parent dir; compose TIDAK auto-load dari sana,
# wajib --env-file). cp infra/docker/.env.example /home/pmmiserver/pmmi/.env lalu isi secrets.

docker compose --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker build
docker compose --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker up -d migrate
docker compose --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker up -d api web dashboard worker

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

## Private service exposure (verifikasi G2, 2026-08-22)

PostgreSQL/Redis (compose `/opt/ai-server`), MinIO (API `:9000` + console `:9001`) dan 9Router di-publish hanya ke `127.0.0.1` + IP Tailscale `100.127.181.108`. Container PMMI menjangkau service host lewat IP Tailscale:

| Endpoint | Nilai produksi | Alasan |
|---|---|---|
| `DATABASE_URL` | `postgresql://…@100.127.181.108:5432/pmmi` | container → host: DNAT Docker hanya match dst spesifik; `host.docker.internal` (172.17.0.1) tidak ter-DNAT untuk bind loopback-only |
| `MINIO_ENDPOINT` | `http://100.127.181.108:9000` | sama |
| `NINE_ROUTER_URL` | `http://pmmi-9router:20128` | 9Router satu network docker dengan API; `host.docker.internal:20128` tak terjangkau dari container (DNAT 127.0.0.1-only) — bug lama yang sudah diperbaiki |
| `BOOTSTRAP_ADMIN_TOKEN` | kosong (dihapus setelah admin dibuat) | bootstrap sekali pakai |

Firewall `ufw` aktif: `default deny incoming`; allow `22/tcp`, `80/tcp`, `443/tcp`, dan `in on tailscale0`; `DEFAULT_FORWARD_POLICY="ACCEPT"` agar networking Docker tetap berfungsi. `ss -tlnp` tidak menunjukkan `5432/6379/9000/9001/3010` publik (loopback/Tailscale only).

Set `CORS_ORIGINS=https://pondokmultimedia.id,https://app.pondokmultimedia.id` (tambahkan origin lain hanya bila memang dibutuhkan). Konfigurasikan MinIO bucket CORS secara terpisah agar presigned upload hanya dapat dipakai dari origin PMMI yang diperlukan. Setelah G1 (TLS/domain) selesai, arahkan `MINIO_ENDPOINT`/presigned URL ke domain publik (mis. `minio.pondokmultimedia.id` via nginx) agar upload/download browser publik berfungsi.

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
# Restore drill Wajib diarahkan ke DB/bucket NON-PRODUCTION (jangan ke DATABASE_URL produksi).
# Contoh: DB scratch `pmmi_restore_drill` di postgres yang sama + MinIO throwaway.
CONFIRM_RESTORE=YES \
DATABASE_URL='postgresql://...@100.127.181.108:5432/pmmi_restore_drill' \
MINIO_ENDPOINT='http://127.0.0.1:9100' \   # MinIO throwaway, BUKAN 100.127.181.108:9000
MINIO_ACCESS_KEY='...' \
MINIO_SECRET_KEY='...' \
infra/scripts/restore.sh /data/pmmi-backups/<timestamp>
```

Bukti drill tercatat di `docs/evidence/` (G5).

Backup Baileys auth volume juga perlu dilindungi sebagai secret; jangan commit atau menaruhnya di storage publik.

## Upgrade

```bash
cd /home/pmmiserver/pmmi/current
git pull --ff-only

docker compose --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker build
docker compose --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker up -d migrate
docker compose --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker up -d api web dashboard worker

# Start exactly one worker strategy:
# A) Docker worker while Hermes is disabled, OR
# B) hardened host/custom worker with shared Hermes runtime.

# If Baileys is used:
docker compose --profile baileys --env-file /home/pmmiserver/pmmi/.env -f infra/docker/compose.yml -p docker up -d whatsapp

infra/scripts/health-check.sh
```

Selalu pastikan backup terakhir valid sebelum migration production.
