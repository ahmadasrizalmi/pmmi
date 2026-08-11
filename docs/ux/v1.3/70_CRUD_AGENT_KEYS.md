# PMMI UX v1.3 - CRUD, Agent & API Key

## CRUD sederhana per panel

CRUD tidak perlu tampil sebagai istilah CRUD di UI. User cukup mendapat tombol sesuai pekerjaan.

| Panel | Create | Read | Update | Delete/Arsip/Koreksi |
|---|---|---|---|---|
| System Admin | akun, API key, koneksi/config tertentu | semua status sistem sesuai wewenang | akun/hak akses/model/koneksi | revoke key, nonaktifkan akun, arsip agent; audit tidak dihapus |
| Pimpinan | umumnya laporan | seluruh ringkasan yang diizinkan | approve/reject | tidak hard-delete transaksi/history |
| Staff Penerimaan | pendaftar manual, interview/review | pendaftar | biodata/review/state sesuai aturan | cancel/withdraw; dokumen/history tidak silent delete |
| Staff Keuangan | tagihan, pembayaran, pengeluaran | transaksi/laporan | draft | posted record dikoreksi/reversal, bukan delete |
| Staff Kesantrian | izin, catatan, lifecycle request | santri restricted | data kesantrian/izin | archive/cancel sesuai state |
| Staff Sarpras | alat, peminjaman, maintenance | inventaris/history | asset/loan/maintenance | archive/write-off/cancel, bukan hapus history |
| Ustadz | sesi, absensi, tugas, materi, grade/revisi/feature | assigned classes | objects yang diampu | cancel/archive; grade history auditable |
| Santri | submission, agent, Developer Key | data sendiri | submission draft/revisi, agent setup, akun | archive agent, revoke key, hapus file sebelum submit sesuai aturan |

## Agent Wizard v1.3 - simple surface, complete backend

User hanya melihat 6 langkah:

1. **Nama & Tujuan** - nama agent dan untuk apa.
2. **Kepribadian** - guided editor yang menghasilkan `SOUL.md`.
3. **Hubungkan Chat** - Telegram atau WhatsApp.
4. **Pilih AI** - user memilih pilihan sederhana; PMMI otomatis membuat **Agent Key** dan memasangnya ke profile Hermes.
5. **Tempat Kerja** - pilih/buat workspace dan verifikasi home chat (`/sethome`) di belakang alur bantuan.
6. **Cek & Aktifkan** - PMMI mengetes channel, AI, workspace, safety lalu agent siap.

Yang disembunyikan dari user normal: key hash, internal scopes, path config, detail proses internal, secret layanan, status teknis. Semua tetap ada di backend/audit dan hanya System Admin melihat detail jika diperlukan.

## Developer Key v1.3

`API untuk Proyek` adalah halaman terpisah dari `Agen AI`. Ini hanya untuk project/coding yang memang membutuhkan API.

- Base URL: `https://ai.pondokmultimedia.id/v1`.
- User dapat create / rotate / revoke **Developer Key**.
- Secret hanya terlihat sekali.
- Agent Hermes **tidak** memakai Developer Key; setiap agent mendapat Agent Key sendiri yang dibuat otomatis.

## Definition of Done untuk frontend

1. Sidebar tiap panel mengikuti jumlah menu pada panel map, bukan semua page.
2. Detail page tidak muncul sebagai menu sidebar.
3. Tidak ada raw UUID atau JSON di normal UI.
4. Tidak ada istilah teknis internal di halaman utama non-teknis.
5. Tidak ada Chat AI sebagai core Santri page.
6. Agent wizard memakai 6 langkah sederhana, tetapi semua backend checks tetap wajib.
7. Developer Key dan Agent Key tidak pernah dicampur.
8. Staff hanya melihat modul sesuai tugasnya.
9. Pimpinan tidak melihat API secret atau detail server.
10. Browser E2E harus menguji flow per panel dan hak akses.
