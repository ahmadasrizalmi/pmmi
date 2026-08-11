# v1.4 - Santri

## Panel map

`Hari Ini | Belajar | Karya & Hasil | Agen AI | Akun`

Five workspaces. There is no core AI Chat page.

## S01 - Hari Ini `/santri`

```text
+------------------------------------------+
| PMMI • Ahmad                             |
|------------------------------------------|
| Berikutnya: Fotografi 13:00              |
| [Buka Belajar]                           |
|------------------------------------------|
| Tugas: Photo Story • due 15 Aug          |
| [Lanjutkan]                              |
|------------------------------------------|
| Agen: Coding Mentor • Berjalan           |
| Home | Belajar | Hasil | Agen | Akun     |
+------------------------------------------+
```

Purpose: surface the next useful action, not metrics.

## S02 - Belajar `/santri/belajar`

Schedule, assignments, selected assignment detail and curriculum are tabs in one workspace.

```text
+--------------------------------------------------------------+
| BELAJAR                                                      |
| [Hari Ini/Jadwal] [Tugas] [Kurikulum]                       |
|--------------------------------------------------------------|
| TUGAS                                                        |
| Photo Story • Fotografi • REVISI • due 15 Aug        [>]    |
|--------------------------------------------------------------|
| PANEL TUGAS                                                  |
| Brief • feedback • attempt history                           |
| [Pilih File] Catatan [...]                                   |
| [Kirim Revisi]                                               |
+--------------------------------------------------------------+
```

Actions: read schedule/materials, create/resubmit submission, replace files before submission according to policy.

## S03 - Karya & Hasil `/santri/hasil`

Grades, certificates/achievements and portfolio are tabs.

```text
+--------------------------------------------------------------+
| KARYA & HASIL                                                |
| [Nilai] [Sertifikat] [Karya]                                |
|--------------------------------------------------------------|
| Fotografi • Photo Story • 92                 [Feedback]      |
| Sertifikat Konten Kreator 2026               [Lihat]         |
| Photo Story • Portfolio Publik               [Lihat]         |
+--------------------------------------------------------------+
```

## S04 - Agen AI `/santri/agen`

Hermes Agent is the primary AI experience. There is no Chat AI dashboard.

```text
+--------------------------------------------------------------+
| AGEN AI                                   [+ Buat Agen]      |
| Coding Mentor • Telegram • Berjalan                [>]      |
| Research Helper • WhatsApp • Berhenti              [>]      |
|--------------------------------------------------------------|
| SETUP                                                        |
| Nama -> Kepribadian -> Chat -> Pilih AI -> Tempat Kerja ->  |
| Cek & Aktifkan                                               |
| Agent Key dibuat & dipasang otomatis oleh PMMI.              |
+--------------------------------------------------------------+
```

Actions: create/edit agent, start/stop/restart, archive. Agent Key is dedicated to one agent and is never manually copied into Hermes by the Santri.

## S05 - Akun & API untuk Proyek `/santri/akun`

Profile, security, notifications and optional Developer API access are tabs in one page.

```text
+--------------------------------------------------------------+
| AKUN                                                         |
| [Profil] [Keamanan] [Notifikasi] [API untuk Proyek*]        |
|--------------------------------------------------------------|
| API UNTUK PROYEK                                             |
| Base URL: https://ai.pondokmultimedia.id/v1        [Salin]  |
| Developer Key: project-web • ab12... • Aktif       [Kelola] |
| [+ Buat Developer Key]                                      |
| Cara pakai: [Python] [JavaScript] [cURL]                    |
+--------------------------------------------------------------+
```

The API tab is shown only to eligible users. Developer Key is for coding/project use and is **not** reused by Hermes Agents. Actions: create/rotate/revoke Developer Key, change own safe profile/security/notification preferences.