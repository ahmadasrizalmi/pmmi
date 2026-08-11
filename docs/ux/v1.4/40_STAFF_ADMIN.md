# v1.4 - Staff Admin

## Panel map

`Beranda | Pendaftaran | Keuangan & Administrasi | Santri & Izin | Alat & Peminjaman`

Five menu items = five workspaces. Staff Admin focuses on routine service, recording, checking and preparation. Final/sensitive decisions are escalated to Pimpinan.

## O01 - Beranda Staff `/staff`

```text
+--------------------------------------------------------------+
| STAFF ADMIN                                                  |
|--------------------------------------------------------------|
| HARI INI                                                     |
| 6 pendaftar perlu dicek                 [Buka]              |
| 7 pembayaran perlu dicatat              [Buka]              |
| 3 izin santri perlu diperbarui           [Buka]              |
| 2 alat harus kembali hari ini            [Buka]              |
+--------------------------------------------------------------+
```

The home page is a task list, not a KPI dashboard.

## O02 - Pendaftaran & Daftar Ulang `/staff/pendaftaran`

List, document checking, selected applicant detail, interview scheduling and registration preparation are one workspace.

```text
+--------------------------------------------------------------+
| PENDAFTARAN                                                  |
| [Pendaftar] [Dokumen] [Wawancara/Daftar Ulang]             |
|--------------------------------------------------------------|
| Ahmad • 100% • Dokumen 5/5 • Screening              [>]    |
|--------------------------------------------------------------|
| PANEL DETAIL                                                 |
| Biodata • keluarga • kesehatan • dokumen                     |
| [Verifikasi Dokumen] [Minta Perbaikan]                       |
| Jadwal Wawancara [atur]                                      |
| Siap keputusan -> [Kirim ke Pimpinan]                        |
+--------------------------------------------------------------+
```

Actions: add manual application if needed, correct data with audit, verify/request document fixes, schedule interview, prepare registration. **Accept/reject and enrollment approval belong to Pimpinan.**

## O03 - Keuangan & Administrasi `/staff/administrasi`

Routine financial/admin recording uses tabs instead of four separate pages.

```text
+--------------------------------------------------------------+
| KEUANGAN & ADMINISTRASI                                      |
| [Tagihan] [Pembayaran] [Pengeluaran] [Surat/Dokumen]        |
|--------------------------------------------------------------|
| TAGIHAN                                      [+ Buat]        |
| Ahmad • Daftar Ulang • Rp ... • Belum Lunas         [>]    |
|--------------------------------------------------------------|
| Payment posted tidak dihapus. Salah catat -> [Buat Koreksi] |
+--------------------------------------------------------------+
```

Actions: create/edit draft bills, record payments, record routine expenses, create correction records, register/archive letters/documents. Special/high-value expenses and important corrections are sent to Pimpinan.

## O04 - Santri & Izin `/staff/santri`

Directory, routine permit handling and light operational notes are one workspace.

```text
+--------------------------------------------------------------+
| SANTRI & IZIN                                                |
| [Daftar Santri] [Izin] [Catatan Ringan]                     |
|--------------------------------------------------------------|
| Ahmad • Konten Kreator • Aktif                      [>]     |
|--------------------------------------------------------------|
| PANEL SANTRI                                                 |
| Kontak • angkatan • jalur • izin                             |
| [+ Buat Izin] [+ Catatan]                                    |
| Kasus sensitif/status -> [Ajukan ke Pimpinan]                |
+--------------------------------------------------------------+
```

Actions: update administrative student fields, create/edit/cancel routine permits, add operational notes, escalate sensitive cases. Lifecycle changes are not a Staff Admin direct button.

## O05 - Alat & Peminjaman `/staff/alat`

Inventory, checkout/return and repairs are tabs in one page.

```text
+--------------------------------------------------------------+
| ALAT & PEMINJAMAN                                            |
| [Daftar Alat] [Dipinjam] [Perbaikan]                        |
|--------------------------------------------------------------|
| Canon R10 • CAM-001 • Tersedia                    [Pinjam]   |
| Tripod T01 • Ahmad • kembali 18:00               [Kembali]  |
| Kamera X • Rusak • sedang diperbaiki              [>]        |
|--------------------------------------------------------------|
| Rusak berat/write-off -> [Ajukan ke Pimpinan]                |
+--------------------------------------------------------------+
```

Actions: create/edit/archive asset, checkout/return, record damage/repair. Write-off, replacement or exceptional decisions go to Pimpinan.