# PMMI UX v1.3 - SYSTEM ADMIN

> Simplified, task-first wireframes. Halaman detail tidak memenuhi sidebar.

## Panel utuh

```text
+--------------------------------------------------------------+
| SYSTEM ADMIN                                                |
+--------------------------------------------------------------+
| MENU UTAMA                                                   |
|  - Beranda Sistem                                  |
|  - Pengguna                                        |
|  - AI & API                                        |
|  - Agen AI                                         |
|  - Koneksi                                         |
|  - Keamanan & Cadangan                             |
+--------------------------------------------------------------+
| HALAMAN (9)                                                 |
| W01  Beranda Sistem                         /system                 |
| W02  Pengguna                               /system/pengguna        |
| W03  Detail Pengguna & Hak Akses            /system/pengguna/:id    |
| W04  AI & API                               /system/ai              |
| W05  API Key                                /system/ai/api-key      |
| W06  Agen AI                                /system/agen            |
| W07  Koneksi Sistem                         /system/koneksi         |
| W08  Keamanan & Aktivitas                   /system/keamanan        |
| W09  Cadangan & Kesehatan Sistem            /system/cadangan        |
+--------------------------------------------------------------+
| 6 menu utama, 9 halaman.                                    |
+--------------------------------------------------------------+
```

## Wireframe per page

### W01 - Beranda Sistem

**Route:** `/system`  
**Tujuan:** Melihat apakah sistem berjalan normal dan apa yang butuh perhatian.

```text
+-------------------+------------------------------------------+
| SYSTEM ADMIN      | Sistem hari ini                          |
| Beranda Sistem    | API ✓ Database ✓ File ✓ AI ✓ Agen ✓     |
| Pengguna          |------------------------------------------|
| AI & API          | Perlu perhatian                          |
| Agen AI           | • 2 akun belum aktif                    |
| Koneksi           | • 1 agen gagal terhubung                |
| Keamanan/Cadangan | • Cadangan terakhir: hari ini 02:00 ✓   |
+-------------------+------------------------------------------+
```

**Yang bisa dilakukan:** Lihat status; Buka masalah yang perlu ditangani.

### W02 - Pengguna

**Route:** `/system/pengguna`  
**Tujuan:** Mencari akun dan membuat akun staff/ustadz/admin web.

```text
+--------------------------------------------------------------+
| PENGGUNA                                      [+ Tambah]      |
| [Cari nama/email] [Jenis akun v] [Status v]                  |
|--------------------------------------------------------------|
| Nisa    Staff Pondok   Aktif       Keuangan, Peminjaman [>] |
| Zaid    Ustadz         Aktif       Foto, Video          [>] |
| Ahmad   Santri         Aktif       Konten Kreator       [>] |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Tambah akun; Lihat akun; Nonaktifkan/aktifkan akun.

### W03 - Detail Pengguna & Hak Akses

**Route:** `/system/pengguna/:id`  
**Tujuan:** Mengatur hak yang benar tanpa istilah permission teknis.

```text
+--------------------------------------------------------------+
| < Pengguna   Nisa Rahma                                      |
|--------------------------------------------------------------|
| Jenis akun: Staff Pondok                                     |
| Tugas yang diberikan                                         |
| [✓] Keuangan   [ ] Penerimaan   [✓] Peminjaman Alat         |
| [ ] Kesantrian [ ] Administrasi Umum                        |
|--------------------------------------------------------------|
| Status akun: Aktif            [Nonaktifkan Akun]             |
| [Simpan Perubahan]                                           |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Ubah tugas/hak akses; Aktifkan/nonaktifkan; Reset/beri activation link bila perlu.

### W04 - AI & API

**Route:** `/system/ai`  
**Tujuan:** Mengatur model AI dan batas pemakaian dengan bahasa sederhana.

