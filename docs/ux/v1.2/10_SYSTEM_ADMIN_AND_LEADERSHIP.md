# PMMI UX v1.2 - System Admin & Pimpinan

> `SYSTEM_ADMIN` adalah **Admin Web/Platform**, bukan staf operasional pondok. `PIMPINAN` adalah role governance/approval, bukan admin server.

## A. System Admin portal (`/system/*`)

| Page | Route | Primary purpose | CRUD / action boundary |
|---|---|---|---|
| W01 Platform Overview | `/system` | Health API/DB/MinIO/worker/9Router/Hermes + security alerts | R system health; resolve ops alerts only |
| W02 Users | `/system/users` | Identity lifecycle | C/R/U account; disable/archive, no hard-delete referenced users; assign roles/capabilities |
| W03 Roles & Permissions | `/system/roles` | RBAC v2 | C/R/U/archive custom role; C/R/U/D role-permission grants; built-ins protected |
| W04 AI Models & Policies | `/system/ai/models` | Model aliases, role/model policy, rate limits | C/R/U/archive model alias; C/R/U/D policy |
| W05 LLM API Keys | `/system/ai/api-keys` | Generate/rotate/revoke USER/AGENT/SERVICE keys | C key; R metadata/prefix; rotate; revoke; secret shown once |
| W06 Credits & Ledger | `/system/ai/credits` | Wallet policy and auditable adjustments | R wallet/ledger; C compensating grant/adjustment; ledger immutable |
| W07 Usage & Developer Docs | `/system/ai/usage` | Usage by user/model/key and API contract | R/filter/export; no mutation of usage logs |
| W08 Agent Templates | `/system/hermes/templates` | Safe Hermes defaults per use case | C/R/U/archive template; no user secret in template |
| W09 Runtime & Fleet | `/system/hermes/runtime` | Shared Hermes runtime/fleet/isolation | R; start/stop/quarantine/retry safe jobs under policy |
| W10 Messaging & Providers | `/system/integrations` | 9Router, Resend, Telegram, WhatsApp, MinIO provider config | C/R/U/disable integration; secret values never re-revealed |
| W11 Audit & Security | `/system/audit` | Immutable security/platform audit | R/filter/export only |
| W12 Ops & Backup | `/system/ops` | Incident, backup, restore readiness | R alerts/runs; resolve alert with note; trigger backup; no UI hard-delete |

### W02 - Users

```text
+--------------------------------------------------------------------------------+
| USERS                                                    [+ Create Account]      |
| [Search] [Role v] [Status v] [Capability v]                                    |
|--------------------------------------------------------------------------------|
| Ahmad Admin   SYSTEM_ADMIN   Active   last login 1h                  [Open]     |
| Ust. Zaid     USTADZ         Active   Fotografi, Videografi          [Open]     |
| Staff Nisa    STAFF          Active   Keuangan, Sarpras              [Open]     |
|--------------------------------------------------------------------------------|
| User Detail: account | roles | capabilities | security | sessions               |
+--------------------------------------------------------------------------------+
```

Akun boleh memiliki lebih dari satu role/capability. Staff menu bukan role baru per unit; unit diberikan melalui capability bundle.

### W03 - Roles & Permissions

```text
+--------------------------------------------------------------------------------+
| ROLES & PERMISSIONS                                                            |
| SYSTEM_ADMIN  [technical platform permissions]                                  |
| PIMPINAN      [report + approval permissions]                                   |
| STAFF         [capability-driven]                                               |
| USTADZ        [teaching-assignment scoped]                                      |
| SANTRI        [self scoped]                                                     |
|--------------------------------------------------------------------------------|
| Atomic permission examples                                                     |
| finance.records.manage       assets.loans.manage                                |
| student_affairs.manage       academic.grade.assigned                            |
| ai.keys.manage_all           hermes.runtime.manage                              |
+--------------------------------------------------------------------------------+
```

### W05 - LLM API Keys

```text
+--------------------------------------------------------------------------------+
| LLM API KEYS                                               [+ Generate Key]      |
| [Owner v] [Type USER/AGENT/SERVICE] [Status v] [Search prefix]                  |
|--------------------------------------------------------------------------------|
| pmmi_sk_ab12...   Ahmad   USER    chat,models   last 2h   ACTIVE    [Open]      |
| pmmi_sk_cd34...   Agent X AGENT   chat          last 5m   ACTIVE    [Open]      |
|--------------------------------------------------------------------------------|
| GENERATE                                                                        |
| Owner [Search user/agent] Name [________] Expires [90d v]                       |
| Scopes [chat] [models] Allowed models [v] Rate policy [v]                       |
| [Generate] -> SECRET SHOWN ONCE -> [Copy]                                       |
+--------------------------------------------------------------------------------+
```

