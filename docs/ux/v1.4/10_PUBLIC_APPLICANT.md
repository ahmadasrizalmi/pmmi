# v1.4 - Public / Pendaftar

## Panel map

`Program | Pendaftaran | Portal Pendaftar | Portfolio`

Six workspace/page groups:

1. P01 Program PMMI - `/program`
2. P02 Form Pendaftaran - `/daftar`
3. P03 Portal Pendaftar - `/daftar/:id`
4. P04 Aktivasi Akun - `/activate`
5. P05 Portfolio (list + detail) - `/portfolio`
6. P06 Verifikasi Sertifikat - `/sertifikat/:nomor`

## P01 - Program PMMI

```text
+--------------------------------------------------------------+
| PROGRAM PMMI                                                 |
|--------------------------------------------------------------|
| KONTEN KREATOR              PROGRAMMER                       |
| Foto • Video • Desain       Web/App • UI/UX                  |
| Copywriting • Branding      Front/Back • Automation • AI     |
|--------------------------------------------------------------|
| Materi bersama: Tahsin • Fiqih/Hadist • Adab • Public       |
| Speaking • Digital Marketing                     [Daftar]     |
+--------------------------------------------------------------+
```

Actions: read program, start registration.

## P02 - Form Pendaftaran

The actual PMMI biodata is presented as one save/resume wizard, not many routes:

`Identitas -> Keluarga -> Wali -> Kesehatan -> Latar Rumah -> Kecakapan -> Motivasi -> Dokumen`

```text
+--------------------------------------------------------------+
| PENDAFTARAN SANTRI                     Langkah 4 dari 8       |
|--------------------------------------------------------------|
| Identitas ✓ • Keluarga ✓ • Wali ✓ • Kesehatan               |
| Rumah • Kecakapan • Motivasi • Dokumen                       |
|--------------------------------------------------------------|
| [field sesuai bagian aktif...]                               |
| [Simpan & Keluar]                         [Lanjut]            |
+--------------------------------------------------------------+
```

Actions: create draft, save/resume, submit, cancel draft. Submitted admission history is not silently hard-deleted.

## P03 - Portal Pendaftar

Status, biodata corrections, documents, interview and registration live in one page with tabs.

```text
+--------------------------------------------------------------+
| PORTAL PENDAFTAR                       Status: SCREENING      |
|--------------------------------------------------------------|
| [Status] [Biodata] [Dokumen] [Wawancara] [Daftar Ulang*]    |
|--------------------------------------------------------------|
| Dikirim > Verifikasi > Seleksi > Wawancara > Hasil          |
| Yang perlu dilakukan                                        |
| • Lengkapi Ijazah                         [Lengkapi]         |
| • Wawancara 14 Aug 09:00                  [Lihat]            |
+--------------------------------------------------------------+
```

Daftar Ulang is visible only after acceptance.

## P04 - Aktivasi Akun

```text
+--------------------------------------------------------------+
| AKTIVASI AKUN PMMI                                           |
| Ahmad Rizal • Santri                                         |
| Password baru   [**********************]                     |
| Ulangi          [**********************]                     |
| [Aktifkan dan Masuk]                                         |
+--------------------------------------------------------------+
```

## P05 - Portfolio

List and selected project detail stay in one experience; a selected item can use a detail state/drawer while retaining a public slug URL.

```text
+--------------------------------------------------------------+
| PORTFOLIO PMMI                 [Jalur v] [Angkatan v]         |
|--------------------------------------------------------------|
| [Photo Story] [Short Film] [Student App]                     |
|--------------------------------------------------------------|
| Selected project: cover • story • learning result • gallery  |
+--------------------------------------------------------------+
```

## P06 - Verifikasi Sertifikat

Read-only public verification of approved public metadata.

```text
+--------------------------------------------------------------+
| VERIFIKASI SERTIFIKAT                                        |
| PMMI-2026-001 • VALID ✓                                      |
| Ahmad Rizal • Jalur Konten Kreator • 2026                   |
+--------------------------------------------------------------+
```