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

## 3. Kondisi Terverifikasi Saat Ini (snapshot 2026-08-22)

> Dari audit SSH langsung. **Selalu verifikasi ulang sebelum bertindak** — jangan mengandalkan asumsi.

- Compose project `docker` di `/home/pmmiserver/pmmi/current`: `api` (127.0.0.1:3001), `web` (127.0.0.1:8080), `dashboard` (127.0.0.1:8081) — semua **healthy** (~43 jam berjalan).
- `nginx-proxy` (nginx:alpine) listen `:80`, config `default.conf` — **TLS/443 BELUM ada**.
- `pmmi-9router` (decolua/9router:latest) aktif di `127.0.0.1:20128`; `GET /v1/models` OK (provider `ds` → deepseek); `NINE_ROUTER_API_KEY` terisi.
- `postgres:17` aktif; **5432 bind `0.0.0.0` (v4+v6)** — melanggar baseline §14, WAJIB direstriksi.
- `minio` aktif; **9000 bind `0.0.0.0`** — WAJIB direstriksi.
- Immich v3 + postgres/redis/ML sendiri — **workload terpisah, JANGAN diganggu**.
- **Hermes BELUM diinstal** (tidak ada binary; `HERMES_ENABLED` false).
- Env produksi belum berisi: `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, webhook secrets, `META_WHATSAPP_*`, `BAILEYS_*`.
- `/srv/pmmi` belum ada; realita deploy `/home/pmmiserver/pmmi` — pertahankan layout berjalan, perbarui docs.
- `df -h` hanya menampilkan satu volume root 98G; HDD 500 GB tidak tampak — audit `lsblk`/mount saat fase ops.
- Repo lokal clean & up-to-date dengan `origin/main`.

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

| ID | Item | Kondisi sukses | Dependensi eksternal (user) |
|---|---|---|---|
| G1 | TLS/HTTPS + DNS 3 domain + vhost nginx | `curl -I https://` ketiga domain OK; redirect http→https | A record DNS ke IP publik server; port 80/443 diteruskan |
| G2 | Restriksi eksposur: bind PostgreSQL/MinIO ke loopback/Tailscale; firewall (ufw); CORS allowlist; bootstrap admin dibuat lalu token dihapus | `ss -tlnp` tidak menunjukkan 5432/9000/3010 publik; CORS hanya origin PMMI | — |
| G3 | Channel eksternal: Resend (domain verify + webhook signed), Telegram bot + linking, WhatsApp (Baileys pairing akun khusus ATAU Meta) | delivery nyata dengan status + retry; webhook verified | Resend API key + DNS verify; token bot @BotFather; nomor WA khusus PMMI |
| G4 | Hermes: instalasi sekali, service account, workspace root, template profile, host worker systemd, isolation test | `hermes --version` di host; provisioning profile santri aman; isolation test lolos | — |
| G5 | Ops: ops-monitor + backup/restore drill | event health/disk/9Router tercatat; restore sukses; `backup_runs` ada | — |
| G6 | 9Router hardening & metering verification | fallback/provider/usage diverifikasi; ledger settle benar | provider keys di 9Router (cek dulu) |
| G7 | E2E smoke test MVP §62 via domain produksi | 12 langkah lolos; bukti disimpan | G1–G3 selesai |
| G8 | Update docs status + final commit/push | docs mencerminkan realita; CI hijau | — |

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