**Key rules**
- Store only hash + prefix/metadata; full secret shown once on create/rotate.
- `USER`, `AGENT`, and `SERVICE` keys have separate owner type and usage attribution.
- System Admin never gives users upstream provider/9Router credentials.
- Rotation creates new secret and revokes/supersedes old key according to policy.

### W09 - Hermes Runtime & Fleet

```text
+--------------------------------------------------------------------------------+
| HERMES RUNTIME                                                                 |
| Shared install HEALTHY • Active profiles 18                                    |
| Isolation policy: Docker backend REQUIRED ✓ • safe write root ✓                |
|--------------------------------------------------------------------------------|
| Agent | Owner | Profile | Gateway | Runtime | Last job | Action                |
|--------------------------------------------------------------------------------|
| System Admin: Retry provisioning • Stop runaway • Quarantine                    |
+--------------------------------------------------------------------------------+
```

Runtime administration is machine/platform work. Persona/SOUL/channel/model configuration belongs to the agent owner wizard unless policy pins it.

---

## B. Pimpinan portal (`/leadership/*`)

Pimpinan gets decision context and approvals, but **never server secrets, LLM API secret values, provider tokens, or arbitrary technical controls**.

| Page | Route | Primary purpose | CRUD / action boundary |
|---|---|---|---|
| L01 Executive Dashboard | `/leadership` | Cross-unit KPIs + approval queue | R; approve/reject queued decisions |
| L02 Admissions Oversight | `/leadership/admissions` | Funnel, exception, decision report | R; optional exceptional approval by policy |
| L03 Finance Oversight | `/leadership/finance` | Receipts/expenses/outstanding + high-risk approvals | R/export; approve/reject reversal/write-off thresholds |
| L04 Kesantrian & Lifecycle | `/leadership/students` | Sensitive lifecycle approval | R; approve/reject request with note |
| L05 Academic Overview | `/leadership/academic` | Attendance/completion/grading backlog by Jalur/mapel | R/export only |
| L06 Assets Overview | `/leadership/assets` | Inventory exceptions and write-off approval | R; approve/reject write-off |
| L07 AI & Agent Resources | `/leadership/ai` | Aggregate AI spend/keys count/agent utilization | Aggregate R only; no key secrets |
| L08 Reports | `/leadership/reports` | Generate cross-unit snapshots | Generate/read/export; retention-controlled snapshots |

### L01 - Executive Dashboard

```text
+--------------------------------------------------------------------------------+
| PIMPINAN                                                                       |
| Santri aktif 69 • Pendaftar 42 • Cashflow summary • Asset overdue 3            |
| Academic completion • Lifecycle exceptions • AI spend summary                  |
|--------------------------------------------------------------------------------|
| APPROVAL NEEDED                                                                |
| 2 lifecycle • 1 finance adjustment • 1 asset write-off                         |
+--------------------------------------------------------------------------------+
```

### L04 - Lifecycle approval

```text
+--------------------------------------------------------------------------------+
| LIFECYCLE APPROVAL QUEUE                                                       |
| Ahmad • request SUSPENDED • Staff Kesantrian • [Review]                        |
| Fulan • request DROPOUT • Staff Kesantrian • [Review]                          |
|--------------------------------------------------------------------------------|
| Review                                                                          |
| Reason + evidence                                                               |
| Impact: login / academic write / AI / API keys / Hermes / notifications        |
| Communication draft                                                            |
| [Reject] [Approve]                                                              |
+--------------------------------------------------------------------------------+
```

Lifecycle changes such as SUSPENDED/DROPOUT are requested by authorized staff and approved under pondok policy. Technical consequences are automated only after the business decision is approved.

## C. Permission separation acceptance

1. `SYSTEM_ADMIN` login must not automatically expose finance/kesantrian/admissions records.
2. `PIMPINAN` must not see provider tokens, API key plaintext, server environment variables, or arbitrary Hermes shell controls.
3. A user who is both System Admin and Pondok Staff may switch portal context, but permissions remain explicitly granted and auditable.
4. Every privilege mutation (role, capability, teaching assignment, LLM key, integration secret rotation) creates an audit event.
