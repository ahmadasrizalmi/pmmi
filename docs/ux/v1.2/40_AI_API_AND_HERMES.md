# PMMI UX v1.2 - LLM API Access & Hermes Agent Pipeline

## 1. PMMI LLM API product contract

The PMMI AI Gateway is not only a dashboard chat feature. Eligible Santri/Ustadz must receive a developer-facing API surface.

### End-user contract

- **Base URL:** `https://ai.pondokmultimedia.id/v1`
- OpenAI-compatible routes: `GET /models`, `POST /chat/completions`.
- Authentication: `Authorization: Bearer pmmi_sk_...`.
- Personal key metadata: name, prefix, scopes, allowed models, rate policy, expiry, last-used, created-at, revoked-at.
- Full secret is displayed **once** during create/rotate.
- Existing key secret can never be revealed again.
- Dashboard chat and API calls use the same PMMI wallet/immutable ledger.
- Provider/9Router credentials remain server-side.

### Santri/Ustadz API Access page

```text
+--------------------------------------------------------------------------------+
| PMMI LLM API ACCESS                                                            |
| Base URL                                                                        |
| https://ai.pondokmultimedia.id/v1                         [Copy]                |
|--------------------------------------------------------------------------------|
| API KEYS                                                   [+ Create Key]       |
| pmmi_sk_ab12... • Laptop • last used 2h • expires 90d [Rotate] [Revoke]       |
|--------------------------------------------------------------------------------|
| Allowed models: pmmi-fast, pmmi-coder                                          |
| Rate policy: 30 req/h        Credits: 84                                       |
|--------------------------------------------------------------------------------|
| QUICK START                                                                     |
| [cURL] [Python/OpenAI SDK] [JavaScript/OpenAI SDK]                             |
+--------------------------------------------------------------------------------+
```

### System Admin key page

```text
+--------------------------------------------------------------------------------+
| LLM API KEYS                                               [+ Generate Key]      |
| [Owner v] [Type USER/AGENT/SERVICE] [Status v] [Search prefix]                  |
|--------------------------------------------------------------------------------|
| pmmi_sk_ab12... Ahmad   USER    chat,models  last 2h ACTIVE [Open]             |
| pmmi_sk_cd34... Agent X AGENT   chat         last 5m ACTIVE [Open]             |
|--------------------------------------------------------------------------------|
| GENERATE                                                                        |
| Owner [Search user/agent] Name [________] Expires [90d v]                       |
| Scopes [chat] [models] Allowed models [v] Rate policy [v]                       |
| [Generate] -> SECRET SHOWN ONCE -> [Copy]                                       |
+--------------------------------------------------------------------------------+
```

### Key CRUD

| Operation | USER own key | SYSTEM_ADMIN | Notes |
|---|---|---|---|
| Create | Yes, if policy allows | Yes | Plaintext shown once |
| Read | Metadata/prefix only | Metadata/prefix only | Never return secret/hash |
| Update name | Yes | Yes | Does not mutate secret |
| Rotate | Yes | Yes | New secret; old key revoked/superseded |
| Revoke | Yes | Yes | Audited |
| Delete row | No | No | Retain lifecycle/usage reference |
| Change scopes/models | Policy-limited | Yes | May require re-auth/approval |

### Copyable examples

```bash
export PMMI_API_KEY='pmmi_sk_...'
curl https://ai.pondokmultimedia.id/v1/chat/completions \
  -H "Authorization: Bearer $PMMI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"pmmi-coder","messages":[{"role":"user","content":"Halo"}]}'
```

```python
from openai import OpenAI
client = OpenAI(
    api_key=os.environ['PMMI_API_KEY'],
    base_url='https://ai.pondokmultimedia.id/v1',
)
response = client.chat.completions.create(
    model='pmmi-coder',
    messages=[{'role':'user','content':'Halo'}],
)
```

```javascript
const client = new OpenAI({
  apiKey: process.env.PMMI_API_KEY,
  baseURL: 'https://ai.pondokmultimedia.id/v1',
});
```

---

## 2. Hermes Agent: required onboarding state machine

Agent creation is a configuration/provisioning workflow, not a `Build Agent` button.

```text
DRAFT
  -> PROFILE_CONFIGURED
  -> SOUL_CONFIGURED
  -> CHANNEL_CONNECTED
  -> LLM_CONFIGURED
  -> HOME_VERIFIED
  -> SAFETY_VERIFIED
  -> READY
  -> STARTING
  -> RUNNING
  -> STOPPED / ERROR
  -> ARCHIVED
```

