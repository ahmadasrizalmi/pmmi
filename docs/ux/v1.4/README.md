# PMMI Digital Campus - Efficient Simplified UX v1.4

> **Canonical UX review target.** v1.4 supersedes v1.3 for user-facing implementation. The goal is not to maximize page count; it is to make the whole campus manageable by a small pondok team.

## Core rule

**Staff Admin = catat + cek + siapkan + layani.**  
**Pimpinan = putuskan + setujui + tangani kasus sensitif/pengecualian.**

List, detail and edit surfaces that belong to the same job are combined with tabs, drawers or split views instead of becoming separate routes.

## Panel size

| Panel | Main menu | Workspace/page groups |
|---|---:|---:|
| Public / Pendaftar | 4 | 6 |
| System Admin | 5 | 5 |
| Pimpinan | 5 | 5 |
| Staff Admin | 5 | 5 |
| Ustadz | 4 | 4 |
| Santri | 5 | 5 |

**Total: 30 workspace/page groups**, down from 56 in v1.3.

## Canonical documents

1. [Public / Pendaftar](./10_PUBLIC_APPLICANT.md)
2. [System Admin](./20_SYSTEM_ADMIN.md)
3. [Pimpinan](./30_PIMPINAN.md)
4. [Staff Admin](./40_STAFF_ADMIN.md)
5. [Ustadz](./50_USTADZ.md)
6. [Santri](./60_SANTRI.md)
7. [Work split, CRUD and implementation rules](./70_WORK_SPLIT_CRUD.md)

## Whole-panel map

### System Admin

`Beranda | Pengguna | AI & API | Agen & Koneksi | Keamanan & Cadangan`

- W01 Beranda Sistem - `/system`
- W02 Pengguna & Akses - `/system/pengguna`
- W03 AI & API - `/system/ai`
- W04 Agen & Koneksi - `/system/agen`
- W05 Keamanan & Cadangan - `/system/keamanan`

### Pimpinan

`Beranda | Penerimaan | Kesantrian | Keuangan & Operasional | Akademik & Laporan`

- L01 Beranda & Persetujuan - `/pimpinan`
- L02 Penerimaan & Enrollment - `/pimpinan/penerimaan`
- L03 Kesantrian & Status Santri - `/pimpinan/kesantrian`
- L04 Keuangan & Operasional - `/pimpinan/operasional`
- L05 Akademik & Laporan - `/pimpinan/akademik`

### Staff Admin

`Beranda | Pendaftaran | Keuangan & Administrasi | Santri & Izin | Alat & Peminjaman`

- O01 Beranda Staff - `/staff`
- O02 Pendaftaran & Daftar Ulang - `/staff/pendaftaran`
- O03 Keuangan & Administrasi - `/staff/administrasi`
- O04 Santri & Izin - `/staff/santri`
- O05 Alat & Peminjaman - `/staff/alat`

### Ustadz

`Beranda | Kelas Saya | Penilaian | Agen AI`

- T01 Beranda Ustadz - `/ustadz`
- T02 Kelas Saya - `/ustadz/kelas`
- T03 Penilaian - `/ustadz/penilaian`
- T04 Agen AI - `/ustadz/agen`

### Santri

`Hari Ini | Belajar | Karya & Hasil | Agen AI | Akun`

- S01 Hari Ini - `/santri`
- S02 Belajar - `/santri/belajar`
- S03 Karya & Hasil - `/santri/hasil`
- S04 Agen AI - `/santri/agen`
- S05 Akun & API untuk Proyek - `/santri/akun`

## AI credential rule

- **Agent Key:** created automatically by PMMI for one Hermes Agent and installed automatically. Santri/Ustadz do not copy it.
- **Developer Key:** optional key for coding/project use. It lives under `Akun > API untuk Proyek` for eligible users.
- There is **no core AI Chat page**.

## UX gate

Do not add a new page if the job can be completed clearly in the existing workspace with a tab, drawer or split view. Complexity belongs in the backend, not in the sidebar.