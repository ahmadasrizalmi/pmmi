# PMMI Digital Campus - UX / IA / CRUD / Agent Specification v1.2

> **Status: proposed UX source-of-truth for PR #10.** This version supersedes v1.0/v1.1 assumptions. It is grounded in the actual PMMI admission form, the two-track PMMI program structure, the pondok staffing model, and current Hermes Agent official documentation.

## 1. Corrections locked in v1.2

1. **Admin Web != Admin Pondok.** `SYSTEM_ADMIN` is a technical platform role. Pondok operations use `PIMPINAN`, capability-scoped `STAFF`, and assignment-scoped `USTADZ`.
2. **One account can have multiple roles/capabilities.** Current single-role `ADMIN/USTADZ/SANTRI` model is not sufficient for real pondok staffing.
3. **Staf is capability based.** Admissions, finance, kesantrian, sarpras/peminjaman, and general administration are separate permission bundles; a staff member can hold more than one.
4. **Ustadz access is teaching-assignment scoped.** Examples explicitly supplied: Fotografi, Videografi, Programmer, Tahsin, and UK.
5. **LLM access is a product surface.** Santri/Ustadz receive Base URL, personal API keys, model/rate/credit information, and copyable usage examples. System Admin can generate/rotate/revoke user, agent, and service keys.
6. **Hermes Agent creation is a pipeline, not a Build button.** Profile -> SOUL.md -> Telegram/WhatsApp -> LLM -> workspace + `/sethome` -> safety -> review/ready.
7. **Every operational page has explicit CRUD semantics.** Auditable records generally use archive/cancel/reversal rather than destructive delete.

## 2. Source-grounded PMMI structure

### 2.1 Academic tracks

- **Jalur Konten Kreator:** Fotografi, Videografi, Desain Grafis, Copywriting, Branding.
- **Jalur Programmer:** Web & App Development, UI/UX, Front-end, Back-end, Automation, AI Tools.
- **Materi bersama:** Tahsin & Tahfidz, Fiqih & Hadist, Adab Kehidupan, Public Speaking, Digital Marketing.

### 2.2 Admission form groups

| Group | Source fields |
|---|---|
| Identitas Calon Santri | Nama, Email, Utusan dari, Jenis Kelamin, NIK, alamat KTP, WhatsApp, tempat/tanggal lahir, suku, kewarganegaraan, pendidikan terakhir |
| Keluarga | Ayah/Ibu, kondisi, NIK, KK, pekerjaan, pendidikan, agama, suku, kewarganegaraan, jumlah saudara |
| Wali (opsional) | Nama, hubungan, pekerjaan, pendidikan, alamat KTP/domisili, agama, suku, kewarganegaraan |
| Fisik & Kesehatan | Golongan darah, tinggi/berat, khitan, penglihatan, kacamata, pendengaran, alergi, riwayat penyakit |
| Latar Rumah | Merokok, riwayat penjara, kondisi pendidikan rumah, ekonomi keluarga, situasi rumah |
| Kecakapan & Prestasi | Bidang studi, olahraga, kesenian, keterampilan khusus, prestasi, pengalaman organisasi |
| Motivasi | Esai: "Kenapa ingin masuk Pondok ini?" |
| Dokumen | KTP Santri + Ayah/Ibu/Wali, KK, Akte, Ijazah, SKTM jika ada, Pas Photo |

Initial biodata does **not** force a Jalur choice because the supplied form does not contain a Jalur selection. Track placement remains a distinct admission/enrollment policy step.

## 3. Actor model

| Role template | Human meaning | Boundary |
|---|---|---|
| SYSTEM_ADMIN | Admin Web / Platform | Teknis platform, IAM, integrasi, AI gateway, Hermes runtime, security, audit, ops. Tidak otomatis mendapat kewenangan operasional pondok. |
| PIMPINAN | Pimpinan Pondok | Executive visibility, policy, approval sensitif, laporan lintas unit. Bukan admin server. |
| STAFF | Staf Pondok | Hak berdasarkan capability/unit; satu staf boleh memegang beberapa unit. |
| USTADZ | Ustadz Pengampu | Hak berdasarkan teaching assignment/mapel/kelas, bukan seluruh akademik. |
| SANTRI | Santri | Self-service akademik, AI, API access, agent, notifikasi, portofolio pribadi. |

### 3.1 Staff capability bundles

| Capability | Unit | Scope |
|---|---|---|
| admissions.manage | Penerimaan | Pipeline pendaftar, dokumen, review, interview, keputusan sesuai policy |
| finance.manage | Keuangan | Pencatatan tagihan/pembayaran/pengeluaran dan laporan administratif |
| student_affairs.manage | Kesantrian | Data kesantrian, izin/catatan, lifecycle request sesuai policy |
| assets.manage | Sarpras & Peminjaman | Inventaris, alat, checkout/return, maintenance |
| general_admin.manage | Administrasi Umum | Registri surat/dokumen/arsip administratif |

