# Phase 2 — Academic Core

This phase adds the academic domain on top of the Phase 1 identity/admission foundation.

## Scope

- Courses and classes
- Class enrollments
- Assignments and deadlines
- Student submissions and MinIO object references
- Grading, feedback, and revision requests
- Certificate records
- Portfolio projects sourced from submissions
- Featured portfolio publishing without student approval
- Initial REST route contracts for academic workflows

## Important behavior

A teacher/admin may feature a submission directly. The resulting portfolio project is public immediately once featured; no student approval state is required.

## Storage

Submission files and certificate binaries are stored in MinIO. PostgreSQL stores metadata and object keys only.

## Follow-up hardening

The route handlers in this phase establish API contracts. Repository/database wiring, authenticated user context, RBAC enforcement, notification event emission, and MinIO presigned upload flows are implemented in subsequent hardening phases.
