# PMMI Digital Campus UX

> **Canonical review target: UX v1.2.**
>
> The original v1 files in this PR are **superseded**. They are retained only as historical drafts and must not be used to implement the frontend.

UX v1.2 was rewritten after studying:

- the actual PMMI calon-santri biodata form;
- the PMMI two-track academic structure;
- the real pondok staffing model (Pimpinan, Staff, Ustadz, Santri, technical Admin Web);
- the official Hermes Agent profile/SOUL/messaging/configuration model.

## Canonical v1.2 documents

1. [Core, PMMI sources, actor model, public foundation](./v1.2/00_CORE_AND_ACTORS.md)
2. [Public, Applicant & Shared surfaces](./v1.2/05_PUBLIC_APPLICANT_SHARED.md)
3. [System Admin & Pimpinan](./v1.2/10_SYSTEM_ADMIN_AND_LEADERSHIP.md)
4. [Staff Pondok by capability](./v1.2/20_STAFF_PONDOK.md)
5. [Ustadz & Santri](./v1.2/30_USTADZ_AND_SANTRI.md)
6. [LLM API Access & 7-step Hermes Agent pipeline](./v1.2/40_AI_API_AND_HERMES.md)
7. [Backend impact & CRUD rules](./v1.2/50_BACKEND_IMPACT_AND_CRUD_RULES.md)

## Locked actor separation

- `/system/*` — **SYSTEM_ADMIN / Admin Web**: platform IAM, AI Gateway, LLM API keys, Hermes runtime, integrations, security, audit, backup/ops.
- `/leadership/*` — **PIMPINAN**: cross-unit reports and sensitive approvals; never platform/provider secrets.
- `/office/*` — **STAFF Pondok**: menus assembled from capabilities such as admissions, finance, kesantrian, sarpras/peminjaman, general administration.
- `/ustadz/*` — **USTADZ Pengampu**: teaching-assignment scoped; examples supplied by pondok include Fotografi, Videografi, Programmer, Tahsin, and UK.
- `/santri/*` — **SANTRI**: learning, submission, portfolio/certificates, AI Playground, LLM API access, Hermes Agent.
- `/daftar/*` — Applicant admission flow.

One user may hold more than one role/capability. The current single enum `ADMIN/USTADZ/SANTRI` is therefore an implementation gap, not the target UX authorization model.

## Admission correction

The initial `/daftar` flow follows the actual biodata form groups:

1. Identitas
2. Keluarga
3. Wali
4. Fisik & Kesehatan
5. Latar Rumah
6. Kecakapan & Prestasi
7. Motivasi
8. Dokumen

The supplied form does **not** contain a Jalur selection. UX v1.2 therefore does not force Konten Kreator/Programmer choice during initial biodata; placement is a separate controlled process until pondok policy defines the exact moment.

## LLM access correction

Eligible Santri/Ustadz receive:

- Base URL `https://ai.pondokmultimedia.id/v1`;
- personal API-key create/rotate/revoke flow;
- allowed models, rate policy, expiry, last-used and credit information;
- copyable cURL, Python/OpenAI SDK and JavaScript examples.

System Admin has a separate LLM key management page for USER, AGENT and SERVICE keys. Full secrets are shown once only; existing keys are never revealable.

## Hermes correction

`Create Agent` is a seven-step pipeline:

1. Agent/profile name and template
2. `SOUL.md` role/personality
3. Telegram or WhatsApp connection
4. PMMI LLM model + dedicated AGENT API key
5. workspace / `terminal.cwd` + `/sethome` verification
6. tools & safety policy
7. review, provision, activate

An agent cannot become READY until every required step validates. Start/Stop/Restart/Archive operate through runtime jobs after setup.

## CRUD rule

Every v1.2 page documents entities and create/read/update/delete semantics. Important records use archive/cancel/reversal/state-transition rather than silent hard delete. Examples: posted finance records, AI ledger, audit events, lifecycle decisions, agent history and assets with loan history.

## UX implementation gate

Frontend implementation is not complete until:

- technical Admin and pondok operational portals are separated;
- capability and teaching-assignment authorization is enforced by backend;
- no normal user enters UUID or sees raw JSON;
- LLM API-key and Hermes setup flows are real, not placeholder buttons;
- browser E2E includes both allowed CRUD and forbidden-role paths;
- Santri mobile and Ustadz tablet flows are tested.
