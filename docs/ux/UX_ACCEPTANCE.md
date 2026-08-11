# PMMI UX Wireframe - Acceptance & Implementation Order

## Cross-page interaction contracts

| Domain | UX contract |
|---|---|
| Admissions | Pipeline -> Application Detail -> legal transition; Enrollment terpisah setelah Registration COMPLETE. |
| Academic | Class Workspace -> Session/Attendance atau Assignment -> Submission Queue -> Grading Detail. |
| Portfolio | Grading Detail -> Feature -> immediately public; Admin Portfolio Manager -> unpublish/re-publish with reason. |
| AI | Santri AI Workspace -> PMMI Gateway -> 9Router. Wallet usage secondary; low credit warning contextual. |
| Hermes | Agents List -> Build -> Agent Detail -> Start/Stop -> Archive. Async status wajib terlihat. |
| Lifecycle | Student Detail -> Lifecycle action -> reason + impact preview -> commit -> Admin communication review. |
| Notifications | Inbox notification selalu deep-link ke entity/task; settings terpisah dari system delivery monitor. |

## State & feedback standard

- Loading: skeleton untuk table/card, bukan blank screen.
- Empty: jelaskan kenapa kosong + CTA bila user bisa memperbaiki.
- Error: bahasa manusia + retry; raw stack/API response tidak ditampilkan.
- Success: toast singkat + resulting state terlihat di page.
- Async job: `Queued -> Running -> Success/Failed`; polling atau refresh yang jelas.
- Permission: menu yang tidak relevan disembunyikan; deep-link forbidden menampilkan 403 page yang rapi.
- Offline/network: submission/upload jangan kehilangan file selection tanpa warning.

## Responsive acceptance

- 360px: Santri core flow (Home, Tugas, Assignment Submit, AI, Agents, Notifications) tanpa horizontal overflow.
- 768px: Ustadz attendance, submission review, class workspace usable.
- 1280px+: Admin queue/table/detail optimal.
- Touch target >= 44px untuk attendance/status actions.

## UX definition of done

1. Tidak ada normal-user field yang meminta UUID.
2. Tidak ada JSON dump sebagai output UX.
3. Setiap page di dokumen ini punya route/component nyata atau intentionally deferred dengan alasan eksplisit.
4. Admin, Ustadz, Santri navigation mengikuti IA yang didefinisikan di `docs/ux/README.md`.
5. Queue/detail workflows tidak digabung menjadi mega form.
6. Semua dangerous lifecycle/portfolio/Hermes actions memiliki confirmation dan audit reason bila applicable.
7. Applicant, Admin, Ustadz, Santri happy-path diuji via browser/E2E, bukan hanya build TypeScript.
8. Mobile Santri dan tablet Ustadz visual regression/screenshots lulus.
9. Accessibility minimum: semantic labels, keyboard navigation, focus states, contrast, table headings.

## Implementation priority

| Priority | Scope |
|---|---|
| P0 | Shell/navigation + routing + design tokens; remove UUID/JSON patterns. |
| P0 | Admin Admissions Pipeline/Application Detail/Enrollment + Applicant Portal. |
| P0 | Ustadz Class/Attendance/Submission Grading; Santri Assignment Submit/Revision. |
| P1 | Admin lifecycle, Staff, Academic Catalog/Class Detail, Notifications. |
| P1 | Santri Schedule/Grades/AI/Agents; Ustadz notifications. |
| P1 | Portfolio public/admin, certificate surfaces. |
| P2 | Ops/Audit/Rewards refinements and secondary analytics. |

## Non-goals

- Dokumen ini bukan visual brand high-fidelity. Warna, illustration, motion, dan final typography ditentukan setelah wireframe disetujui.
- Wireframe tidak mengubah business rules blueprint.
- Deployment/runtime 9Router/Hermes/notification providers tetap concern terpisah dari UX.
