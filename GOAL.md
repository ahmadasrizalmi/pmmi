# GOAL — PMMI Digital Campus: Implementasi Blueprint v1.2 100% (Code + Production Deployment)

## 1. Tujuan

Implementasikan **PMMI Digital Campus Blueprint v1.2** (`docs/PMMI_Digital_Campus_Blueprint_v1.2.md`) sampai **100%**, mencakup dua gate:

1. **Repository**: kode lengkap, CI hijau — *sudah tercapai, JAGA JANGAN REGRESI*.
2. **Production deployment**: seluruh komponen terverifikasi berjalan di home server (`pmmiserver`) dengan bukti konkret, sesuai kontrak `docs/BLUEPRINT_IMPLEMENTATION_STATUS.md` dan `docs/DEPLOYMENT.md`.

GOAL ini bersifat **looping**: setiap iterasi wajib memajukan backlog sisa pekerjaan (bagian 5), diverifikasi, didokumentasikan, di-commit, dan di-push — sampai Definition of Done (bagian 4) terpenuhi. Jangan berhenti di tengah fase. Bila suatu item terblokir kredensial/aksi user, kerjakan item lain yang bisa, dan laporkan blokir secara eksplisit di docs status.

## 2. Lingkungan & Akses

| Item | Nilai |
|---|---|
| Repo lokal (Windows) | `D:/9 KANDA/vibecoding/pmmi` — branch `main`, sinkron dengan origin |
| GitHub | `https://github.com/ahmadasrizalmi/pmmi.git` |
| Server | `ssh pmmiserver@pmmiserver` — **key auth SUDAH aktif, tanpa password** |
| Tailscale | sudah terhubung; IP server `100.127.181.108` (nama Tailscale `pmmiserver`) |
| Password fallback SSH | lihat `.credentials.local` (file lokal, **gitignored** — dilarang commit) |
| Layout deploy server | `/home/pmmiserver/pmmi/current` (compose `infra/docker/compose.yml`) |
| Env produksi server | `/home/pmmiserver/pmmi/.env` (secrets — dilarang commit/print penuh) |

Alur sinkronisasi: kerja di lokal → commit → push GitHub → di server `git -C /home/pmmiserver/pmmi/current pull --ff-only` → build/up service terdampak → health-check.

## 3. Kondisi Terverifikasi Saat Ini (FINAL — 2026-08-22)

> Status akhir setelah looping. Semua bukti di `docs/evidence/`. Beberapa dependensi user tersisa didokumentasikan sebagai blocked (kredensial).

- **TLS LIVE**: tunnel Cloudflare `pmmi-home-server` + `cloudflared` service → `https://` ketiga domain **200 OK** (`pondokmultimedia.id`→web, `app.`→dashboard, `ai.`→API) + redirect http→https (301, edge).
- **Exposure**: PostgreSQL/Redis/MinIO/9Router hanya bind `127.0.0.1` + Tailscale `100.127.181.108`; ufw aktif; tanpa docker.sock mount; `CORS_ORIGINS` allowlist produksi (ditegakkan live); `BOOTSTRAP_ADMIN_TOKEN` dihapus (bootstrap 403).
- **E2E MVP 12 langkah LOLOS via domain produksi** (G7): applicant → review → daftar ulang → ENROLLED → aktivasi → login → tugas/upload/nilai → reward → AI gateway + **ledger metering live** (reserve→refund/reconcile) → Build Agent (container READY/RUNNING/STOP) → featured portfolio publik → delivery status + fallback → admin health.
- **Hermes**: v0.20.5 service account `pmmi`, template `pmmi-template` (9Router container-reachable), host worker active (Docker worker stop), **container sandbox + adversarial isolation test LOLOS**, `HERMES_ENABLED=true`.
- **Notifikasi**: EMAIL **Resend LIVE** (delivery nyata, `NOTIFICATION_TRANSPORT=live`); retry/backoff teramati; **TELEGRAM/WHATSAPP blocked** (belum ada kredensial user — documented).
- **Ops**: ops-monitor (5 mnt) + backup (02:34 UTC) timer aktif; backup `FULL|SUCCEEDED` + checksum; **restore drill sukses**; `backup_runs` tercatat.
- **Lifecycle**: DROPOUT live → wallet 0, entitlements 0, ledger `lifecycle.resource_shutdown`, `hermes.user.archive`, profile ARCHIVED, container dihapus, teraudit.
- **9Router**: routing/format usage/usage-tracking verified; metering ledger akurat; **fallback belum dikonfigurasi** (butuh provider key kedua — blocked user).
- Repo `main` sinkron; **CI hijau** pada commit final (`PMMI Blueprint CI`).
- Layout deploy: `/home/pmmiserver/pmmi` (bukan `/srv/pmmi`); HDD 465.8G di `/data` (postgres/minio/backup).

