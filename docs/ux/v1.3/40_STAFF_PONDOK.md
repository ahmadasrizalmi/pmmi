# PMMI UX v1.3 - STAFF PONDOK

> Simplified, task-first wireframes. Halaman detail tidak memenuhi sidebar.

## Panel utuh

```text
+--------------------------------------------------------------+
| STAFF PONDOK                                                |
+--------------------------------------------------------------+
| MENU UTAMA                                                   |
|  - Beranda                                         |
|  - Penerimaan                                      |
|  - Keuangan                                        |
|  - Kesantrian                                      |
|  - Peminjaman Alat                                 |
|  - Administrasi                                    |
+--------------------------------------------------------------+
| HALAMAN (16)                                                |
| O01  Beranda Staff                          /staff                  |
| O02  Daftar Pendaftar                       /staff/penerimaan       |
| O03  Detail Pendaftar                       /staff/penerimaan/:id   |
| O04  Daftar Ulang & Enrollment              /staff/enrollment       |
| O05  Ringkasan Keuangan                     /staff/keuangan         |
| O06  Tagihan                                /staff/keuangan/tagihan |
| O07  Pembayaran                             /staff/keuangan/pembayaran|
| O08  Pengeluaran                            /staff/keuangan/pengeluaran|
| O09  Laporan Keuangan                       /staff/keuangan/laporan |
| O10  Daftar Santri                          /staff/kesantrian       |
| O11  Detail Santri                          /staff/kesantrian/:id   |
| O12  Izin & Catatan Kesantrian              /staff/kesantrian/:id/aktivitas|
| O13  Daftar Alat                            /staff/alat             |
| O14  Peminjaman & Pengembalian              /staff/alat/peminjaman  |
| O15  Perbaikan Alat                         /staff/alat/perbaikan   |
| O16  Surat & Dokumen                        /staff/administrasi     |
+--------------------------------------------------------------+
| Maksimal 6 menu; staff hanya melihat menu sesuai tugasnya.      |
+--------------------------------------------------------------+
```

## Wireframe per page

### O01 - Beranda Staff

**Route:** `/staff`  
**Tujuan:** Menampilkan tugas sesuai pekerjaan staff.

```text
+--------------------------------------------------------------+
| BERANDA STAFF - NISA                                         |
| Tugas saya: Keuangan • Peminjaman Alat                       |
|--------------------------------------------------------------|
| Hari ini                                                     |
| 7 pembayaran belum dicatat          [Buka]                   |
| 3 alat terlambat dikembalikan        [Buka]                   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buka pekerjaan yang ditugaskan.

### O02 - Daftar Pendaftar

**Route:** `/staff/penerimaan`  
**Tujuan:** Mengelola antrean pendaftar.

```text
+--------------------------------------------------------------+
| PENDAFTAR                              [Cari] [Status v]      |
|--------------------------------------------------------------|
| Ahmad • Masjid X • 100% lengkap • Screening          [>]    |
| Fulan • Pribadi  • 76% lengkap  • Submitted          [>]    |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Tambah manual jika perlu; Lihat/filter pendaftar.

### O03 - Detail Pendaftar

**Route:** `/staff/penerimaan/:id`  
**Tujuan:** Review biodata, dokumen, wawancara dan keputusan.

```text
+--------------------------------------------------------------+
| AHMAD RIZAL • SCREENING                                     |
| [Biodata] [Keluarga] [Kesehatan] [Dokumen] [Seleksi]        |
|--------------------------------------------------------------|
| Kelengkapan 100%    Dokumen 5/5                             |
| Catatan seleksi ...                                         |
|--------------------------------------------------------------|
| Langkah berikutnya                                          |
| [Jadwalkan Wawancara] [Terima] [Tunggu] [Tolak]            |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Perbaiki data dengan audit; Verifikasi dokumen; Tambah/edit interview; Buat keputusan sesuai aturan.

### O04 - Daftar Ulang & Enrollment

**Route:** `/staff/enrollment`  
**Tujuan:** Menempatkan jalur/cohort dan membuat akun santri.

```text
+--------------------------------------------------------------+
| DAFTAR ULANG                                                |
|--------------------------------------------------------------|
| Ahmad • Diterima • Daftar ulang lengkap             [Buka] |
|--------------------------------------------------------------|
| Jalur     [Konten Kreator v]                                |
| Angkatan  [2026-A v]                                       |
| Yang dibuat: akun + kredit AI + slot agen + storage         |
| [Daftarkan sebagai Santri]                                  |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Ubah daftar ulang; Tetapkan jalur/cohort; Daftarkan sebagai santri.

### O05 - Ringkasan Keuangan

**Route:** `/staff/keuangan`  
**Tujuan:** Melihat pekerjaan keuangan harian.

