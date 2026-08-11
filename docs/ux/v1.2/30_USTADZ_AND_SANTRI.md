# PMMI UX v1.2 - Ustadz & Santri

## A. Ustadz portal (`/ustadz/*`)

Ustadz is not a general academic admin. Access is scoped by `teaching_assignments` to subject/course/class. Example assignments supplied by pondok: **Fotografi, Videografi, Programmer, Tahsin, UK**. `UK` remains the canonical label until its expanded name is documented.

| Page | Route | Entity | CRUD / action |
|---|---|---|---|
| T01 Overview | `/ustadz` | teaching assignment/task queue | R assigned context only |
| T02 Kelas Saya | `/ustadz/classes` | class | R assigned classes only |
| T03 Materi Pembelajaran | `/ustadz/materials` | learning material | C/R/U/archive in assigned subject |
| T04 Class Workspace | `/ustadz/classes/:id` | class/roster | R assigned class |
| T05 Session & Attendance | `/ustadz/classes/:id/sessions/:sessionId` | session, attendance | C/R/U session; cancel instead of destructive delete; C/R/U attendance correction with audit |
| T06 Assignments | `/ustadz/assignments` | assignment | C/R/U/archive/cancel assigned class |
| T07 Submission & Grading | `/ustadz/submissions/:id` | submission, grade, revision, feature | R submission; C/U grade; C/U revision request; Feature graded work -> public immediately |
| T08 AI Access & API Keys | `/ustadz/ai/access` | own API key | C/R/rotate/revoke own key within policy |
| T09 AI Agents | `/ustadz/agents` | own agent profile | C via seven-step wizard; R/U/archive own agent |
| T10 Notifications | `/ustadz/notifications` | preference/channel | C/R/U/D own preferences/linking |

### T01 - Overview

```text
+--------------------------------------------------------------------------------+
| USTADZ - Ust. Zaid                                                             |
| Pengampu: Fotografi • Videografi                                                |
| Hari ini: Fotografi 09:00 • 7 submission pending                               |
| [Kelas Saya] [Submission Queue]                                                 |
+--------------------------------------------------------------------------------+
```

### T03 - Materi Pembelajaran

```text
+--------------------------------------------------------------------------------+
| MATERI PEMBELAJARAN                                        [+ Materi]           |
| Fotografi > Exposure Triangle • Published [Edit]                               |
| Fotografi > Composition • Draft [Edit]                                         |
| Attach: article / file / link / video                                           |
+--------------------------------------------------------------------------------+
```

Ustadz can CRUD learning materials only inside an assigned subject/course.

### T05 - Session & Attendance

```text
+--------------------------------------------------------------------------------+
| SESSION: Komposisi & Exposure • 11 Aug 09:00               [Save Attendance]   |
| [Edit Session]                                                                  |
| Ahmad  Present / Late / Excused / Absent   note [____]                         |
| Fulan  Present / Late / Excused / Absent   note [____]                         |
+--------------------------------------------------------------------------------+
```

### T06 - Assignments

```text
+--------------------------------------------------------------------------------+
| ASSIGNMENTS                                                [+ Buat Tugas]       |
| Photo Story • Fotografi • due 15 Aug • 18/24 submitted [Open]                 |
| Landing Page • Programmer • due 18 Aug ...                                      |
+--------------------------------------------------------------------------------+
```

### T07 - Submission & Grading

```text
+--------------------------------------------------------------------------------+
| Ahmad • Photo Story • Fotografi • Attempt 2                                    |
| [Asset viewer]                       Score [92 / 100]                            |
|                                      Feedback [.........................]       |
| [Request Revision]                   [Save Grade]                               |
| AFTER GRADED: [Feature -> Public Portfolio]                                     |
+--------------------------------------------------------------------------------+
```

The PMMI portfolio rule remains locked: Ustadz/Admin **Feature** on graded work makes it public immediately; there is no Santri approval state.

### T08 - AI Developer Access

```text
+--------------------------------------------------------------------------------+
| AI DEVELOPER ACCESS                                                            |
| Base URL: https://ai.pondokmultimedia.id/v1                                    |
| Allowed models: pmmi-fast, pmmi-coder                                          |
|--------------------------------------------------------------------------------|
| Your keys                                                                      |
| pmmi_sk_ab12... • Laptop • last used 2h • expires 90d [Rotate] [Revoke]       |
| [+ Create Personal Key]                                                        |
|--------------------------------------------------------------------------------|
| [cURL] [Python/OpenAI SDK] [JavaScript/OpenAI SDK]                             |
+--------------------------------------------------------------------------------+
```

Ustadz key policy is entitlement-driven. Teaching role does not imply unlimited AI budget.

### T09 - AI Agents

```text
+--------------------------------------------------------------------------------+
| AI AGENTS                                       Slots 1/2                       |
| Teaching Assistant • READY • Telegram ✓ • pmmi-fast • [Open]                   |
| [+ Create Agent] -> 7-step wizard                                               |
+--------------------------------------------------------------------------------+
```

---

## B. Santri portal (`/santri/*`)

Santri is mobile-first and self-scoped. Academic track appears after placement/enrollment.

