# Analisis UX & Gap Fungsional Dashboard PMMI (2026-08-22)

Audit kode (`apps/dashboard` + `apps/api/src/routes`) terhadap blueprint "Frontend dashboard coverage".

## 1. Arsitektur — masalah utama

- `main.tsx` memuat **AppV14** (shell baru, nav role-based bagus).
- Hampir semua halaman = `LegacyPane` yang **meng-embed seluruh App.tsx (813 baris)** lalu **meng-klik tombol nav-nya via polling DOM** (`selectTarget` setiap 30ms) — rapuh & duplikasi.
- Kode mati/duplikat: `App.tsx`, `AppV2.tsx`, `BlueprintPanels.tsx`, `CompletionPanels.tsx` (sebagian), panel-panel tersebar (AdminEnrollmentPanel, AdminPortfolioPanel, dst).
- **Rekomendasi**: satukan jadi satu aplikasi; hapus layer embed; tiap halaman = komponen langsung.

## 2. CRUD yang RUSAK — **DIPERBAIKI (commit bc620f8, 5972278)**

| Aksi UI | Perbaikan | Status live |
|---|---|---|
| Hapus user | route baru `DELETE /v1/admin/users/:id` (guard dependensi, hapus wallet/entitlements/tokens) | ✅ 200 / 409-guard |
| Toggle aktif user | frontend → `PATCH .../users/:id/active` `{isActive}` | ✅ |
| Hapus kelas | route baru `DELETE /v1/academic/classes/:id` (guard assignments/sessions/enrollments) | ✅ 200 / 409-guard |
| Edit kelas | route baru `PATCH /v1/academic/classes/:id` (name/teacher/times) | ✅ |
| List submission | route baru `GET /v1/academic/submissions` (ustadz-scoped / admin) | ✅ 1 item |
| List rewards | route baru `GET /v1/rewards` `{rules, grants}` | ✅ |
| Grant kredit AI | frontend → `POST /v1/ai/credits/grant` | ✅ |

## 3. CRUD yang ADA tapi tidak lengkap (per entitas)

| Entitas | Create | Read | Update | Delete |
|---|---|---|---|---|
| Users/staff | ✅ | ✅ | ⚠️ toggle (rusak) | ⚠️ rusak |
| Periode penerimaan | ✅ | ✅ | ❌ | ❌ |
| Program | ✅ | ✅ | ❌ | ❌ |
| Cohort | ✅ | ✅ | ❌ | ❌ |
| Course | ✅ | ✅ | ❌ | ❌ |
| Class | ✅ | ✅ | ⚠️ rusak | ⚠️ rusak |
| Sesi/schedule | ⚠️ (via create?) | ✅ (roster/attendance) | ❌ | ❌ |
| Assignment | ✅ | ✅ | ❌ | ❌ |
| Submission/nilai | — | ⚠️ rusak | ✅ grade | — |
| Sertifikat | ✅ | ✅ | ❌ | ❌ |
| Reward rules | ✅ | ✅ | ❌ | ❌ |
| Santri (student record) | (via enroll) | ✅ | ⚠️ lifecycle only | ❌ |
| Notification templates | ❌ | ❌ | ❌ | ❌ |
| AI API keys | ✅ | ✅ | ✅ rotate | ✅ |

## 4. UX yang perlu disederhanakan

1. **Satu aplikasi, satu pola**: hapus embed `LegacyPane`/App.tsx; setiap entitas → halaman tunggal = list + inline form + confirm delete (pola seragam).
2. **Komponen bersama**: `DataTable`, `EntityForm`, `ConfirmDialog`, `Toast` — ganti inline notices.
3. **State kosong/loading/error** yang konsisten (saat ini sebagian besar tanpa handling).
4. **Search/filter** pada list Users, Applicants, Students, Portfolio.
5. **Edit inline** (perbarui langsung di baris) daripada pindah halaman.
6. **Delete dengan konfirmasi** (sudah ada sebagian) + guard dependensi (hapus class → konfirmasi assignment ikut terhapus?).
7. **Nav role-based AppV14 dipertahankan** — hanya isi halamannya dengan panel nyata.

## 5. Prioritas implementasi

