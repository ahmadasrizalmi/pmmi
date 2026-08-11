# PMMI UX Wireframe - Santri: Home & Learning

### S01 - SANTRI - Hari Ini

**Route:** `/santri`

**Goal:** Mobile-first dashboard yang menjawab: apa yang harus dikerjakan sekarang?

```text
+--------------------------------------+
| PMMI                      [bell] [me] |
| Assalamu'alaikum, Ahmad               |
|--------------------------------------|
| NEXT                                  |
| Web Fundamental • 13:00              |
| [Lihat jadwal]                        |
|--------------------------------------|
| TODO                                 |
| Final Web Project • due 15 Aug       |
| [Lanjutkan submission]               |
|--------------------------------------|
| AI credits 84     Agent: Running     |
| [Buka AI]          [Buka Agent]       |
|--------------------------------------|
| Bottom nav: Home Tugas AI Agent More |
+--------------------------------------+
```

**Key behaviors**
- Priority stack: due soon, class next, feedback/revision.
- Metric hanya jika actionable.
- Bottom navigation mobile; desktop sidebar.

### S02 - SANTRI - Tugas

**Route:** `/santri/assignments`

**Goal:** Melihat semua tugas berdasarkan urgency dan status.

```text
+--------------------------------------------------------------------------------+
| Tugas                 [Semua] [Belum submit] [Revision] [Selesai]               |
|--------------------------------------------------------------------------------|
| [URGENT] Final Web Project     WEB101    due 15 Aug   REVISION REQUESTED [Open]  |
| Landing Page Challenge         WEB101    due 22 Aug   NOT SUBMITTED      [Open]  |
| Video Reflection               ...       graded       90                 [View]  |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Default sort due soon.
- Status copy manusiawi.
- Card jelas menampilkan next action.

### S03 - SANTRI - Assignment Detail & Submission

**Route:** `/santri/assignments/:id`

**Goal:** Mengumpulkan tugas dengan aman dan memahami feedback/revision.

```text
+--------------------------------------------------------------------------------+
| < Tugas   Final Web Project                              Due 15 Aug 23:59        |
|--------------------------------------------------------------------------------|
| Brief / criteria / files                                                        |
|--------------------------------------------------------------------------------|
| Submission                                                                     |
| Current status: REVISION REQUESTED                                              |
| Feedback Ustadz: 'Perbaiki responsive navbar...'                               |
| Revision deadline: 14 Aug 20:00                                                 |
|                                                                                |
| [Drop file / pilih file]  progress 100%                                         |
| Catatan [........................................]                              |
| [Submit Revision]                                                              |
|--------------------------------------------------------------------------------|
| Attempt history: #1 submitted -> graded -> revision; #2 current                 |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Upload progress dan failure retry.
- Presigned upload detail tidak terlihat user.
- Attempt history menjaga konteks revisi.
- Tidak bisa submit jika lifecycle bukan ACTIVE.

### S04 - SANTRI - Jadwal

**Route:** `/santri/schedule`

**Goal:** Menampilkan jadwal kelas sebagai timeline yang mudah dipahami.

```text
+--------------------------------------------------------------------------------+
| Jadwal                  [Hari ini] [Minggu ini]                                 |
|--------------------------------------------------------------------------------|
| Tue 11 Aug                                                                    |
| 13:00 - 15:00  Web Fundamental   Lab A / Online     Ust. Zaid                   |
|                                                                                |
| Wed 12 Aug                                                                    |
| 09:00 - 11:00  Mentoring         Studio            Ust. Fulan                  |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Timezone WIB explicit bila dibutuhkan.
- Session detail memuat lokasi/link/catatan.
- Calendar export optional later, bukan blocker.

### S05 - SANTRI - Nilai & Feedback

**Route:** `/santri/grades`

**Goal:** Melihat perkembangan akademik, feedback, dan revision requirement.

```text
+--------------------------------------------------------------------------------+
| Nilai & Feedback                 [Course v]                                      |
|--------------------------------------------------------------------------------|
| WEB101 Web Fundamental                                                          |
| Final Web Project       92/100    Graded   [View feedback]                       |
| Landing Page            Revision requested     [Open task]                       |
|--------------------------------------------------------------------------------|
| Trend / completion summary (simple, not gamified excessively)                   |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Feedback punya deep-link ke submission.
- Revision action tampil lebih dominan daripada angka nilai.

### S06 - SANTRI - Sertifikat & Achievement

**Route:** `/santri/achievements`

**Goal:** Mengarsipkan pencapaian formal dan reward.

```text
+--------------------------------------------------------------------------------+
| Pencapaian              [Certificates] [Achievements]                            |
|--------------------------------------------------------------------------------|
| Certificate: Programmer Bootcamp 2026       [View] [Copy verify link]           |
| Achievement: Grade Excellence +20 AI credits  Earned 10 Aug                     |
| Achievement: First Featured Project           Earned 11 Aug                     |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Certificate read-only.
- Reward effect transparan: credits/agent slots.
