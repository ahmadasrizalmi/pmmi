# **PMMI DIGITAL CAMPUS**

## *Blueprint Platform Pondok Serbaguna — Version 1.2*

## *Academic Management • AI Gateway • Hermes Agent Workspaces • Portfolio*

## 

| Tujuan dokumen  Menjadi acuan implementasi teknis dan produk untuk mengembangkan repo \`ahmadasrizalmi/pmmi\` menjadi platform internal-eksternal PMMI yang berjalan terutama di home server pondok. |
| :---- |

| Parameter | Keputusan awal |
| :---- | :---- |
| Domain utama | pondokmultimedia.id |
| Public frontend | pondokmultimedia.id |
| Dashboard aplikasi | app.pondokmultimedia.id |
| AI gateway | ai.pondokmultimedia.id |
| Database | PostgreSQL di home server |
| AI routing | 9Router yang sudah tersedia |
| Agent runtime | Hermes Agent yang sudah terpasang; tidak install ulang per user |
| Compute target | Intel i5 Gen 2, RAM 16 GB |
| Storage target | SSD 256 GB \+ HDD 500 GB |
| Dokumen | Blueprint v1.0 — 11 Agustus 2026 |

Status dokumen: blueprint implementasi komprehensif v1.2 berdasarkan kondisi aktual home server. Ubuntu Server, Tailscale, PostgreSQL, MinIO, Immich, dan Docker sudah tersedia; 9Router dan Hermes Agent belum diinstal. Versi ini menambahkan Admission & Enrollment Lifecycle serta Multi-Channel Notification Engine end-to-end.

# **1\. Visi Produk**

PMMI Digital Campus adalah satu platform untuk mengelola operasional akademik pondok sekaligus menyediakan infrastruktur AI yang terukur untuk admin, pengajar, santri aktif, alumni, dan publik.

| Prinsip inti  Satu identitas, satu database utama, satu instalasi Hermes, satu AI gateway; resource dan hak akses dibedakan berdasarkan role serta lifecycle santri. |
| :---- |

## **Sasaran utama**

* Dashboard administrasi untuk data santri, pengajar, kelas, nilai, sertifikat, reward, AI, agent, audit, dan kesehatan sistem.  
* Dashboard pengajar untuk kelas, tugas, submission, penilaian, feedback, dan pemilihan karya featured.  
* Dashboard santri untuk tugas, nilai, sertifikat, portfolio, saldo AI, histori penggunaan, dan pembuatan Hermes agent profile.  
* AI Gateway internal yang memberi credit/quota per user dan meneruskan request ke 9Router.  
* Hermes Agent Builder yang membuat profile/workspace baru dari instalasi Hermes yang sama, bukan container/instalasi Hermes baru.  
* Public portfolio di pondokmultimedia.id yang otomatis menampilkan karya yang di-featured oleh pengajar/admin tanpa persetujuan tambahan dari santri.

## **Non-goals awal**

* Menjalankan container Hermes terpisah untuk setiap user.  
* Menyimpan seluruh file tugas sebagai BLOB di PostgreSQL.  
* Membuat AI model hosting lokal besar di server i5 Gen 2\.  
* Menjamin akses alumni ke compute aktif tanpa kebijakan quota khusus.

# **2\. Topologi Domain & Aplikasi**

| Internet / LAN Pondok         |         \+-- pondokmultimedia.id       \-\> Public website \+ portfolio         \+-- app.pondokmultimedia.id   \-\> Login \+ dashboard role-based         \+-- ai.pondokmultimedia.id    \-\> OpenAI-compatible AI Gateway API                                       \-\> internal only / authenticated Home Server   Reverse Proxy / TLS         |         \+-- PMMI Web/API         \+-- PostgreSQL         \+-- Hermes installation         \+-- 9Router         \+-- File storage (SSD hot \+ HDD archive)         \+-- Backup jobs / audit logs |
| :---- |

Semua service sebaiknya tetap berada di balik reverse proxy. Endpoint administratif Hermes, PostgreSQL, dan 9Router tidak diekspos langsung ke internet.

# **3\. Role & Hak Akses**

| Role | Akses utama | Batasan penting |
| :---- | :---- | :---- |
| Super Admin | System settings, user lifecycle, quota, agent policies, audit, backup status | Jumlah akun sangat terbatas; MFA sangat disarankan |
| Admin Akademik | Santri, pengajar, angkatan, kelas, sertifikat, laporan | Tidak perlu akses shell/server |
| Pengajar / Ustadz | Kelas, tugas, submission, nilai, feedback, featured portfolio | Tidak mengubah credit global kecuali diberi permission reward |
| Santri Aktif | Belajar, upload tugas, nilai, sertifikat, AI credit, agent workspace | Quota compute/storage/AI dibatasi |
| Alumni | Profil, riwayat nilai, sertifikat, portfolio, arsip tertentu | Workspace Hermes default dihentikan; AI credit default 0 |
| DO / Inaktif | Akun ditutup atau read-only sesuai kebijakan administrasi | Tidak ada compute, AI, upload, atau agent aktif |
| Public | Halaman informasi dan portfolio featured | Tidak dapat melihat nilai/submission/private profile |

## **Model authorization**

Gunakan RBAC (role-based access control) plus permission granular untuk tindakan sensitif seperti grant credit, membuat agent slot, publish/unpublish portfolio, dan melihat audit log.

# **4\. Lifecycle Santri: Aktif, Alumni, dan DO**

| Alasan desain  Lifecycle bukan hanya label akademik. Ia harus otomatis mengubah resource policy agar server kecil tetap stabil. |
| :---- |

| Status | Akun | Hermes | AI Credit | Storage | Portfolio |
| :---- | :---- | :---- | :---- | :---- | :---- |
| AKTIF | Full login | Agent/workspace aktif sesuai slot | Bulanan \+ reward | Hot storage di SSD; overflow ke HDD | Bisa featured |
| ALUMNI | Login read-mostly | Default STOP \+ archive workspace | Default 0; dapat grant khusus | Submission lama dipindah ke HDD/archive | Tetap tampil jika featured |
| DO / INAKTIF | Disabled atau read-only admin | STOP, lalu archive/delete sesuai retention | 0 | Dipindah ke archive; hapus data non-esensial setelah retention | Unpublish by policy/admin decision |
| GRADUATED PENDING | Sementara sebelum alumni final | Grace period pendek | Sisa credit dapat expire | Proses archival | Featured tetap berjalan |

## **Transisi otomatis yang disarankan**

1\. Saat santri dinyatakan lulus: status menjadi GRADUATED\_PENDING selama 14–30 hari.

2\. Setelah grace period: agent dihentikan, workspace dikompresi, metadata tetap di PostgreSQL, file dipindahkan ke HDD.

3\. Saldo AI reguler kadaluarsa; reward khusus dapat dipertahankan jika kebijakan PMMI menghendaki.

4\. Akun berubah ALUMNI dengan akses read-only pada nilai/sertifikat/portfolio dan fitur komunitas yang kelak ditambahkan.

5\. Saat status DO: access token dicabut segera, AI credit dinolkan, job aktif dibatalkan, workspace masuk quarantine/archive sebelum retention berakhir.

# **5\. Strategi Resource untuk Home Server**

Dengan i5 Gen 2 dan RAM 16 GB, bottleneck utama bukan PostgreSQL tetapi proses agent paralel, file growth, indexing/logging berlebihan, serta cache/container yang tidak dibatasi. Platform harus dirancang dengan prinsip queue \+ limits.

| Resource | Kebijakan v1 |
| :---- | :---- |
| RAM | Sisakan 3–4 GB untuk OS/cache. PostgreSQL konservatif. Hermes agent jobs dibatasi concurrency. |
| CPU | Jangan menjalankan banyak build/job bersamaan. Gunakan job queue dengan concurrency awal 1–2. |
| SSD 256 GB | OS, app, PostgreSQL, current semester metadata/cache, file tugas aktif yang sering diakses. |
| HDD 500 GB | Archive submission, workspace alumni/DO terkompresi, certificate exports, backup lokal terjadwal. |
| Logs | Retention pendek untuk verbose logs (mis. 7–14 hari); usage aggregate disimpan lebih lama. |
| Uploads | Per-file dan per-user quota; kompres image/video preview; file video besar sebaiknya dibatasi atau dipindah storage eksternal. |
| Backups | Database dump \+ config \+ critical files. Backup bukan di disk yang sama saja; perlu salinan eksternal/offsite. |

## **Baseline quota awal yang aman diuji**

| Item | Santri aktif | Pengajar | Alumni |
| :---- | :---- | :---- | :---- |
| Hermes agent slots | 1 default; max 2–3 via reward | 2–5 | 0 default |
| Agent job concurrency | 1 per user, global queue | 1 per user | 0 |
| Workspace soft quota | 0.5–1 GB | 1–2 GB | Archive only |
| Upload soft quota / semester | 1–3 GB | 2–5 GB | No new upload |
| AI credit | Configurable monthly | Lebih tinggi | 0 default |

Angka tersebut adalah baseline operasional untuk server saat ini, bukan limit permanen. Setelah 2–4 minggu, tune berdasarkan telemetry nyata.

# **6\. Modul Produk**

| Modul | Fitur v1 |
| :---- | :---- |
| Identity & Access | Login, reset password, role, permission, session, audit |
| Academic | Angkatan, kelas, course, enrollment, assignment, submission, grade, feedback |
| Certificate | Template, eligibility, issue, verification code/URL, PDF record |
| Portfolio | Project dari submission/manual, media, featured flag, publish/unpublish, public slug |
| AI Wallet | Credit balance, ledger, grants, expiry, usage, model policy |
| AI Gateway | Auth, quota check, model allowlist, 9Router forwarding, metering, rate limit |
| Hermes Builder | Profile template, workspace provisioning, build/start/stop/archive, job logs |
| Reward | Reward definitions, achievements, grant AI credit/agent slots/badges |
| Operations | Server health, storage usage, queue depth, service status, backup status |

# **7\. Workflow Akademik & Portfolio**

## **Workflow tugas dan penilaian**

| Pengajar membuat Assignment         |         v Santri upload Submission         |         v Pengajar review \-\> nilai \+ feedback         |         \+--\> revisi (opsional)         |         \+--\> final grade                 |                 \+--\> reward (opsional)                 \+--\> featured portfolio (opsional) |
| :---- |

## **Workflow featured portfolio yang disepakati**

| Project / Submission Santri         | Dinilai pengajar (mis. 92\)         | Pengajar/Admin klik FEATURED         | Sistem membuat / memperbarui PortfolioProject         | Langsung publish ke pondokmultimedia.id/portfolio Tidak ada langkah persetujuan santri. |
| :---- |

| Governance  Walaupun tidak memerlukan persetujuan santri, sistem tetap harus menyimpan audit trail: siapa yang mem-feature, kapan dipublish, sumber submission, dan siapa yang melakukan unpublish. |
| :---- |

Public portfolio sebaiknya menampilkan nama santri sesuai kebijakan pondok, angkatan, kategori/jalur, thumbnail, deskripsi, skill/tags, dan link/project media yang diizinkan. Data privat seperti nilai lengkap dan feedback tidak ikut dipublikasi.

# **8\. Model Data Inti**

## **Tabel inti yang direkomendasikan**

| users roles / permissions / user\_roles student\_profiles / teacher\_profiles cohorts courses / classes / enrollments assignments / submissions / submission\_files grades / grade\_feedback certificates portfolio\_projects / portfolio\_assets ai\_wallets / ai\_credit\_ledger / ai\_usage\_logs / ai\_policies hermes\_profiles / hermes\_workspaces / hermes\_jobs / hermes\_templates rewards / reward\_grants / achievements files / storage\_objects audit\_logs / system\_events |
| :---- |

## **Field lifecycle penting**

| Entity | Field yang wajib |
| :---- | :---- |
| student\_profiles | status, joined\_at, graduated\_at, dropped\_out\_at, lifecycle\_reason |
| ai\_credit\_ledger | user\_id, amount, type, reason, expires\_at, reference\_type/id, created\_by |
| hermes\_workspaces | owner\_id, profile\_id, path, state, quota\_bytes, archived\_at |
| portfolio\_projects | owner\_id, source\_submission\_id, featured\_by, featured\_at, published\_at, status |
| files | owner\_id, storage\_tier, path/key, size, mime\_type, checksum, retention\_class |

# **9\. AI Gateway & Credit System**

PMMI AI Gateway menjadi satu-satunya jalur aplikasi PMMI menuju 9Router. User tidak perlu menerima master credential 9Router.

| Client / Hermes Agent       |       v ai.pondokmultimedia.id/v1/\*       |       \+-- verify app/user token       \+-- resolve AI policy       \+-- check wallet / quota       \+-- rate limit       \+-- forward to 9Router       \+-- capture usage / cost units       \+-- debit ledger       v 9Router \-\> upstream model/provider |
| :---- |

## **Desain credit**

* Gunakan ledger immutable; balance adalah hasil agregasi, bukan angka yang diedit tanpa histori.  
* Credit dapat memiliki expiry date (mis. quota bulanan) atau non-expiring reward.  
* Reward dapat berupa AI credit, agent slot, badge, atau kenaikan limit tertentu.  
* Model policy dapat berbeda: santri default hanya model ekonomis, pengajar/admin dapat model premium sesuai budget.  
* Gateway wajib mengembalikan error yang jelas jika saldo habis, model tidak diizinkan, atau rate limit tercapai.

## **Metering**

Jika 9Router menyediakan token/cost usage di response, jadikan itu sumber metering utama. Jika tidak, gateway menghitung estimasi unit dan menyimpan raw metadata yang diperlukan untuk rekonsiliasi. Kontrak API 9Router aktual harus diverifikasi sebelum implementasi.

# **10\. Hermes Agent Builder**

| Aturan utama  Tombol “Build Agent” tidak menginstall Hermes dan tidak membuat Docker Hermes baru. Ia hanya melakukan provisioning profile/workspace terpisah pada instalasi Hermes yang sudah ada. |
| :---- |

| Santri klik BUILD AGENT         |         \+-- cek status \= AKTIF         \+-- cek agent slot         \+-- cek storage quota         \+-- create hermes\_profiles row         \+-- enqueue hermes\_job(PROVISION)                    |                    v           server-side worker                    |         \+-- create workspace directory         \+-- copy / render profile template         \+-- attach PMMI AI Gateway credential         \+-- set ownership / permissions         \+-- validate profile         \+-- mark READY |
| :---- |

## **State machine yang disarankan**

REQUESTED → PROVISIONING → READY → RUNNING/IDLE → STOPPED → ARCHIVED. Error state: FAILED dengan log ringkas dan retry terkontrol.

## **Isolasi minimum**

* Workspace directory unik per user/profile.  
* Config dan memory/state tidak dibagi antar user.  
* Credential AI yang dipakai Hermes adalah token scoped ke user/workspace, bukan master 9Router key.  
* Path traversal harus dicegah; nama folder dibuat dari internal UUID, bukan input user mentah.  
* Per-workspace disk quota/soft quota dan total agent slot diterapkan oleh PMMI.

# **11\. Storage Tiering & Retention**

| SSD (HOT)   \- PostgreSQL data   \- app/runtime   \- current active workspace   \- current semester frequently-used uploads HDD (WARM/ARCHIVE)   \- old submissions   \- compressed alumni/DO Hermes workspace   \- generated certificates / exports   \- local backup copy External/Offsite (BACKUP)   \- PostgreSQL dumps   \- critical config/secrets backup (encrypted)   \- selected portfolio originals / certificates |
| :---- |

| Data | Aktif | Alumni | DO |
| :---- | :---- | :---- | :---- |
| Nilai & akademik | Keep | Keep jangka panjang | Keep sesuai kebutuhan legal/akademik |
| Sertifikat | Keep | Keep | Keep jika pernah diterbitkan |
| Submission | Hot/Warm | Archive HDD | Archive lalu purge non-esensial sesuai retention |
| Hermes workspace | Hot | Compress \+ HDD | Quarantine/archive; purge setelah retention |
| AI raw logs | 7–14 hari detail | Tidak perlu detail lama | Tidak perlu detail lama |
| AI usage aggregate | Keep | Keep untuk laporan | Keep minimal audit |
| Portfolio featured | Public | Public tetap | Admin menentukan keep/unpublish |

Retention exact (mis. 90 hari, 1 tahun, dst.) sebaiknya menjadi konfigurasi admin, karena kebutuhan pondok dapat berubah.

# **12\. API & Service Boundaries**

| Area | Contoh endpoint |
| :---- | :---- |
| Auth | POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout |
| Academic | /api/classes, /api/assignments, /api/submissions, /api/grades |
| Portfolio | /api/portfolio, POST /api/portfolio/:id/feature, /public/portfolio/:slug |
| Wallet | GET /api/ai/wallet, GET /api/ai/ledger, POST /api/admin/ai/grants |
| Gateway | POST /v1/chat/completions atau kompatibel API 9Router/OpenAI |
| Hermes | POST /api/hermes/profiles, POST /:id/build, /start, /stop, /archive |
| Ops | GET /api/admin/system/health, /storage, /queues, /backups |

Untuk v1, arsitektur modular monolith lebih cocok daripada microservices. Satu backend dapat menangani domain akademik, wallet, portfolio, dan orchestration; AI Gateway/worker dapat dipisahkan proses bila perlu. Ini menghemat RAM dan kompleksitas deployment.

# **13\. Struktur Dashboard**

## **Admin**

* Overview & system health  
* Santri / pengajar / alumni / DO  
* Angkatan, kelas, course  
* Assignments & academic reports  
* Certificates  
* Portfolio moderation  
* AI wallets, grant/revoke/expiry, usage  
* Hermes profiles, queue, archived workspace  
* Rewards & achievements  
* Audit log & settings

## **Pengajar / Ustadz**

* Kelas saya  
* Buat tugas  
* Submission masuk  
* Nilai & feedback  
* Riwayat nilai  
* Featured portfolio  
* AI usage pribadi  
* Hermes agents pribadi  
* Reward yang boleh diberikan sesuai permission

## **Santri Aktif**

* Ringkasan kelas & tugas  
* Upload submission  
* Nilai & feedback  
* Sertifikat  
* AI credit balance & usage  
* Build/manage Hermes agent  
* Achievements/rewards  
* Portfolio saya

## **Alumni**

* Profil alumni  
* Transkrip/ringkasan nilai yang diizinkan  
* Sertifikat  
* Portfolio  
* Riwayat achievement  
* Tanpa agent compute dan AI credit secara default

# **14\. Security Baseline**

* TLS untuk domain publik/app/AI gateway; database dan Hermes control endpoint hanya private network.  
* Password di-hash modern; session/token rotation; MFA untuk super admin bila memungkinkan.  
* Rate limiting pada login, upload, AI gateway, dan agent build.  
* File upload divalidasi MIME, ukuran, extension; nama file server-side; jangan mengeksekusi upload.  
* AI/Gateway token scoped per user/workspace dan dapat dicabut.  
* RBAC plus audit log untuk grade changes, credit grants, lifecycle changes, featured portfolio, dan agent operations.  
* Secrets tidak masuk Git repository. Gunakan environment/secret file dengan permission ketat.  
* Backup dienkripsi bila disimpan offsite dan lakukan restore drill berkala.

| Penting  Karena home server akan mengelola data pendidikan dan akses AI, jangan mengekspos PostgreSQL, SSH, Hermes admin endpoint, atau 9Router master endpoint langsung melalui public DNS. |
| :---- |

# **15\. Observability & Operasional**

| Metric | Alert / tindakan |
| :---- | :---- |
| Disk SSD \> 75% | Pindahkan archive/cache; block upload besar jika mendekati kritis |
| Disk SSD \> 90% | Emergency mode; stop new Hermes provisioning |
| RAM pressure tinggi | Kurangi global agent concurrency; restart worker terkontrol bila leak |
| Queue depth | Tampilkan di admin; batasi request build berulang |
| PostgreSQL backup stale | Warning di dashboard admin |
| AI gateway error rate | Cek 9Router/upstream; jangan debit credit jika request gagal sebelum usage |
| Workspace quota exceeded | Stop write/build dan minta cleanup/admin grant |

# **16\. Roadmap Implementasi**

| Fase | Deliverable | Kriteria selesai |
| :---- | :---- | :---- |
| 0 — Audit | Audit repo, install Hermes/9Router, reverse proxy, storage mount | CLI/API dan path aktual terdokumentasi |
| 1 — Foundation | Backend, PostgreSQL schema, auth, RBAC, dashboard shell | Admin/pengajar/santri login dan role routing |
| 2 — Academic | Cohort, class, assignment, submission, grade, feedback | End-to-end tugas → nilai berjalan |
| 3 — Portfolio | Featured workflow \+ public dynamic portfolio | Ustadz feature → langsung muncul public |
| 4 — AI Wallet/Gateway | Ledger, policy, quota, 9Router proxy, usage | Debit benar dan over-quota diblok |
| 5 — Hermes Builder | Workspace profile provisioning \+ queue \+ states | Build membuat profile/workspace, bukan install Hermes |
| 6 — Lifecycle/Archive | Alumni/DO automation, storage tiering, cleanup | Resource turun saat status berubah |
| 7 — Certificates/Reward | Certificate issuance \+ reward engine | Prestasi dapat memberi credit/agent slot |
| 8 — Hardening | Backup restore, audit, monitoring, rate limit, security review | Siap dipakai operasional pondok |

Urutan ini sengaja menempatkan akademik sebelum AI/Hermes agar identitas, role, status santri, dan audit trail sudah stabil ketika resource berbayar/terbatas mulai diberikan.

# **17\. Keputusan Arsitektur v1**

| Keputusan | Pilihan |
| :---- | :---- |
| Aplikasi | Modular monolith \+ worker/queue ringan |
| Database | Satu PostgreSQL utama |
| Public \+ dashboard | Satu codebase boleh dipertahankan; route/domain dipisah secara deployment |
| File | Filesystem tiered SSD/HDD; metadata di PostgreSQL |
| Agent isolation | Profile/workspace per user di satu instalasi Hermes |
| AI access | PMMI AI Gateway → 9Router |
| Quota | Ledger credit \+ policy \+ expiry |
| Portfolio publishing | Featured oleh pengajar/admin \= publish langsung, tanpa approval santri |
| Lifecycle compute | Aktif=enabled; alumni=archived; DO=disabled/archive/purge by policy |

# **18\. Hal yang Harus Diverifikasi Sebelum Coding Integrasi**

1\. Hermes Agent BELUM terinstal. Saat fase AI Agent dimulai, instal satu Hermes Agent pada host dan gunakan Profiles untuk agent independen. Dokumentasi resmi menyatakan setiap profile memiliki config, API keys, memory, sessions, skills, cron, dan state sendiri; profile dapat dibuat/di-clone dari profile template.

2\. 9Router BELUM terinstal. Instalasi dilakukan setelah PMMI Core dan policy credit siap. Saat integrasi, verifikasi base URL, format usage response, authentication, model naming, fallback, serta metering yang tersedia pada versi 9Router yang dipasang.

3\. Kondisi aktual server: Ubuntu Server versi terbaru, Docker, Tailscale, PostgreSQL, MinIO, dan Immich sudah tersedia. Yang masih perlu diputuskan: reverse proxy, Linux service user Hermes, mount point final SSD/HDD, port map, backup target, dan resource limit container.

4\. Jumlah santri aktif/pengajar yang diperkirakan bersamaan serta ukuran tipikal tugas (gambar, video, source code).

5\. Kebijakan retention final untuk DO/alumni dan apakah portfolio DO harus otomatis unpublish atau tetap menjadi keputusan admin.

| Catatan  Blueprint ini tidak mengasumsikan detail Hermes/9Router yang belum diperiksa. Integrasi final harus mengikuti interface aktual di server agar tidak membangun orchestration yang keliru. |
| :---- |

# **19\. Definisi MVP**

MVP dianggap sukses jika satu alur nyata berikut bisa dilakukan dari awal sampai akhir:

| Admin membuat santri \+ pengajar \+ kelas         ↓ Pengajar membuat tugas         ↓ Santri upload tugas         ↓ Pengajar memberi nilai \+ feedback         ↓ Pengajar feature karya \-\> tampil di pondokmultimedia.id         ↓ Admin/pengajar memberi reward AI credit / agent slot         ↓ Santri menggunakan AI via PMMI Gateway \-\> 9Router         ↓ Santri klik Build Agent \-\> Hermes profile/workspace baru dibuat         ↓ Status santri menjadi ALUMNI \-\> agent stop & workspace diarsipkan |
| :---- |

Dengan alur ini, inti akademik, portfolio, reward, AI, Hermes, dan lifecycle server semuanya sudah tervalidasi dalam satu produk.

# **20\. Rekomendasi Langkah Berikutnya**

1\. Audit codebase \`pmmi\` secara menyeluruh dan petakan komponen public website yang dipertahankan.

2\. Audit home server aktual: inventaris container Docker, PostgreSQL database/user, MinIO bucket/policy, Immich resource usage, Tailscale ACL, port yang terpakai, mount SSD/HDD, reverse proxy, backup path, dan baseline RAM/CPU sebelum memasang 9Router/Hermes.

3\. Bekukan schema v1 dan permission matrix.

4\. Buat branch implementasi foundation dan jangan mengubah public landing secara destruktif.

5\. Bangun MVP secara fase, dengan telemetry resource sejak fase AI/Hermes.

| Arah produk  Nama kerja yang cocok: PMMI Digital Campus — platform operasional akademik \+ AI infrastructure \+ student portfolio untuk Pondok Multimedia Munzalan Indonesia. |
| :---- |

# 21\. Revisi v1.1 — Kondisi Aktual Infrastruktur

Blueprint v1.1 mengunci baseline server yang benar-benar sudah tersedia sehingga deployment tidak lagi berangkat dari asumsi. 9Router dan Hermes diposisikan sebagai fase instalasi berikutnya, bukan existing dependency.

| Komponen | Status | Peran di PMMI |
| :---- | :---- | :---- |
| Ubuntu Server (latest) | Sudah ada | Host utama seluruh service dan orchestration |
| Docker | Sudah ada | Deployment PMMI web/API/worker dan service pendukung |
| Tailscale | Sudah ada | Akses privat admin, maintenance, dan endpoint internal |
| PostgreSQL | Sudah ada | Source of truth akademik, identity, wallet, audit, metadata |
| MinIO | Sudah ada | Object storage tugas, sertifikat, portfolio, archive |
| Immich | Sudah ada | Tetap aplikasi media independen; bukan storage PMMI |
| 9Router | Belum | AI provider/router layer setelah PMMI Gateway |
| Hermes Agent | Belum | Satu instalasi host dengan banyak Profiles/workspaces |

# 22\. Deployment Topology v1.1

Target topology memisahkan public traffic, application policy, data plane, dan private administration. PostgreSQL, MinIO admin console, Hermes control surface, serta 9Router admin tidak diekspos langsung ke internet.

Internet → reverse proxy → pondokmultimedia.id / app.pondokmultimedia.id / ai.pondokmultimedia.id → PMMI services. PMMI API mengakses PostgreSQL dan MinIO di jaringan internal. PMMI AI Gateway meneruskan request yang lolos policy ke 9Router. Hermes menggunakan scoped PMMI AI credential, bukan master credential provider.

| Hostname | Tujuan | Exposure |
| :---- | :---- | :---- |
| pondokmultimedia.id | Website publik \+ featured portfolio | Publik |
| app.pondokmultimedia.id | Dashboard admin/ustadz/santri/alumni | Publik \+ auth |
| ai.pondokmultimedia.id | OpenAI-compatible PMMI AI Gateway | Publik terautentikasi / dapat dibatasi |
| PostgreSQL | Database | Private only |
| MinIO API | Object storage | Private; presigned URL terkontrol |
| 9Router admin | Provider/router management | Tailscale/private only |
| Hermes control | Profile provisioning/operations | Tailscale/private only |

# 23\. Storage Plan SSD 256 GB \+ HDD 500 GB

SSD diprioritaskan untuk OS, Docker runtime, PostgreSQL, aplikasi, cache kecil, dan workspace aktif. HDD diprioritaskan untuk object/archive yang besar. Angka di bawah adalah guardrail awal; finalisasi setelah audit pemakaian Immich dan filesystem aktual.

| Tier | Isi | Policy awal |
| :---- | :---- | :---- |
| SSD / hot | OS, Docker, PostgreSQL, PMMI app, Hermes profile state, workspace aktif | Sisakan minimum 20–25% free space; jangan simpan video tugas besar permanen |
| HDD / warm | MinIO object, submission media, portfolio originals, alumni archive | Lifecycle/retention aktif; monitor growth mingguan |
| Backup / external | DB dump, MinIO critical objects, config/secrets backup terenkripsi | Idealnya device/NAS/offsite terpisah; disk server yang sama bukan backup penuh |

Immich harus dihitung sebagai existing workload. PMMI tidak boleh mengasumsikan seluruh 500 GB HDD tersedia. Sebelum migration/upload massal, ukur kapasitas yang sudah dipakai Immich dan growth rate-nya.

# 24\. Lifecycle Resource Policy — Aktif, Alumni, DO

| Status | Login | AI Credit | Hermes | Workspace | Akademik/Portfolio |
| :---- | :---- | :---- | :---- | :---- | :---- |
| ACTIVE | Ya | Quota \+ reward | Agent slot sesuai entitlement | Hot/aktif | Penuh |
| GRADUATED\_PENDING | Ya | Terbatas selama grace period | Stop provisioning baru | Persiapan archive | Read/write terbatas |
| ALUMNI | Ya | Default 0; grant khusus admin | Tidak ada compute default | Archive/read-only | Nilai, sertifikat, portfolio tetap tersedia |
| DO | Dicabut/disabled | 0 | Stop \+ revoke | Quarantine lalu archive/delete sesuai retention | Data administratif tetap; portfolio mengikuti keputusan pondok |

Kebijakan ini membuat lifecycle menjadi mekanisme penghematan resource, bukan sekadar label database. Perubahan status harus memicu job: revoke token, stop agent, expire regular credit, archive workspace, dan menulis audit log.

# 25\. Hermes Provisioning v1.1

Hermes belum diinstal. Ketika fase ini dimulai, gunakan satu instalasi Hermes dan fitur Profiles. Dokumentasi resmi Hermes menyebut profile sebagai home directory terpisah dengan config, API keys, memory, sessions, skills, cron, dan state masing-masing. Profile baru dapat dibuat blank atau di-clone dari profile tertentu. Karena profile bukan pengganti security sandbox, PMMI tetap wajib menerapkan filesystem/terminal isolation dan least privilege.

Flow Build Agent: user klik Build → API cek status ACTIVE \+ agent slot → buat provisioning job → worker membuat internal UUID \+ workspace → create/clone Hermes profile dari template PMMI → inject scoped AI gateway token dan policy → health check → status READY. Jika gagal, rollback credential/profile parsial dan simpan log ringkas.

| Guardrail | Implementasi |
| :---- | :---- |
| Naming | Gunakan internal UUID; display name terpisah |
| Credential | Token PMMI AI scoped per profile/user; jangan master 9Router/provider key |
| Filesystem | Workspace unik; tidak boleh membaca workspace user lain atau secrets host |
| Concurrency | Queue provisioning; batasi agent aktif paralel sesuai telemetry |
| Lifecycle | Alumni/DO menghentikan compute dan mengarsipkan workspace |
| Template | Clone config/skills/SOUL dari profile template PMMI; memory/session tetap fresh |

# 26\. 9Router & PMMI AI Gateway v1.1

9Router belum diinstal dan tidak menjadi wallet santri. PMMI AI Gateway tetap menjadi policy enforcement point: authentication, model allowlist, rate limit, credit reservation, usage accounting, reward, dan audit. 9Router bertugas sebagai routing/provider layer di belakang gateway.

Request lifecycle: client/Hermes → PMMI AI Gateway → validate user/status/profile → reserve credit → route via 9Router → provider → capture usage → settle ledger → return response. Jika provider gagal, reservation dilepas/di-adjust sesuai hasil aktual.

Credit disimpan sebagai immutable ledger dengan entry grant, reward, expiry, reservation, usage settlement, adjustment, dan admin correction. Balance adalah agregasi transaksi agar seluruh perubahan dapat diaudit.

# 27\. MinIO Bucket & Object Policy

| Bucket/Prefix | Isi | Akses |
| :---- | :---- | :---- |
| pmmi-submissions | Tugas santri | Private; presigned upload/download |
| pmmi-certificates | PDF/asset sertifikat | Private; user terkait \+ admin |
| pmmi-portfolio | Karya featured/thumbnail | Private origin; public delivery melalui app/proxy/presigned policy |
| pmmi-archives | Workspace/export alumni/DO bila diperlukan | Admin/private only |

Database hanya menyimpan object key, metadata, checksum, MIME, size, owner, lifecycle state, dan timestamps. Upload harus memiliki size limit, MIME validation, random server-side object key, serta tidak pernah dieksekusi sebagai file program.

# 28\. Portfolio Publication Policy yang Dikunci

Flow final: santri submit karya → ustadz menilai → ustadz/admin memilih Featured → karya langsung eligible untuk tampil di pondokmultimedia.id/portfolio. Tidak ada langkah persetujuan santri. Unpublish tetap tersedia untuk ustadz/admin dan seluruh publish/unpublish dicatat pada audit log.

# 29\. Installation & Delivery Sequence v1.1

| Fase | Deliverable |
| :---- | :---- |
| 0 — Audit | Snapshot resource, Docker inventory, port, disk/mount, Immich usage, PostgreSQL/MinIO config, Tailscale ACL, backup |
| 1 — PMMI Foundation | Auth, RBAC, lifecycle user, PostgreSQL schema, audit, dashboard shell |
| 2 — Academic | Course/class, assignment, MinIO upload, grading, certificates, featured portfolio |
| 3 — Resource Governance | Quota storage, retention, archive jobs, monitoring, backup/restore drill |
| 4 — AI Router | Install/configure 9Router secara private; uji provider/fallback/usage |
| 5 — AI Gateway | Wallet ledger, model policy, scoped keys, rate limit, usage settlement |
| 6 — Hermes | Install satu Hermes; buat template profile; provisioning worker \+ workspace isolation |
| 7 — Rewards | Prestasi → AI credit/agent slot/badge; admin policy configurable |
| 8 — Hardening | Telemetry, alert, security review, concurrency tuning, disaster recovery |

# 30\. Capacity Guardrails Awal

Dengan i5 Gen 2 / RAM 16 GB, desain harus menghindari banyak proses agent aktif sekaligus. Dashboard akademik dan PostgreSQL relatif ringan; risiko terbesar adalah agent concurrency, media growth, log tak terbatas, dan existing workload Immich. Karena itu semua limit awal harus konservatif dan ditune dari telemetry.

| Area | Guardrail awal |
| :---- | :---- |
| Hermes provisioning | Queue; jangan provision banyak profile bersamaan |
| Agent runtime | Batasi concurrency global dan per user; naikkan hanya setelah observasi |
| AI request | Rate limit per user/profile \+ global circuit breaker |
| Upload | Limit file per tugas dan total storage per santri/angkatan |
| Logs | Retention pendek untuk verbose logs; agregat statistik lebih lama |
| PostgreSQL | Connection pool kecil/terukur; backup terjadwal |
| Docker | Memory/CPU limit untuk service yang berisiko runaway bila kompatibel |

# 31\. Checklist Sebelum Instalasi 9Router & Hermes

• Catat output CPU/RAM/disk baseline saat idle dan saat Immich aktif.

• Pastikan mount SSD/HDD dan free space aktual; tentukan lokasi MinIO dan workspace Hermes.

• Tentukan reverse proxy dan sertifikat TLS untuk tiga hostname PMMI.

• Buat service account Linux khusus orchestration; hindari menjalankan agent sebagai root.

• Pastikan PostgreSQL/MinIO tidak terekspos publik dan credential terpisah untuk PMMI.

• Buat backup PostgreSQL \+ MinIO critical data dan lakukan minimal satu restore test.

• Tentukan jumlah santri aktif, pengajar, estimasi concurrent user, dan ukuran tugas tipikal.

• Setelah itu baru install 9Router, validasi routing, lalu install Hermes dan validasi Profiles.

# 32\. Referensi Teknis v1.1

Hermes Agent Documentation — https://hermes-agent.nousresearch.com/docs/ — dokumentasi instalasi, profiles, configuration, tools, security, dan gateway.

Hermes Profiles — https://hermes-agent.nousresearch.com/docs/user-guide/profiles/ — dasar desain satu instalasi dengan banyak profile independen; mendukung create, clone, dan clone-from.

Repository PMMI — https://github.com/ahmadasrizalmi/pmmi — codebase public website yang menjadi fondasi frontend platform.

Catatan: detail 9Router sengaja tidak dikunci ke kontrak API tertentu sampai versi yang akan diinstal dipilih dan diuji di home server. PMMI Gateway didesain agar router di belakangnya dapat diganti tanpa mengubah wallet/identity akademik.

# **Lampiran A — Contoh Reward Policy**

| Trigger | Reward contoh | Approval |
| :---- | :---- | :---- |
| Nilai tugas \>= 90 | \+50 AI credit units | Auto atau pengajar |
| Project terbaik bulanan | \+1 Hermes agent slot selama periode tertentu | Pengajar/Admin |
| Kehadiran sempurna | \+25 AI credit units | Auto setelah data tersedia |
| Juara kompetisi | Credit premium \+ badge | Admin |
| Pelanggaran penggunaan AI | Freeze AI sementara | Admin |

Reward policy harus configurable dan tidak hard-coded pada nilai tertentu agar sistem bisa berubah tanpa deployment.

# **Lampiran B — Contoh Struktur Workspace Hermes**

| /srv/pmmi/hermes-workspaces/   \<user-uuid\>/     \<profile-uuid\>/       profile-config/       workspace/       memory-or-state/       logs/          \# short retention /archive/pmmi/hermes/   alumni/\<user-uuid\>/\<profile-uuid\>.tar.zst   inactive/\<user-uuid\>/\<profile-uuid\>.tar.zst |
| :---- |

Path final mengikuti instalasi aktual dan permission model Hermes di server. UUID internal mencegah collision dan mengurangi risiko path injection.

# **Lampiran C — Source Context**

Repo awal: github.com/ahmadasrizalmi/pmmi. Codebase saat blueprint dibuat sudah memiliki struktur React/Vite dengan App.tsx, pages, components, hooks, src, package.json, dan dokumentasi public website PMMI. Blueprint mempertahankan public-facing site sebagai bagian dari ekosistem, lalu menambahkan aplikasi authenticated dan backend.

Dokumen ini disusun berdasarkan requirement percakapan dan orientasi awal repository. Detail sistem server yang belum tersedia ditandai sebagai hal yang perlu diverifikasi, bukan dianggap sudah pasti.

# **33\. Revisi v1.2 — Admission, Lifecycle & Communication Automation**

Versi 1.2 memperluas blueprint menjadi alur end-to-end dari pengunjung publik hingga alumni/DO. Pendaftaran santri baru diperlakukan sebagai modul inti (Module 0), dan Notification Engine diperlakukan sebagai communication backbone yang menghubungkan admission, akademik, AI, Hermes, portfolio, sertifikat, operasional server, dan perubahan status santri.

**Prinsip v1.2: perubahan status bisnis harus menghasilkan perubahan hak akses dan resource secara deterministik. Contoh: ENROLLED membuat identitas santri dan entitlement; ACTIVE mengaktifkan AI/agent sesuai quota; ALUMNI/DO menghentikan compute dan memindahkan data ke mode arsip sesuai retention policy.**

# **34\. Admission & Recruitment Module**

## **Tujuan**

* Mengubah public website pondokmultimedia.id menjadi acquisition funnel resmi PMMI, bukan hanya company profile.  
* Menyimpan semua calon santri sebagai applicant terlebih dahulu; applicant tidak otomatis menjadi user santri aktif.  
* Memungkinkan admin memproses verifikasi, seleksi, tes, wawancara, keputusan, daftar ulang, dan enrollment dari satu dashboard.  
* Menjaga server tetap hemat resource: provisioning penuh hanya dilakukan setelah calon santri diterima dan menyelesaikan registrasi ulang.

## **Public entry point**

pondokmultimedia.id/daftar  
    ↓  
Admission Campaign aktif  
    ↓  
Form \+ dokumen  
    ↓  
Application submitted  
    ↓  
Admin review & selection  
    ↓  
Accepted / Waitlisted / Rejected  
    ↓  
Registration / daftar ulang  
    ↓  
ENROLLED → provisioning santri

## **Admission campaign**

Setiap tahun/gelombang dibuat sebagai entitas admission\_period agar aturan dapat berbeda tanpa mengubah kode. Contoh: PMMI 2027 — kuota 20 santri, periode Januari–Maret, jalur Programmer dan Content Creator.

| Field | Contoh | Fungsi |
| :---- | :---- | :---- |
| name | Penerimaan Santri 2027 | Nama periode publik/admin |
| slug | 2027-gelombang-1 | URL dan identifier |
| open\_at / close\_at | 2027-01-01 / 2027-03-31 | Batas formulir |
| capacity\_total | 20 | Guardrail penerimaan |
| capacity\_by\_program | Programmer 10; Creator 10 | Opsional |
| status | draft/open/closed/archived | Lifecycle campaign |
| requirements\_json | usia, dokumen, syarat Quran, dsb. | Rules configurable |

# **35\. Application State Machine**

DRAFT  
  ↓  
SUBMITTED  
  ↓  
ADMIN\_REVIEW  
  ├── NEEDS\_REVISION → SUBMITTED  
  ↓  
ADMIN\_VERIFIED  
  ↓  
SCREENING / TEST  
  ↓  
INTERVIEW  
  ├── WAITLISTED  
  ├── REJECTED  
  └── ACCEPTED  
          ↓  
     REGISTRATION\_PENDING  
          ↓  
       ENROLLED

Status tidak boleh dilompati secara sembarang oleh UI. Backend menyimpan transition history sehingga keputusan penerimaan dapat diaudit.

| Status | Resource yang boleh dipakai | Notif utama |
| :---- | :---- | :---- |
| DRAFT | Temporary form data saja | Opsional reminder draft |
| SUBMITTED | Dokumen admission di MinIO | Konfirmasi submit |
| ADMIN\_VERIFIED | Tidak ada AI/Hermes | Jadwal seleksi |
| INTERVIEW | Tidak ada AI/Hermes | Jadwal \+ reminder |
| ACCEPTED | Masih belum ada compute | Surat diterima \+ daftar ulang |
| ENROLLED | Akun \+ cohort \+ wallet \+ entitlement | Welcome/onboarding |

# **36\. Form, Dokumen & Data Admission**

## **Data yang disarankan**

* Identitas: nama lengkap, nama panggilan, tanggal lahir, jenis kelamin bila dibutuhkan administrasi, alamat, nomor WhatsApp, email.  
* Riwayat pendidikan/pondok, kemampuan membaca Al-Quran, hafalan bila relevan, pengalaman multimedia/programming.  
* Pilihan jalur/program dan alasan mendaftar.  
* Kontak wali/orang tua jika kebijakan PMMI membutuhkan.  
* Dokumen: foto, identitas, ijazah/surat pondok, dokumen tambahan sesuai campaign.  
* Consent administrasi dan kebijakan privasi; consent ini bukan approval untuk Featured Portfolio. Kebijakan karya featured dikendalikan pondok sesuai blueprint.

## **Storage admission**

Dokumen admission disimpan di MinIO, bukan PostgreSQL. PostgreSQL hanya menyimpan object key, size, MIME, checksum, owner/application\_id, dan metadata review. Bucket/prefix admission memiliki retention sendiri agar dokumen applicant yang ditolak tidak disimpan tanpa batas.

pmmi-admissions/  
  \<admission\_period\_id\>/  
    \<application\_uuid\>/  
      identity/  
      education/  
      supporting/

# **37\. Selection, Scoring & Decision**

Sistem mendukung nilai seleksi terstruktur namun keputusan akhir tetap milik admin/panitia. Scoring membantu ranking dan transparansi internal, bukan auto-accept tanpa review.

| Komponen | Contoh bobot | Catatan |
| :---- | :---- | :---- |
| Administrasi | Pass/Fail | Dokumen dan syarat minimum |
| Quran/keislaman | 25% | Sesuai kurikulum pondok |
| Wawancara/adab | 25% | Rubrik terstruktur |
| Aptitude digital | 25% | Logika, kreativitas, dasar komputer |
| Project/portfolio test | 25% | Dapat berupa coding atau content task |

Reward berbasis hasil seleksi boleh diterapkan, tetapi default v1.2 adalah entitlement awal yang sama per cohort. Bonus AI credit/agent slot dari prestasi seleksi dibuat configurable dan membutuhkan approval admin.

# **38\. Enrollment & Automatic Provisioning**

ACCEPTED  
  ↓ daftar ulang selesai  
ENROLLED  
  ↓ transaction \+ jobs  
Create user identity  
Assign role \= SANTRI  
Create student profile  
Assign cohort \+ program  
Enroll default classes  
Create AI wallet  
Grant initial quota  
Set agent\_slots entitlement  
Set storage quota  
Create notification preferences  
Send account activation  
  ↓  
ACTIVE

**Hermes profile TIDAK otomatis dibuat saat enrollment. Sistem hanya memberikan entitlement agent\_slots. Profile/workspace baru dibuat ketika santri benar-benar menekan Build Agent. Ini mengurangi file growth dan proses background pada server 16 GB RAM.**

## **Idempotency**

Provisioning harus idempotent. Jika worker crash setelah membuat wallet tetapi sebelum enrollment kelas, retry tidak boleh membuat wallet atau akun ganda. Gunakan provisioning\_job dengan idempotency key berbasis student\_id \+ action.

# **39\. Student Lifecycle Automation v1.2**

| Lifecycle | Login | AI | Hermes | Storage | Academic |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Applicant | Admission portal | Off | Off | Small/temp | Application only |
| Accepted | Admission portal | Off | Off | Small/temp | Registration only |
| Active | Full | On by quota | On by slots | Active quota | Full |
| Suspended | Limited/blocked | Off | Stop | Retained | Read/restricted |
| Alumni | Limited | Off default | Archived | Archive tier | Read-only |
| DO | Disabled/limited | Off | Archived | Archive/retention | Retained |

Perubahan lifecycle menghasilkan event seperti student.activated, student.graduated, student.dropout. Worker menangani revoke token, stop agent, archive workspace, expire quota reguler, dan notification. Tindakan sensitif seperti DO tidak boleh dikirim otomatis tanpa confirmation admin pada langkah final.

# **40\. Multi-Channel Notification & Communication Engine**

Notification Engine adalah urat saraf aplikasi. Semua modul menghasilkan domain event; worker menentukan siapa penerimanya, channel yang dipakai, prioritas, template, schedule, fallback, retry, dan delivery tracking.

Domain Events  
    ↓  
Transactional Outbox / notification\_jobs  
    ↓  
Notification Worker  
    ├── In-App Provider  
    ├── Email Provider → Resend  
    ├── WhatsApp Provider → Baileys (awal) / Meta Cloud (future)  
    └── Telegram Provider → Telegram Bot API  
            ↓  
Delivery status \+ retry \+ audit

## **Channel responsibility**

| Channel | Peran utama | Karakter |
| :---- | :---- | :---- |
| In-App | Source of truth untuk seluruh notif user | Murah, searchable, tidak tergantung provider eksternal |
| WhatsApp | High-attention academic/user notification | Dekat dengan kebiasaan pengguna; batasi broadcast |
| Email / Resend | Formal, durable, activation, sertifikat, keputusan admission | Mudah diarsip/search; delivery bisa dilacak via webhook |
| Telegram | Fallback WA \+ primary ops/admin alert | Bot API resmi; baik untuk automation/ops |

# **41\. Routing & Fallback Policy**

Fallback bukan berarti selalu mengirim ke semua channel. Sistem memilih route sesuai event dan prioritas. Jika primary delivery gagal atau user tidak memiliki channel tersebut, worker melanjutkan ke fallback yang diizinkan.

| Event class | Primary | Fallback | Catatan |
| :---- | :---- | :---- | :---- |
| Normal academic | In-App | — | Tidak perlu mengganggu user |
| Important academic | WhatsApp \+ In-App | Telegram | Jadwal berubah, deadline dekat, revisi |
| Formal | Email \+ In-App | WhatsApp/Telegram | Admission decision, certificate, graduation |
| AI quota/reward | In-App | WhatsApp → Telegram | Threshold tertentu saja |
| Infrastructure critical | Telegram Admin | Email Admin | Jangan memakai nomor WA santri-facing |
| Security/account | In-App \+ Email | WhatsApp/Telegram | Reset/activation/perubahan penting |

## **Priority**

| Priority | Contoh | Delivery behavior |
| :---- | :---- | :---- |
| LOW | Achievement kecil, info umum | In-App/digest |
| NORMAL | Tugas baru | In-App; WA sesuai preference/policy |
| IMPORTANT | Jadwal berubah, revisi | Immediate WA \+ In-App; TG fallback |
| CRITICAL | Account/security, server issue | Escalation/fallback cepat \+ admin visibility |

# **42\. Notification Event Catalog — Admission**

| Event | Recipient | Default route |
| :---- | :---- | :---- |
| admission.submitted | Applicant \+ Admin | Email/WA applicant; in-app admin |
| admission.needs\_revision | Applicant | WA \+ In-App/portal \+ email optional |
| admission.verified | Applicant | WA \+ email |
| selection.scheduled | Applicant | WA \+ email |
| selection.reminder\_h1 | Applicant | WA; Telegram fallback |
| interview.scheduled | Applicant | WA \+ email |
| admission.accepted | Applicant | Email \+ WA |
| admission.waitlisted | Applicant | Email \+ WA |
| admission.rejected | Applicant | Email; WA concise |
| registration.reminder | Accepted applicant | WA; TG fallback |
| student.enrolled | New student | Email activation \+ WA welcome |

# **43\. Notification Event Catalog — Academic**

| Event | Recipient | Default route |
| :---- | :---- | :---- |
| assignment.created | Class students | In-App \+ WA |
| assignment.deadline\_h3/h1 | Pending students | In-App \+ WA |
| assignment.overdue | Missing students | In-App \+ WA |
| submission.created | Teacher | In-App; digest preferred |
| submission.revision\_requested | Student | In-App \+ WA |
| submission.resubmitted | Teacher | In-App |
| submission.graded | Student | In-App \+ WA |
| grade.updated | Student | In-App \+ WA |
| class.starting | Students/teacher | In-App; WA optional |
| class.rescheduled | Affected users | WA \+ In-App; TG fallback |
| attendance.warning | Student/admin | In-App \+ channel policy |

# **44\. Notification Event Catalog — AI, Hermes, Reward, Portfolio**

| Event | Recipient | Default route |
| :---- | :---- | :---- |
| ai.credit\_50pct | User | In-App |
| ai.credit\_80pct | User | In-App \+ WA |
| ai.credit\_95pct | User | WA; TG fallback |
| ai.credit\_depleted | User | In-App \+ WA |
| reward.granted | User | In-App \+ WA for meaningful rewards |
| hermes.build\_requested | User | In-App |
| hermes.agent\_ready | User | In-App |
| hermes.agent\_failed | User \+ Admin if repeated | In-App; admin TG if systemic |
| portfolio.featured | Student | In-App \+ WA informational only |
| certificate.issued | Student | Email \+ In-App \+ WA |
| student.graduated | Student | Email \+ In-App \+ WA |

# **45\. Notification Event Catalog — Operations**

| Event | Threshold/example | Route |
| :---- | :---- | :---- |
| server.disk\_warning | SSD/HDD \>= 80% | Telegram admin |
| server.disk\_critical | \>= 90% | Telegram \+ email |
| postgres.backup\_failed | Backup job error | Telegram \+ email |
| minio.unreachable | Health check failed | Telegram |
| pmmi.api\_unhealthy | Repeated failure | Telegram |
| 9router.unreachable | AI gateway cannot route | Telegram \+ admin dashboard |
| ai.cost\_anomaly | Usage spike vs baseline | Telegram \+ admin dashboard |
| hermes.failure\_spike | Repeated provisioning/runtime errors | Telegram |
| notification.provider\_down | WA/Email/TG adapter unhealthy | Admin dashboard \+ alternate channel |

# **46\. Digests, Throttling & Anti-Spam**

WhatsApp tidak boleh menjadi event firehose. Baileys sendiri adalah library WhatsApp Web dan maintainernya memperingatkan agar tidak digunakan untuk spam/bulk automated messaging. Karena itu v1.2 menerapkan aggregation, quiet hours, per-user throttle, dan digest untuk event berfrekuensi tinggi.

20 submission masuk  
    ↓  
BUKAN 20 WhatsApp ke ustadz  
    ↓  
Digest: "12 submission baru, 4 revisi, 3 belum submit"

* Teacher digest: ringkasan submission/penilaian pending pada jam yang dapat dikonfigurasi.  
* Admin digest: admission pending, document review, capacity, dan system warnings non-critical.  
* Student reminder: hanya untuk tugas yang belum submit; student yang sudah submit tidak menerima reminder deadline.  
* Deduplication key mencegah event yang sama dikirim berkali-kali akibat retry worker.  
* Quiet hours: pesan non-critical ditunda ke jam wajar; critical security/ops dapat bypass.

# **47\. WhatsApp Strategy — Adapter, Bukan Ketergantungan**

Implementasi awal dapat memakai WhiskeySockets/Baileys karena self-hosted dan cocok untuk skala kecil, tetapi Baileys berinteraksi dengan WhatsApp Web, bukan API bisnis resmi. Versi 7 memperkenalkan breaking changes; karena itu domain logic PMMI tidak boleh memanggil Baileys secara langsung.

WhatsAppProvider  
  sendText()  
  sendDocument()  
  healthCheck()  
       │  
       ├── BaileysProvider (phase 1\)  
       └── MetaCloudProvider (future)

* Nomor WA notification sebaiknya dipisahkan dari nomor personal admin.  
* Session/auth state Baileys disimpan terenkripsi atau permission-restricted dan dibackup secara hati-hati.  
* Jika auth/session putus, provider ditandai degraded dan fallback Telegram/email berjalan.  
* Broadcast besar dipecah dan dijadwalkan; tidak ada blast tak terkendali.

# **48\. Telegram Fallback & PMMI Ops Bot**

Telegram Bot API digunakan sebagai fallback user notification jika akun Telegram telah ditautkan, dan sebagai primary channel untuk infrastructure/admin alerts. Telegram mendokumentasikan limit broadcast gratis sekitar 30 pesan/detik; kebutuhan PMMI jauh di bawah batas tersebut.

## **Account linking**

Dashboard → Connect Telegram  
   ↓  
Generate one-time token  
   ↓  
t.me/PMMIBot?start=\<token\>  
   ↓  
Bot receives /start  
   ↓  
Verify token \+ bind telegram\_chat\_id  
   ↓  
Connected

Jangan mengandalkan username Telegram sebagai identifier karena dapat berubah/tidak ada. Simpan chat\_id yang diperoleh setelah flow linking.

## **Ops bot — fase lanjutan**

/status  
/storage  
/admissions  
/pending  
/ai-usage  
/server

Command ops harus read-only pada fase awal. Tindakan destruktif seperti restart/delete tidak diberikan melalui Telegram sampai ada authorization, confirmation, dan audit yang matang.

# **49\. Email via Resend**

Resend digunakan untuk transactional email seperti activation, admission decision, daftar ulang, sertifikat, perubahan akun, dan kelulusan. Resend menyediakan webhook event yang dapat disimpan oleh PMMI untuk tracking delivery/bounce dan reporting.

* Sender utama: noreply@pondokmultimedia.id setelah domain terverifikasi.  
* Logical sender/display name dapat berbeda: PMMI Admission, PMMI Academic, PMMI System.  
* Gunakan template versioning dan jangan menyimpan secret API key di Git.  
* Webhook endpoint harus diverifikasi/signature checked sesuai mekanisme provider dan di-rate-limit.  
* Bounced/invalid email diberi status sehingga sistem tidak melakukan retry tanpa batas.

# **50\. Notification Data Model**

| Table | Fungsi utama |
| :---- | :---- |
| notifications | Pesan logical/source of truth in-app |
| notification\_recipients | Target user bila satu notification ditujukan ke banyak user |
| notification\_deliveries | Satu record per channel attempt dan status |
| notification\_jobs | Queue pending/scheduled/retry |
| notification\_preferences | Preference per user/category/channel |
| notification\_templates | Template versioned per event/channel/locale |
| notification\_rules | Policy routing/reminder configurable |
| user\_channels | Email/phone/telegram binding \+ verified state |

## **Delivery status**

PENDING → PROCESSING → SENT → DELIVERED  
                     ├── FAILED → RETRY\_SCHEDULED  
                     └── BOUNCED / UNREACHABLE

| Field penting | Contoh |
| :---- | :---- |
| channel | in\_app / email / whatsapp / telegram |
| provider | resend / baileys / telegram\_bot |
| provider\_message\_id | ID dari provider bila tersedia |
| attempt\_count | 0..N |
| last\_error\_code | AUTH\_LOST / RATE\_LIMIT / INVALID\_TARGET |
| next\_attempt\_at | exponential/backoff schedule |
| sent\_at/delivered\_at | timestamp audit |

# **51\. Outbox & Worker Architecture**

Untuk skala PMMI dan keterbatasan server, tidak perlu Kafka/RabbitMQ pada MVP. PostgreSQL cukup menjadi durable queue menggunakan transactional outbox. Event dibuat dalam transaksi yang sama dengan perubahan bisnis; worker mengambil event setelah commit.

BEGIN TX  
  INSERT assignment  
  INSERT outbox\_event(assignment.created)  
COMMIT  
       ↓  
pmmi-worker  
       ↓  
resolve recipients \+ rules  
       ↓  
create deliveries  
       ↓  
send providers  
       ↓  
update status/retry

Pola ini mencegah kasus tugas berhasil dibuat tetapi notifikasi hilang karena proses mati di antara database commit dan pemanggilan provider.

# **52\. Retry, Backoff & Circuit Breaker**

| Attempt | Delay baseline | Behavior |
| :---- | :---- | :---- |
| 1 | Immediate | Normal send |
| 2 | \~1 minute | Transient failure retry |
| 3 | \~5 minutes | Retry \+ provider health check |
| 4 | \~30 minutes | Final automated retry untuk non-critical |
| Permanent | Manual/admin visibility | Invalid target, revoked session, repeated auth failure |

Untuk outage provider, gunakan circuit breaker: hentikan spam retry sementara, tandai provider degraded, dan alihkan ke fallback bila event policy mengizinkan.

# **53\. Notification Preferences & Mandatory Messages**

User dapat memilih channel untuk kategori non-mandatory, tetapi beberapa komunikasi tidak boleh dimatikan karena terkait akun, keamanan, dan perubahan akademik kritis.

| Kategori | User boleh mematikan? | Default |
| :---- | :---- | :---- |
| Tugas baru | Ya untuk channel eksternal; In-App tetap ada | In-App \+ WA |
| Reminder deadline | Ya/terbatas sesuai policy pondok | WA \+ In-App |
| Nilai/revisi | Ya untuk external; In-App tetap | In-App \+ WA |
| Reward/AI usage | Ya | In-App; WA threshold |
| Security/account | Tidak | Email \+ In-App \+ fallback |
| Admission decision | Tidak untuk applicant | Email \+ WA |
| Critical schedule change | Tidak selama aktif | WA \+ In-App |

# **54\. End-to-End Journey — Calon Santri sampai Santri Aktif**

Visitor melihat pondokmultimedia.id  
→ buka /daftar  
→ pilih admission campaign  
→ isi form \+ upload dokumen ke MinIO  
→ SUBMITTED  
→ admin mendapat queue review  
→ applicant mendapat konfirmasi  
→ ADMIN\_VERIFIED  
→ schedule tes \+ WA/email reminder  
→ interview \+ scoring  
→ ACCEPTED  
→ link daftar ulang  
→ ENROLLED  
→ PMMI membuat akun/cohort/wallet/entitlement  
→ activation email \+ WA welcome  
→ ACTIVE  
→ santri login dashboard

# **55\. End-to-End Journey — Belajar, Reward & Portfolio**

Ustadz membuat assignment  
→ event assignment.created  
→ notif santri  
→ santri upload submission ke MinIO  
→ ustadz melihat submission queue  
→ ustadz grade \+ feedback  
→ jika revision: notif \+ resubmission loop  
→ jika final: nilai muncul di dashboard  
→ reward rule/admin dapat memberi AI credit/agent slot  
→ ustadz klik Featured  
→ portfolio.public \= true  
→ karya muncul di pondokmultimedia.id/portfolio  
→ santri hanya diberi notification informasional; tidak ada approval tambahan

# **56\. End-to-End Journey — AI & Hermes**

Santri login  
→ melihat AI balance \+ agent entitlement  
→ AI request → PMMI AI Gateway  
→ validate ACTIVE \+ model policy \+ credit  
→ reserve credit  
→ 9Router → provider  
→ settle usage ledger  
→ threshold notification jika saldo menipis

Build Agent  
→ validate ACTIVE \+ available slot \+ disk quota  
→ provisioning job  
→ create restricted workspace  
→ hermes profile create/clone from PMMI template  
→ inject scoped AI gateway credential  
→ READY  
→ in-app notification

Dokumentasi resmi Hermes menyatakan Profile adalah home/state terpisah, sedangkan workspace/terminal.cwd dan sandboxing adalah concern terpisah. Karena Profile tidak membatasi filesystem, PMMI tetap membutuhkan OS/container/sandbox policy untuk agent santri.

# **57\. End-to-End Journey — Graduation / Alumni / DO**

ACTIVE  
   ├── GRADUATED  
   │      ↓  
   │   graduation notification \+ certificate  
   │      ↓  
   │   stop Hermes compute  
   │   expire regular AI quota  
   │   archive workspace  
   │   academic records read-only  
   │      ↓  
   │    ALUMNI  
   │  
   └── DROPOUT (admin-confirmed)  
          ↓  
       revoke access / limited portal  
       stop Hermes  
       disable AI  
       archive according retention  
       retain academic/audit records  
       formal notification only after confirmation

# **58\. Privacy, Safety & Audit for Communications**

* Notification body tidak boleh memuat API key, password plaintext, MinIO secret, 9Router master credential, atau Hermes .env.  
* Nilai/detail akademik sensitif sebaiknya hanya berupa ringkasan di WA/TG; detail lengkap dibuka setelah login dashboard.  
* Admission documents tidak dikirim sebagai attachment WA secara default; gunakan secure dashboard link.  
* Semua perubahan grade, credit, status admission, lifecycle santri, Featured Portfolio, dan notification manual broadcast masuk audit log.  
* Manual broadcast ke banyak user memerlukan role/permission khusus, preview recipient count, dan confirmation sebelum send.  
* Telegram bot token, Resend API key, dan WhatsApp auth state disimpan sebagai secrets di server, bukan database plaintext yang dapat dibaca frontend.

# **59\. Updated Service Topology v1.2**

Internet  
  ↓  
Reverse Proxy / TLS  
  ├── pondokmultimedia.id        Public \+ Admission  
  ├── app.pondokmultimedia.id    Dashboards  
  └── ai.pondokmultimedia.id     PMMI AI Gateway  
              │  
        PMMI API (modular monolith)  
          ├── Admission  
          ├── Academic  
          ├── Portfolio  
          ├── Wallet/Rewards  
          ├── Hermes Orchestrator  
          └── Notification Rules  
              │  
        PostgreSQL \+ MinIO  
              │  
          pmmi-worker  
          ├── scheduled reminders  
          ├── archival jobs  
          ├── notification delivery  
          └── Hermes provisioning jobs  
              │  
   ┌──────────┼─────────────┐  
   │          │             │  
9Router     Hermes      External Channels  
   │          │        Resend / WA / Telegram  
AI providers Profiles

# **60\. Resource Impact of v1.2**

Admission dan Notification Engine tidak membutuhkan service berat tambahan. Worker dapat berjalan sebagai satu proses/container ringan dengan concurrency kecil. PostgreSQL outbox menghindari Redis/RabbitMQ pada tahap awal. Beban eksternal terbesar tetap agent concurrency, media growth, Immich, dan AI/Hermes processes.

| Component | Guardrail awal |
| :---- | :---- |
| pmmi-worker | 1 process; concurrency rendah dan configurable |
| Notification history | Retention detail delivery 6–12 bulan; aggregate/audit lebih lama sesuai kebutuhan |
| Admission rejected files | Expire setelah retention configurable, mis. 90–180 hari setelah campaign selesai |
| WA session | Satu account notification; health check \+ fallback |
| Telegram bot | Satu bot untuk user fallback; admin group/channel ops dapat dipisahkan |
| Email webhooks | Store normalized delivery metadata, bukan payload tak terbatas |

# **61\. Updated Database Domain Map**

IDENTITY  
users, roles, permissions, user\_channels

ADMISSION  
admission\_periods, applications, application\_documents, application\_reviews,  
selection\_scores, interviews, admission\_decisions, registrations

ACADEMIC  
students, teachers, cohorts, courses, classes, enrollments, assignments,  
submissions, submission\_files, grades, grade\_feedback, certificates

PORTFOLIO  
portfolio\_projects, portfolio\_assets, featured\_history

AI & REWARD  
ai\_wallets, ai\_credit\_ledger, ai\_usage\_logs, reward\_rules, rewards, achievements

HERMES  
hermes\_profiles, hermes\_workspaces, hermes\_build\_jobs, agent\_entitlements

NOTIFICATIONS  
notifications, notification\_recipients, notification\_deliveries,  
notification\_jobs, notification\_preferences, notification\_templates, notification\_rules

OPERATIONS  
audit\_logs, outbox\_events, system\_health\_events

# **62\. MVP v1.2 — Acceptance Scenario**

MVP v1.2 dianggap tervalidasi bila satu calon santri dapat melewati alur berikut tanpa operasi manual di database/server:

1. Admin membuka Admission Period dari dashboard.  
2. Calon santri mendaftar dari pondokmultimedia.id dan menerima confirmation notification.  
3. Admin memverifikasi dokumen, menjadwalkan seleksi/wawancara, lalu menerima/menolak.  
4. Calon yang diterima menyelesaikan daftar ulang dan otomatis menjadi santri aktif.  
5. Santri menerima account activation dan dapat login.  
6. Ustadz membuat tugas; santri menerima notif; santri upload; ustadz menilai/revisi.  
7. Nilai tampil di dashboard santri; reward dapat menambah AI credit/agent slot.  
8. Santri melakukan AI request melalui PMMI Gateway dan usage tercatat di ledger.  
9. Santri menekan Build Agent; satu Hermes profile/workspace dibuat dari instalasi yang sama.  
10. Ustadz men-featured karya; karya otomatis tampil di public portfolio tanpa approval santri.  
11. Notification delivery memiliki status, retry, dan Telegram fallback jika WA gagal.  
12. Admin dapat melihat health/storage/AI/provider warning dan menerima alert kritis lewat Telegram.

# **63\. Delivery Roadmap v1.2**

| Phase | Deliverable |
| :---- | :---- |
| 0 — Infra audit | Port/mount/container/backup/reverse proxy/Tailscale/security inventory |
| 1 — Core identity | Auth, RBAC, users, lifecycle, audit log |
| 2 — Admission | Campaign, form, documents, review, selection, enrollment |
| 3 — Academic | Classes, assignments, MinIO submissions, grades, revisions, certificates |
| 4 — Notification core | In-App, outbox, worker, templates, preferences, scheduling |
| 5 — External channels | Resend → Telegram → WhatsApp adapter with fallback |
| 6 — Portfolio | Featured publishing to pondokmultimedia.id |
| 7 — AI Gateway | Install 9Router, credit ledger, policy, metering |
| 8 — Hermes | Install one Hermes, PMMI template profile, Build Agent provisioning |
| 9 — Lifecycle automation | Graduation/alumni/DO archival and quota automation |
| 10 — Ops hardening | Monitoring, backup restore drill, capacity tuning, security review |

# **64\. Architecture Decisions Locked in v1.2**

* Domain utama adalah pondokmultimedia.id; public/admission di root, dashboard di app subdomain, AI gateway di ai subdomain.  
* Applicant bukan Student. Provisioning penuh hanya setelah ENROLLED.  
* PostgreSQL menyimpan metadata/ledger/state; MinIO menyimpan file/object.  
* Immich tetap workload terpisah dan kapasitasnya harus dihitung dalam storage planning.  
* 9Router adalah router/provider engine; PMMI AI Gateway adalah policy/quota/accounting source of truth.  
* Hermes diinstal satu kali dan menggunakan Profiles; agent slots adalah entitlement; profile baru dibuat on-demand.  
* Hermes Profile bukan sandbox. Workspace \+ OS isolation tetap wajib dirancang.  
* Featured Portfolio tidak meminta persetujuan santri setelah dipilih ustadz/admin.  
* In-App adalah notification source of truth; WhatsApp high-attention; Resend formal; Telegram fallback \+ ops.  
* WhatsApp provider diabstraksikan agar Baileys dapat diganti Meta Cloud API tanpa mengubah domain logic.  
* Notification queue awal memakai PostgreSQL outbox/worker, bukan message broker berat.  
* Lifecycle Active/Alumni/DO mengontrol compute, AI, storage, dan access — bukan hanya label.

# **65\. Items to Verify During Implementation**

13. Versi Ubuntu, Docker Engine/Compose, PostgreSQL, MinIO, dan Immich aktual beserta resource usage.  
14. Reverse proxy yang akan dipakai (mis. Caddy/Nginx/Traefik) dan port existing.  
15. Mount point SSD/HDD dan lokasi object data MinIO/Immich agar tidak terjadi double-counting kapasitas.  
16. 9Router release yang dipasang, format usage response, authentication, data directory, dan health endpoint.  
17. Hermes release yang dipasang, host/container deployment choice, Linux service account, sandbox strategy, dan template profile.  
18. Nomor WhatsApp khusus notification, toleransi risiko Baileys, serta migrasi future ke official WhatsApp API jika dibutuhkan.  
19. Resend domain verification DNS untuk pondokmultimedia.id dan sender policy.  
20. Telegram bot/user linking policy serta grup admin ops.  
21. Retention final untuk rejected applicant, alumni workspace, DO data, notification delivery logs, dan AI logs.  
22. Jumlah santri/pengajar aktif dan ukuran tugas tipikal untuk menetapkan quota final.

# **66\. Referensi Teknis Terverifikasi untuk v1.2**

**Hermes Agent — Profiles: Running Multiple Agents —** https://hermes-agent.nousresearch.com/docs/user-guide/profiles/ — Profile memiliki home/config/memory/state terpisah; workspace dan sandboxing berbeda dari profile.

**Hermes Agent — Profile Commands —** https://hermes-agent.nousresearch.com/docs/reference/profile-commands/ — Perintah create/clone/clone-from/export/import untuk provisioning profile.

**9Router Architecture —** https://github.com/decolua/9router/blob/master/docs/ARCHITECTURE.md — OpenAI-compatible /v1/\*, routing/fallback, usage tracking dan request logging.

**9Router Repository / Quick Start —** https://github.com/decolua/9router — Deployment/local endpoint dan konfigurasi dasar.

**Resend — Webhooks —** https://resend.com/docs/webhooks/introduction — Webhook real-time untuk delivery/bounce dan event email lainnya.

**WhiskeySockets/Baileys —** https://github.com/WhiskeySockets/Baileys — Library TypeScript/WebSocket untuk WhatsApp Web; v7 membawa breaking changes dan bukan API bisnis resmi.

**Telegram Bots FAQ —** https://core.telegram.org/bots/faq — Broadcast bot gratis memiliki limit sekitar 30 pesan/detik; cukup untuk skala PMMI.

**MinIO Object Lifecycle Management —** https://min.io/docs/minio/linux/administration/object-management/create-lifecycle-management-expiration-rule.html — Lifecycle/expiration dapat digunakan untuk retention file admission/log/object tertentu.

**Repository PMMI —** https://github.com/ahmadasrizalmi/pmmi — Codebase public website yang menjadi foundation frontend PMMI Digital Campus.

# **Lampiran D — Notification Rule Examples**

RULE: assignment.deadline\_h1  
IF student has no final submission  
AND assignment.status \= OPEN  
THEN create IMPORTANT notification  
ROUTE: In-App \+ WhatsApp  
FALLBACK: Telegram  
DEDUP: assignment\_id \+ student\_id \+ h1

RULE: ai.credit\_95pct  
IF active user balance \<= 5% initial\_period\_quota  
THEN notification priority IMPORTANT  
ROUTE: In-App \+ WhatsApp  
FALLBACK: Telegram  
COOLDOWN: once per quota cycle

RULE: server.disk\_critical  
IF SSD \>= 90% OR HDD \>= 90%  
THEN priority CRITICAL  
ROUTE: Telegram Admin  
FALLBACK: Email Admin  
REPEAT: every 6h until acknowledged or recovered

# **Lampiran E — Suggested Notification Templates**

Template aktual sebaiknya singkat dan mengarahkan user ke dashboard. Hindari memasukkan data sensitif berlebihan dalam pesan eksternal.

| Use case | Contoh isi ringkas |
| :---- | :---- |
| Tugas baru | Tugas baru “Landing Page UMKM” tersedia. Deadline: 20 Feb, 21:00. Buka dashboard untuk detail. |
| Revisi | Ustadz meminta revisi “Video Profil Masjid”. Feedback dan deadline revisi tersedia di dashboard. |
| Nilai | Tugas “UI Design” sudah dinilai: 91/100. Lihat feedback lengkap di dashboard. |
| Accepted | Alhamdulillah, Anda diterima pada PMMI. Silakan selesaikan daftar ulang melalui link aman di email/dashboard admission. |
| Portfolio featured | Karya “Company Profile Masjid” dipilih sebagai Featured Project dan telah ditampilkan di pondokmultimedia.id. |
| AI credit low | AI Credit Anda tersisa 5%. Gunakan seperlunya sampai quota berikutnya atau tunggu reward/grant baru. |

# **Lampiran F — v1.2 Change Summary**

* Menambahkan Admission Period, applicant pipeline, selection, interview, decision, registration, dan enrollment provisioning.  
* Menghubungkan enrollment ke identity, cohort, class, MinIO quota, AI wallet, dan agent entitlement.  
* Menambahkan Notification Engine event-driven dengan PostgreSQL outbox/worker.  
* Menetapkan channel policy: In-App, Resend email, WhatsApp adapter, Telegram fallback/ops.  
* Menambahkan event catalog admission, academic, AI/Hermes, portfolio, lifecycle, dan infrastructure.  
* Menambahkan digest/throttling, retry/backoff, circuit breaker, preferences, templates, delivery tracking, dan security controls.  
* Memperbarui MVP dan roadmap sehingga Admission \+ Notification dibangun sebelum AI/Hermes production integration.