# v1.4 - Pimpinan

## Panel map

`Beranda | Penerimaan | Kesantrian | Keuangan & Operasional | Akademik & Laporan`

Pimpinan is not a passive reporting role. In a small pondok team, Pimpinan shares operational load by taking final decisions, approvals, sensitive student matters and exceptions.

## L01 - Beranda & Persetujuan `/pimpinan`

```text
+--------------------------------------------------------------+
| PIMPINAN                                                     |
|--------------------------------------------------------------|
| Santri 69 • Pendaftar 42 • Kelas 12 • Alat terlambat 3      |
|--------------------------------------------------------------|
| MENUNGGU KEPUTUSAN                                            |
| 3 hasil penerimaan                    [Periksa]              |
| 2 perubahan status santri             [Periksa]              |
| 1 koreksi/pengeluaran khusus          [Periksa]              |
+--------------------------------------------------------------+
```

This is the approval inbox; it prevents work from being hidden inside many menus.

## L02 - Penerimaan & Enrollment `/pimpinan/penerimaan`

Staff Admin prepares biodata, documents, interview schedule and registration data. Pimpinan handles the final decision and enrollment approval.

```text
+--------------------------------------------------------------+
| PENERIMAAN & ENROLLMENT                                      |
| [Menunggu Keputusan] [Wawancara] [Diterima & Daftar Ulang]  |
|--------------------------------------------------------------|
| Ahmad • Biodata ✓ Dokumen ✓ Wawancara selesai       [Buka]  |
|--------------------------------------------------------------|
| Ringkasan calon • catatan wawancara • rekomendasi staff      |
| [Terima] [Tunggu] [Tolak]                                   |
| Jalur [v] Angkatan [v]                [Setujui Enrollment]   |
+--------------------------------------------------------------+
```

Actions: final admission decision, review interview, set/confirm track and cohort when process requires it, approve enrollment/provisioning.

## L03 - Kesantrian & Status Santri `/pimpinan/kesantrian`

Sensitive cases and lifecycle changes live here.

```text
+--------------------------------------------------------------+
| KESANTRIAN & STATUS                                          |
| [Perlu Tindakan] [Daftar Santri]                            |
|--------------------------------------------------------------|
| Ahmad • usulan SUSPEND • alasan ...                 [Buka]  |
| Fulan • izin khusus / catatan pembinaan             [Buka]  |
|--------------------------------------------------------------|
| Ringkasan • riwayat izin • catatan penting                   |
| [Setujui/Tolak] [Ubah Status]                               |
+--------------------------------------------------------------+
```

Staff Admin still handles routine administrative data and normal permits. Pimpinan handles sensitive notes, exceptional permits and lifecycle decisions.

## L04 - Keuangan & Operasional `/pimpinan/operasional`

```text
+--------------------------------------------------------------+
| KEUANGAN & OPERASIONAL                                       |
| [Keuangan] [Aset/Alat] [Persetujuan]                        |
|--------------------------------------------------------------|
| Pemasukan ... • Pengeluaran ... • Tagihan belum ...          |
| Review: 1 koreksi pembayaran • 1 pengeluaran khusus         |
|--------------------------------------------------------------|
| Alat: 3 overdue • 1 rusak berat • 1 usulan write-off        |
| [Review Item]                                                |
+--------------------------------------------------------------+
```

Routine billing, payments, expense entry and lending remain with Staff Admin. Pimpinan reviews corrections, special/high-value expenses, write-off and exceptions.

## L05 - Akademik & Laporan `/pimpinan/akademik`

```text
+--------------------------------------------------------------+
| AKADEMIK & LAPORAN                                           |
| [Akademik] [Laporan]                                        |
|--------------------------------------------------------------|
| Konten Kreator • progress ... • attendance ...              |
| Programmer • progress ... • attendance ...                  |
| Tahsin • progress ...                                       |
| Tugas belum dinilai 18                                      |
|--------------------------------------------------------------|
| Periode [Agustus 2026 v] [Export Laporan]                    |
+--------------------------------------------------------------+
```

Pimpinan monitors overall academic condition; Ustadz remains responsible for teaching, attendance, materials, assignments and grading.