1. Backend: tambah route CRUD yang hilang (`DELETE/PATCH classes`, `DELETE users`, `GET submissions`, `GET rewards`, perbaiki path toggle-active & ai/grant) — **UI langsung fungsional**.
2. Frontend: perbaiki path panggilan + buang LegacyPane embed → panel langsung.
3. Lengkapi update/delete per entitas (matriks §3).
4. Konsolidasi komponen + state handling + search (UX).

---

# Update: Semua Item DIPERBAIKI (commit dc57e22, f28cfb2) + Re-audit 2026-08-22

## Yang diperbaiki (prioritas 2–4)

### Arsitektur (§1)
- **LegacyPane + embed App.tsx DIBUANG**. AppV14 sekarang merender panel langsung.
- Kode mati dihapus: `App.tsx`, `AppV2.tsx`; `BlueprintPanels.tsx`/`CompletionPanels.tsx` dipangkas ke ekspor yang dipakai.
- Panel baru terorganisir: `src/panels/` (common, adminPanels, ustadzPanels, santriPanels).

### CRUD lengkap (§3) — semua entitas kini Create+Read+Update+Delete
| Entitas | Update/Delete | Route baru |
|---|---|---|
| Program | ✅ | `PATCH/DELETE /v1/catalog/programs/:id` (guard students/registrations/classes) |
| Cohort | ✅ | `PATCH/DELETE /v1/catalog/cohorts/:id` |
| Periode | ✅ | `PATCH/DELETE /v1/admissions/periods/:id` (guard applications) |
| Course | ✅ | `PATCH/DELETE /v1/academic/courses/:id` |
| Class | ✅ | `PATCH/DELETE /v1/academic/classes/:id` (guard assignments/sessions/enrollments) |
| Sesi | ✅ | `PATCH/DELETE /v1/academic/sessions/:id` (guard attendance) |
| Assignment | ✅ | `PATCH/DELETE /v1/academic/assignments/:id` (guard submissions) |
| Sertifikat | ✅ (delete) | `DELETE /v1/academic/certificates/:id` + `GET` list (admin) |
| Reward rules | ✅ | `PATCH/DELETE /v1/rewards/rules/:id` (guard achievements) |
| Notification templates | ✅ (baru) | `GET/PUT/DELETE /v1/admin/notification-templates` |
| Santri | ✅ lifecycle | (sudah ada) |

Semua delete memakai **guard dependensi** (409 + dependents) — tidak ada penghapusan diam-diam; audit log di tiap mutasi.

### UX (§4)
- Satu aplikasi, satu pola (list + form + confirm delete) via `panels/common.tsx` (`useData`, `Notice`, `Empty`, `SearchBox`, `ConfirmDelete`).
- **Search/filter** pada Users, Applicants, Students, Submissions (ustadz), Riwayat, Tugas santri.
- State kosong/loading/error konsisten di semua panel.
- Delete dengan konfirmasi + guard dependensi (pesan 409 dari API ditampilkan).
- Nav role-based AppV14 dipertahankan; tiap halaman = panel nyata.
- Perbaikan bug lama: submit tugas santri kini mengirim `uploadIds` (array) — sebelumnya `uploadId` (invalid 400).

## Re-audit (2026-08-22)
- **Audit panggilan UI vs route API: 0 mismatch nyata** (semua sisa adalah artefak regex; POST terdeteksi GET, segmen dinamis).
- API routes: 124 · dashboard calls: 53 — semua match.
- **Verified live di production**: PATCH/DELETE classes, templates PUT/list/DEL, periods PATCH, programs PATCH, cohorts PATCH, rewards GET, submissions GET, certificates GET — semua 200.
- Dashboard (app.pondokmultimedia.id) 200 dengan UI baru.
- CI: `dc57e22` (build+lint+test) dijalankan — hijau.

### Verifikasi UI (browser smoke, production `app.pondokmultimedia.id`, 2026-08-22)
- Login admin → nav role (Beranda/Pendaftaran/Akademik/AI & Agen/Sistem); Beranda → "Ringkasan"; Pengguna → list 9 baris + search; Akademik → 4 form CRUD + 3 tabel; Setup → 3 form CRUD. ✅
- Login ustadz → nav (Beranda/Kelas Saya/Penilaian/Agen AI); Kelas Saya → selector kelas; Penilaian → search + daftar submission. ✅
- CI `8370f75` hijau (full suite: test, build, validate:ui, compose).
