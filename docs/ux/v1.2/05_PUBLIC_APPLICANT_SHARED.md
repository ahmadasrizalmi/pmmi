# PMMI UX v1.2 - Public, Applicant & Shared

This file preserves the public/shared surfaces while correcting the admission flow against the actual PMMI biodata form.

## Page registry + CRUD

| Page | Route | Entity | CRUD / action |
|---|---|---|---|
| G01 Login | `/login` | session | Create session/login, read current identity, delete session/logout |
| G02 Profile & Security | `/account` | own profile/security/channels | R/U own safe profile fields/password; link/unlink own channels; no privilege change |
| P01 Biodata Calon Santri | `/daftar` | application draft + sections | C/R/U draft; withdraw/cancel by policy; save/resume |
| P02 Applicant Portal | `/daftar/:applicationId` | application/documents/registration | R own state; U open sections; C/R/U/replace documents; C/U registration after accepted |
| P03 Program / Jalur | `/program` | public program catalog | R only |
| P04 Account Activation | `/activate?token=...` | activation token/account | consume token + create password; no role choice |
| P05 Featured Portfolio | `/portfolio` | public featured project | R only |
| P06 Portfolio Detail | `/portfolio/:slug` | public project/assets | R only; 404 when unpublished |
| P07 Certificate Verification | `/certificates/verify/:certificateNo` | public certificate verification | R verification-safe fields only |

## G02 - Profile & Security

```text
+--------------------------------------------------------------------------------+
| PROFIL & KEAMANAN                                                               |
| [Profile] [Security] [Connected Channels]                                       |
|--------------------------------------------------------------------------------|
| Nama / email sesuai policy                                                      |
| Change password [Current] [New] [Confirm]                                       |
| Email verified • Telegram linked • WhatsApp pending                             |
| [Logout this device]                                                            |
+--------------------------------------------------------------------------------+
```

Role/capability/lifecycle are read-only here. Users cannot self-escalate privileges.

## P01 - Form Biodata Calon Santri

The current PMMI source form is represented as an **8-step save/resume wizard**, not a four-field lead form.

1. Identitas Calon Santri
2. Keluarga
3. Wali (optional)
4. Fisik & Kesehatan
5. Latar Rumah
6. Kecakapan & Prestasi
7. Motivasi
8. Dokumen

```text
+--------------------------------------------------------------------------------+
| FORM BIODATA CALON SANTRI                               Step 4 / 8              |
|--------------------------------------------------------------------------------|
| 1 Identitas ✓  2 Keluarga ✓  3 Wali ✓  4 Fisik/Kesehatan                      |
| 5 Latar Rumah   6 Kecakapan   7 Motivasi   8 Dokumen                           |
|--------------------------------------------------------------------------------|
| FISIK & KESEHATAN                                                              |
| Golongan darah [A v]    Tinggi [___] cm     Berat [___] kg                     |
| Sudah khitan? [Sudah v]                                                        |
| Penglihatan [Baik v]    Kacamata? [Tidak v]   Pendengaran [Baik v]            |
| Alergi [.................................................................]      |
| Riwayat penyakit + tahun [...............................................]      |
|                                                                                |
| [Simpan & Keluar]                                          [Lanjut]             |
+--------------------------------------------------------------------------------+
```

**Privacy boundary**
- NIK, KK, scans, health, religion/ethnicity, household economy/background are restricted admission data.
- They are not general Ustadz/Santri profile fields.
- Document previews use private/signed access, never public object URLs.
- The initial form does **not** force Jalur selection because the supplied form does not contain that question.

## P02 - Applicant Portal

```text
+--------------------------------------------------------------------------------+
| PMMI Applicant Portal                                      #PMMI-26-0042        |
| STATUS: SCREENING                                                              |
|--------------------------------------------------------------------------------|
| Biodata 87% [Lanjutkan]       Dokumen 4/6 [Lengkapi]                           |
| Timeline: Submitted > Verified > Screening > Interview > Decision > Registration|
|--------------------------------------------------------------------------------|
| ACTION REQUIRED                                                                |
| [!] Lengkapi riwayat penyakit                                                  |
| [!] Upload Ijazah Terakhir                                                     |
| Interview: 14 Aug 09:00 WIB [Detail]                                           |
| Daftar Ulang hanya muncul setelah ACCEPTED.                                    |
+--------------------------------------------------------------------------------+
```

Internal scores/reviewer notes are not exposed to applicant.

## P03 - Program / Jalur

```text
+--------------------------------------------------------------------------------+
| PROGRAM PMMI                                                                   |
|--------------------------------------------------------------------------------|
| JALUR KONTEN KREATOR                      JALUR PROGRAMMER                      |
| Fotografi                                  Web & App Development                |
| Videografi                                 UI/UX                                |
| Desain Grafis                              Front-end                            |
| Copywriting                                Back-end                             |
| Branding                                   Automation + AI Tools                |
|--------------------------------------------------------------------------------|
| Materi bersama: Tahsin & Tahfidz • Fiqih & Hadist • Adab Kehidupan            |
| Public Speaking • Digital Marketing                                             |
+--------------------------------------------------------------------------------+
```

## P04 - Account Activation

```text
+--------------------------------------------------------------------------------+
| AKTIVASI AKUN PMMI                                                             |
| Halo, Ahmad Rizal • SANTRI                                                     |
| Email: ahmad@...                                                               |
|--------------------------------------------------------------------------------|
| Password baru   [************************]                                      |
| Ulangi          [************************]                                      |
| [Aktifkan dan Masuk]                                                           |
+--------------------------------------------------------------------------------+
```

Activation is after provisioning/enrollment; it does not ask the user to choose their own role.

## P05 - Featured Portfolio

```text
+--------------------------------------------------------------------------------+
| FEATURED PORTFOLIO                     [Jalur v] [Course v] [Angkatan v]         |
|--------------------------------------------------------------------------------|
| [photo] Portrait Series               [video] Short Documentary                 |
| Ahmad • Konten Kreator • Fotografi    Fulan • Konten Kreator • Videografi      |
|--------------------------------------------------------------------------------|
| [app] Student Portal                  [web] Landing Page                        |
| Zaid • Programmer • Vibe Coding       Nisa • Programmer • Front-end            |
+--------------------------------------------------------------------------------+
```

Only explicitly featured/public-safe content is shown.

## P06 - Portfolio Detail

```text
+--------------------------------------------------------------------------------+
| < Portfolio                                                                     |
| PROJECT TITLE                          Ahmad • Konten Kreator • 2026             |
| [cover / public asset]                                                         |
|--------------------------------------------------------------------------------|
| Tentang project                       Hasil pembelajaran                         |
| Challenge / process / outcome         Course / assignment context               |
|--------------------------------------------------------------------------------|
| Gallery [asset] [asset] [asset]                                             |
| Public-safe selected Ustadz feedback                                           |
+--------------------------------------------------------------------------------+
```

Admin unpublish makes the route unavailable publicly; private MinIO source is never directly browsable.

## P07 - Certificate Verification

```text
+--------------------------------------------------------------------------------+
| VERIFY PMMI CERTIFICATE                                                        |
| Certificate No: PMMI-2026-001                                                  |
| Status: VALID ✓                                                                 |
| Ahmad Rizal • Jalur Konten Kreator • Issued 11 Aug 2026                        |
| [Public verification metadata only]                                             |
+--------------------------------------------------------------------------------+
```

Verification must expose only fields intentionally approved for public verification, not student private profile data.