```text
+--------------------------------------------------------------+
| AI & API                                                     |
| [Model AI] [Batas Pemakaian] [Pemakaian]                    |
|--------------------------------------------------------------|
| MODEL YANG TERSEDIA                                          |
| PMMI Coder     Aktif     Untuk coding          [Ubah]        |
| PMMI Fast      Aktif     Umum/hemat            [Ubah]        |
|--------------------------------------------------------------|
| Pemakaian hari ini: 811 permintaan                           |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Tambah/ubah model alias; Atur siapa boleh memakai model; Lihat pemakaian.

### W05 - API Key

**Route:** `/system/ai/api-key`  
**Tujuan:** Membuat dan mencabut Developer Key atau Agent Key.

```text
+--------------------------------------------------------------+
| API KEY                                         [+ Buat Key]  |
| [Jenis: Semua v] [Pemilik v] [Status v]                      |
|--------------------------------------------------------------|
| Developer • Ahmad     ab12...  Aktif   dipakai 2 jam lalu [>]|
| Agent • Coding Mentor cd34...  Aktif   dipakai 5 menit    [>]|
|--------------------------------------------------------------|
| Buat Key                                                     |
| Jenis [Developer v]  Pemilik [Cari user/agent]              |
| Berlaku [90 hari v]   [Buat]                                 |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Buat key; Rotate key; Cabut key; Lihat pemakaian key.

**Catatan:** Secret hanya muncul saat dibuat/rotate.

### W06 - Agen AI

**Route:** `/system/agen`  
**Tujuan:** Melihat semua agen dan menolong jika setup atau pengoperasian bermasalah.

```text
+--------------------------------------------------------------+
| AGEN AI                                                     |
| [Cari] [Status v]                                           |
|--------------------------------------------------------------|
| Coding Mentor • Ahmad • Berjalan      Telegram ✓       [>]  |
| Asisten Foto  • Fulan • Perlu bantuan WhatsApp gagal  [>]  |
|--------------------------------------------------------------|
| Di detail: langkah setup, koneksi, model AI, status, riwayat |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat agen; Hentikan/restart jika perlu; Ulangi proses gagal; Arsipkan sesuai aturan.

### W07 - Koneksi Sistem

**Route:** `/system/koneksi`  
**Tujuan:** Mengetahui layanan luar terhubung atau tidak.

```text
+--------------------------------------------------------------+
| KONEKSI SISTEM                                               |
|--------------------------------------------------------------|
| Email          Terhubung ✓      [Tes]                        |
| Telegram       Terhubung ✓      [Tes]                        |
| WhatsApp       Terhubung ✓      [Kelola]                     |
| Router AI      Terhubung ✓      [Tes]                        |
| Penyimpanan    Terhubung ✓      [Tes]                        |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Ubah koneksi; Tes koneksi; Aktifkan/nonaktifkan.

### W08 - Keamanan & Aktivitas

**Route:** `/system/keamanan`  
**Tujuan:** Melihat perubahan penting dan kejadian keamanan.

```text
+--------------------------------------------------------------+
| KEAMANAN & AKTIVITAS                                        |
|--------------------------------------------------------------|
| Hari ini                                                     |
| 18:02 Nisa diubah tugas aksesnya oleh Admin Web             |
| 17:41 API key Ahmad di-rotate                               |
| 16:10 Login gagal 3x                                        |
|--------------------------------------------------------------|
| [Cari Aktivitas] [Filter]                                   |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat audit; Filter/export; Tangani alert.

### W09 - Cadangan & Kesehatan Sistem

**Route:** `/system/cadangan`  
**Tujuan:** Memastikan backup ada dan layanan sehat.

```text
+--------------------------------------------------------------+
| CADANGAN & KESEHATAN                                        |
|--------------------------------------------------------------|
| Cadangan terakhir     Hari ini 02:00 ✓                      |
| Database              Sehat ✓                                |
| File / MinIO          Sehat ✓                                |
| Ruang penyimpanan     62%                                    |
| Uji restore terakhir Belum dilakukan                         |
|                                                              |
| [Jalankan Cadangan] [Lihat Riwayat]                         |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Jalankan backup; Lihat backup; Tandai/selesaikan masalah.
