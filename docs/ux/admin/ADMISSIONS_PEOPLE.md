# PMMI UX Wireframe - Admin: Overview, Admissions & People

### A01 - ADMIN - Overview

**Route:** `/admin`

**Goal:** Memberi situational awareness dan prioritas kerja hari ini.

```text
+----------------------+---------------------------------------------------------+
| ADMIN SIDEBAR        | Selamat sore, Admin                                      |
| Overview             | [Periode aktif: PMMI 2026] [Search global...]            |
| Penerimaan           |---------------------------------------------------------|
| Orang                | Action needed                                            |
| Akademik             | [12 pendaftar belum diverifikasi] [8 submission pending] |
| AI & Agent           | [2 ops alerts] [3 lifecycle review]                      |
| Konten               |---------------------------------------------------------|
| Operasional          | Hari ini                                                 |
|                      | Interview 09:00 • Class reminders • Backup last success  |
|                      |---------------------------------------------------------|
|                      | Snapshot: Active santri | AI spend | Storage | Agents    |
+----------------------+---------------------------------------------------------+
```

**Key behaviors**
- Metric card harus clickable ke queue terkait.
- Prioritaskan exceptions/action-needed, bukan vanity metrics.
- Global search menemukan applicant, santri, staff, class, project.

### A02 - ADMIN - Pipeline Pendaftar

**Route:** `/admin/admissions`

**Goal:** Memproses applicant sebagai queue dengan filter dan state transition yang aman.

```text
+----------------------+---------------------------------------------------------+
| Penerimaan           | Pipeline Pendaftar                    [+ Applicant manual]|
| > Pipeline           | [Periode v] [Status v] [Program v] [Search...]           |
|   Setup              |---------------------------------------------------------|
|   Enrollment         | New 18 | Need docs 6 | Screening 12 | Interview 7 | ...  |
|                      |---------------------------------------------------------|
|                      | Applicant          Status        Last update     Owner    |
|                      | Ahmad              SCREENING     2h              Admin A  |
|                      | Fulan              INTERVIEW     1d              Admin B  |
|                      | ...                                                     |
|                      | [row click -> Application Detail]                        |
+----------------------+---------------------------------------------------------+
```

**Key behaviors**
- Kanban summary + table; table menjadi working surface utama.
- Bulk action hanya untuk low-risk actions (assign owner/tag), bukan accept/reject.
- Filter state persisten di URL.
- Tidak ada tombol transition langsung tanpa membuka detail.

### A03 - ADMIN - Application Detail

**Route:** `/admin/admissions/:id`

**Goal:** Satu tempat mengambil keputusan berdasarkan evidence lengkap.

```text
+--------------------------------------------------------------------------------+
| < Pipeline   Ahmad Rizal                            SCREENING   Application #... |
| [Overview] [Documents] [Review & Score] [Interview] [Decision] [Audit]          |
|--------------------------------------------------------------------------------|
| LEFT 2/3                                     RIGHT 1/3                           |
| Profil applicant                             Next best action                    |
| Kontak / asal / program minat                [Mark Admin Verified]               |
|                                              atau                               |
| Dokumen                                      [Schedule Interview]                |
| [KTP Verified] [Portfolio Verified]          ---------------------------------- |
|                                              Transition preview                  |
| Review & score                               Current -> Next                     |
| Criteria rows + notes                        Notification: applicant/in-app       |
|                                              [Confirm action]                    |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Action rail kanan hanya menawarkan transition legal berikutnya.
- Decision ACCEPTED/WAITLISTED/REJECTED memerlukan reason/note.
- Transition menampilkan efek notifikasi sebelum confirm.
- Audit tab read-only.

### A04 - ADMIN - Setup Penerimaan

**Route:** `/admin/admissions/setup`

**Goal:** Menyiapkan periode, program, cohort, capacity tanpa UUID.

```text
+--------------------------------------------------------------------------------+
| Setup Penerimaan                                                                 |
| [Periode] [Program] [Cohort]                                                     |
|--------------------------------------------------------------------------------|
| Periode aktif                                                                   |
| PMMI 2026   01 Jan - 30 Sep   Capacity 120   74 enrolled   [Edit] [Close]        |
| [+ Buat Periode]                                                                |
|--------------------------------------------------------------------------------|
| Programs                                                                        |
| Programmer         Cohort 2026-A, 2026-B                    [Manage]            |
| Content Creator    Cohort 2026-A                            [Manage]            |
| [+ Program]                                                                     |
|--------------------------------------------------------------------------------|
| Cohort detail uses date pickers + capacity + program select, never raw IDs.     |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Setiap entity punya list + detail/edit drawer.
- Closing period perlu confirmation dan tidak menghapus historical applications.
- Capacity progress visible.

