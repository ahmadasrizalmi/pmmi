# Phase 2 — Academic Core

Phase 2 implements the academic backend on top of the Phase 1 identity/admission foundation.

## Implemented

- Courses and classes with Admin creation.
- Class enrollment and role-aware class access.
- Assignment creation by Admin or the assigned Ustadz.
- Student assignment listing with enrollment checks.
- MinIO presigned upload intents with 15-minute expiry.
- MinIO object verification before a submission is accepted.
- Initial submission and resubmission after revision requests.
- Grading, feedback, revision-required state, and max-score validation.
- Student grade retrieval.
- Certificate records pointing to MinIO object keys.
- Featured portfolio projects published immediately by Ustadz/Admin without student approval.
- Public featured portfolio endpoint.
- Audit records for critical submission/grading actions.
- Integration test covering admission through published portfolio.

## Storage rule

Files stay in MinIO. PostgreSQL stores object keys and metadata. A client cannot register an arbitrary object key as a submission: it must use a server-issued upload intent and the API verifies that the object exists in MinIO before committing the submission.

## Permission rule

- Admin: global academic management.
- Ustadz: may manage/grade only classes assigned to that user.
- Santri: may access and submit only for actively enrolled classes.

Notification events are intentionally deferred to Phase 3; AI Gateway/9Router and Hermes provisioning are later phases.