A profile cannot become `READY` until every required step validates.

## 3. Seven-step Create Agent wizard

### H01 - Step 1: Create Agent / Profile

**Route:** `/agents/new?step=profile`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 1 / 7                                                           |
| Profile > SOUL > Channel > LLM > Workspace/Home > Safety > Review              |
|--------------------------------------------------------------------------------|
| Nama Agent        [Coding Mentor________________]                              |
| Slug/Profile      [coding-mentor] (auto, unique)                                |
| Tujuan singkat    [Membantu saya belajar coding...]                            |
| Template          [Coding Assistant v]                                         |
| Owner             Ahmad Rizal (fixed)                                          |
| [Save Draft]                                              [Continue]            |
+--------------------------------------------------------------------------------+
```

**CRUD:** Create/read/update DRAFT profile; archive/cancel instead of destructive delete.

### H02 - Step 2: `SOUL.md`

**Route:** `/agents/:id/setup/soul`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 2 / 7 • IDENTITY / SOUL.md                                     |
|--------------------------------------------------------------------------------|
| Peran          [Senior coding mentor________________________]                   |
| Kepribadian    [Sabar, jelas, tidak memberi jawaban instan...]                 |
| Gaya bahasa    [Indonesia santai v]                                             |
| Prinsip/batasan [.........................................................]      |
|                                                                                |
| [Guided] [Raw SOUL.md]                                                         |
| Preview:                                                                       |
| # Identity ...                                                                  |
| [Save]                                                     [Continue]           |
+--------------------------------------------------------------------------------+
```

**CRUD:** versioned SOUL records; create/edit/select active version; preserve history.

**Contract:** `SOUL.md` contains agent identity/personality. Project-specific instructions belong in project context such as `AGENTS.md`, not mixed into permanent persona by default.

### H03 - Step 3: Messaging Channel

**Route:** `/agents/:id/setup/channel`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 3 / 7 • CHANNEL                                                 |
| Choose: (● Telegram) (○ WhatsApp)                                               |
|--------------------------------------------------------------------------------|
| TELEGRAM                                                                        |
| Bot Token [********************************] [Test Connection]                  |
| Bot: @coding_mentor_bot ✓                                                       |
| Access: Owner only [Ahmad]                                                      |
| Status: CONNECTED                                                               |
|                                                                                |
| WhatsApp -> pairing/session flow + connection test                              |
| [Save]                                                     [Continue]           |
+--------------------------------------------------------------------------------+
```

**CRUD:** create/read/update/unlink channel connection; rotate secret/session via controlled flow.

**Rules**
- Each Hermes profile has independent gateway state.
- A Telegram bot token must not be reused concurrently across two profiles.
- WhatsApp session material is a secret and needs persistent protected storage.
- Platform-managed WhatsApp Cloud API secrets remain in System Admin integration config, not user forms.

### H04 - Step 4: LLM Settings

**Route:** `/agents/:id/setup/llm`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 4 / 7 • LLM                                                    |
| Provider          [PMMI LLM Gateway (managed) v]                                |
| Base URL          https://ai.pondokmultimedia.id/v1        [policy locked]      |
| Model             [pmmi-coder v]                                                |
| Credential        [Generate Agent API Key]                                      |
| Key               pmmi_sk_... CREATED • stored securely • shown once           |
| Credit source     Owner wallet / assigned budget                                |
| Rate policy       30 req/h                                                      |
| [Test LLM] -> Success 642ms                                                     |
| [Save]                                                     [Continue]           |
+--------------------------------------------------------------------------------+
```

**CRUD:** create/read/update/disable LLM config; create/rotate/revoke dedicated AGENT API key.

Default PMMI policy should pin the base URL to PMMI Gateway so the agent never needs direct upstream provider credentials.

### H05 - Step 5: Workspace & `/sethome`

