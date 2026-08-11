# PMMI Digital Campus — Blueprint Implementation Contract

This document defines what "blueprint code-complete + CI-verified" means for the PMMI repository. It does **not** claim that the physical Ubuntu home server has already been deployed or smoke-tested.

## Product surfaces

- Public website: `pondokmultimedia.id`
- Public application: `/daftar`
- Public featured portfolio API/page surface
- Role dashboard: `app.pondokmultimedia.id`
- PMMI API + AI Gateway: `ai.pondokmultimedia.id`
- Worker: PostgreSQL transactional outbox, notifications, reminders, rewards, lifecycle jobs and Hermes provisioning commands

## Implemented domains

### Identity, RBAC and lifecycle

- ADMIN / USTADZ / SANTRI roles
- Password hashing, JWT login, activation tokens
- Admin user provisioning for staff
- Student lifecycle: ACTIVE, GRADUATED, ALUMNI, DROPOUT, SUSPENDED, INACTIVE
- Resource shutdown policy for alumni/dropout/inactive states
- Sensitive lifecycle communication requires an explicit admin-approved message before external delivery
- Audit log for security, admission, submission, Hermes and lifecycle actions

### Admissions

- Admission periods
- Public application and applicant access token
- MinIO-backed application documents
- Admin review, selection scoring, interviews, decision and registration
- Program/cohort assignment
- Accepted -> Enrolled provisioning creates SANTRI identity, student profile, resource entitlements, AI wallet and activation token
- Hermes profile is **not** created during enrollment; it is only requested by Build AI Agent

### Academic

- Courses, classes and enrollments
- Class sessions/schedule and attendance
- Assignments/deadlines
- MinIO presigned uploads
- Submission/resubmission
- Grading, feedback and revision requests
- Certificates
- Featured portfolio publication without a student approval state

### Notification engine

- In-App source of truth
- PostgreSQL transactional outbox
- Delivery records, retry/backoff and dedupe
- Preferences and user channels
- Resend email provider adapter
- Telegram Bot provider + account link token/webhook
- WhatsApp provider abstraction with Baileys sidecar and Meta-compatible adapter options
- Per-event fallback routes rather than one global fallback chain
- Assignment reminders, missing work, class reminders, AI credit thresholds and ustadz digest scheduler
- Sensitive lifecycle states notify admins for review instead of sending a blunt automated message to students

External channels require their real production credentials before live delivery. CI uses the provider mock transport so routing and persistence can be verified without leaking secrets.

### AI Gateway / 9Router

- PMMI credit wallet and immutable ledger
- Model permission records
- Usage logs
- Reserve credits before upstream request
- Reconcile/refund after completion or failure
- OpenAI-compatible chat-completions proxy to 9Router
- Model-list proxy
- Streaming passthrough supported; PMMI uses final upstream usage when available

PMMI remains the accounting source of truth. 9Router remains the routing/provider engine.

### Hermes Agent

- Agent-slot entitlement
- Build Agent API creates a PMMI profile record, workspace record and build job only after lifecycle/slot checks
- Worker command contract creates a profile from the one shared Hermes installation and sets a per-profile `terminal.cwd`
- Workspace layout: `/srv/pmmi/workspaces/<user-id>/<profile-id>`
- Archive jobs stop profile gateway where available and archive PMMI workspace/profile state

Profiles/workspaces are **not** treated as an OS security sandbox. Production deployment must still enforce filesystem/credential/process isolation on the host.

### Rewards

- Configurable reward rules
- Manual grants
- Automatic event-triggered achievements
- AI-credit rewards
- Hermes-slot rewards
- Achievement notifications

### Operations

- Readiness health endpoint
- PostgreSQL / MinIO / 9Router / Hermes / outbox admin health summary
- Ops events and resolution
- Backup run records
- PostgreSQL + MinIO backup script
- Guarded restore script with checksum verification
- systemd nightly backup timer example

## Dashboard coverage

Admin dashboard includes operational overview, admissions, staff users, academic management, AI credits, rewards, ops and notifications.

Ustadz dashboard includes classes/pending submissions, grading/revision and notification center.

Santri dashboard includes assignments/upload/submission, grades summary, AI credits/chat, Build AI Agent, certificates summary and notification center.

## CI completion gate

`PMMI Blueprint CI` must pass all of the following on the blueprint branch before this implementation is called CI-verified:

1. dependency installation
2. PostgreSQL migrations
3. real MinIO startup
4. end-to-end API integration test covering admissions -> enrollment -> academic -> AI -> Hermes request -> lifecycle
5. worker/outbox integration test covering notifications, automatic rewards and Hermes job handling
6. TypeScript API build
7. TypeScript worker build
8. public React/Vite website build
9. role dashboard build
10. shell syntax validation for operational scripts
11. Docker Compose configuration validation

## Explicitly outside the code-complete claim

These require the physical PMMI server or real third-party credentials and therefore are deployment verification, not repository code completion:

- DNS/reverse-proxy TLS on the home server
- real Resend delivery and webhook receipt
- real WhatsApp session/account
- real Telegram bot token and webhook
- installed/running 9Router with real providers
- installed/running shared Hermes runtime and host filesystem sandbox policy
- production backup/restore drill on the actual disks
- Tailscale/firewall policy and real server smoke tests

Until those are executed on the home server, the correct status is **code-complete + CI-verified, deployment-not-yet-verified**.
