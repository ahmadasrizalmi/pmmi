# PMMI UX v1.2 - Staff Pondok

> Portal `/office/*` adalah panel operasional pondok. Menu dirakit berdasarkan capability user; bukan semua staf melihat semua modul.

## Capability map

| Capability | Unit | Menu |
|---|---|---|
| `admissions.manage` | Penerimaan | Pipeline Pendaftar, Application Detail, Enrollment Queue |
| `finance.manage` | Keuangan | Dashboard Keuangan, Tagihan, Pembayaran, Pengeluaran/Kas, Laporan |
| `student_affairs.manage` | Kesantrian | Santri Directory, Perizinan, Catatan Kesantrian, Lifecycle Request |
| `assets.manage` | Sarpras/Peminjaman | Inventaris, Peminjaman Alat, Maintenance |
| `general_admin.manage` | Administrasi Umum | Surat & Dokumen Administrasi |

Satu staf boleh mendapat beberapa capability. Capability lain tidak muncul di sidebar dan direct URL harus ditolak backend.

## Page registry + CRUD

| Page | Route | Entity | CRUD / action |
|---|---|---|---|
| O01 Staff Home | `/office` | task queue | R task sesuai capability |
| O02 Pipeline Pendaftar | `/office/admissions` | application | C manual application; R/U; cancel/withdraw, bukan hard delete |
| O03 Application Detail | `/office/admissions/:id` | profile, documents, review, interview, decision | R/U corrected fields with audit; verify docs; C/U review/interview; decision by policy |
| O04 Enrollment Queue | `/office/enrollment` | registration, placement | R/U registration; C placement/enrollment; transfer after enrollment is controlled |
| O05 Finance Dashboard | `/office/finance` | finance summary | R only |
| O06 Tagihan | `/office/finance/bills` | bill, bill items | C/R/U draft; delete draft only; finalized bill -> cancel/adjust |
| O07 Pembayaran & Kwitansi | `/office/finance/payments` | payment, receipt | C/R; posted payment immutable; correction/reversal as new record |
| O08 Pengeluaran/Kas | `/office/finance/expenses` | expense | C/R/U draft; posted -> reversal/correction, not delete |
| O09 Laporan Keuangan | `/office/finance/reports` | report | generate/read/export |
| O10 Santri Directory | `/office/students` | student-affairs profile | R/U kesantrian fields only |
| O11 Perizinan Santri | `/office/students/leave` | leave permit | C/R/U; cancel before active; confirm return/close |
| O12 Catatan Kesantrian | `/office/students/:id/notes` | restricted note | C/R; controlled correction/archive; audited |
| O13 Lifecycle Request | `/office/students/:id/lifecycle` | lifecycle request | C/R/U/cancel while DRAFT; approval by Pimpinan |
| O14 Inventaris Alat | `/office/assets` | asset, category | C/R/U; archive/write-off instead of hard delete with history |
| O15 Peminjaman Alat | `/office/assets/loans` | asset loan | C/R/U; checkout, return, overdue, damage; cancel before checkout |
| O16 Maintenance | `/office/assets/maintenance` | maintenance ticket | C/R/U; cancel/archive preserving history |
| O17 Surat & Dokumen | `/office/documents` | admin document | C/R/U/archive; files private |

## O01 - Staff Home

```text
+----------------------+---------------------------------------------------------+
| STAFF PORTAL         | Halo, Nisa                                              |
| Home                 | Capabilities: Keuangan • Sarpras                        |
| Penerimaan*          |---------------------------------------------------------|
| Keuangan*            | Tasks                                                   |
| Kesantrian*          | 7 pembayaran belum dicatat                              |
| Sarpras*             | 3 alat overdue • 1 maintenance due                      |
| Administrasi Umum*   | (* hanya muncul bila capability dimiliki)                |
+----------------------+---------------------------------------------------------+
```

## Penerimaan

### O02 - Pipeline Pendaftar

```text
+--------------------------------------------------------------------------------+
| PIPELINE PENDAFTAR                                                             |
| [Periode v] [Status v] [Kelengkapan v] [Search nama/NIK/email/utusan]           |
|--------------------------------------------------------------------------------|
| New 18 | Incomplete 9 | Documents 6 | Screening 12 | Interview 7              |
|--------------------------------------------------------------------------------|
| Nama    Utusan dari     Kelengkapan    Status       Owner           [Open]      |
+--------------------------------------------------------------------------------+
```

### O03 - Application Detail

```text
+--------------------------------------------------------------------------------+
| Ahmad Rizal • SCREENING • #PMMI-26-0042                                        |
| [Identitas] [Keluarga/Wali] [Kesehatan] [Latar Rumah] [Kecakapan] [Dokumen]    |
| [Seleksi] [Audit]                                                              |
|--------------------------------------------------------------------------------|
| Sensitive NIK/KK/health/background fields masked by default.                    |
| Next legal action: Verify / Schedule Interview / Decision                       |
+--------------------------------------------------------------------------------+
```

Admission detail must represent the actual form groups: identity, parents/family, guardian, health, home background, skills/achievements, motivation, and documents. Sensitive fields are not visible to unrelated staff/Ustadz/Santri.

### O04 - Enrollment Queue

