# PMMI Digital Campus — Final Blueprint Completion Contract

Dokumen ini mendefinisikan arti **100% repository implementation + CI verification** untuk PMMI. Status ini sengaja dipisahkan dari **production deployment verification**: Ubuntu home server, domain/TLS, Tailscale/firewall, provider nyata, 9Router runtime nyata, Hermes runtime nyata, WhatsApp pairing nyata, dan restore drill hanya dapat diverifikasi pada server production.

## Phase completion map

| Phase | Repository status | Completion boundary |
|---|---|---|
| 0 — Infrastructure readiness | COMPLETE | Docker/Compose, env inventory, prerequisites, health/backup/restore/systemd artifacts. Physical host audit remains deployment verification. |
| 1 — Identity / RBAC / lifecycle / audit | COMPLETE | ADMIN/USTADZ/SANTRI auth, scrypt password, JWT, activation, staff provisioning, lifecycle access/resource policy and audit. |
| 2 — Admissions | COMPLETE | Period/program/cohort setup, applicant portal/tokens/documents, review/score/interview/decision/registration, capacity/state guards, enrollment provisioning and Admin Enrollment UI. |
| 3 — Academic | COMPLETE | Courses/classes/scope/auto-enrollment, schedules, roster/attendance UI, assignment/submission/revision/grading, certificates and public verification/portfolio hooks. |
| 4 — Notification core | COMPLETE | Durable in-app source, preferences UI, channel UI, transactional outbox, retries/backoff/dedupe/fallback/circuit guard and reminder scheduler. |
| 5 — External channels | COMPLETE in code | Resend, Telegram, Meta-compatible WhatsApp and isolated Baileys sidecar are implemented. Real credentials/account pairing are deployment verification. |
| 6 — Portfolio | COMPLETE | Ustadz/Admin Feature publishes immediately without santri approval, asset snapshots, public list/detail and Admin publish/unpublish manager. |
| 7 — AI Gateway / 9Router | COMPLETE in code | OpenAI-compatible PMMI gateway, auth/model policy/rate limit, reservation/ledger/reconcile/refund/usage. Installing/configuring real 9Router providers is deployment verification. |
| 8 — Hermes | COMPLETE in code | Agent entitlement, Build/Start/Stop/Archive APIs/UI, shared-runtime jobs, profile/workspace policy and host worker integration. Installing and isolation-testing real Hermes is deployment verification. |
| 9 — Lifecycle + Rewards | COMPLETE | Lifecycle-driven access/resource shutdown, sensitive communication approval, configurable achievements, AI-credit and agent-slot grants. |
| 10 — Operations / backup / refinement | COMPLETE in code | Readiness/health/ops events, monitor, backup/checksum/restore guard, systemd examples and production images. Real restore drill is deployment verification. |

## Product surfaces

- Public website: `pondokmultimedia.id`
- Public admission: `/daftar`
- Applicant portal: `/daftar/:applicationId`
- Account activation: `/activate?token=...`
- Public featured portfolio: `/portfolio` dan `/portfolio/:slug`
- Role dashboard: `app.pondokmultimedia.id`
- PMMI API + AI Gateway: `ai.pondokmultimedia.id`
- PostgreSQL worker: transactional outbox, notifications, schedules, rewards, lifecycle and Hermes jobs
- Optional isolated Baileys sidecar: internal `/health`, `/session`, `/pairing-code`, `/send`

## Identity, RBAC, lifecycle

- Roles: `ADMIN`, `USTADZ`, `SANTRI`
- scrypt password hashing, JWT login, activation tokens and public activation page
- Staff provisioning/activation by admin
- Student lifecycle: `ACTIVE`, `GRADUATED`, `ALUMNI`, `DROPOUT`, `SUSPENDED`, `INACTIVE`
- DB guard prevents suspended/dropout/inactive login activation
- DB academic-write guard permits upload/submission only for `ACTIVE` santri
- Alumni/graduated resource policy disables AI/agent entitlement according to lifecycle policy
- Nonactive lifecycle transitions enqueue Hermes stop/archive
- Sensitive DO/SUSPENDED/INACTIVE communication requires explicit Admin-approved message before outbox delivery
- Security/admission/academic/Hermes/lifecycle actions are audited

## Admissions