## 4. Definition of Done (100%)

Semua kondisi berikut harus terpenuhi dan **terbukti** (bukan klaim):

1. **CI hijau** pada commit final: workflow `PMMI Blueprint CI` (job `blueprint`) — test API/worker, semua build (web, dashboard, api, worker, whatsapp), `validate:ui`, validasi compose (kontrak lengkap di `BLUEPRINT_IMPLEMENTATION_STATUS.md`).
2. **TLS aktif** untuk `pondokmultimedia.id`, `app.pondokmultimedia.id`, `ai.pondokmultimedia.id` + redirect http→https; vhost: pondokmultimedia.id→:8080, app→:8081, ai→:3001.
3. **Tanpa eksposur publik**: PostgreSQL, MinIO, Docker socket, Baileys (3010), Hermes control, 9Router admin hanya loopback/Tailscale; `CORS_ORIGINS` allowlist produksi.
4. **MVP v1.2 acceptance (§62)**: 12 langkah lolos end-to-end via domain produksi tanpa operasi manual DB/server — applicant → admission → review → daftar ulang → ENROLLED → aktivasi → login → tugas/notif/upload/nilai → reward → AI request via gateway + ledger tercatat → Build Agent → featured portfolio publik → delivery status + fallback → admin health/alert.
5. **9Router production**: routing/fallback/format usage response diverifikasi; metering PMMI akurat (reservation → settle/reconcile/refund; penanganan `stream:false`).
6. **Hermes**: satu instalasi host + service account `pmmi` + template profile PMMI + provisioning worker; **adversarial isolation test lolos** sebelum agent santri diberi eksekusi; `HERMES_ENABLED=true` hanya setelah lolos.
7. **Notifikasi eksternal**: minimal satu channel live dengan delivery nyata (Resend/Telegram/WA sesuai kredensial tersedia); retry/fallback/circuit breaker berfungsi; sisanya documented blocked bila kredensial tidak ada.
8. **Lifecycle automation**: transisi ACTIVE→GRADUATED→ALUMNI dan DO memicu stop agent / expire quota / archive sesuai policy, teraudit.
9. **Ops**: ops-monitor + backup timer aktif; **restore drill sukses** ke non-production; `backup_runs` tercatat.
10. **Dokumentasi final**: `BLUEPRINT_IMPLEMENTATION_STATUS.md`, `DEPLOYMENT.md`, `SERVER_PREREQUISITES.md` mencerminkan realita; semua perubahan di-push.

## 5. Backlog Sisa Pekerjaan (urutan prioritas)