```text
+--------------------------------------------------------------------------------+
| ENROLLMENT QUEUE                                                               |
| Ready 14 • Blocked 3 • Enrolled 74                                             |
|--------------------------------------------------------------------------------|
| Ahmad • ACCEPTED • biodata✓ docs✓ registration✓ • Jalur belum ditetapkan       |
| [Review]                                                                        |
|--------------------------------------------------------------------------------|
| Placement: Jalur [Konten Kreator v]   Cohort [2026-A v]                        |
| Resource preview: account + AI wallet/API eligibility + agent slot + storage    |
| [Enroll & Provision]                                                           |
+--------------------------------------------------------------------------------+
```

The supplied admission form does not ask Jalur. Therefore Jalur placement is a separate controlled step until pondok policy specifies a different placement moment.

## Keuangan

The finance module is **administrative finance recording**, not an assumption that PMMI already has full double-entry accounting.

### O06 - Tagihan

```text
+--------------------------------------------------------------------------------+
| TAGIHAN                                                   [+ Buat Tagihan]       |
| Santri | Category | Amount | Due | Status | [Open]                              |
|--------------------------------------------------------------------------------|
| DRAFT: editable                                                                  |
| FINALIZED: amount/history immutable; correction through cancel/adjustment       |
+--------------------------------------------------------------------------------+
```

### O07 - Pembayaran & Kwitansi

```text
+--------------------------------------------------------------------------------+
| PEMBAYARAN                                               [+ Catat Pembayaran]   |
| Search santri -> pilih tagihan -> amount -> method -> reference -> receipt      |
|--------------------------------------------------------------------------------|
| Posted payment tidak boleh hard delete.                                         |
| Salah input -> [Create Correction / Reversal]                                   |
+--------------------------------------------------------------------------------+
```

### O08 - Pengeluaran / Kas

```text
+--------------------------------------------------------------------------------+
| PENGELUARAN / KAS                                         [+ Catat]             |
| Date | Category | Payee | Amount | Status | Evidence | [Open]                   |
| Draft -> Review/Approval if threshold -> Posted                                  |
+--------------------------------------------------------------------------------+
```

## Kesantrian

### O10 - Santri Directory

```text
+--------------------------------------------------------------------------------+
| KESANTRIAN                                                                     |
| [Search] [Jalur] [Cohort] [Lifecycle]                                           |
| Ahmad • Konten Kreator • ACTIVE • izin 0 • [Open]                              |
+--------------------------------------------------------------------------------+
```

### O11 - Perizinan Santri

```text
+--------------------------------------------------------------------------------+
| PERIZINAN SANTRI                                           [+ Buat Izin]        |
| Ahmad • 12 Aug 08:00 -> 18:00 • reason ... • APPROVED                          |
| Request -> review -> approved/rejected -> return confirmed                     |
+--------------------------------------------------------------------------------+
```

The exact izin taxonomy is a proposed operational model and must be finalized with pondok SOP before implementation.

### O12 - Restricted Notes

```text
+--------------------------------------------------------------------------------+
| CATATAN KESANTRIAN - Ahmad                                                     |
| [Filter type] [+ Tambah Catatan]                                                |
| 10 Aug • Pembinaan • ... • Staff Nisa                                           |
| Visibility: Kesantrian / Pimpinan only                                          |
+--------------------------------------------------------------------------------+
```

These notes are not general academic comments and must not automatically appear to Ustadz/Santri.

### O13 - Lifecycle Request

```text
+--------------------------------------------------------------------------------+
| LIFECYCLE REQUEST                                                              |
| Current ACTIVE -> Requested SUSPENDED                                           |
| Reason [.................................................................]      |
| Impact: login / academic / AI / API keys / Hermes / notifications              |
| Communication draft [....................................................]      |
| [Submit for Pimpinan Approval]                                                  |
+--------------------------------------------------------------------------------+
```

## Sarpras & Peminjaman

### O14 - Inventaris

```text
+--------------------------------------------------------------------------------+
| INVENTARIS ALAT                                            [+ Tambah Aset]       |
| [Category: Camera v] [Status v] [Search barcode/serial/name]                   |
| Canon R10 • CAM-001 • AVAILABLE • Studio [Open]                                |
+--------------------------------------------------------------------------------+
```

### O15 - Peminjaman

```text
+--------------------------------------------------------------------------------+
| PEMINJAMAN ALAT                                           [+ Peminjaman]        |
| Borrower [Search] • Asset [Scan/Search] • Due [date/time]                       |
|--------------------------------------------------------------------------------|
| Ahmad • Canon R10 • due 18:00 • CHECKED OUT [Return]                           |
| Fulan • Tripod • OVERDUE • CHECKED OUT [Open]                                  |
+--------------------------------------------------------------------------------+
```

### O16 - Maintenance

```text
+--------------------------------------------------------------------------------+
| MAINTENANCE                                               [+ Ticket]            |
| Canon R10 • sensor clean • IN PROGRESS • vendor ... [Open]                     |
| Issue -> diagnosis -> cost -> completed -> asset AVAILABLE                     |
+--------------------------------------------------------------------------------+
```

## Administrasi Umum

### O17 - Surat & Dokumen

```text
+--------------------------------------------------------------------------------+
| SURAT & DOKUMEN ADMINISTRASI                               [+ Record]            |
| Incoming / Outgoing / Internal / Agreement                                     |
| Number | Date | Subject | Counterparty | Access | [Open]                        |
+--------------------------------------------------------------------------------+
```

Taxonomy and retention rules for general administration remain a pondok SOP item; the UX spec only reserves the capability and workflow boundary.
