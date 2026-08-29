# PMMI UX v1.2 - Backend Impact & CRUD Rules

The v1.2 UX cannot be implemented correctly by only rearranging React components. It changes the authorization and persistence model.

## 1. Current repo mismatch

The current repository foundation models one `users.role` enum with `ADMIN`, `USTADZ`, `SANTRI`. That is insufficient for:

- separate Admin Web vs Pondok operations;
- Pimpinan approvals;
- staff with multiple operational units;
- Ustadz scoped to multiple assigned subjects/classes;
- one person carrying multiple responsibilities.

The implementation phase must move to many-to-many roles/capabilities while preserving migration compatibility.

## 2. RBAC v2 proposed entities

| Entity | Purpose |
|---|---|
| `roles` | Built-in/custom role templates: SYSTEM_ADMIN, PIMPINAN, STAFF, USTADZ, SANTRI |
| `permissions` | Atomic permission catalog |
| `user_roles` | Many-to-many user-role membership |
| `user_capabilities` | Capability grant, especially staff operational units |
| `teaching_assignments` | Ustadz -> subject/course/class scope |
| `role_permissions` | Role template -> permission mapping |
| `capability_permissions` | Staff capability -> permission mapping |

Authorization must check both action and resource scope. Example: `academic.grade.assigned` is not permission to grade every class.

## 3. Admission persistence impact

The actual form needs structured storage beyond `applicant_name/email/phone`.

| Logical entity | Data |
|---|---|
| `application_profiles` | identity, utusan, birth, address, education, nationality |
| `application_family` | parents, KK, jobs, education, religion/ethnicity/nationality, siblings |
| `application_guardians` | optional guardian data |
| `application_health` | physical, sight/hearing, allergies, medical history |
| `application_background` | smoking, prison history, home education/economy/situation |
| `application_skills` | study/sport/art/special skills, achievement, organization, motivation |
| `application_documents` | existing private file metadata/object refs |

Exact physical layout may use normalized tables or controlled JSONB, but permission boundaries must remain explicit and queryable.

## 4. Pondok Ops entities

### Finance administrative records

| Entity | CRUD rule |
|---|---|
| `finance_bills` | Draft C/R/U/D; finalized bill is not hard-deleted; cancel/adjust |
| `finance_bill_items` | Draft C/R/U/D; lock with finalization |
| `finance_payments` | C/R; posted payment immutable; reversal/correction creates new record |
| `finance_receipts` | C/R; reissue representation, not destructive edit |
| `finance_expenses` | Draft C/R/U/D; posted -> reversal/correction |
| `finance_adjustments` | C/R; may need Pimpinan approval by threshold |

### Kesantrian

| Entity | CRUD rule |
|---|---|
| `student_affairs_profiles` | R/U restricted fields |
| `leave_permits` | C/R/U; cancel/close state transition |
| `student_affairs_notes` | C/R; controlled correction/archive + audit |
| `lifecycle_requests` | C/R/U/cancel DRAFT; approved/rejected by Pimpinan |

The exact leave/note taxonomy is a proposed operational model and needs pondok SOP confirmation before coding.

### Sarpras / assets

| Entity | CRUD rule |
|---|---|
| `asset_categories` | C/R/U/archive |
| `asset_items` | C/R/U; archive/write-off preserving history |
| `asset_loans` | C/R/U; checkout/return/damage/cancel state transitions |
| `asset_maintenance` | C/R/U/archive; retain service history |

### General administration

| Entity | CRUD rule |
|---|---|
| `administrative_documents` | C/R/U/archive; private attachments and retention policy |

Taxonomy for surat/administrative documents remains a pondok SOP item.

## 5. AI API-key entities

| Entity | Required fields / behavior |
|---|---|
| `ai_api_keys` | owner type USER/AGENT/SERVICE; owner id; name; prefix; `key_hash`; scopes; allowed models; policy; expiry; last-used; revoked-at; creator |
| `ai_key_policies` | eligibility, max keys, default TTL, allowed scopes/models, request/token limits |
| `ai_key_usage` or usage reference | usage attributed to key id + owner + model while preserving existing AI ledger as accounting truth |