- Admission periods + capacity, with Admin creation UI
- Programs and cohorts, with Admin creation UI
- Public application + hashed applicant access token
- Admin token recovery with old-token revocation
- Applicant self-service status/registration portal
- MinIO-backed application documents and durable size guard
- Admin review, selection scoring, interview, decision
- Registration / daftar ulang
- PostgreSQL transition guard and enrollment prerequisite guard
- Capacity enforced atomically during enrollment
- `ENROLLED` provisions SANTRI identity, profile, program/cohort, AI wallet, credits, agent slots, storage quota and activation token
- Admin Enrollment Queue is mounted in the active role dashboard
- Cohort/program class scope is configurable from Admin UI and can auto-enroll matching santri
- Hermes profile is never created during enrollment; it is created only by Build AI Agent

## Academic

- Courses, classes, enrollments and class scope
- Class sessions/schedules
- Teacher class roster endpoint and mounted Ustadz attendance editor
- Assignments/deadlines
- MinIO presigned upload intents
- Submission/resubmission
- Grading, feedback, revision request/deadline
- DB storage quota guard for submission files
- Certificates and object metadata
- Featured portfolio publication and `portfolio_assets` references without blob duplication
- Locked PMMI rule: Ustadz/Admin `Feature` => immediately public, no santri approval state

## Notification engine

- In-App is durable source of truth
- PostgreSQL transactional outbox
- Delivery records, retry, exponential backoff and poison-event ops alert
- Applicant/user dedupe including NULL user IDs
- Per-event route and per-parent fallback guard
- Preferences editor is mounted for all dashboard roles
- Email/WhatsApp channel editor + Telegram linking UI
- Mandatory `ops`, `security`, `lifecycle` categories cannot be disabled
- Resend adapter + signed webhook handling
- Telegram Bot adapter + one-time account link token
- Meta-compatible WhatsApp adapter
- Isolated Baileys sidecar with persistent auth-state volume, service-token protected pairing/session/send endpoints
- Worker authenticates sidecar requests
- Provider circuit breaker
- Assignment/class/credit reminders and Ustadz digest with anti-spam windows
- Sensitive lifecycle events only alert Admin until formal communication is approved

External delivery credentials are never required by CI; CI validates routing/persistence/contracts with mock transport and builds the real provider code.

## AI Gateway / 9Router

- PMMI AI wallet + immutable ledger
- Model permission + hourly request limit
- Usage/failure logs
- Conservative pre-request credit reservation
- Actual-usage reconciliation/refund
- Canonical `GET /v1/models` and `POST /v1/chat/completions`
- Compatibility aliases in `/v1/ai/*`
- Streaming passthrough and upstream usage capture when available
- PMMI remains accounting source of truth; 9Router is routing/provider engine only

## Hermes Agent

- Agent-slot entitlement
- Build permitted only for valid lifecycle/slot state
- PMMI profile/workspace/build-job state
- Workspace layout `/srv/pmmi/workspaces/<user-id>/<profile-id>`
- Shared Hermes installation only; never install per santri
- Build configures separate profile + `terminal.cwd`
- Mounted Santri runtime controls: Build, Start, Stop, Archive
- Start/Stop are outbox jobs executed only by the host/shared-runtime worker
- Admin status/retry/archive + audit surface

Profile/workspace is not an OS sandbox. Production must keep execution disabled until host/container isolation proves agents cannot read provider credentials, `/etc`, admin/root home or other users' workspaces.

## Rewards

- Configurable rules
- Manual grants
- Event-triggered achievements
- AI-credit rewards
- Hermes agent-slot rewards
- Achievement notifications

## Operations

- API liveness/readiness
- Admin health for PostgreSQL, MinIO, 9Router, Hermes/outbox
- Ops events + resolution
- Disk/9Router monitor
- Backup records
- PostgreSQL + MinIO backup + checksum
- Backup failure creates CRITICAL ops event
- Guarded restore with `CONFIRM_RESTORE=YES` + checksum verification
- systemd timer/service examples
- hardened host worker example for shared Hermes
- Production CORS is allowlisted to PMMI origins/configured origins; permissive `origin:true` is forbidden by CI contract

## Frontend dashboard coverage

The dashboard is one role-aware React application, not three separate codebases.

