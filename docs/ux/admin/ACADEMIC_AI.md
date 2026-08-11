# PMMI UX Wireframe - Admin: Academic, AI, Rewards & Hermes

### A09 - ADMIN - Academic Catalog

**Route:** `/admin/academic`

**Goal:** Mengelola course dan class dalam struktur yang dapat dipahami.

```text
+--------------------------------------------------------------------------------+
| Academic                                                                         |
| [Courses] [Classes]                                                              |
|--------------------------------------------------------------------------------|
| Courses                                      Classes                             |
| WEB101 Web Fundamental [Open]                Programmer 26-A / Web [Open]        |
| VID201 Video Editing [Open]                  Creator 26-A / Video [Open]         |
| [+ Course]                                  [+ Class]                            |
|--------------------------------------------------------------------------------|
| Create Class: Course select, Teacher select, Cohort/Program scope, dates         |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Course dan class dipisah sub-page/tab yang jelas.
- Teacher, program, cohort memakai searchable select.
- Class scope preview menunjukkan calon auto-enrollment count.

### A10 - ADMIN - Class Detail

**Route:** `/admin/academic/classes/:id`

**Goal:** Menjadi hub roster, sessions, assignments, dan scope kelas.

```text
+--------------------------------------------------------------------------------+
| < Classes   Web Fundamental - Programmer 26-A                                  |
| Teacher: Ust. Zaid  •  24 Santri  •  Mon/Wed                                   |
| [Overview] [Roster] [Sessions] [Assignments] [Settings]                         |
|--------------------------------------------------------------------------------|
| Next session: Wed 13:00 [Open schedule]                                         |
| Pending grading: 7 [View submissions]                                           |
| Roster table: Name | status | attendance | latest assignment                    |
|--------------------------------------------------------------------------------|
| Settings: cohort/program scope + teacher reassignment                           |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Admin bisa inspect tetapi teaching actions utama tetap Ustadz.
- Roster menunjukkan lifecycle nonactive dengan warning.

### A11 - ADMIN - Certificates

**Route:** `/admin/academic/certificates`

**Goal:** Menerbitkan dan menelusuri certificate sebagai dokumen formal.

```text
+--------------------------------------------------------------------------------+
| Certificates                                                   [+ Issue]        |
| [Search certificate no / santri] [Program v] [Year v]                           |
|--------------------------------------------------------------------------------|
| No             Santri         Title                 Issued       Verify          |
| PMMI-26-001    Ahmad          Programmer Bootcamp   11 Aug       [Public link]   |
|--------------------------------------------------------------------------------|
| Issue flow: select santri -> template/title -> review metadata -> issue          |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Santri dipilih via search.
- Nomor certificate bisa auto-generate dengan override admin.
- Public verification link copyable.

### A12 - ADMIN - AI Credits & Usage

**Route:** `/admin/ai`

**Goal:** Mengelola budget AI dan anomali usage tanpa meminta user UUID.

```text
+--------------------------------------------------------------------------------+
| AI Credits & Usage                                                               |
| Spend today: 3,420 credits | Requests: 811 | Failures: 2.1% | Low wallets: 12   |
|--------------------------------------------------------------------------------|
| [Wallets] [Usage] [Models & Policy]                                              |
| Search user...                                                                  |
| Ahmad   84 credits   38 req today   last model ...     [Open wallet]             |
|--------------------------------------------------------------------------------|
| Wallet drawer: immutable ledger + [Grant credits] reason                        |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Grant credits dari user search, bukan UUID.
- Ledger immutable dan tampil sebagai timeline.
- Model policy/rate controls separated from individual wallet.

### A13 - ADMIN - Rewards

**Route:** `/admin/rewards`

**Goal:** Membuat reward rule dan melihat grant dengan efek resource yang jelas.

```text
+--------------------------------------------------------------------------------+
| Rewards                                                                          |
| [Rules] [Achievements] [Manual Grant]                                             |
|--------------------------------------------------------------------------------|
| Grade Excellence   when grade >= 90    +20 AI credits   ACTIVE [Edit]            |
| First Featured     project featured    +1 achievement    ACTIVE [Edit]            |
|--------------------------------------------------------------------------------|
| Manual Grant: [Search santri] [Select reward] [Reason] [Preview] [Grant]         |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Rule builder memakai human-readable conditions.
- Preview effect sebelum activate/edit.
- Manual grant selalu reason + audit.

### A14 - ADMIN - Hermes Agents & Audit

**Route:** `/admin/hermes`

**Goal:** Mengawasi agent runtime dan job failures secara operasional.

```text
+--------------------------------------------------------------------------------+
| Hermes Agents                                      Runtime: DISABLED / HEALTHY   |
| [Agents] [Jobs] [Isolation Checklist] [Audit]                                    |
|--------------------------------------------------------------------------------|
| Agent             Owner       State     Job       Workspace          Action      |
| Coding Agent      Ahmad       STOPPED   OK        /.../profile       [Open]      |
|--------------------------------------------------------------------------------|
| Agent detail: Build/Start/Stop/Archive history; retry failed job                 |
| Isolation checklist must be green before runtime enable                          |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Admin tidak membuka arbitrary shell dari dashboard.
- Retry hanya untuk safe/idempotent failed job.
- Workspace path secondary/debug info, bukan primary UX.
