# v1.4 - Work Split, CRUD and Implementation Rules

## Staff Admin vs Pimpinan

| Area | Staff Admin | Pimpinan |
|---|---|---|
| Penerimaan | Check biodata/documents, communication, interview scheduling, prepare registration | Final interview/decision, track/cohort confirmation, enrollment approval |
| Keuangan | Create bills, record payments, record routine expenses, archive evidence | Review corrections/reversals, special/high-value expenses, summary and decisions |
| Kesantrian | Administrative student data, routine permits, light operational notes | Sensitive cases, guidance/decisions, lifecycle/status changes |
| Alat | Inventory, checkout/return, damage/repair recording | Write-off/replacement/exception decisions |
| Administrasi umum | Routine letters/documents/archive | Documents/decisions requiring approval/signature |
| Akademik | Minimal support only | Overall monitoring; Ustadz still owns teaching/grading |

## CRUD ownership

CRUD is an implementation contract, not a UI label. Users see normal buttons.

| Domain | Routine owner | Final/sensitive owner | Delete semantics |
|---|---|---|---|
| Admission biodata/documents | Staff Admin + Applicant self where open | Pimpinan for decision | no silent deletion after submission |
| Admission decision/enrollment | - | Pimpinan | state transition/audit, not delete |
| Bills | Staff Admin | Pimpinan for exceptional correction | draft can cancel; finalized uses correction |
| Payments | Staff Admin records | Pimpinan reviews important reversal | posted payment corrected/reversed, not deleted |
| Expenses | Staff Admin routine entry | Pimpinan special/high-value | posted uses correction/reversal |
| Student admin data | Staff Admin | Pimpinan for sensitive/lifecycle | audit/archive policy |
| Permits | Staff Admin routine | Pimpinan exception | cancel/close state |
| Assets | Staff Admin | Pimpinan write-off/exception | archive/write-off, preserve history |
| Academic class/session/material/task | Ustadz assigned class | Pimpinan oversight only | cancel/archive with history |
| Grade/revision/feature | Ustadz assigned class | Pimpinan oversight only | audit correction; feature publishes immediately per PMMI rule |
| Agent | owner Ustadz/Santri | System Admin support/security | archive by default |
| Developer Key | eligible owner | System Admin support | revoke/rotate, never reveal old secret |
| Agent Key | generated automatically | System Admin support | rotate/revoke; not copied by agent owner |
| Audit/ledger | system generated | System Admin read/support | immutable |

## Agent AI simple surface

User-facing setup remains six steps:

1. Nama & Tujuan
2. Kepribadian - generates/updates `SOUL.md` behind the scenes
3. Hubungkan Chat - Telegram or WhatsApp
4. Pilih AI - PMMI creates and installs a dedicated **Agent Key** automatically
5. Tempat Kerja - workspace + home-channel setup
6. Cek & Aktifkan - PMMI validates channel, AI, workspace and safety

Do not expose key hashes, internal scopes, job payloads, server paths or provider credentials to normal users.

## Developer Key rule

Developer Key is optional, for coding/project use only. It is located at `Santri/Ustadz Account > API untuk Proyek` when the user is eligible.

- Base URL: `https://ai.pondokmultimedia.id/v1`
- full secret shown once at create/rotate
- create / rotate / revoke
- never reused as Hermes Agent credential

## Page efficiency rule

Do not create a new route just because backend has a separate entity or endpoint.

Use one workspace when:

- the user begins from a list and immediately needs selected-item detail;
- create/edit actions can safely use a drawer/modal;
- subtasks belong to one mental object, e.g. `Kelas Saya` contains Ringkasan, Absensi, Materi and Tugas;
- an approval can be opened from the Pimpinan approval inbox and returned to the same context.

Create a separate page only when the user changes job/context significantly, the form is too large for a drawer, or a public/shareable URL is required.

## Frontend Definition of Done

1. v1.4 remains at **30 workspace/page groups** unless a new page has a documented UX reason.
2. System Admin = 5 primary workspaces.
3. Pimpinan = 5 primary workspaces.
4. Staff Admin = 5 primary workspaces.
5. Ustadz = 4 primary workspaces.
6. Santri = 5 primary workspaces.
7. Staff Admin cannot make final admission/lifecycle or important financial approval silently.
8. No core AI Chat page.
9. Agent Key and Developer Key remain separate in backend and UI.
10. No normal user enters UUID or sees raw JSON/internal runtime data.
11. Browser E2E covers permission boundaries and the combined list/detail/tab workflows.