### Admin

- Overview
- Admission review / document / scoring / interview / decision
- **Admission Setup:** periods, programs, cohorts
- **Enrollment Queue:** registration readiness + Enroll/Provision
- Class cohort/program scope
- Students/lifecycle + sensitive communication approval
- Staff users + activation token output
- Courses/classes/certificates
- AI credits
- Rewards
- Hermes/admin audit
- Ops/backup health
- Notifications + preferences/channels
- Portfolio Manager publish/unpublish

### Ustadz

- Overview
- Classes
- Assignment creation
- Schedule/session creation
- **Attendance editor with live class roster**
- Pending submission review
- Grade / feedback / revision
- `Feature -> public portfolio`
- Notifications + preferences/channels

### Santri

- Overview
- Assignments + direct MinIO upload/submit
- Schedule
- Grades/feedback/revision
- Certificates
- Achievements
- AI credits/chat
- Build/Start/Stop/Archive AI Agent
- Notifications + preferences/channels

## CI completion gate

`PMMI Blueprint CI` must be green on the exact final PR HEAD before merge:

1. dependency installation;
2. PostgreSQL 16 startup + every ordered migration;
3. real MinIO startup;
4. canonical end-to-end blueprint API journey;
5. final completion API regression: roster, Hermes runtime jobs, CORS;
6. worker/outbox integration tests + Hermes command unit contract;
7. API build;
8. worker build;
9. existing public website build;
10. role dashboard build;
11. Baileys sidecar build;
12. mounted frontend/operator contract validation;
13. shell syntax validation;
14. default + Baileys-profile Compose validation;
15. production image builds: API, worker, public web, dashboard, WhatsApp sidecar.

## Explicitly outside the repository-complete claim

These require the physical server / real credentials:

- Ubuntu package/runtime compatibility and final disk mounts
- DNS/reverse proxy/TLS
- Tailscale/firewall policy
- MinIO production CORS/bucket permissions
- real Resend delivery/webhook
- real Telegram bot/webhook
- real WhatsApp Baileys pairing or Meta credentials
- installed/running 9Router with provider credentials
- installed/running shared Hermes + adversarial per-agent isolation verification
- backup placement/off-host copy + restore drill
- end-to-end smoke test through production domains

Before those deployment checks, the exact status is **repository implementation 100% + CI-verified, production deployment not yet verified**.

---

# Production deployment status (log per loop iterasi, lihat `docs/evidence/`)

> Snapshot awal 2026-08-22 di `GOAL.md` §3. Status ini dicatat saat perubahan selesai diverifikasi; bukan klaim.

## 2026-08-22 — G2 Exposure restriction SELESAI (bukti: `docs/evidence/G2.md`)

- PostgreSQL/Redis (`/opt/ai-server/docker-compose.yml`) dan MinIO (`docker run`) hanya bind `127.0.0.1` + Tailscale `100.127.181.108`; `ss -tlnp` tidak menunjukkan `5432/6379/9000/9001/3010` publik.
- Kredensial MinIO dirotasi (sebelumnya default `minioadmin`); nilai baru hanya di env server.
- Env produksi: `DATABASE_URL`/`MINIO_ENDPOINT` → IP Tailscale; `NINE_ROUTER_URL=http://pmmi-9router:20128` (DNS docker) — memperbaiki bug latent: API tidak bisa menjangkau 9Router (`host.docker.internal:20128` refused dari container).
- `BOOTSTRAP_ADMIN_TOKEN` dihapus dari env setelah admin `admin@pmmi.local` dibuat; `POST /v1/auth/bootstrap-admin` → 403.
- ufw aktif: deny incoming; allow 22/80/443 + tailscale0; `DEFAULT_FORWARD_POLICY=ACCEPT` (kompat Docker). Tidak ada container mounting `/var/run/docker.sock`.
- Worker (`docker-worker-1`) dihidupkan kembali (mati ~10 hari, error koneksi PostgreSQL saat startup); log `PMMI worker started`, outbox backlog 0.
- `CORS_ORIGINS=https://pondokmultimedia.id,https://app.pondokmultimedia.id` (allowlist produksi).
- Verifikasi: `health/ready` = `{postgres:true,minio:true}`; api→9Router `200` + `ds/deepseek-v4-pro`; api healthy; web :80 `200`; `infra/scripts/health-check.sh` → `PMMI health checks passed`.
- **Repo server diperbaiki**: `/home/pmmiserver/pmmi/current` adalah dump tanpa commit (CRLF, origin lama kedaluwarsa) — diganti clone resmi `ahmadasrizalmi/pmmi` (commit `e36d00f`) + `.gitattributes` `*.sh text eol=lf` (bug runtime `pipefail\r`); konten identik modulo CR; backup di `current.bak-20260822`.
- Catatan: `0.0.0.0:2283` (Immich) tetap bind publik — workload terpisah, dibiarkan sesuai aturan keras; ufw memblokir akses non-tailscale.

