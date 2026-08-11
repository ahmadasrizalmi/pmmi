# v1.4 - System Admin

## Panel map

`Beranda | Pengguna | AI & API | Agen & Koneksi | Keamanan & Cadangan`

Five menu items = five workspaces.

## W01 - Beranda Sistem `/system`

Purpose: answer whether the platform is healthy and what needs attention.

```text
+-------------------+------------------------------------------+
| SYSTEM ADMIN      | Kondisi Sistem                           |
| Beranda           | Website ✓ Database ✓ File ✓ AI ✓ Agen ✓ |
| Pengguna          |------------------------------------------|
| AI & API          | Perlu perhatian                          |
| Agen & Koneksi    | • 1 agen gagal tersambung                |
| Keamanan/Cadangan | • Backup terakhir 02:00 ✓                |
+-------------------+------------------------------------------+
```

No raw logs on the home page. Problems open contextual details.

## W02 - Pengguna & Akses `/system/pengguna`

List + selected-account detail are one workspace.

```text
+--------------------------------------------------------------+
| PENGGUNA                                     [+ Tambah Akun] |
|--------------------------------------------------------------|
| [Cari] [Jenis v] [Status v]      | PILIHAN: Nisa Rahma       |
| Nisa • Staff • Aktif       [>]    | Jenis: Staff Admin       |
| Zaid • Ustadz • Aktif      [>]    | Tugas/Hak                |
| Ahmad • Santri • Aktif     [>]    | [✓] Keuangan [✓] Alat    |
|                                   | [ ] Pendaftaran           |
|                                   | [Simpan] [Nonaktifkan]    |
+--------------------------------------------------------------+
```

Actions: create account, change role/task assignment, activate/deactivate, regenerate activation access where allowed.

## W03 - AI & API `/system/ai`

Models, API keys and usage are tabs in one page.

```text
+--------------------------------------------------------------+
| AI & API                                                     |
| [Model AI] [API Key] [Pemakaian]                            |
|--------------------------------------------------------------|
| Developer • Ahmad • ab12... • Aktif            [Kelola]     |
| Agent • Coding Mentor • cd34... • Aktif         [Kelola]     |
| [+ Buat Key] Jenis [Developer/Agent/Service]                 |
+--------------------------------------------------------------+
```

Actions: manage model aliases/policies, create/rotate/revoke keys, inspect usage. Agent Key is still normally created automatically by the agent wizard; this page is an admin support/control surface.

## W04 - Agen & Koneksi `/system/agen`

Agent fleet and external connections are one workspace.

```text
+--------------------------------------------------------------+
| AGEN & KONEKSI                                               |
| [Agen] [Koneksi Sistem]                                     |
|--------------------------------------------------------------|
| Coding Mentor • Ahmad • Berjalan • Telegram ✓        [>]    |
| Asisten Foto • Fulan • Bermasalah • WhatsApp !       [>]    |
|--------------------------------------------------------------|
| Email ✓ Telegram ✓ WhatsApp ✓ Router AI ✓ File ✓            |
+--------------------------------------------------------------+
```

Actions: inspect/restart/stop/archive agent according to policy, retry failed setup jobs, test/change service connections.

## W05 - Keamanan & Cadangan `/system/keamanan`

Audit, backup and health are tabs rather than separate pages.

```text
+--------------------------------------------------------------+
| KEAMANAN & CADANGAN                                          |
| [Aktivitas] [Cadangan] [Kesehatan Sistem]                   |
|--------------------------------------------------------------|
| 18:02 Hak akses Nisa diubah                                  |
| 17:41 Developer Key Ahmad di-rotate                          |
|--------------------------------------------------------------|
| Backup terakhir: hari ini 02:00 ✓                            |
| Storage: 62% • Restore drill: belum                          |
| [Jalankan Backup]                                            |
+--------------------------------------------------------------+
```

Technical details such as internal job payloads, hashes and server paths belong in secondary technical disclosure only.