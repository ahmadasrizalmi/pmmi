# PMMI Digital Campus UX

> **Canonical review target: Efficient Simplified UX v1.4.**
>
> v1.0-v1.3 are retained only as historical drafts. **Do not implement their page counts or user-facing hierarchy directly.**

## Why v1.4

v1.3 was already simpler, but it still created too many page-level surfaces and put too much routine work on Staff Admin. PMMI is expected to operate with a small pondok administration team, so v1.4 optimizes for fewer people, fewer menus and fewer pages.

### Locked corrections

- **Staff Admin = catat + cek + siapkan + layani.**
- **Pimpinan = putuskan + setujui + tangani kasus sensitif/pengecualian.**
- List + detail + edit that belong to one job are combined with tabs/drawers/split views.
- Ustadz `Kelas Saya` now includes class selection, overview, attendance, materials and assignments in one workspace.
- Staff finance/admin, student/permit and inventory/lending are grouped instead of becoming many routes.
- System Admin remains powerful but uses only five human-language workspaces.
- Santri has no core AI Chat page.
- **Agent Key** remains automatic for Hermes Agent; **Developer Key** remains separate for coding/project use.

## Canonical v1.4 docs

1. [v1.4 overview and whole-panel maps](./v1.4/README.md)
2. [Public / Pendaftar](./v1.4/10_PUBLIC_APPLICANT.md)
3. [System Admin](./v1.4/20_SYSTEM_ADMIN.md)
4. [Pimpinan](./v1.4/30_PIMPINAN.md)
5. [Staff Admin](./v1.4/40_STAFF_ADMIN.md)
6. [Ustadz](./v1.4/50_USTADZ.md)
7. [Santri](./v1.4/60_SANTRI.md)
8. [Work split, CRUD and implementation rules](./v1.4/70_WORK_SPLIT_CRUD.md)

## Page efficiency

| Panel | Main menus | Workspace/page groups |
|---|---:|---:|
| Public / Pendaftar | 4 | 6 |
| System Admin | 5 | 5 |
| Pimpinan | 5 | 5 |
| Staff Admin | 5 | 5 |
| Ustadz | 4 | 4 |
| Santri | 5 | 5 |

**Total: 30 workspace/page groups, down from 56 in v1.3.**

## Work-sharing rule

Routine admission checking, transaction entry, routine permits and equipment service stay with Staff Admin. Final admission decisions, enrollment approval, sensitive student/lifecycle cases, important financial corrections/special expenses and equipment exceptions move to Pimpinan.

## AI credential model

- **Agent Key:** generated automatically by PMMI during `Pilih AI`, dedicated to one Hermes Agent, installed automatically, not manually copied by Santri/Ustadz.
- **Developer Key:** optional key under `Akun > API untuk Proyek`, used by coding/application projects, never reused as Hermes credential.

## Frontend gate

Do not add a new page merely because the backend has a separate entity/endpoint. Add a route only when the user's job/context genuinely changes, a large form needs its own space, or a public/shareable URL is required.