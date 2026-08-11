# v1.4 - Ustadz

## Panel map

`Beranda | Kelas Saya | Penilaian | Agen AI`

Only four workspaces. Ustadz sees only assigned subjects/classes.

## T01 - Beranda Ustadz `/ustadz`

```text
+--------------------------------------------------------------+
| ASSALAMU'ALAIKUM UST. ZAID                                  |
| Pengampu: Fotografi • Videografi                             |
|--------------------------------------------------------------|
| 09:00 Fotografi 26-A                         [Buka Kelas]    |
| 7 submission belum dinilai                  [Periksa]       |
+--------------------------------------------------------------+
```

## T02 - Kelas Saya `/ustadz/kelas`

This replaces separate class list, class detail, attendance, material and assignment pages.

```text
+--------------------------------------------------------------+
| KELAS SAYA                                                   |
|--------------------------------------------------------------|
| Fotografi 26-A [aktif]  Videografi 26-A  Tahsin 26-A*       |
|--------------------------------------------------------------|
| FOTOGRAFI 26-A                                               |
| [Ringkasan] [Absensi] [Materi] [Tugas]                      |
|--------------------------------------------------------------|
| Ringkasan: 24 santri • sesi Rabu 09:00                       |
| Absensi hari ini                      [Isi / Edit]           |
| Materi 12                             [+ Materi]             |
| Tugas aktif 3                         [+ Tugas]              |
+--------------------------------------------------------------+
```

Actions within assigned classes: create/edit/cancel sessions, fill/correct attendance, CRUD learning materials, CRUD assignments. The selected class changes without leaving the workspace.

## T03 - Penilaian `/ustadz/penilaian`

Cross-class grading queue + selected submission detail are one page.

```text
+--------------------------------------------------------------+
| PENILAIAN                               [Kelas v] [Status v] |
|--------------------------------------------------------------|
| Ahmad • Photo Story • Fotografi • 2 jam lalu        [>]     |
|--------------------------------------------------------------|
| PANEL PENILAIAN                                              |
| [Preview karya]                                              |
| Nilai [92/100]                                               |
| Feedback [..............................................]    |
| [Minta Revisi] [Simpan Nilai]                               |
| Setelah dinilai: [Jadikan Portfolio Publik]                  |
+--------------------------------------------------------------+
```

Actions: read submission, create/update grade, request/cancel revision, feature project to public portfolio under the locked PMMI rule.

## T04 - Agen AI `/ustadz/agen`

Agent list, setup and runtime controls stay in one workspace.

```text
+--------------------------------------------------------------+
| AGEN AI                                   [+ Buat Agen]      |
| Teaching Assistant • Telegram • Berjalan             [>]    |
|--------------------------------------------------------------|
| Setup/edit                                                   |
| 1 Nama & Tujuan > 2 Kepribadian > 3 Hubungkan Chat         |
| 4 Pilih AI > 5 Tempat Kerja > 6 Cek & Aktifkan             |
|--------------------------------------------------------------|
| Agent Key dibuat otomatis PMMI; Ustadz tidak copy key agent.|
+--------------------------------------------------------------+
```

Actions: create/edit own agent, start/stop/restart, archive. Backend still persists SOUL.md, channel connection, PMMI LLM config, workspace/home and safety checks.