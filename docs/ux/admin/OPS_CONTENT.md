# PMMI UX Wireframe - Admin: Ops, Notifications & Portfolio

### A15 - ADMIN - Ops & Backup

**Route:** `/admin/ops`

**Goal:** Mengetahui health service dan backup tanpa membaca log mentah.

```text
+--------------------------------------------------------------------------------+
| Ops & Backup                                                                     |
| API ●  DB ●  MinIO ● 9Router ○  Hermes ○  Outbox ●                              |
|--------------------------------------------------------------------------------|
| Critical / Warning alerts                                                        |
| [CRIT] Backup failed 02:10   [Open] [Resolve]                                    |
| [WARN] Disk 78%               [Open]                                             |
|--------------------------------------------------------------------------------|
| Backups: Last success 10 Aug 02:00 • checksum ✓ • off-host ?                     |
| [View runs] [Runbook]                                                            |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Raw log/details behind expandable technical section.
- Resolve alert requires note.
- Backup drill status distinct from backup-created status.

### A16 - ADMIN - Notifications

**Route:** `/admin/notifications`

**Goal:** Memantau delivery dan mengelola channel/preference admin.

```text
+--------------------------------------------------------------------------------+
| Notifications                               [Inbox] [Delivery Monitor] [Settings]|
|--------------------------------------------------------------------------------|
| Inbox: lifecycle review, ops alert, admission tasks                              |
| Delivery Monitor: event | channel | provider | status | attempts | next retry   |
|--------------------------------------------------------------------------------|
| Settings:                                                                      |
| Email [verified]   WhatsApp [linked]   Telegram [linked]                         |
| Categories: Academic [on] Admission [on] Ops [mandatory] Lifecycle [mandatory]   |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Preference per user terpisah dari delivery monitor system-wide.
- Mandatory category terlihat locked, bukan toggle yang gagal diam-diam.
- Provider failure punya retry/fallback trace.

### A17 - ADMIN - Portfolio Manager

**Route:** `/admin/portfolio`

**Goal:** Meninjau karya featured dan mengubah visibility sesuai policy.

```text
+--------------------------------------------------------------------------------+
| Portfolio Manager                                                               |
| [Published 42] [Unpublished 3] [Search santri/project]                           |
|--------------------------------------------------------------------------------|
| Thumbnail | Project | Santri | Course | Featured by | Visibility | Action       |
|           | WebApp  | Ahmad  | WEB101 | Ust. Zaid   | PUBLIC     | [Open]       |
|--------------------------------------------------------------------------------|
| Detail: asset snapshot + grade context + public preview                          |
| [Unpublish] -> reason confirmation                                               |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Feature publication tetap immediate; admin controls post-public visibility.
- Unpublish/re-publish selalu reason + audit.
- Public preview link tersedia.