**Security invariants**
- Never store plaintext API key.
- Never expose `key_hash`.
- Plaintext appears only on create/rotate.
- Revocation must be checked on every request or through a cache with bounded invalidation.
- Agent uses a dedicated AGENT key so usage is distinguishable from owner's manual chat/API use.

## 6. Hermes Agent setup entities

| Entity | Purpose |
|---|---|
| `agent_profiles` | owner, profile slug/name, template, purpose, setup state, runtime state |
| `agent_soul_versions` | versioned SOUL.md, active version, editor/audit |
| `agent_channel_connections` | Telegram/WhatsApp connection and encrypted secret/session reference |
| `agent_llm_configs` | PMMI base URL policy, model, agent-key reference, wallet/budget source |
| `agent_workspaces` | absolute `terminal.cwd`, owner, quota/lifecycle |
| `agent_home_bindings` | home channel/chat identity and `/sethome` verification state |
| `agent_safety_configs` | runtime backend, write root, tools, network/approval policy |
| `agent_runtime_jobs` | PROVISION/TEST/START/STOP/RESTART/ARCHIVE/ROTATE, attempts, timestamps, error |

### Setup state guard

`READY` is impossible unless all required state is valid:

- profile configured;
- active SOUL version exists;
- channel connected/tested;
- LLM model + active agent key tested;
- workspace provisioned;
- home binding verified;
- safety policy resolved.

This guard belongs in service/database state logic, not only frontend button disabling.

## 7. Global CRUD conventions

### Hard delete allowed only for disposable drafts

Examples: unsubmitted local application draft, draft bill line, draft template before references exist.

### Archive / cancel instead of delete

Use for users, roles referenced by history, assets, courses/materials with historical references, assignments, agents, channel connections, administrative documents.

### Immutable + compensating entry

Use for:
- AI credit ledger;
- posted payments;
- posted expenses where accounting trace matters;
- audit/security events;
- significant lifecycle decisions.

### State transitions instead of arbitrary update

Use for:
- admissions lifecycle;
- registration/enrollment;
- lifecycle requests;
- asset checkout/return;
- agent provisioning/runtime;
- notification delivery;
- approval queues.

## 8. Page permission tests required

Every browser/API E2E suite must include **positive and forbidden paths**.

Examples:

1. System Admin can rotate an agent/service API key but a Staff Keuangan user cannot open `/system/ai/api-keys`.
2. Staff Keuangan can record payment but cannot see restricted medical admission data.
3. Staff Kesantrian can create lifecycle request but cannot approve it if Pimpinan approval is required.
4. Ustadz Fotografi can create assignment for Fotografi class but receives 403 for an unassigned Programmer class.
5. Santri A cannot read Santri B submission, API key, wallet, agent or workspace.
6. Pimpinan can see aggregate AI resource report but cannot reveal API-key secret or provider token.
7. Archived/alumni/dropout lifecycle policy blocks academic/AI/agent actions according to resource policy even when direct API endpoints are called.

## 9. Implementation epics before UX can be called complete

1. **RBAC v2** - roles, permissions, user_roles, capabilities, teaching assignments.
2. **Admission data v2** - complete biodata schema + privacy scopes.
3. **Pondok Ops** - finance records, kesantrian, asset borrowing/maintenance, approvals.
4. **AI API Keys** - hashed USER/AGENT/SERVICE key auth for OpenAI-compatible PMMI routes.
5. **Hermes Setup v2** - SOUL/channel/LLM/workspace/home/safety state + provisioning jobs.
6. **Frontend shells** - `/system`, `/leadership`, `/office`, `/ustadz`, `/santri`, `/daftar`.
7. **Browser E2E** - CRUD, approval, forbidden-role paths, mobile Santri, tablet Ustadz.

Until these epics are implemented and tested, the existing frontend should be described as **backend/domain prototype UI**, not final PMMI UX.
