# PMMI UX v1.3 - PIMPINAN

> Simplified, task-first wireframes. Halaman detail tidak memenuhi sidebar.

## Panel utuh

```text
+--------------------------------------------------------------+
| PIMPINAN                                                    |
+--------------------------------------------------------------+
| MENU UTAMA                                                   |
|  - Ringkasan                                       |
|  - Penerimaan                                      |
|  - Santri                                          |
|  - Keuangan                                        |
|  - Akademik                                        |
|  - Laporan                                         |
+--------------------------------------------------------------+
| HALAMAN (6)                                                 |
| L01  Ringkasan Pondok                       /pimpinan               |
| L02  Penerimaan                             /pimpinan/penerimaan    |
| L03  Santri & Kesantrian                    /pimpinan/santri        |
| L04  Keuangan                               /pimpinan/keuangan      |
| L05  Akademik                               /pimpinan/akademik      |
| L06  Laporan & Persetujuan                  /pimpinan/laporan       |
+--------------------------------------------------------------+
| 6 menu, 6 halaman. Pimpinan tidak melihat secret/API key.   |
+--------------------------------------------------------------+
```

## Wireframe per page

### L01 - Ringkasan Pondok

**Route:** `/pimpinan`  
**Tujuan:** Melihat kondisi pondok tanpa detail teknis.

```text
+--------------------------------------------------------------+
| RINGKASAN PONDOK                                             |
|--------------------------------------------------------------|
| Santri aktif 69    Pendaftar 42    Kelas aktif 12           |
| Tagihan belum lunas ...          Alat terlambat 3           |
|--------------------------------------------------------------|
| PERLU PERSETUJUAN                                            |
| 2 perubahan status santri    [Periksa]                       |
| 1 koreksi keuangan            [Periksa]                      |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat ringkasan; Buka item yang perlu persetujuan.

### L02 - Penerimaan

**Route:** `/pimpinan/penerimaan`  
**Tujuan:** Melihat perkembangan penerimaan dan hasil seleksi.

```text
+--------------------------------------------------------------+
| PENERIMAAN                                                   |
|--------------------------------------------------------------|
| 42 masuk > 33 terverifikasi > 18 wawancara > 12 diterima    |
|--------------------------------------------------------------|
| Pendaftar perlu perhatian                                    |
| • 6 dokumen belum lengkap                                   |
| • 3 keputusan menunggu review                               |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat funnel; Lihat exception; Setujui jika aturan membutuhkan.

### L03 - Santri & Kesantrian

**Route:** `/pimpinan/santri`  
**Tujuan:** Melihat kondisi santri dan persetujuan status sensitif.

```text
+--------------------------------------------------------------+
| SANTRI & KESANTRIAN                                         |
|--------------------------------------------------------------|
| Aktif 69   Izin hari ini 4   Catatan perlu tindak lanjut 2  |
|--------------------------------------------------------------|
| Ahmad -> usulan SUSPEND     [Periksa]                        |
| Fulan -> usulan DROPOUT     [Periksa]                        |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat ringkasan; Setujui/tolak lifecycle request.

### L04 - Keuangan

**Route:** `/pimpinan/keuangan`  
**Tujuan:** Melihat rekap administratif keuangan.

```text
+--------------------------------------------------------------+
| KEUANGAN                                                     |
|--------------------------------------------------------------|
| Pemasukan periode ini ...     Pengeluaran ...                |
| Tagihan belum lunas ...       Koreksi menunggu 1            |
|--------------------------------------------------------------|
| [Lihat Rekap] [Periksa Koreksi]                             |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat rekap; Approve/reject koreksi tertentu; Export laporan.

### L05 - Akademik

**Route:** `/pimpinan/akademik`  
**Tujuan:** Melihat progress jalur dan mapel.

```text
+--------------------------------------------------------------+
| AKADEMIK                                                     |
|--------------------------------------------------------------|
| Konten Kreator  Progress ...   Kehadiran ...                 |
| Programmer      Progress ...   Kehadiran ...                 |
| Tahsin          Progress ...   Kehadiran ...                 |
|--------------------------------------------------------------|
| Tugas belum dinilai: 18                                    |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Lihat progress; Lihat backlog per kelas/mapel.

### L06 - Laporan & Persetujuan

**Route:** `/pimpinan/laporan`  
**Tujuan:** Satu tempat untuk laporan dan approval lintas unit.

```text
+--------------------------------------------------------------+
| LAPORAN & PERSETUJUAN                                       |
|--------------------------------------------------------------|
| [Penerimaan] [Santri] [Keuangan] [Akademik] [Aset]         |
| Periode [Agustus 2026 v]        [Buat Laporan]               |
|--------------------------------------------------------------|
| Menunggu persetujuan: 3                                     |
| [Buka Daftar]                                               |
+--------------------------------------------------------------+
```

**Yang bisa dilakukan:** Generate/export laporan; Approve/reject item.
