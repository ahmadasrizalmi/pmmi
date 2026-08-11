# PMMI Digital Campus — Blueprint Implementation Contract

Dokumen ini mendefinisikan arti **blueprint code-complete + CI-verified** untuk repository PMMI. Status ini tidak sama dengan production deployment: Ubuntu home server, DNS/TLS, Tailscale, provider nyata, 9Router nyata, Hermes nyata, dan restore drill tetap harus diverifikasi saat deployment.

## Product surfaces

- Public website: `pondokmultimedia.id`
- Public admission: `/daftar`
- Applicant portal: `/daftar/:applicationId`
- Public featured portfolio: `/portfolio` dan `/portfolio/:slug`
- Role dashboard: `app.pondokmultimedia.id`
- PMMI API + AI Gateway: `ai.pondokmultimedia.id`
- PostgreSQL worker: transactional outbox, notifications, schedules, rewards, lifecycle, dan Hermes provisioning jobs

## Identity, RBAC, lifecycle

- Role `ADMIN`, `USTADZ`, `SANTRI`
- scrypt password hashing, JWT login, account activation tokens
- Staff provisioning dan activation oleh admin
- Student lifecycle: `ACTIVE`, `GRADUATED`, `ALUMNI`, `DROPOUT`, `SUSPENDED`, `INACTIVE`
- Lifecycle access dijaga di DB; suspended/dropout/inactive tidak dapat memiliki login aktif
- Academic write dijaga di DB: upload/submission hanya legal untuk santri `ACTIVE`
- Alumni/graduated resource policy mematikan AI credits/agent entitlement sesuai lifecycle policy
- Perpindahan ke lifecycle nonaktif mengantrekan Hermes archive/stop
- Komunikasi sensitif untuk DO/SUSPENDED/INACTIVE membutuhkan pesan formal yang di-approve admin sebelum masuk outbox
- Audit log untuk security/admission/academic/Hermes/lifecycle actions

## Admissions

- Admission periods + capacity
- Public application + applicant access token yang disimpan sebagai hash
- Admin token recovery dengan revoke token lama
- Applicant self-service status API
- MinIO-backed application documents, max durable document size 50 MiB
- Admin review, selection scoring, interview, decision
- Programs dan cohorts
- Registration/daftar ulang
- PostgreSQL state-machine guard menolak transisi admission ilegal
- PostgreSQL guard mewajibkan registration + program + cohort sebelum `ENROLLED`
- Capacity admission period ditegakkan saat enrollment
- `ENROLLED` provisions SANTRI identity, student profile, program/cohort, AI wallet, initial credits, agent slots, storage quota, activation token
- Cohort/program scoped classes dapat auto-enroll saat student/class diprovisioning
- Hermes profile **tidak** dibuat saat enrollment; profile dibuat hanya melalui Build AI Agent

## Academic

- Courses, classes, enrollments
- Cohort/program class scope dan automatic class enrollment
- Class sessions/schedules + attendance
- Assignments/deadlines
- MinIO presigned upload intents
- Submission/resubmission
- Grading, feedback, revision request/deadline
- DB storage quota guard untuk submission files
- Certificates + certificate metadata/object references
- Featured portfolio publication
- `portfolio_assets` snapshots submission-file references tanpa menduplikasi blob MinIO
- Rule PMMI terkunci: Ustadz/Admin `Featured` => langsung public, **tanpa approval state santri**

## Notification engine

- In-App source of truth
- PostgreSQL transactional outbox
- Delivery records, retry, exponential backoff, poison-event ops alert
- Dedupe bekerja juga untuk applicant yang belum mempunyai `users.id`
- Per-event route + per-parent fallback guard
- Preferences dan user channels
- Mandatory categories: ops/security/lifecycle tidak dapat dinonaktifkan
- Resend email adapter + signed webhook handling
- Telegram Bot provider + one-time account linking token/webhook
- WhatsApp provider abstraction: Baileys sidecar atau Meta-compatible adapter
- Provider circuit breaker
- Assignment reminders pada window threshold, missing work, class reminder, AI-credit threshold, ustadz digest
- Anti-spam guard mencegah semua deadline/credit thresholds terkirim sekaligus
- Sensitive lifecycle state hanya mengirim admin alert sampai komunikasi formal disetujui

