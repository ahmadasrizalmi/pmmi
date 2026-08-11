# PMMI Digital Campus - Simplified UX Wireframe v1.3

> **Tujuan:** menyederhanakan seluruh panel agar nyaman untuk orang non-IT, tanpa mengurangi kemampuan backend. v1.3 menggantikan UX surface v1.2 yang terlalu teknis/enterprise.

## 1. Keputusan penting

- **Tidak ada tombol Chat AI di panel Santri.** PMMI LLM adalah service untuk Hermes Agent dan project/coding.
- **Agent Key** dibuat otomatis oleh PMMI dan dipasang ke Hermes Agent. User tidak perlu melihat/copy secret.
- **Developer Key** dibuat manual untuk project/coding dan boleh disalin oleh user.
- System Admin tetap punya kemampuan teknis, tetapi UI memakai bahasa sederhana; detail teknis disembunyikan di secondary detail.
- Staff Pondok hanya melihat menu sesuai tugas/capability.
- Ustadz hanya melihat mapel/kelas yang diampu.

## 2. Prinsip desain sederhana

| Prinsip | Aturan |
|---|---|
| Bahasa manusia | Gunakan istilah pondok: pendaftar, santri, kelas, tagihan, alat, agen. Hindari runtime, IAM, provider, ledger di layar utama. |
| Sedikit menu | Setiap panel maksimal 5-6 menu utama. Halaman detail dibuka dari daftar, bukan ditumpuk di sidebar. |
| Satu halaman satu pekerjaan | Daftar untuk mencari, detail untuk memutuskan, form untuk membuat/mengubah. |
| Teknis disembunyikan | Base URL/API key hanya di halaman yang memang membutuhkan. Hash, scope internal, job payload, path server masuk Detail Teknis. |
| Aman tanpa terasa rumit | Konfirmasi untuk tindakan sensitif, tetapi gunakan kalimat sederhana dan jelaskan dampaknya. |
| Agent mudah dibuat | Wizard agent memakai bahasa: Nama -> Kepribadian -> Hubungkan Chat -> Pilih AI -> Tempat Kerja -> Cek & Aktifkan. |
| Dua credential | Agent Key dibuat otomatis dan tidak perlu dilihat user. Developer Key dibuat manual untuk project/coding dan boleh disalin user. |

## 3. Ringkasan jumlah halaman per panel

| Panel | Menu Utama | Jumlah Halaman |
|---|---:|---:|
| PUBLIC / APPLICANT | 4 | 7 |
| SYSTEM ADMIN | 6 | 9 |
| PIMPINAN | 6 | 6 |
| STAFF PONDOK | 6 | 16 |
| USTADZ | 5 | 8 |
| SANTRI | 5 | 10 |

**Total route/page-level surfaces: 56.**

## 4. Dokumen per panel

- [PUBLIC / APPLICANT](10_PUBLIC_APPLICANT.md)
- [SYSTEM ADMIN](20_SYSTEM_ADMIN.md)
- [PIMPINAN](30_PIMPINAN.md)
- [STAFF PONDOK](40_STAFF_PONDOK.md)
- [USTADZ](50_USTADZ.md)
- [SANTRI](60_SANTRI.md)

- [CRUD, Agent Key, Developer Key, Definition of Done](70_CRUD_AGENT_KEYS.md)

## 5. Cara membaca wireframe

- **Menu utama** adalah yang benar-benar tampil di sidebar/bottom-nav.
- **Halaman detail** dibuka dari list/card dan tidak menambah menu utama.
- Staff Pondok bersifat capability-based: seorang staff hanya melihat modul sesuai tugas.
- Agent Key otomatis; Developer Key hanya untuk project/coding.
