# Phase 1 + 2 Completion Contract

This document defines what “complete” means for the first two PMMI Digital Campus phases.

## Phase 1 — Foundation

Complete when the codebase provides:

- Monorepo/workspace structure while preserving the public PMMI site.
- PostgreSQL migration runner with tracked, transactional migrations.
- Fastify API service and worker service foundation.
- Environment validation and home-server Docker wiring.
- Identity model for Admin, Ustadz, and Santri.
- Password hashing, JWT login, account activation, and role enforcement.
- Admission periods and public application submission.
- Controlled admission state transitions.
- Accepted → Enrolled provisioning into user, student, resource entitlement, and activation token records.
- Student lifecycle transitions with resource shutdown for alumni/dropout/inactive states.
- Audit logging for security/business-critical transitions.
- CI verification against a real PostgreSQL service.

## Phase 2 — Academic Core

Complete when the codebase provides:

- Courses, classes, class enrollments, assignments, deadlines, and permissions.
- Role-aware class/assignment access.
- MinIO presigned upload intents with expiry.
- Submission creation only after the uploaded MinIO object is verified.
- Resubmission after revision request.
- Ustadz/Admin grading with maximum-score validation, feedback, and revision workflow.
- Student grade retrieval.
- Certificate metadata/object references.
- Featured portfolio publication directly by Ustadz/Admin without student approval.
- Public portfolio listing.
- End-to-end integration test covering admission → enrollment → activation → academic submission → grading → portfolio.
- CI verification against real PostgreSQL and MinIO services plus API/public-web builds.

## Explicitly not Phase 1 or 2

The following remain later phases and are not required to call Phase 1 or 2 complete:

- Notification delivery engine (Resend, WhatsApp, Telegram).
- 9Router / AI Gateway and AI credit ledger consumption.
- Hermes installation/profile provisioning.
- Full dashboard UI for Admin/Ustadz/Santri.
- Production reverse proxy/TLS/DNS setup.
- Production deployment and load testing on the physical PMMI home server.

## Completion rule

Code completion and production deployment are different gates. Phase 1+2 can be code-complete only after CI passes migrations, integration tests, TypeScript build, and public-web build. Physical-server readiness remains unverified until the same migration and smoke-test path is executed on the PMMI Ubuntu server.
