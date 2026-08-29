# PMMI UX Wireframe - Santri: AI, Agents & Notifications

### S07 - SANTRI - AI Workspace

**Route:** `/santri/ai`

**Goal:** Chat AI dengan transparansi credit tanpa terasa seperti admin console.

```text
+--------------------------------------------------------------------------------+
| AI Workspace                                 Credits: 84  [Usage]               |
| Model [Recommended: PMMI Coder v]                                              |
|--------------------------------------------------------------------------------|
| conversation thread                                                             |
| You: bantu review fungsi ini...                                                  |
| AI: ...                                                                         |
|--------------------------------------------------------------------------------|
| [Attach context later] [Tulis pesan...............................] [Send]       |
| Est. reserve <= 5 credits • actual usage reconciled automatically                |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Model list hanya yang diizinkan.
- Credit warning saat rendah, bukan menampilkan ledger setiap saat.
- Usage detail secondary page/drawer.

### S08 - SANTRI - AI Agents

**Route:** `/santri/agents`

**Goal:** Mengelola entitlement agent tanpa konsep container/CLI.

```text
+--------------------------------------------------------------------------------+
| AI Agents                                     Slots: 1/1                        |
|--------------------------------------------------------------------------------|
| Coding Agent           RUNNING             Last activity 5m                     |
| Workspace: Project workspace              [Open Agent]                          |
|--------------------------------------------------------------------------------|
| [+ Build AI Agent] disabled jika slot penuh                                     |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Build CTA menjelaskan bahwa agent dibuat dari shared Hermes runtime.
- Tidak tampilkan shell/path sebagai primary info.
- State badges: Building, Ready/Stopped, Starting, Running, Stopping, Archived, Failed.

### S09 - SANTRI - Agent Detail

**Route:** `/santri/agents/:id`

**Goal:** Start/Stop/Archive agent dengan status async dan batasan keamanan jelas.

```text
+--------------------------------------------------------------------------------+
| < Agents  Coding Agent                               RUNNING                    |
|--------------------------------------------------------------------------------|
| Status timeline: Built -> Started -> Running                                   |
| Workspace: Final Project                                                       |
| Last job: START success 11 Aug 17:02                                            |
|                                                                                |
| [Stop Agent]                                                                   |
| [Archive Agent] (secondary danger)                                              |
|--------------------------------------------------------------------------------|
| Activity / job history                                                         |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Start/Stop menghasilkan queued state dan polling/reload.
- Archive confirmation menjelaskan workspace retention policy.
- Failed job menampilkan Retry jika safe + error summary manusiawi.

### S10 - SANTRI - Notifications & Preferences

**Route:** `/santri/notifications`

**Goal:** Inbox tugas/notifikasi dan pengaturan channel yang sederhana.

```text
+--------------------------------------------------------------------------------+
| Notifications                           [Inbox] [Settings]                       |
|--------------------------------------------------------------------------------|
| [Unread] Revision requested • Final Web Project                  [Open]         |
| [Info] Class starts in 1 hour • Web Fundamental                                 |
| [Reward] Grade Excellence +20 credits                                            |
|--------------------------------------------------------------------------------|
| Settings                                                                       |
| Email: verified     WhatsApp: 62... [verify/link]   Telegram: [link]            |
| Assignment [on] Class reminder [on] Rewards [on]                               |
| Security/Lifecycle [mandatory]                                                  |
+--------------------------------------------------------------------------------+
```

**Key behaviors**
- Deep-link ke task.
- Mandatory categories locked with explanation.
- Channel verification status explicit.