| Page | Route | Entity | CRUD / action |
|---|---|---|---|
| S01 Hari Ini | `/santri` | dashboard | R self only |
| S02 Kurikulum Saya | `/santri/curriculum` | curriculum/material | R published self curriculum |
| S03 Tugas & Submission | `/santri/assignments/:id` | submission/files | C/R/resubmit/replace/withdraw according to cutoff; storage quota applies |
| S04 Jadwal | `/santri/schedule` | class session | R self schedule |
| S05 Nilai & Feedback | `/santri/grades` | grade/revision | R self; revision action via submission page |
| S06 Karya & Sertifikat | `/santri/achievements` | portfolio/certificate/achievement | R; portfolio visibility follows feature/admin policy |
| S07 AI Playground | `/santri/ai` | AI request | C requests; R usage summary |
| S08 API Access | `/santri/ai/access` | own API key | C/R/rotate/revoke personal key |
| S09 Agent List | `/santri/agents` | own agent | C via wizard; R/U/archive |
| S10 Notifications | `/santri/notifications` | preferences/channels | C/R/U/D self |

### S01 - Hari Ini

```text
+--------------------------------------+
| PMMI          Ahmad • Konten Kreator|
|--------------------------------------|
| NEXT: Fotografi 13:00                |
| TODO: Photo Story due 15 Aug         |
| REVISION: Poster Dakwah              |
|--------------------------------------|
| AI credits 84     Agent slots 0/1    |
| Home | Tugas | AI | Agent | More     |
+--------------------------------------+
```

### S02 - Kurikulum Saya

```text
+--------------------------------------------------------------------------------+
| KURIKULUM SAYA - JALUR KONTEN KREATOR                                         |
|--------------------------------------------------------------------------------|
| Core jalur                                                                     |
| Fotografi 62% • Videografi 40% • Desain 75% • Copywriting • Branding          |
|--------------------------------------------------------------------------------|
| Materi bersama                                                                 |
| Tahsin & Tahfidz • Fiqih & Hadist • Adab • Public Speaking • Digital Marketing |
+--------------------------------------------------------------------------------+
```

For Jalur Programmer, the core area changes to Web & App Development, UI/UX, Front-end, Back-end, Automation, AI Tools while shared pondok material remains visible.

### S03 - Assignment Detail & Submission

```text
+--------------------------------------------------------------------------------+
| Photo Story • Fotografi • Due 15 Aug                                           |
| Brief / rubric / materials                                                     |
| Feedback: perbaiki framing ... • Revision due 14 Aug                           |
| [Drop file] progress 100%  Catatan [........]                                  |
| [Submit Revision]                                                               |
| Attempt history                                                                 |
+--------------------------------------------------------------------------------+
```

Presigned MinIO URL and object-key implementation are hidden from normal UX. Attempt/revision history stays visible.

### S06 - Karya & Pencapaian

```text
+--------------------------------------------------------------------------------+
| KARYA & PENCAPAIAN                                                             |
| Featured: Photo Story • PUBLIC [View]                                           |
| Certificate: Konten Kreator 2026 [View / Verify]                               |
| Achievement: First Featured Project                                             |
+--------------------------------------------------------------------------------+
```

### S07 - AI Playground

```text
+--------------------------------------------------------------------------------+
| AI PLAYGROUND                                         Credits 84               |
| Model [pmmi-coder v]                                                           |
| Conversation                                                                   |
| [Tulis pesan........................................................] [Send]   |
+--------------------------------------------------------------------------------+
```

Dashboard chat and API usage consume the same PMMI wallet/ledger.

### S08 - API Access

```text
+--------------------------------------------------------------------------------+
| PMMI LLM API ACCESS                                                            |
| Base URL                                                                        |
| https://ai.pondokmultimedia.id/v1                         [Copy]                |
|--------------------------------------------------------------------------------|
| API KEYS                                                   [+ Create Key]       |
| pmmi_sk_ab12... • Personal Laptop • last 2h • expires 90d [Rotate] [Revoke]   |
|--------------------------------------------------------------------------------|
| Allowed models: pmmi-fast, pmmi-coder • Rate 30 req/h • Credits 84            |
|--------------------------------------------------------------------------------|
| QUICK START                                                                     |
| [cURL] [Python/OpenAI SDK] [JavaScript/OpenAI SDK]                             |
+--------------------------------------------------------------------------------+
```

Key UX rules:
- full secret shown once;
- existing secret cannot be revealed;
- rotate/revoke is self-service within policy;
- prefix, expiry, last-used, scopes, model allowlist, rate and credits are visible;
- no upstream provider key is exposed.

### S09 - AI Agents

```text
+--------------------------------------------------------------------------------+
| AI AGENTS                                      Slots 0/1                       |
| No agents yet                                                                   |
| [+ Create Agent]                                                                |
| Pipeline: Profile -> SOUL -> Channel -> LLM -> Home -> Safety -> Ready          |
+--------------------------------------------------------------------------------+
```

There is intentionally no single-click `Build Agent` shortcut that skips configuration. The full wizard is specified in `40_AI_API_AND_HERMES.md`.

## C. Authorization acceptance

1. Ustadz cannot read or mutate another Ustadz's classes unless explicitly assigned.
2. Santri cannot access another Santri's submission, wallet, API keys, agent profile, workspace, notification channels, or certificate private metadata.
3. Archived/non-active lifecycle policies are enforced by backend, not just hidden buttons.
4. Every grading, revision, feature, API-key lifecycle, and agent lifecycle action is auditable.
