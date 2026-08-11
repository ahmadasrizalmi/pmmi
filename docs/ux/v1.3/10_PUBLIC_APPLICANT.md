# PMMI UX v1.3 - PUBLIC / APPLICANT

> Simplified, task-first wireframes. Halaman detail tidak memenuhi sidebar.

## Panel utuh

```text
+--------------------------------------------------------------+
| PUBLIC / APPLICANT                                          |
+--------------------------------------------------------------+
| MENU UTAMA                                                   |
|  - Website                                         |
|  - Pendaftaran                                     |
|  - Portal Pendaftar                                |
|  - Portfolio                                       |
+--------------------------------------------------------------+
| HALAMAN (7)                                                 |
| P01  Program PMMI                           /program                |
| P02  Form Pendaftaran                       /daftar                 |
| P03  Portal Pendaftar                       /daftar/:id             |
| P04  Aktivasi Akun                          /activate               |
| P05  Portfolio                              /portfolio              |
| P06  Detail Portfolio                       /portfolio/:slug        |
| P07  Verifikasi Sertifikat                  /sertifikat/:nomor      |
+--------------------------------------------------------------+
| 7 halaman publik/applicant.                                 |
+--------------------------------------------------------------+
```

## Wireframe per page

### P01 - Program PMMI

**Route:** `/program`  
**Tujuan:** Menjelaskan Jalur Konten Kreator, Jalur Programmer dan materi bersama.

```text
+--------------------------------------------------------------+
| PROGRAM PMMI                                                 |
|--------------------------------------------------------------|
| KONTEN KREATOR              PROGRAMMER                       |
| Foto • Video • Desain       Web/App • UI/UX • Front/Back    |
| Copywriting • Branding      Automation • AI Tools           |
|--------------------------------------------------------------|
| Materi bersama: Tahsin, Fiqih & Hadist, Adab, Public         |
| Speaking, Digital Marketing                                  |
|                                      [Daftar]                 |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat program; Mulai pendaftaran.

### P02 - Form Pendaftaran

**Route:** `/daftar`  
**Tujuan:** Mengisi form biodata panjang dalam langkah sederhana dan bisa dilanjutkan nanti.

```text
+--------------------------------------------------------------+
| PENDAFTARAN SANTRI                         Langkah 4 dari 8    |
|--------------------------------------------------------------|
| Identitas ✓  Keluarga ✓  Wali ✓  Kesehatan                  |
| Rumah  Kecakapan  Motivasi  Dokumen                          |
|--------------------------------------------------------------|
| Golongan darah [A v]     Tinggi [___]   Berat [___]         |
| Penglihatan [Baik v]     Kacamata [Tidak v]                 |
| Alergi [.................................................]   |
| Riwayat penyakit [......................................]   |
|                                                              |
| [Simpan & Keluar]                         [Lanjut]            |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat pendaftaran; Simpan perubahan; Batalkan draft sebelum submit.

### P03 - Portal Pendaftar

**Route:** `/daftar/:id`  
**Tujuan:** Melihat kelengkapan dan langkah berikutnya.

```text
+--------------------------------------------------------------+
| PORTAL PENDAFTAR                     Status: SCREENING        |
|--------------------------------------------------------------|
| Biodata 87%          Dokumen 4/6                              |
| [Lanjutkan Biodata]  [Lengkapi Dokumen]                      |
|--------------------------------------------------------------|
| Alur: Dikirim > Diverifikasi > Seleksi > Wawancara > Hasil  |
|--------------------------------------------------------------|
| Yang perlu dilakukan                                         |
| • Lengkapi riwayat penyakit                                  |
| • Upload ijazah terakhir                                     |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat status; Lengkapi data yang dibuka; Upload/replace dokumen; Daftar ulang jika diterima.

### P04 - Aktivasi Akun

**Route:** `/activate`  
**Tujuan:** Membuat password setelah akun santri/staff sudah diprovision.

```text
+--------------------------------------------------------------+
| AKTIVASI AKUN PMMI                                           |
| Ahmad Rizal • Santri                                         |
|--------------------------------------------------------------|
| Password baru   [************************]                    |
| Ulangi password [************************]                    |
|                                                              |
| [Aktifkan dan Masuk]                                         |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Aktifkan akun.

### P05 - Portfolio

**Route:** `/portfolio`  
**Tujuan:** Menampilkan karya featured.

```text
+--------------------------------------------------------------+
| PORTFOLIO PMMI                     [Jalur v] [Angkatan v]     |
|--------------------------------------------------------------|
| [foto] Portrait Series       [video] Short Documentary       |
| Ahmad • Fotografi            Fulan • Videografi              |
| [Lihat]                      [Lihat]                          |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat karya.

### P06 - Detail Portfolio

**Route:** `/portfolio/:slug`  
**Tujuan:** Menampilkan project yang sudah dipublikasi.

```text
+--------------------------------------------------------------+
| < Portfolio                                                   |
| PHOTO STORY - AHMAD                                          |
| [cover / asset publik]                                       |
|--------------------------------------------------------------|
| Cerita Project                Hasil Belajar                   |
| ...                          Fotografi / Assignment           |
| Gallery [asset] [asset] [asset]                              |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat karya/asset publik.

### P07 - Verifikasi Sertifikat

**Route:** `/sertifikat/:nomor`  
**Tujuan:** Memastikan sertifikat PMMI valid.

```text
+--------------------------------------------------------------+
| VERIFIKASI SERTIFIKAT                                        |
|--------------------------------------------------------------|
| PMMI-2026-001                                                |
| VALID ✓                                                      |
| Ahmad Rizal • Jalur Konten Kreator • 2026                   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Cek sertifikat.