## 2026-08-22 — G5 Ops SELESAI (bukti: `docs/evidence/G5.md`)

- HDD 465.8G ditemukan di `/data` (sdb1) — audit `lsblk` selesai; backup → `/data/pmmi-backups`.
- User system `pmmi` dibuat (juga untuk G4 Hermes); `/srv/pmmi` dibuat (workspace root).
- Tools host: `postgresql-client` (pg_dump/psql 18.6), `mc`. Env file → group `pmmi` 640.
- Systemd aktif: `pmmi-ops-monitor.timer` (5 menit) + `pmmi-backup.timer` (02:30 UTC); keduanya `oneshot` sukses terverifikasi.
- Backup `FULL|SUCCEEDED` tercatat di `backup_runs` + checksum + artefak di `/data/pmmi-backups/`; **restore drill sukses** ke DB scratch `pmmi_restore_drill` + MinIO throwaway (checksum OK, 52 tabel, row count identik: users 4/4, outbox_events 32/32) — produksi tidak tersentuh.
- Perbaikan bug di `ops-monitor.sh` (JSON printf + auth 9Router) dan `backup.sh` (run_id `tail`→`head`); unit systemd pakai path aktual (tanpa `ProtectHome`, yang menyebabkan 203/EXEC di bawah `/home`).
- `NINE_ROUTER_URL` dipisah konteks: container → `http://pmmi-9router:20128` (hardcode compose), host scripts → `http://127.0.0.1:20128` (env).

## 2026-08-22 — G4 Hermes: **SELESAI** — container sandbox + isolation test LOLOS + enable (bukti: `docs/evidence/G4.md`)

- Iterasi sebelumnya: install v0.20.5 utk `pmmi`, template, worker unit, test host GAGAL (cross-workspace, karena agent berbagi OS user pmmi).
- **Solusi sandbox (diimplementasikan)**: image `pmmi-hermes:0.20.5` (Dockerfile resmi, build ~9 mnt), network `hermes-net`, wrapper `/usr/local/bin/hermes` — gateway tiap profile dijalankan dalam container (mount hanya profile+workspace milik sendiri, `umask 000`, `--restart unless-stopped`); provisioning tetap hermes host. Kontrak worker tidak berubah → CI hijau. `pmmi` masuk grup docker (orchestrator; agent berjalan UID 10000 di container, bukan pmmi).
- **Adversarial isolation test LOLOS di container**: marker santri-A, `/etc/shadow`, `.env` produksi, docker.sock → DENIED; workspace sendiri → READ. Diverifikasi: POC one-shot, gateway container (`docker exec`), dan FS langsung. User-unit `InaccessiblePaths` terbukti TIDAK ditegakkan (diuji empiris) → container adalah jalur yang benar.
- **Enable**: `HERMES_ENABLED=true`; `pmmi-worker-hermes.service` active; Docker worker di-stop (satu worker). Host worker memproses outbox + EMAIL Resend benar (ops event → `EMAIL|SENT` id `0d375723-…`).
- Template `pmmi-template` → `base_url: http://100.127.181.108:20128/v1` (alamat terjangkau container). Provisioning chain (create/config/gateway start/stop) terverifikasi via wrapper.
- Sisa: E2E santri (Build→Start→Stop→Archive) di G7 (butuh auth); scoped credential per-user (catatan G6).

## 2026-08-22 — G6 9Router: sebagian SELESAI (bukti: `docs/evidence/G6.md`)

