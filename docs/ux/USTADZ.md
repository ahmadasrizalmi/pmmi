# PMMI UX Wireframe - Ustadz

### U01 - USTADZ - Overview

**Route:** `/ustadz`

**Goal:** Menampilkan agenda mengajar dan submission yang harus dikerjakan.

```text
+----------------------+---------------------------------------------------------+
| USTADZ SIDEBAR       | Assalamu'alaikum, Ust. Zaid                             |
| Overview             | Hari ini: 2 sesi • 7 submission pending • 1 revision due|
| Kelas Saya           |---------------------------------------------------------|
| Jadwal & Sesi        | Agenda                                                   |
| Tugas                | 09:00 Web 26-A [Buka kelas]                              |
| Submission Masuk     | 13:00 Mentoring Creator [Buka]                           |
| Featured Portfolio   |---------------------------------------------------------|
| Notifikasi           | Review queue                                             |
|                      | Ahmad - Final Project [Grade]                             |
+----------------------+---------------------------------------------------------+
```

**Key behaviors**
- CTA berdasarkan waktu dan workload.
- Tidak tampilkan admin-only controls.

### U02 - USTADZ - Kelas Saya

**Route:** `/ustadz/classes`

**Goal:** Memilih class berdasarkan context pengajaran.

```text
+--------------------------------------------------------------------------------+
| Kelas Saya                                                                        |
| [Current term v] [Search]                                                        |
|--------------------------------------------------------------------------------|
| Web Fundamental - Programmer 26-A     24 santri   Next Wed 13:00   [Open]       |
| Content Production - Creator 26-A     19 santri   Next Fri 09:00   [Open]       |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Card/table adaptif mobile/tablet.
- Open class menuju workspace class, bukan generic academic page.

### U03 - USTADZ - Class Workspace

**Route:** `/ustadz/classes/:id`

**Goal:** Hub harian pengajaran: roster, session, assignment, pending review.

```text
+--------------------------------------------------------------------------------+
| < Kelas Saya  Web Fundamental - Programmer 26-A                                |
| [Overview] [Roster] [Sessions] [Assignments]                                    |
|--------------------------------------------------------------------------------|
| Next session Wed 13:00                         [+ Buat Sesi]                     |
| Attendance last: 22/24 present               [Open Attendance]                  |
| Assignments: 3 active • 7 awaiting grade      [+ Buat Tugas]                    |
|--------------------------------------------------------------------------------|
| Recent activity / announcements                                                  |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Create session/assignment pre-fills class context.
- No course/class UUID input.

### U04 - USTADZ - Attendance

**Route:** `/ustadz/classes/:id/sessions/:sessionId/attendance`

**Goal:** Mencatat kehadiran roster cepat di tablet/HP.

```text
+--------------------------------------------------------------------------------+
| < Class   Session: 11 Aug 2026 09:00                    [Save attendance]        |
| [Mark all Present] [Search santri]                                               |
|--------------------------------------------------------------------------------|
| Ahmad Rizal        (• Present) ( Late ) ( Excused ) ( Absent )  note [____]     |
| Fulan              (• Present) ( Late ) ( Excused ) ( Absent )  note [____]     |
| ...                                                                            |
|--------------------------------------------------------------------------------|
| Unsaved changes: 3                                                              |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Radio/tap targets besar.
- Bulk mark present lalu exception editing.
- Autosave optional, tetapi explicit save + unsaved state wajib.

### U05 - USTADZ - Assignments & Submission Queue

**Route:** `/ustadz/assignments`

**Goal:** Membuat tugas dan memproses submission berdasarkan queue.

```text
+--------------------------------------------------------------------------------+
| Tugas & Submission                                                              |
| [Assignments] [Awaiting Grade 7] [Revision 3]                                   |
|--------------------------------------------------------------------------------|
| Assignment: Final Web Project  • Class 26-A • due 15 Aug                        |
| Submitted 18/24 • Graded 11 • Revision 2                        [Open]           |
|--------------------------------------------------------------------------------|
| Queue: Ahmad  submitted 2h ago   attempt 2  [Review]                            |
|        Fulan  submitted 1d ago   attempt 1  [Review]                            |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Create assignment is dedicated form/drawer: title, description, due, max score, rubric.
- Queue sort oldest/newest/due-risk.

### U06 - USTADZ - Grading Detail

**Route:** `/ustadz/submissions/:id`

**Goal:** Memberi nilai/feedback/revision sambil melihat artefak submission.

```text
+--------------------------------------------------------------------------------+
| < Submission Queue    Ahmad • Final Web Project • Attempt 2                     |
|--------------------------------------------------------------------------------|
| LEFT 2/3: Submission viewer / file links / notes                                |
| [Open artifact] [Download if allowed]                                           |
|                                                                                |
| RIGHT 1/3: Rubric / Grade                                                       |
| Score [ 92 / 100 ]                                                              |
| Feedback [........................................]                             |
| [Request Revision]  [Save Grade]                                                |
| After graded: [Feature to Public Portfolio]                                     |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Revision requires deadline + instruction.
- Feature button only visible after graded.
- Feature confirmation states: 'langsung public, tanpa approval santri'.

### U07 - USTADZ - Notifications & Preferences

**Route:** `/ustadz/notifications`

**Goal:** Inbox pekerjaan dan preference channel pribadi.

```text
+--------------------------------------------------------------------------------+
| Notifications                               [Inbox] [Settings]                   |
|--------------------------------------------------------------------------------|
| [Unread] Submission baru • Ahmad • Final Project                 10m [Open]      |
| [Info] Class reminder • Web 26-A                                   1h           |
|--------------------------------------------------------------------------------|
| Settings: Email [verified] • WhatsApp [link] • Telegram [linked]                 |
| Academic [on] Assignment [on] Digest [on]                                       |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Notification click deep-links langsung ke task terkait.
- Digest preference terpisah dari immediate critical alerts.
