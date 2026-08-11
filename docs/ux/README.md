# PMMI Digital Campus UX

> **Canonical review target: Simplified UX v1.3.**
>
> v1.0, v1.1 and v1.2 are retained only as historical design/architecture drafts. **Do not implement their user-facing surfaces directly.** v1.3 keeps the required backend capabilities but deliberately simplifies what pondok users see.

## Why v1.3

The earlier specs were still too technical for daily pondok use. v1.3 locks these corrections:

- no AI Chat / AI Playground as a core Santri feature;
- **Agent Key** belongs to Hermes Agent and is generated/installed automatically by PMMI;
- **Developer Key** is a separate credential for project/coding and may be copied by its owner;
- System Admin remains powerful but uses human-language pages rather than an IT-console-shaped sidebar;
- each panel has only 4-6 main menus; detail screens are opened from lists/cards instead of appearing as sidebar items;
- Staff Pondok only sees modules matching their assigned duties;
- Ustadz only sees subjects/classes they teach;
- Pimpinan sees pondok summaries and approvals, never platform secrets.

## Canonical v1.3 documents

1. [v1.3 overview, panel counts and design rules](./v1.3/README.md)
2. [Public & Applicant](./v1.3/10_PUBLIC_APPLICANT.md)
3. [System Admin](./v1.3/20_SYSTEM_ADMIN.md)
4. [Pimpinan](./v1.3/30_PIMPINAN.md)
5. [Staff Pondok](./v1.3/40_STAFF_PONDOK.md)
6. [Ustadz](./v1.3/50_USTADZ.md)
7. [Santri](./v1.3/60_SANTRI.md)
8. [CRUD, Agent Key, Developer Key and frontend definition of done](./v1.3/70_CRUD_AGENT_KEYS.md)

## Panel size

| Panel | Main menus | Page-level surfaces |
|---|---:|---:|
| Public / Applicant | 4 | 7 |
| System Admin | 6 | 9 |
| Pimpinan | 6 | 6 |
| Staff Pondok | max 6 | 16 |
| Ustadz | 5 | 8 |
| Santri | 5 | 10 |

**Total: 56 page-level surfaces.** The page count is intentionally larger than the menu count because detail/edit/review pages are contextual screens, not sidebar clutter.

## Actor separation

- `/system/*` — **System Admin / Admin Web**: users/access, AI & API, agent support, connections, security/activity, backup/system health.
- `/pimpinan/*` — **Pimpinan**: pondok summary, admissions, santri, finance, academic and reports/approvals.
- `/staff/*` — **Staff Pondok**: task-based modules for admissions, finance, kesantrian, equipment lending and general administration. A staff member only sees assigned modules.
- `/ustadz/*` — **Ustadz Pengampu**: dashboard, assigned classes, tasks/grades, materials and own agents.
- `/santri/*` — **Santri**: today, learning, works, agents and account. Developer API is a contextual page for eligible users, not a main menu.
- `/daftar/*` — Applicant admission flow based on the real PMMI biodata form.

## AI credential model

### Agent Key

- generated automatically when the agent setup reaches **Pilih AI**;
- dedicated to that Hermes Agent;
- installed by PMMI into the agent profile/configuration;
- not copied manually by Santri/Ustadz;
- can be rotated/revoked by the platform according to policy.

### Developer Key

- created from **API untuk Proyek**;
- used by a user's own coding/application project;
- Base URL: `https://ai.pondokmultimedia.id/v1`;
- secret is shown only when created/rotated;
- never reused as the Hermes Agent credential.

## Simplified Hermes setup

The user-facing wizard is six steps:

1. **Nama & Tujuan**
2. **Kepribadian** — produces `SOUL.md` behind the scenes
3. **Hubungkan Chat** — Telegram or WhatsApp
4. **Pilih AI** — PMMI creates and installs the Agent Key automatically
5. **Tempat Kerja** — workspace and home-channel setup
6. **Cek & Aktifkan** — PMMI runs connection, AI, workspace and safety checks

The backend may still use detailed provisioning states, secrets, jobs and runtime checks. Those implementation details do not belong in the normal Santri/Ustadz interface.

## Admission correction retained

The initial `/daftar` wizard follows the actual PMMI form groups:

1. Identitas
2. Keluarga
3. Wali
4. Fisik & Kesehatan
5. Latar Rumah
6. Kecakapan & Prestasi
7. Motivasi
8. Dokumen

The supplied source form does **not** ask the applicant to choose Jalur, so v1.3 does not invent a Jalur selector in the initial biodata flow.

## Frontend implementation gate

The production frontend is not UX-complete until:

- the v1.3 panel/menu hierarchy is implemented;
- System Admin and pondok operational roles are separated;
- Staff menus are capability-based and Ustadz access is teaching-assignment scoped;
- there is no core Santri AI-chat page;
- Agent Key and Developer Key are separate in both UX and backend;
- agent setup uses the simplified six-step wizard while still enforcing all backend checks;
- no normal user enters UUID or sees raw JSON/internal job data;
- browser E2E covers both permitted workflows and forbidden-role paths.