- Routing + auth verified: `ds/deepseek-v4-pro` → deepseek (apikey, priority 1, aktif); tanpa key → 401; hanya loopback.
- Format usage verified: `stream:false` → JSON bersih + `usage{total_tokens,...}` (format yang diparse gateway; konfirmasi fix commit 768cf7c); `stream:true` → SSE chunk. Usage tracking 9Router aktif (`usageHistory`/`usageDaily`).
- **Gap: fallback TIDAK dikonfigurasi** (providerNodes/proxyPools/combos = 0) — butuh provider key kedua (user) untuk fallback + uji failover.
- Metering ledger produksi (reserve→settle/reconcile/refund) menunggu user terautentikasi — dituntaskan G7 (E2E); logika sudah CI-verified.

## 2026-08-22 — G3 channel eksternal: EMAIL **LIVE**, TELEGRAM/WHATSAPP blocked (bukti: `docs/evidence/G3.md`)

- **EMAIL (Resend) LIVE + delivery nyata terverifikasi**: key user + domain `pondokmultimedia.id` terhubung; `NOTIFICATION_TRANSPORT=live`. Direct send ke inbox nyata sukses (id `ab61ad4f-…`); jalur worker → `EMAIL\|SENT` dengan `provider_message_id` Resend nyata (`5cd1e22b-…`) untuk notifikasi ops.
- `RESEND_WEBHOOK_SECRET` diset (placeholder; ganti `whsec_…` dari dashboard saat webhook endpoint dibuat setelah G1). Route `POST /v1/integrations/resend/webhook` (Svix-signed) siap di API.
- **TELEGRAM/WHATSAPP blocked**: tanpa token bot / nomor WA — dibutuhkan user.
- In-App tetap LIVE (source of truth); TELEGRAM tercatat `SKIPPED` (channel not linked) — truthful.
- Temuan awal `NOTIFICATION_TRANSPORT=mock` → sudah diganti `live` (sebelumnya delivery EMAIL SENT tanpa kiriman nyata).

---

# Definisi of Done — peta status per kriteria (snapshot 2026-08-22)