External channels membutuhkan credential production. CI memakai mock transport sehingga routing/persistence dapat diverifikasi tanpa secret nyata.

## AI Gateway / 9Router

- PMMI AI credit wallet + immutable ledger
- Model permission + hourly request limit
- Usage logs
- Credit reservation sebelum upstream request
- Reconcile/refund setelah success/failure
- OpenAI-compatible canonical `GET /v1/models` dan `POST /v1/chat/completions`
- Compatibility aliases di `/v1/ai/*`
- Streaming passthrough; final upstream usage dipakai saat tersedia
- PMMI tetap accounting source of truth; 9Router hanya routing/provider engine

## Hermes Agent

- Agent-slot entitlement
- Build Agent hanya untuk lifecycle/slot yang valid
- PMMI profile/workspace/build-job state
- Workspace layout `/srv/pmmi/workspaces/<user-id>/<profile-id>`
- Worker memakai **satu shared Hermes installation**, bukan install ulang per santri
- Profile create/config menggunakan profile terpisah dan `terminal.cwd`
- Archive jobs stop gateway bila tersedia dan mengarsipkan state PMMI
- Admin Hermes status/retry/archive surface

Hermes profile/workspace bukan OS sandbox. Production tidak boleh mengaktifkan agent execution sampai host/container sandbox policy membuktikan agent tidak dapat membaca credential, `/etc`, admin home, atau workspace user lain.

## Rewards

- Configurable reward rules
- Manual grant
- Automatic event-triggered achievements
- AI-credit rewards
- Hermes agent-slot rewards
- Achievement notifications

## Operations

- API liveness/readiness
- Admin health: PostgreSQL, MinIO, 9Router, Hermes/outbox state
- Ops events + resolution
- DB-triggered ops notification outbox
- Disk + 9Router host monitor script
- Backup run records
- PostgreSQL + MinIO backup script + checksum
- Backup failure creates CRITICAL ops event
- Guarded restore script (`CONFIRM_RESTORE=YES`) + checksum verification
- systemd timer examples for backup/ops monitor
- hardened systemd example for shared Hermes worker

## Dashboard coverage

### Admin

Overview, admission review, enrollment queue, students/lifecycle, staff users, courses/classes/certificates, AI credits, rewards, Hermes/admin audit, ops/backup health, notification center.

### Ustadz

Classes, assignment creation, schedule creation, pending submission review, grading, feedback, revision, `Feature -> public portfolio`, notifications.

### Santri

Assignments + MinIO upload/submit, schedule, grades/feedback/revision, certificates, achievements, AI credits/chat, Build/Archive AI Agent, notification center.

## CI completion gate

`PMMI Blueprint CI` harus hijau pada **commit head terakhir** sebelum repository disebut CI-verified:

1. dependency installation
2. PostgreSQL migrations (seluruh migration yang ada di `packages/db/migrations`)
3. real MinIO startup
4. canonical end-to-end API integration test: applicant -> registration -> enrollment -> academic -> portfolio/certificate -> AI -> Hermes request -> lifecycle
5. worker/outbox integration test: notification delivery, fallback/persistence, automatic reward, Hermes result, lifecycle communication, ops alerts
6. TypeScript API build
7. TypeScript worker build
8. public React/Vite website build
9. role dashboard build
10. shell syntax validation: backup/restore/health/ops monitor
11. Docker Compose validation
12. production image builds: API, worker, public web, dashboard

## Explicitly outside the repository-complete claim

Hal berikut membutuhkan server/credential nyata dan baru dinilai saat deployment:

- DNS/reverse proxy/TLS pada home server
- Tailscale/firewall policy
- real Resend delivery + webhook
- real WhatsApp session/account
- real Telegram bot + webhook
- installed/running 9Router dengan provider nyata
- installed/running shared Hermes runtime + **verified per-agent host/container isolation**
- production disk mounts/quotas
- backup + restore drill di disk/bucket nyata
- end-to-end smoke test melalui domain production

Sebelum poin deployment tersebut dilakukan, status yang benar adalah **code-complete + CI-verified, deployment-not-yet-verified**.