### A05 - ADMIN - Daftar Ulang & Enrollment

**Route:** `/admin/admissions/enrollment`

**Goal:** Memprovision santri hanya setelah registration valid.

```text
+--------------------------------------------------------------------------------+
| Enrollment Queue                         [Ready 14] [Blocked 3] [Enrolled 74]     |
|--------------------------------------------------------------------------------|
| Applicant      Program       Cohort      Registration      Account        Action |
| Ahmad          Programmer    2026-A      COMPLETE          Not created    [Review]|
| Fulan          -             -           INCOMPLETE        -              Blocked |
|--------------------------------------------------------------------------------|
| Review drawer/page:                                                             |
| Checklist: Accepted ✓ Registration ✓ Program ✓ Cohort ✓ Capacity ✓               |
| Provision preview: user + SANTRI + wallet + 100 credits + 1 slot + 1GB storage  |
| [Enroll & Provision]                                                            |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Tidak ada ENROLL button jika prerequisite belum valid.
- Preview resources sebelum provisioning.
- Setelah sukses tampilkan activation link dengan copy button + sent-channel status.

### A06 - ADMIN - Santri Directory

**Route:** `/admin/students`

**Goal:** Mencari dan memantau lifecycle santri.

```text
+--------------------------------------------------------------------------------+
| Santri                                                    [+ Export CSV]         |
| [Search nama/email] [Status v] [Program v] [Cohort v]                           |
|--------------------------------------------------------------------------------|
| Nama             Program      Cohort    Lifecycle   AI credits  Agents  Last seen|
| Ahmad            Programmer   26-A      ACTIVE      84          1       2h       |
| ...                                                                            |
|--------------------------------------------------------------------------------|
| Row click -> Student Detail                                                     |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- No destructive bulk lifecycle transitions.
- Export respects privacy/role.
- Lifecycle badge semantic.

### A07 - ADMIN - Student Detail & Lifecycle

**Route:** `/admin/students/:id`

**Goal:** Melihat profil akademik/resources dan melakukan perubahan lifecycle yang aman.

```text
+--------------------------------------------------------------------------------+
| < Santri   Ahmad Rizal                  ACTIVE                                  |
| [Profile] [Academic] [Resources] [Portfolio] [Lifecycle] [Audit]                |
|--------------------------------------------------------------------------------|
| Academic snapshot                      Resource snapshot                         |
| Program / cohort / classes             AI credits 84                            |
| GPA/grade summary                      Agent slots 1 • running 1                 |
| Certificates                           Storage 430MB / 1GB                       |
|--------------------------------------------------------------------------------|
| Lifecycle action                                                              |
| [Suspend] [Graduate] [Mark Alumni] [Dropout]                                    |
| Click -> modal: reason + effective date + impact preview + communication review |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Sensitive status tidak langsung mengirim pesan; create review item.
- Impact preview: login, AI, Hermes, academic write, portfolio policy.
- Reactivation ACTIVE juga menampilkan resource restore policy.

### A08 - ADMIN - Staff & Ustadz

**Route:** `/admin/users`

**Goal:** Provisioning staff tanpa form campur raw quota/UUID.

```text
+--------------------------------------------------------------------------------+
| Staff & Ustadz                                             [+ Tambah Staff]      |
| [Search] [Role v] [Status v]                                                     |
|--------------------------------------------------------------------------------|
| Nama          Role       Status       Classes    Last login       Action         |
| Ust. Zaid     USTADZ     ACTIVE       3          1h               [Open]         |
| Admin B       ADMIN      PENDING      -          never            [Open]         |
|--------------------------------------------------------------------------------|
| Create Staff drawer: Name, Email, Role, optional entitlement template           |
| Success: activation link + delivery status                                      |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Default entitlement berasal template role; advanced override secondary.
- Activation link bukan JSON dump.
- Disable account terpisah dari delete (no hard delete).
