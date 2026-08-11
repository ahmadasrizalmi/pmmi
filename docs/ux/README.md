# PMMI UX Wireframe v1

> **Status:** source-of-truth untuk redesign frontend setelah audit UX `main`.
>
> Backend/domain implementation tidak otomatis berarti UX selesai. Frontend baru dinyatakan sesuai blueprint jika page hierarchy, task flow, dan acceptance criteria di dokumen ini terpenuhi.

## Problem yang diperbaiki

- Hilangkan pola **developer UI**: input UUID, JSON dump, dan mega-form.
- Gunakan **task-first information architecture**: user datang untuk menyelesaikan pekerjaan, bukan membuka endpoint.
- Setiap workflow stateful memakai pola **queue -> detail -> action -> confirmation -> resulting state**.
- Relationship seperti santri, ustadz, course, class, program, cohort selalu memakai search/select kontekstual.
- Async job seperti notification/Hermes selalu menampilkan queued/running/success/failed.
- Lifecycle, publish/unpublish, dan archive membutuhkan reason/impact confirmation sesuai risk.

## Dokumen

- [Shared pages](./SHARED.md)
- [Public + Applicant](./PUBLIC_APPLICANT.md)
- [Admin](./ADMIN.md)
- [Ustadz](./USTADZ.md)
- [Santri](./SANTRI.md)
- [UX Acceptance & Implementation Order](./UX_ACCEPTANCE.md)

## Navigation

### Admin
- **Beranda:** Overview
- **Penerimaan:** Pipeline Pendaftar, Setup Penerimaan, Daftar Ulang & Enrollment
- **Orang:** Santri, Staff & Ustadz
- **Akademik:** Course & Kelas, Sertifikat
- **AI & Agent:** AI Credits & Usage, Rewards, Hermes Agents
- **Konten:** Portfolio Manager
- **Operasional:** Notifikasi, Audit Log, Ops & Backup

### Ustadz
- **Beranda:** Overview
- **Mengajar:** Kelas Saya, Jadwal & Sesi, Tugas
- **Review:** Submission Masuk, Penilaian
- **Publikasi:** Featured Portfolio
- **Akun:** Notifikasi, Profil

### Santri
- **Beranda:** Hari Ini
- **Belajar:** Tugas, Jadwal, Nilai & Feedback, Sertifikat & Achievement
- **AI:** AI Workspace, AI Agents
- **Akun:** Notifikasi, Profil

## Global layout rules

- Desktop: sidebar 240-272px + sticky topbar + content max-width.
- Admin desktop-first; Ustadz tablet-friendly; Santri mobile-first.
- Page header = breadcrumb, title/context, status, primary CTA.
- No raw UUID / JSON untuk normal user.
- Dangerous action = reason + impact preview + confirmation.
- Loading menggunakan skeleton; empty/error state punya penjelasan dan next action.
