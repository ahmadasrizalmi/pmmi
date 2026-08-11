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
