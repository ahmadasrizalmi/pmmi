# PMMI UX v1.3 - USTADZ

> Simplified, task-first wireframes. Halaman detail tidak memenuhi sidebar.

## Panel utuh

```text
+--------------------------------------------------------------+
| USTADZ                                                      |
+--------------------------------------------------------------+
| MENU UTAMA                                                   |
|  - Beranda                                         |
|  - Kelas Saya                                      |
|  - Tugas & Nilai                                   |
|  - Materi                                          |
|  - Agen AI                                         |
+--------------------------------------------------------------+
| HALAMAN (8)                                                 |
| T01  Beranda Ustadz                         /ustadz                 |
| T02  Kelas Saya                             /ustadz/kelas           |
| T03  Detail Kelas                           /ustadz/kelas/:id       |
| T04  Absensi                                /ustadz/kelas/:id/absensi/:sesi|
| T05  Tugas & Nilai                          /ustadz/tugas           |
| T06  Periksa Tugas Santri                   /ustadz/tugas/:submissionId|
| T07  Materi                                 /ustadz/materi          |
| T08  Agen AI                                /ustadz/agen            |
+--------------------------------------------------------------+
| 5 menu, 8 halaman. Hanya mapel/kelas yang diampu.           |
+--------------------------------------------------------------+
```

## Wireframe per page

### T01 - Beranda Ustadz

**Route:** `/ustadz`  
**Tujuan:** Agenda mengajar dan tugas yang harus dinilai.

```text
+--------------------------------------------------------------+
| ASSALAMU'ALAIKUM UST. ZAID                                  |
| Pengampu: Fotografi • Videografi                             |
|--------------------------------------------------------------|
| 09:00 Fotografi 26-A                         [Buka Kelas]    |
| 7 tugas belum dinilai                         [Periksa]       |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buka kelas/tugas yang diampu.

### T02 - Kelas Saya

**Route:** `/ustadz/kelas`  
**Tujuan:** Melihat kelas yang diampu.

```text
+--------------------------------------------------------------+
| KELAS SAYA                                                  |
| Fotografi Dasar • 26-A • 24 Santri                   [>]   |
| Videografi • 26-A • 24 Santri                       [>]   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat kelas yang diampu.

### T03 - Detail Kelas

**Route:** `/ustadz/kelas/:id`  
**Tujuan:** Satu hub sederhana untuk mengajar.

```text
+--------------------------------------------------------------+
| FOTOGRAFI DASAR - 26A                                       |
|--------------------------------------------------------------|
| Sesi berikutnya: Rabu 09:00                                 |
| [Isi Absensi]                                               |
|--------------------------------------------------------------|
| Tugas aktif: Photo Story                                    |
| 7 belum dinilai                             [Periksa Tugas]  |
|--------------------------------------------------------------|
| Materi: 12                                    [Kelola Materi]|
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat/edit/cancel sesi; Buka absensi; Buat tugas; Kelola materi.

### T04 - Absensi

**Route:** `/ustadz/kelas/:id/absensi/:sesi`  
**Tujuan:** Mengisi kehadiran cepat.

```text
+--------------------------------------------------------------+
| ABSENSI • FOTOGRAFI • 11 AUG 09:00             [Simpan]     |
| [Semua Hadir]                                               |
| Ahmad   Hadir / Telat / Izin / Tidak Hadir   [catatan]      |
| Fulan   Hadir / Telat / Izin / Tidak Hadir   [catatan]      |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Tambah/update absensi; Koreksi sesuai aturan.

### T05 - Tugas & Nilai

**Route:** `/ustadz/tugas`  
**Tujuan:** Melihat tugas dan antrean penilaian.

```text
+--------------------------------------------------------------+
| TUGAS & NILAI                                  [+ Buat Tugas]|
| Photo Story • Fotografi • 18/24 masuk • 7 belum dinilai [>]|
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat; Lihat; Ubah; Batalkan/arsipkan tugas.

### T06 - Periksa Tugas Santri

**Route:** `/ustadz/tugas/:submissionId`  
**Tujuan:** Nilai, feedback, revisi, dan feature karya.

```text
+--------------------------------------------------------------+
| AHMAD • PHOTO STORY                                         |
| [Preview karya]                                             |
|--------------------------------------------------------------|
| Nilai [92 / 100]                                            |
| Feedback [..............................................]    |
| [Minta Revisi] [Simpan Nilai]                               |
| Setelah dinilai: [Jadikan Portfolio Publik]                 |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Baca submission; Buat/update nilai; Minta/cancel revisi; Feature ke portfolio.

### T07 - Materi

**Route:** `/ustadz/materi`  
**Tujuan:** Kelola materi mapel yang diampu.

```text
+--------------------------------------------------------------+
| MATERI                                       [+ Tambah]      |
| Fotografi > Exposure Triangle • Published             [>]  |
| Videografi > Framing • Draft                         [>]  |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat; Lihat; Ubah; Arsip/unpublish.

### T08 - Agen AI

**Route:** `/ustadz/agen`  
**Tujuan:** Membuat agen pribadi dengan wizard sederhana.

```text
+--------------------------------------------------------------+
| AGEN AI                                      [+ Buat Agen]   |
| Teaching Assistant • Telegram • Siap                 [>]    |
|--------------------------------------------------------------|
| Buat Agen:                                                  |
| 1 Nama & Tujuan > 2 Kepribadian > 3 Hubungkan Chat         |
| 4 Pilih AI > 5 Tempat Kerja > 6 Cek & Aktifkan             |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat/edit agen sendiri; Start/stop/restart; Arsip.
