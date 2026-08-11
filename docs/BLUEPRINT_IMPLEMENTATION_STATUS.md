# PMMI Digital Campus — Blueprint Completion Contract

This document defines what PMMI means by **code-complete**, **CI-verified**, and **production-verified**. The project must not claim production verification until the physical Ubuntu home server has been deployed and smoke-tested.

## Code-complete domains

### Identity, RBAC, lifecycle, audit
- JWT authentication and activation flow for Admin, Ustadz and Santri.
- Applicant remains an applicant until enrollment provisioning succeeds.
- Student lifecycle supports ACTIVE, GRADUATED, ALUMNI, DROPOUT, SUSPENDED and INACTIVE.
- Ended/suspended states disable login where appropriate, zero AI wallet and Hermes slots, and queue Hermes archive jobs.
- DROPOUT/SUSPENDED/INACTIVE communication is drafted for explicit Admin review before external delivery.
- Critical transitions are audited.

### Admissions
- Admission periods, programs and cohorts.
- Public application and applicant access token.
- Program selection and application status tracking.
- MinIO document upload and document verification.
- Admin review, selection score, interview, decision and registration.
- Accepted + registration completed -> explicit enrollment provisioning.
- Enrollment creates SANTRI identity, student/cohort/program, class enrollment, notification channels, AI wallet, storage/agent entitlements and activation link.
- A Hermes profile is not created until the user clicks Build Agent.

### Academic
- Courses, cohort classes and teacher assignment.
- Auto-enrollment of active students into cohort classes.
- Class sessions, rescheduling/cancellation notifications and attendance.
- Assignments, deadlines, MinIO uploads, submissions/resubmissions.
- Ustadz/Admin submission review, file download, grading, feedback and revision loop.
- Database-enforced student storage quota.
- Certificates, public certificate verification and santri download links.

### Portfolio
- A graded submission may be featured by Ustadz/Admin.
- Featured means immediately public; there is intentionally no student approval state.
- Public portfolio list/detail and MinIO-backed portfolio assets.

### Notifications
- Transactional PostgreSQL outbox.
- Durable in-app notification center.
- Delivery jobs, idempotency, retry/backoff and provider health.
- Provider circuit breaker defers queued jobs while a channel is disabled.
- Preferences and mandatory/formal notifications.
- Assignment deadline, class, interview and grading-digest scheduling.
- Resend email adapter and signed/deduplicated Resend webhook service.
- Telegram one-time linking token and webhook secret validation.
- WhatsApp provider abstraction with a standalone Baileys adapter.
- WhatsApp failure falls back to linked Telegram, then email; Telegram falls back to email.
- Critical ops alerts target active Admins.

### AI Gateway / 9Router
- PMMI exposes OpenAI-compatible `/v1/models` and `/v1/chat/completions` aliases plus PMMI-prefixed routes.
- JWT and PMMI AI API-key authentication.
- Role/model policy and per-user rate limiting.
- Authoritative AI wallet and immutable ledger.
- Credits are reserved before the upstream request and reconciled/refunded afterward.
- Usage/failure logs are persisted.
- 9Router remains an upstream routing engine; PMMI remains the authorization/accounting source of truth.
- Streaming is intentionally disabled until deterministic streaming credit reconciliation is implemented.

### Hermes
- PMMI assumes one Hermes installation/runtime, not one install per santri.
- Build Agent checks lifecycle and slot entitlement, then creates a PMMI profile/workspace/job.
- Jobs support BUILD, START, STOP and ARCHIVE with retry state.
- Real host mode calls the Hermes CLI without a shell, sets `terminal.cwd`, configures a custom OpenAI-compatible PMMI Gateway, creates a dedicated PMMI AI key, and starts/stops the profile gateway.
- PMMI stores the AI key hash only; archive revokes the key and archives the workspace record.
- CI uses mock execution; real Hermes execution belongs to deployment verification.

### Rewards
- Admin-defined rewards and grade-event rules.
- Achievements are deduplicated by rule/source.
- Rewards grant AI credits and/or Hermes agent slots transactionally.
- Jobs worker automatically evaluates graded submissions.

### Dashboards and public surfaces
- Dedicated React/Vite dashboard for Admin, Ustadz and Santri.
- Login + secure activation screen.
- Academic submission/review journeys, notifications/channel settings, AI wallet/chat, Hermes agents, achievements and certificates.
- Admin admissions detail, Ustadz/user management, ops status and sensitive communication review.
- Existing PMMI public website remains deployable unchanged.
- `/daftar` and `/portfolio*` public extensions are provided as a separate Vite surface so the existing public site's visual stack does not need a risky migration during this phase.

### Operations / backup
- DB/MinIO/9Router/provider/worker/backup status API.
- Audit and health-event APIs.
- Production compose connecting to existing host PostgreSQL, MinIO and 9Router.
- Host systemd jobs worker for real Hermes execution.
- PostgreSQL dump + MinIO mirror backup script and nightly systemd timer.
- Smoke-test script.

## CI verification gate

`PMMI Blueprint CI` must pass all of these on the same branch head:

1. Install the monorepo dependency graph.
2. Start PostgreSQL 16 and MinIO.
3. Apply every database migration in order.
4. Re-run the Phase 1-2 integration test.
5. Run the complete cross-domain blueprint API journey.
6. Run jobs worker integration tests for notification delivery, automatic rewards and Hermes mock provisioning.
7. Build the API including `blueprintIndex`.
8. Build jobs worker.
9. Build WhatsApp/Baileys adapter.
10. Build Resend webhook service.
11. Build Admin/Ustadz/Santri dashboard.
12. Build public registration/portfolio extensions.
13. Regression-build the existing public website.
14. Validate production Docker Compose syntax.

A red or incomplete CI run means the blueprint is **not CI-verified**, regardless of how complete the code appears.

## Deployment verification — intentionally not claimed by CI

These require the physical PMMI Ubuntu server and real credentials:

- Install/configure 9Router providers and make a real upstream AI request.
- Install Hermes Agent and execute a real profile/gateway process.
- Pair the real PMMI WhatsApp number with Baileys.
- Send real Resend, Telegram and WhatsApp notifications and verify provider callbacks.
- Configure `pondokmultimedia.id`, `app.pondokmultimedia.id`, `ai.pondokmultimedia.id`, TLS and reverse-proxy routing.
- Verify PostgreSQL and MinIO against the actual server services and permissions.
- Run backups against the real SSD/HDD mount layout, then perform a restore drill.
- Validate Tailscale/firewall policy and production resource limits.
- Run the production smoke test.

Only after those steps should PMMI be described as **production-verified**.