**Route:** `/agents/:id/setup/home`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 5 / 7 • WORKSPACE & HOME                                       |
| Workspace                                                                      |
| [Create new workspace: coding-mentor v]                                         |
| Resolved cwd: /srv/pmmi/workspaces/<owner>/<agent>                             |
|--------------------------------------------------------------------------------|
| HOME CHANNEL                                                                    |
| Telegram @coding_mentor_bot • DM with Ahmad                                    |
| 1. Open bot  2. Send /sethome  3. [Verify Home Channel]                        |
| Status: HOME VERIFIED ✓                                                        |
| [Save]                                                     [Continue]           |
+--------------------------------------------------------------------------------+
```

**CRUD:** create/read controlled workspace; controlled move/retire; create/read/update/unbind home binding.

`terminal.cwd` is the working directory. The Hermes profile/HERMES_HOME is a separate concept.

### H06 - Step 6: Tools & Safety

**Route:** `/agents/:id/setup/safety`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 6 / 7 • SAFETY                                                 |
| Runtime backend      Docker (managed) ✓                                         |
| Workspace write root /srv/pmmi/workspaces/<owner>/<agent> ✓                    |
| Network              Allowed by template                                       |
| Dangerous commands   Smart/Manual approval                                     |
| Tools                 [Web ✓] [Terminal ✓] [Files ✓] [MCP policy]              |
| Secrets forwarded    NONE by default ✓                                          |
|                                                                                |
| Advanced settings managed by System Admin.                                      |
| [Continue]                                                                      |
+--------------------------------------------------------------------------------+
```

**CRUD:** user can update only a permitted subset. Platform-managed safety policy always wins.

A Hermes profile/workspace is not an OS sandbox; production activation requires an actual isolation policy/runtime.

### H07 - Step 7: Review & Activate

**Route:** `/agents/:id/setup/review`

```text
+--------------------------------------------------------------------------------+
| CREATE AGENT - 7 / 7 • REVIEW                                                 |
| Profile       Coding Mentor                     ✓                               |
| SOUL.md       configured                        ✓                               |
| Channel       Telegram @coding_mentor_bot       ✓                               |
| LLM           PMMI / pmmi-coder                ✓                               |
| Workspace     /srv/.../coding-mentor            ✓                               |
| Home channel  verified                          ✓                               |
| Safety        Docker policy                     ✓                               |
|--------------------------------------------------------------------------------|
| [Build & Activate Agent]                                                        |
| Provision files -> validate -> start gateway -> READY/RUNNING                   |
+--------------------------------------------------------------------------------+
```

Activation creates a provisioning job; the UI must show queued/running/success/failed and safe retry where appropriate.

## 4. H08 Agent Detail & Runtime

**Route:** `/agents/:id`

```text
+--------------------------------------------------------------------------------+
| CODING MENTOR                                      RUNNING                      |
| [Overview] [SOUL] [Channel] [LLM] [Workspace] [Jobs]                           |
| Channel Telegram ✓ • Model pmmi-coder • Home ✓ • last activity 5m             |
|--------------------------------------------------------------------------------|
| [Stop] [Restart]                                                               |
| Secondary: [Edit Setup] [Rotate LLM Key] [Archive Agent]                       |
| Runtime jobs: START success • MODEL TEST success ...                            |
+--------------------------------------------------------------------------------+
```

**Agent CRUD semantics**
- Create only through the wizard.
- Read complete setup/runtime health.
- Update SOUL/channel/model/workspace through validated workflows with version/job history.
- Rotate agent API key without exposing old secret.
- Start/Stop/Restart/Rebuild are runtime jobs.
- Archive is the normal delete behavior. Hard-delete requires System Admin + explicit retention policy.

## 5. Required persistence/backend additions

| Entity | Purpose |
|---|---|
| `ai_api_keys` | owner type USER/AGENT/SERVICE, prefix, key hash, scopes, models, expiry, last-used, revoked-at, creator |
| `ai_key_policy` | max keys, TTL, scopes, models, rate limit, eligibility |
| `agent_profiles` | owner, profile slug/name, template, setup/runtime state |
| `agent_soul_versions` | versioned `SOUL.md`, active version |
| `agent_channel_connections` | Telegram/WhatsApp connection + encrypted secret reference |
| `agent_llm_configs` | PMMI base URL policy, model, key ref, wallet/credit source |
| `agent_workspaces` | `terminal.cwd`, ownership, lifecycle |
| `agent_home_bindings` | messaging home chat + `/sethome` verification |
| `agent_safety_configs` | runtime backend, allowed tool/network/write policy |
| `agent_runtime_jobs` | PROVISION/TEST/START/STOP/RESTART/ARCHIVE/ROTATE state, attempts, error |

## 6. Implementation acceptance

1. API key authentication is accepted by PMMI OpenAI-compatible routes in addition to dashboard session auth where applicable.
2. Raw key is never persisted or returned after create/rotate.
3. Usage records include API-key identity so user/agent/service usage can be attributed.
4. Revocation takes effect immediately.
5. Agent cannot become READY if SOUL, channel, LLM, workspace/home or safety check is missing.
6. One agent cannot read another owner's workspace or secret.
7. Browser E2E covers each wizard step, failed connection, resume draft, activation, start/stop and archive.