| # | DoD criterion | Status | Bukti |
|---|---|---|---|
| 1 | CI hijau pada commit final (`PMMI Blueprint CI`) | ✅ | Semua commit `success` (termasuk `af36956`, `1eb8e00`); jobs: test API/worker, build web/dashboard/api/worker/whatsapp, `validate:ui`, compose validation, image builds |
| 2 | TLS 3 domain + redirect http→https; vhost | 🔶 SEBAGIAN | Edge Cloudflare: `ssl=full`, `always_use_https=on` (http→301 terverifikasi), TLS 1.2; `https://` masih **530** — tunnel belum dibuat (blocked user, G1). Vhost nginx siap (`pondok→8080, app→8081, ai→3001`) |
| 3 | Tanpa eksposur publik (PG/MinIO/docker.sock/Baileys/Hermes-control/9Router) + CORS allowlist | ✅ | `docs/evidence/G2.md`: bind loopback+Tailscale (`ss -tlnp` bersih), ufw aktif, tanpa docker.sock mount, `CORS_ORIGINS` allowlist, bootstrap token dihapus. Catatan: Immich `:2283` workload terpisah (aturan keras) |
| 4 | MVP §62 12 langkah E2E via domain | ⛔ | Menunggu G1 (tunnel) + G3 TG/WA + kredensial admin utk langkah admin/akademik — G7 |
| 5 | 9Router production: routing/fallback/usage/metering | 🔶 | `docs/evidence/G6.md`: routing+auth+format usage (`stream:false` JSON, `stream:true` SSE)+tracking verified; **fallback belum dikonfigurasi** (butuh provider key #2); metering ledger live menunggu auth (G7) |
| 6 | Hermes: instalasi + template + worker + isolation test + `HERMES_ENABLED=true` | ✅ | `docs/evidence/G4.md`: v0.20.5 utk `pmmi`, template (9Router container-reachable), host worker active (Docker worker stop), **container sandbox — isolation test LOLOS**, `HERMES_ENABLED=true` |
| 7 | Notifikasi eksternal: min. 1 channel live + retry/fallback/circuit | 🔶 | `docs/evidence/G3.md`: **EMAIL Resend LIVE** (delivery nyata direct + worker path, `NOTIFICATION_TRANSPORT=live`); TG/WA blocked (kredensial); webhook signed siap (butuh URL publik G1); uji retry/fallback live menunggu alur nyata (G7) |
| 8 | Lifecycle automation (ACTIVE→GRADUATED→ALUMNI/DO) | 🔶 | Code-complete + CI-verified (repo gate); transisi produksi + stop-agent/expire/archive teraudit belum dijalankan — butuh auth admin (G7) |
| 9 | Ops: ops-monitor + backup timer + restore drill + `backup_runs` | ✅ | `docs/evidence/G5.md`: timers aktif (5 mnt / 02:30 UTC), backup `FULL\|SUCCEEDED` + checksum, **restore drill sukses** ke non-production (52 tabel, row count identik) |
| 10 | Dokumentasi final mencerminkan realita, semua di-push | 🔶 | Docs diperbarui bertahap (`BLUEPRINT_IMPLEMENTATION_STATUS.md`, `DEPLOYMENT.md`, evidence G1–G6); finalisasi setelah G1/G3/G7 |

**Ringkas**: DoD 1 ✅, 3 ✅, 6 ✅, 9 ✅ · DoD 2/5/7/8/10 🔶 (2,5,7,8 terblokir G1/G3/auth; 10 menyusul) · DoD 4 ⛔ (G7).

## 2026-08-22 — G7 E2E: progres public flow (bukti: `docs/evidence/G7.md`)

- Langkah 1–2 MVP (applicant → submission → notifikasi admission) **terverifikasi live tanpa auth**: `POST /v1/admissions/applications` → `SUBMITTED` + applicant token; outbox `admission.submitted` processed; notifikasi "Pendaftaran PMMI diterima" → **EMAIL Resend SENT nyata** (`e37076a1-…`); portal `/daftar/:id` + `self` 200; halaman publik 200.
- **Retry/backoff terminal teramati live**: WHATSAPP `FAILED` setelah 5 attempt (provider disabled) — mekanisme retry/backoff DoD #7 bekerja.
- Test application `4abb3cae-ce6c-4132-99c6-bf5663f79272` siap untuk lanjutan E2E. Langkah admin + domain publik: blocked (auth admin + G1).

## 2026-08-22 — Addendum verifikasi live (DoD 2/3/9)

- **Redirect http→https**: `http://pondokmultimedia.id` → `301 Location: https://pondokmultimedia.id/` (edge Cloudflare `always_use_https`).
- **CORS allowlist ditegakkan live**: `Origin: https://evil.example.com` → tanpa header `access-control-allow-origin` (browser diblokir); `Origin: https://app.pondokmultimedia.id` → `access-control-allow-origin: https://app.pondokmultimedia.id` + credentials.
- **Ops loop otonom**: `pmmi-ops-monitor.timer` jalan tiap 5 menit (last 33s lalu), `pmmi-backup.timer` terjadwal 02:34 UTC; `ops_events` merekam event (termasuk `backup.failed CRITICAL` dari run pra-fix dan `9router.unreachable` pra-fix — mekanisme alert bekerja).

## G1 — TLS/domain: SEBAGIAN, menunggu pembuatan tunnel (bukti: `docs/evidence/G1.md`)

- Diagnosis: DNS proxied Cloudflare, origin 530; IP publik `182.8.226.154` timeout port 80/443 (port-forward tidak aktif / kemungkinan CGNAT) → jalur A-record+port-forward tidak bisa; **keputusan: Cloudflare Tunnel**.
- Selesai via token Cloudflare user: `ssl=full`, `always_use_https=on` (redirect http→https di edge), `min_tls_version=1.2`; `cloudflared 2026.8.2` terinstal di server + `/etc/cloudflared/config.yml` siap (ingress semua hostname → nginx `localhost:80`).
- Token user tidak punya scope Tunnel:Create/DNS:Edit (hanya Zone settings + Tunnel read) → **tunnel harus dibuat user** (dashboard Zero Trust, nama `pmmi-prod`, 3 public hostname → `http://localhost:80`) lalu `cloudflared service install <TUNNEL_TOKEN>` di server; atau user berikan token dengan scope Tunnel:Edit + DNS:Edit.
- Kondisi sukses G1: `curl -I https://` ketiga domain OK + redirect http→https (edge sudah disiapkan).
