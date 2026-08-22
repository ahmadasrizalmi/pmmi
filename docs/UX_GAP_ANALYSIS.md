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
