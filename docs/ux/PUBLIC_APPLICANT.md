# PMMI UX Wireframe - Public & Applicant

### P01 - PUBLIC - Pendaftaran Santri

**Route:** `/daftar`

**Goal:** Membuat application baru dengan progress jelas dan menyimpan token akses applicant.

```text
+--------------------------------------------------------------------------------+
| pondokmultimedia.id   Program | Karya | Tentang | [Daftar]                      |
|--------------------------------------------------------------------------------|
| Pendaftaran Santri PMMI 2026                                                    |
| [1 Data diri]---[2 Program]---[3 Kontak]---[4 Review]                           |
|                                                                                |
| Data diri                               Ringkasan                               |
| Nama lengkap   [____________________]   Periode: PMMI 2026                      |
| Email          [____________________]   Status: Draft                           |
| WhatsApp       [____________________]   Dokumen diunggah setelah submit         |
| Kota           [____________________]                                           |
|                                                                                |
| [ Simpan draft ]                                  [ Lanjut ]                    |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Wizard 4 langkah, auto-save lokal, validasi per langkah.
- Setelah submit: tampilkan application number + recovery token sekali dan kirim channel tersedia.
- Tidak meminta dokumen berat sebelum application tercipta.
- CTA kembali ke website publik tetap tersedia.

**Important states:** Draft lokal, Submitted, Periode tutup, Capacity penuh

### P02 - APPLICANT - Portal Pendaftar

**Route:** `/daftar/:applicationId`

**Goal:** Applicant melihat status, melengkapi dokumen, jadwal interview, dan daftar ulang.

```text
+--------------------------------------------------------------------------------+
| PMMI Applicant Portal                              Application #PMMI-26-0042     |
|--------------------------------------------------------------------------------|
| STATUS: INTERVIEW SCHEDULED                                                  [i]|
| Timeline: Submitted > Verified > Screening > Interview > Decision > Registration|
|--------------------------------------------------------------------------------|
| Yang perlu kamu lakukan                                                       |
| [!] Interview 14 Aug 2026, 09:00 WIB   [Lihat detail]                          |
| [ ] Upload KTP/identitas                [Upload]                               |
| [ ] Upload portfolio awal               [Upload]                               |
|--------------------------------------------------------------------------------|
| Dokumen             Status       Updated             Action                    |
| Identitas           Missing      -                   [Upload]                   |
| Portfolio awal      Verified     10 Aug              [Preview]                  |
|--------------------------------------------------------------------------------|
| Setelah ACCEPTED: [Mulai Daftar Ulang]                                         |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Status timeline menjadi pusat halaman.
- Checklist hanya berisi action yang relevan terhadap state saat ini.
- Interview card menampilkan waktu, mode/lokasi, PIC, dan catatan.
- Daftar ulang meminta Program + Cohort setelah accepted.

**Important states:** Token invalid/expired, Waitlisted, Rejected dengan pesan aman, Accepted, Registration complete

### P03 - PUBLIC - Aktivasi Akun

**Route:** `/activate?token=...`

**Goal:** Mengubah activation token menjadi akun siap login.

```text
+--------------------------------------------------------------------------------+
| Aktivasi Akun PMMI                                                              |
|--------------------------------------------------------------------------------|
| Halo, Ahmad. Akun SANTRI kamu sudah disiapkan.                                  |
| Email: ahmad@...                                                                |
|                                                                                |
| Buat password                                                                   |
| [ **************************************** ]                                    |
| Ulangi password                                                                 |
| [ **************************************** ]                                    |
| [ Aktifkan akun ]                                                               |
|                                                                                |
| Setelah aktif kamu akan diarahkan ke Dashboard Santri.                          |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Token resolve dulu lalu tampilkan identity summary.
- Password strength sederhana, tidak berlebihan.
- Token sudah dipakai/expired memberi jalur hubungi admin.

### P04 - PUBLIC - Featured Portfolio

**Route:** `/portfolio`

**Goal:** Memamerkan karya terbaik santri yang sudah di-feature Ustadz/Admin.

```text
+--------------------------------------------------------------------------------+
| PORTFOLIO PMMI                                      [Filter Program] [Angkatan] |
|--------------------------------------------------------------------------------|
| Karya pilihan dari proses belajar di Pondok Multimedia.                         |
|                                                                                |
| [thumbnail] Project A           [thumbnail] Project B          [thumbnail] C     |
| Web App                         Short Film                     Branding         |
| Ahmad - Programmer              Fulan - Creator                Nisa - Creator   |
| Nilai 94 • Featured             Nilai 91 • Featured            Nilai 96         |
| [Lihat project]                 [Lihat project]                [Lihat project]  |
|                                                                                |
| [Load more]                                                                    |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Tidak tampilkan informasi sensitif.
- Filter berbasis program/cohort/category; bukan query teknis.
- Card fokus visual karya + identitas publik yang diizinkan.

### P05 - PUBLIC - Detail Portfolio

**Route:** `/portfolio/:slug`

**Goal:** Menceritakan project, hasil belajar, dan artefak publik.

```text
+--------------------------------------------------------------------------------+
| < Kembali ke Portfolio                                                         |
|--------------------------------------------------------------------------------|
| Project Title                                      Ahmad • Programmer • 2026    |
| [ HERO / cover asset -------------------------------------------------------- ] |
|                                                                                |
| Tentang project                 Hasil pembelajaran                              |
| Ringkasan, challenge, solusi    Course / assignment context                     |
|                                                                                |
| Gallery / assets                                                               |
| [asset] [asset] [asset]                                                        |
|                                                                                |
| Feedback pilihan Ustadz (public-safe)                                           |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Portfolio merupakan snapshot publik; bukan direct browser ke MinIO private.
- Jika admin unpublish, route menjadi 404/public unavailable.
