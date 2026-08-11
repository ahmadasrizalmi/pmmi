# PMMI UX v1.3 - SANTRI

> Simplified, task-first wireframes. Halaman detail tidak memenuhi sidebar.

## Panel utuh

```text
+--------------------------------------------------------------+
| SANTRI                                                      |
+--------------------------------------------------------------+
| MENU UTAMA                                                   |
|  - Hari Ini                                        |
|  - Belajar                                         |
|  - Karya                                           |
|  - Agen AI                                         |
|  - Akun                                            |
+--------------------------------------------------------------+
| HALAMAN (10)                                                |
| S01  Hari Ini                               /santri                 |
| S02  Kurikulum & Jadwal                     /santri/belajar         |
| S03  Tugas                                  /santri/tugas           |
| S04  Detail Tugas & Kirim                   /santri/tugas/:id       |
| S05  Nilai & Sertifikat                     /santri/nilai           |
| S06  Karya Saya                             /santri/karya           |
| S07  Agen AI                                /santri/agen            |
| S08  Buat / Edit Agen                       /santri/agen/:id/setup  |
| S09  API untuk Proyek                       /santri/api             |
| S10  Akun & Notifikasi                      /santri/akun            |
+--------------------------------------------------------------+
| 5 menu, 10 halaman. Tidak ada tombol chat AI.               |
+--------------------------------------------------------------+
```

## Wireframe per page

### S01 - Hari Ini

**Route:** `/santri`  
**Tujuan:** Menjawab apa yang harus dikerjakan sekarang.

```text
+--------------------------------------+
| PMMI • Ahmad                         |
|--------------------------------------|
| Berikutnya                           |
| Fotografi • 13:00                    |
| [Lihat Jadwal]                       |
|--------------------------------------|
| Tugas                                |
| Photo Story • due 15 Aug             |
| [Lanjutkan]                          |
|--------------------------------------|
| Agen: Coding Mentor • Berjalan       |
| Home | Belajar | Karya | Agen | Akun |
+--------------------------------------+
```

**Yang bisa dilakukan:** Buka tugas/jadwal/agen.

### S02 - Kurikulum & Jadwal

**Route:** `/santri/belajar`  
**Tujuan:** Melihat progress belajar dan jadwal.

```text
+--------------------------------------------------------------+
| BELAJAR • JALUR KONTEN KREATOR                              |
|--------------------------------------------------------------|
| Fotografi 62% • Videografi 40% • Desain 75%                 |
| Tahsin • Fiqih & Hadist • Adab ...                          |
|--------------------------------------------------------------|
| Hari ini 13:00 Fotografi • Studio                           |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat kurikulum; Lihat jadwal/material published.

### S03 - Tugas

**Route:** `/santri/tugas`  
**Tujuan:** Melihat tugas berdasarkan status.

```text
+--------------------------------------------------------------+
| TUGAS        [Belum] [Revisi] [Selesai]                     |
| Photo Story • Fotografi • REVISI • due 15 Aug        [>]   |
| Poster • Desain • Belum dikirim                       [>]   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat/filter tugas.

### S04 - Detail Tugas & Kirim

**Route:** `/santri/tugas/:id`  
**Tujuan:** Upload dan kirim tugas/revisi.

```text
+--------------------------------------------------------------+
| PHOTO STORY • FOTOGRAFI                                     |
| Brief / kriteria                                             |
|--------------------------------------------------------------|
| Feedback Ustadz: perbaiki framing...                         |
| [Pilih File]  upload 100%                                   |
| Catatan [...............................................]    |
| [Kirim Revisi]                                              |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat submission; Update/resubmit sesuai state; Ganti/hapus file sebelum submit.

### S05 - Nilai & Sertifikat

**Route:** `/santri/nilai`  
**Tujuan:** Melihat hasil belajar dan pencapaian.

```text
+--------------------------------------------------------------+
| NILAI & SERTIFIKAT                                          |
| Fotografi • Photo Story • 92                [Lihat Feedback]|
| Desain • Poster • Revisi                     [Buka Tugas]   |
|--------------------------------------------------------------|
| Sertifikat Jalur Konten Kreator 2026          [Lihat]       |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat nilai/feedback/sertifikat.

### S06 - Karya Saya

**Route:** `/santri/karya`  
**Tujuan:** Melihat karya yang sudah featured.

```text
+--------------------------------------------------------------+
| KARYA SAYA                                                   |
| [cover] Photo Story • PUBLIK                           [>]  |
| [cover] Poster Dakwah • belum featured                  [>]  |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat karya dan status publik.

### S07 - Agen AI

**Route:** `/santri/agen`  
**Tujuan:** Mengelola agen tanpa melihat detail teknis.

```text
+--------------------------------------------------------------+
| AGEN AI                                      [+ Buat Agen]   |
| Coding Mentor                                             |
| Telegram • Berjalan • terakhir aktif 5 menit lalu        [>]|
|--------------------------------------------------------------|
| Research Helper                                          |
| WhatsApp • Berhenti                                     [>]|
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat agen; Lihat agen; Start/stop/restart; Arsip.

### S08 - Buat / Edit Agen

**Route:** `/santri/agen/:id/setup`  
**Tujuan:** Wizard 6 langkah dengan Agent Key otomatis.

```text
+--------------------------------------------------------------+
| BUAT AGEN • Langkah 4 dari 6                                |
|--------------------------------------------------------------|
| 1 Nama ✓  2 Kepribadian ✓  3 Hubungkan Chat ✓              |
| 4 Pilih AI  5 Tempat Kerja  6 Cek & Aktifkan               |
|--------------------------------------------------------------|
| PILIH AI                                                     |
| ( ) Hemat & cepat                                            |
| (●) Coding                                                   |
| ( ) Serbaguna                                                |
|                                                              |
| Kredit diambil dari akun Ahmad                               |
| Agent Key dibuat & dipasang otomatis oleh PMMI               |
| [Tes] ✓ Siap                                                 |
|                                       [Lanjut]                |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat/update nama & tujuan; Edit SOUL/kepribadian; Hubungkan/unlink Telegram/WA; Pilih model; Atur workspace/home; Aktifkan.

**Catatan:** Agent Key tidak perlu disalin atau ditampilkan.

### S09 - API untuk Proyek

**Route:** `/santri/api`  
**Tujuan:** Developer Key untuk aplikasi/coding, bukan untuk Hermes Agent.

```text
+--------------------------------------------------------------+
| API UNTUK PROYEK                                             |
|--------------------------------------------------------------|
| Alamat API                                                   |
| https://ai.pondokmultimedia.id/v1              [Salin]      |
|--------------------------------------------------------------|
| Developer Key                                                |
| project-web • ab12... • Aktif                  [Rotate]      |
| [+ Buat Developer Key]                                      |
|--------------------------------------------------------------|
| Cara pakai: [Python] [JavaScript] [cURL]                    |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat Developer Key; Rotate; Cabut; Salin secret saat pertama dibuat.

**Catatan:** Halaman bisa hanya muncul untuk santri yang berhak/membutuhkan API.

### S10 - Akun & Notifikasi

**Route:** `/santri/akun`  
**Tujuan:** Profil, keamanan, dan preferensi notifikasi.

```text
+--------------------------------------------------------------+
| AKUN                                                         |
| Ahmad Rizal • Konten Kreator                                |
| [Profil] [Keamanan] [Notifikasi]                            |
| Email ✓   Telegram ✓   WhatsApp belum terhubung             |
| [Ganti Password] [Kelola Notifikasi]                        |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Ubah safe profile; Ganti password; Hubungkan channel; Ubah preference.