### 3.2 Ustadz teaching assignment examples

| Subject / assignment label | Access rule |
|---|---|
| Fotografi | Hanya kelas/course yang ditugaskan |
| Videografi | Hanya kelas/course yang ditugaskan |
| Programmer | Hanya kelas/course yang ditugaskan |
| Tahsin | Hanya kelas/course yang ditugaskan |
| UK | Hanya kelas/course yang ditugaskan |

**Important:** `UK` is preserved exactly as supplied by the pondok owner; its expanded name still needs to be documented in curriculum master data.

## 4. Portal separation

- `/system/*` - **Admin Web / System Admin**: IAM, technical integrations, AI Gateway, API keys, Hermes runtime/templates, audit, ops.
- `/leadership/*` - **Pimpinan**: executive overview, reports, approvals, no server secret access.
- `/office/*` - **Staff Pondok**: menu assembled from staff capabilities.
- `/ustadz/*` - **Ustadz Pengampu**: only assigned subjects/classes.
- `/santri/*` - **Santri**: self-service learning, AI/API, agents.
- `/daftar/*` - **Applicant**.

## 5. Public / Applicant wireframes

### G01 - SHARED - Login

**Route:** `/login`

```text
+--------------------------------------------------------------------------------+
| PMMI DIGITAL CAMPUS                                              Bantuan        |
|--------------------------------------------------------------------------------|
|                              [ Logo PMMI ]                                      |
|                           Selamat datang kembali                                |
|                                                                                |
| Email      [____________________________________]                               |
| Password   [************************************] [lihat]                       |
| [ Masuk ]                                                                       |
|                                                                                |
| Role tidak dipilih dari UI. Hak akses berasal dari akun + role/capability.      |
+--------------------------------------------------------------------------------+
```

### P01 - PUBLIC - Form Biodata Calon Santri

**Route:** `/daftar`

```text
+--------------------------------------------------------------------------------+
| FORM BIODATA CALON SANTRI                               Step 4 / 8              |
|--------------------------------------------------------------------------------|
| 1 Identitas ✓  2 Keluarga ✓  3 Wali ✓  4 Fisik/Kesehatan                      |
| 5 Latar Rumah   6 Kecakapan   7 Motivasi   8 Dokumen                           |
|--------------------------------------------------------------------------------|
| FISIK & KESEHATAN                                                              |
| Golongan darah [A v]    Tinggi [___] cm     Berat [___] kg                     |
| Sudah khitan? [Sudah v]                                                        |
| Penglihatan [Baik v]    Kacamata? [Tidak v]   Pendengaran [Baik v]            |
| Alergi [.................................................................]      |
| Riwayat penyakit + tahun [...............................................]      |
|                                                                                |
| [Simpan & Keluar]                                          [Lanjut]             |
+--------------------------------------------------------------------------------+
```

- Save/resume per section.
- Initial biodata tidak memaksa Jalur.
- Sensitive data is privacy-scoped after submit.

### P02 - APPLICANT - Portal Pendaftar

**Route:** `/daftar/:applicationId`

```text
+--------------------------------------------------------------------------------+
| PMMI Applicant Portal                                      #PMMI-26-0042        |
| STATUS: SCREENING                                                              |
|--------------------------------------------------------------------------------|
| Kelengkapan Biodata 87% [Lanjutkan]     Dokumen 4/6 [Lengkapi]                 |
|--------------------------------------------------------------------------------|
| Timeline: Submitted > Verified > Screening > Interview > Decision > Registration|
|                                                                                |
| ACTION REQUIRED                                                                |
| [!] Lengkapi riwayat penyakit                                                  |
| [!] Upload Ijazah Terakhir                                                     |
|                                                                                |
| Interview (jika ada): 14 Aug, 09:00 WIB [Detail]                               |
| Daftar Ulang hanya muncul setelah ACCEPTED.                                    |
+--------------------------------------------------------------------------------+
```

### P03 - PUBLIC - Program / Jalur

**Route:** `/program`

```text
+--------------------------------------------------------------------------------+
| PROGRAM PMMI                                                                   |
|--------------------------------------------------------------------------------|
| [JALUR KONTEN KREATOR]                    [JALUR PROGRAMMER]                   |
| Fotografi                                  Web & App Development                |
| Videografi                                 UI/UX                                |
| Desain Grafis                              Front-end                            |
| Copywriting                                Back-end                             |
| Branding                                   Automation + AI Tools                |
|--------------------------------------------------------------------------------|
| Materi bersama: Tahsin & Tahfidz • Fiqih & Hadist • Adab Kehidupan            |
|                  Public Speaking • Digital Marketing                            |
+--------------------------------------------------------------------------------+
```