| ID | Item | Status final | Catatan |
|---|---|---|---|
| G1 | TLS/HTTPS + DNS 3 domain + vhost nginx | ✅ SELESAI | Tunnel Cloudflare + cloudflared service; https 3 domain 200 + redirect 301 (`docs/evidence/G1.md`) |
| G2 | Restriksi eksposur | ✅ SELESAI | Bind loopback+Tailscale, ufw, CORS allowlist live, bootstrap token dihapus (`docs/evidence/G2.md`) |
| G3 | Channel eksternal | 🔶 EMAIL SELESAI; TG/WA blocked | Resend LIVE + delivery nyata + retry; TELEGRAM/WHATSAPP butuh kredensial user (`docs/evidence/G3.md`) |
| G4 | Hermes | ✅ SELESAI | v0.20.5 pmmi + template + host worker + container sandbox, isolation test LOLOS, `HERMES_ENABLED=true` (`docs/evidence/G4.md`) |
| G5 | Ops: monitor + backup/restore drill | ✅ SELESAI | Timers aktif; restore drill sukses; `backup_runs` tercatat (`docs/evidence/G5.md`) |
| G6 | 9Router hardening & metering | ✅ metering; 🔶 fallback | Routing/usage/metering ledger verified; fallback butuh provider key kedua (`docs/evidence/G6.md`+`G7.md`) |
| G7 | E2E MVP §62 via domain produksi | ✅ SELESAI | 12 langkah lolos via domain + ledger live + lifecycle live (`docs/evidence/G7.md`) |
| G8 | Update docs status + final commit/push | ✅ SELESAI | Docs mencerminkan realita; CI hijau; status final di §3 |

## 6. Loop Protocol (wajib per iterasi)

1. **Baca dulu**: GOAL.md + `docs/BLUEPRINT_IMPLEMENTATION_STATUS.md` + docs terkait item.
2. **Ambil item terbuka** dari backlog (G1→G8). Item terblokir dependensi user → kerjakan yang bisa, tandai blocked + alasannya.
3. **Verifikasi kondisi aktual** (SSH/curl/psql/docker) — catat snapshot sebelum mengubah.
4. **Implementasi** (kode lokal ATAU konfigurasi server); ikuti pola yang sudah ada — dilarang menciptakan konvensi kedua.
5. **Verifikasi** dengan bukti konkret; simpan ke `docs/evidence/<item>.md` (command + output, **sensitif disanitasi** — tanpa token/password penuh).
6. **Update docs status** — truth lives in docs.
7. **Commit + push** ke `main`; di server `git pull --ff-only` + build/up service terdampak; jalankan `infra/scripts/health-check.sh`.
8. **Ulangi** sampai Definition of Done. Setiap turn harus memajukan backlog — dilarang berhenti di tengah fase.

## 7. Aturan Keras

- **Secrets tidak pernah masuk git**: password, API keys, token bot, WA auth state → hanya di `/home/pmmiserver/pmmi/.env` dan file lokal gitignored (`*.local`). Jangan print secrets penuh di log/bukti.
- **Jangan expose**: PostgreSQL, MinIO admin, Docker socket, Baileys, Hermes control, 9Router admin → loopback/Tailscale only.
- **Hermes**: eksekusi agent dilarang sampai adversarial isolation test lolos; satu instalasi — dilarang install ulang per santri.
- **Baileys**: satu akun WA khusus; tanpa broadcast massal/spam; state auth dilindungi dan dibackup.
- **Operasi destruktif** (restore, drop, delete, restart massal): wajib backup valid terakhir + konfirmasi eksplisit.
- **Immich**: workload terpisah — dilarang diubah/dihentikan untuk keperluan PMMI.
- **Konflik repo**: perubahan user dianggap milik user; adaptasi, jangan timpa.
- **Audit trail**: dilarang bypass audit log untuk grade/credit/admission/lifecycle/featured/broadcast.
- **Dokumentasi = kontrak**: bila realita server berbeda dari docs, perbarui docs — jangan biarkan divergen.

## 8. Dependensi yang Harus Diminta ke User (bila belum ada)

- DNS A record + port forwarding untuk 3 subdomain (akses registrar).
- Resend API key + verifikasi domain; token Telegram bot (@BotFather); nomor WhatsApp khusus PMMI.
- (Opsional) keputusan retention final DO/alumni dan approval komunikasi sensitif.

## 9. Status Akhir

Setelah seluruh acceptance criteria (bagian 4) terbukti: update bagian 3 & 5 di dokumen ini ke status final, commit, push. Status akhir: **PMMI Digital Campus 100% implemented & production verified** — bukti di `docs/evidence/`.