```text
+--------------------------------------------------------------+
| KEUANGAN                                                     |
| Hari ini: pembayaran ... • tagihan jatuh tempo ...          |
| [Catat Pembayaran] [Buat Tagihan] [Catat Pengeluaran]       |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buka transaksi utama.

### O06 - Tagihan

**Route:** `/staff/keuangan/tagihan`  
**Tujuan:** Membuat dan mengelola tagihan.

```text
+--------------------------------------------------------------+
| TAGIHAN                                      [+ Buat]        |
| Ahmad • Daftar Ulang • Rp ... • Belum Lunas           [>]  |
| Fulan • ...                                            [>]  |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat; Lihat; Ubah draft; Batalkan draft/final sesuai aturan.

### O07 - Pembayaran

**Route:** `/staff/keuangan/pembayaran`  
**Tujuan:** Mencatat pembayaran tanpa menghapus sejarah.

```text
+--------------------------------------------------------------+
| PEMBAYARAN                                  [+ Catat]        |
| Cari santri -> pilih tagihan -> jumlah -> metode -> simpan  |
|--------------------------------------------------------------|
| Salah catat? Gunakan [Buat Koreksi] bukan hapus transaksi.  |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Catat pembayaran; Lihat; Buat koreksi/reversal.

### O08 - Pengeluaran

**Route:** `/staff/keuangan/pengeluaran`  
**Tujuan:** Mencatat pengeluaran pondok.

```text
+--------------------------------------------------------------+
| PENGELUARAN                                   [+ Catat]       |
| 11 Aug • Servis Kamera • Rp ... • Posted             [>]   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat; Lihat; Ubah draft; Koreksi setelah posted.

### O09 - Laporan Keuangan

**Route:** `/staff/keuangan/laporan`  
**Tujuan:** Membuat rekap sederhana.

```text
+--------------------------------------------------------------+
| LAPORAN KEUANGAN                                            |
| Periode [Agustus 2026 v]                                    |
| [Buat Rekap] [Export]                                       |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Generate/export.

### O10 - Daftar Santri

**Route:** `/staff/kesantrian`  
**Tujuan:** Mencari santri untuk urusan kesantrian.

```text
+--------------------------------------------------------------+
| SANTRI                          [Cari] [Status v] [Jalur v]  |
| Ahmad • Konten Kreator • Aktif                         [>] |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat/filter santri.

### O11 - Detail Santri

**Route:** `/staff/kesantrian/:id`  
**Tujuan:** Mengelola data kesantrian yang berwenang.

```text
+--------------------------------------------------------------+
| AHMAD RIZAL • AKTIF                                         |
| [Profil] [Izin & Catatan] [Status Santri]                   |
|--------------------------------------------------------------|
| Jalur Konten Kreator • Angkatan 2026-A                     |
| Izin aktif: tidak ada                                       |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat; Ubah data kesantrian; Ajukan perubahan status.

### O12 - Izin & Catatan Kesantrian

**Route:** `/staff/kesantrian/:id/aktivitas`  
**Tujuan:** Mencatat izin dan catatan restricted.

```text
+--------------------------------------------------------------+
| IZIN & CATATAN - AHMAD                                      |
| [+ Buat Izin] [+ Catatan]                                   |
|--------------------------------------------------------------|
| Izin • 12 Aug 08:00-18:00 • Approved                        |
| Catatan • Pembinaan • ...                                   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat/edit/cancel izin sesuai state; Buat/edit/archive catatan sesuai aturan.

### O13 - Daftar Alat

**Route:** `/staff/alat`  
**Tujuan:** Inventaris alat yang mudah dicari.

```text
+--------------------------------------------------------------+
| DAFTAR ALAT                                  [+ Tambah]      |
| [Cari] [Kategori v] [Status v]                               |
| Canon R10 • CAM-001 • Tersedia                        [>]   |
| Tripod T01 • Dipinjam Ahmad                           [>]   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Tambah; Lihat; Ubah; Arsip/write-off sesuai aturan.

### O14 - Peminjaman & Pengembalian

**Route:** `/staff/alat/peminjaman`  
**Tujuan:** Checkout/return tanpa istilah teknis.

```text
+--------------------------------------------------------------+
| PEMINJAMAN ALAT                              [+ Pinjamkan]   |
| Ahmad • Canon R10 • kembali 18:00 • Dipinjam        [Kembali]|
| Fulan • Tripod • TERLAMBAT                         [Buka]   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat peminjaman; Ubah sebelum checkout; Catat pengembalian; Batalkan jika belum dipinjamkan.

### O15 - Perbaikan Alat

**Route:** `/staff/alat/perbaikan`  
**Tujuan:** Mencatat kerusakan dan proses servis.

```text
+--------------------------------------------------------------+
| PERBAIKAN ALAT                                [+ Catat]       |
| Canon R10 • Sensor kotor • Sedang diperbaiki          [>]  |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat; Lihat; Ubah status/catatan; Arsip setelah selesai.

### O16 - Surat & Dokumen

**Route:** `/staff/administrasi`  
**Tujuan:** Mencatat administrasi umum.

```text
+--------------------------------------------------------------+
| SURAT & DOKUMEN                                [+ Tambah]     |
| [Masuk] [Keluar] [Internal] [Lainnya]                       |
| 011/PMMI/VIII • Surat ...                            [>]    |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat; Lihat; Ubah; Arsip.
