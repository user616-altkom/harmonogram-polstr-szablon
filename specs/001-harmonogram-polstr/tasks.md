# Tasks: Harmonogram POLSTR

**Input**: Design documents from `/specs/001-harmonogram-polstr/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: The examples below include test tasks. In this feature, tests are explicitly required for the domain logic and the control-number business case.

**Organization**: Tasks are grouped by user story to allow independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Repo already contains the working project skeleton; no setup work is required for this feature.

- Brak zadań w tej fazie. Szkielet projektu i konfiguracja Next.js/Vitest/Tailwind są już obecne.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story work can begin.

- [ ] T001 [P] Review and confirm the domain/data/API/UI boundaries across `src/domena/harmonogram.ts`, `src/dane/wskazniki.ts`, `app/api/harmonogram/route.ts` and `app/page.tsx`
- [ ] T002 [P] Define the canonical data contract for the schedule output in `src/domena/harmonogram.ts` and align it with the API response contract
- [ ] T003 [P] Define the rounding policy and cash-unit policy in `src/domena/harmonogram.ts` so amounts stay in grosz and rounding occurs in one place
- [ ] T004 Create the domain entry type for the credit parameters and the harmonogram result interface in `src/domena/harmonogram.ts`
- [ ] T005 Add the `seriaWskaznika` usage contract and verification notes in `src/dane/wskazniki.ts` to ensure JSON data is consumed through the data layer only
- [ ] T006 Validate the API contract in `app/api/harmonogram/route.ts` so query parameters are parsed and mapped to domain inputs without business logic in the route

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Rata równa przy stałej stopie (Priority: P1) 🎯 MVP

**Goal**: Obliczyć poprawny harmonogram dla rat równych przy stałej stopie i potwierdzić liczbę kontrolną z BRIEF.

**Independent Test**: Dla kwoty 400 000 zł, 300 rat, stopy 5,66 % rocznie i stałego wskaźnika POLSTR 1M 3,55 % + marża 2,11 pp, rata równa musi wynosić 2 494,72 zł ±0,05 zł.

### Tests for User Story 1 (REQUIRED)

> NOTE: Tests MUST be written first and should fail before implementation.

- [ ] T007 [P] [US1] Add the equal-installment control-number test in `tests/harmonogram-rowne-raty.test.ts` for the BRIEF example and expected monthly payment of 2 494,72 zł
- [ ] T008 [P] [US1] Add the final-adjustment validation test in `tests/harmonogram-rowne-raty.test.ts` to confirm the sum of principal parts equals the loan amount after rounding

### Implementation for User Story 1

- [ ] T009 [US1] Implement the pure calculation for equal installments in `src/domena/harmonogram.ts` using the annual-rate and monthly-period convention from the brief
- [ ] T010 [US1] Implement the final payment adjustment logic in `src/domena/harmonogram.ts` so the last installment balances the total principal exactly
- [ ] T011 [US1] Add the schedule result model and per-installment rows in `src/domena/harmonogram.ts` with fields for: number, date, principal, interest, total payment, and remaining balance
- [ ] T012 [US1] Expose the result through the domain entry function so API and tests use the same output structure
- [ ] T013 [US1] Verify the same domain function from `app/api/harmonogram/route.ts` for a valid `rowne` request and return JSON instead of a 501 response

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Zmienne wskaźniki i nadpłaty (Priority: P2)

**Goal**: Dodać obsługę wskaźników POLSTR 1M i WIBOR 3M, zmiany stóp w trakcie spłaty oraz nadpłat w trybie obniż raty i skrócenia okresu.

**Independent Test**: Dla zmienionej serii wskaźnika albo nadpłaty w trybie `obnizRate`/`skrocOkres`, harmonogram musi odzwierciedlać nowe saldo i ratę bez naruszenia reguły wyrównania końcowego.

### Tests for User Story 2 (REQUIRED)

- [ ] T014 [P] [US2] Add a test for a periodic rate change in `tests/harmonogram-zmiana-wskaznika.test.ts` covering POLSTR/WIBOR transitions and stale final value behavior
- [ ] T015 [P] [US2] Add a test for overpayments in `tests/harmonogram-nadplaty.test.ts` covering both `obnizRate` and `skrocOkres`

### Implementation for User Story 2

- [ ] T016 [P] [US2] Implement the rate-selection logic in `src/domena/harmonogram.ts` using the period-specific series from `src/dane/wskazniki.ts`
- [ ] T017 [US2] Add the logic for the next valid rate selection and last-known-rate fallback in `src/domena/harmonogram.ts`
- [ ] T018 [US2] Implement the `malejace` schedule calculation in `src/domena/harmonogram.ts` alongside the `rowne` logic
- [ ] T019 [US2] Implement overpayment processing in `src/domena/harmonogram.ts` with both modes: `obnizRate` and `skrocOkres`
- [ ] T020 [US2] Update the route handler contract in `app/api/harmonogram/route.ts` so all additional parameters are accepted and forwarded without leaking business logic into the route

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Ekran www podłączony do API (Priority: P3)

**Goal**: Dostarczyć ostatnią historię użytkownika: ekran kalkulatora z formularzem, pobieraniem danych z `/api/harmonogram` i eksportem CSV.

**Independent Test**: Po wpisaniu parametrów kredytu i kliknięciu „Policz” komponent z `app/page.tsx` wyświetla wynik z API i pozwala na eksport CSV bez obliczeń w UI.

### Tests for User Story 3 (OPTIONAL)

- [ ] T021 [P] [US3] Add a smoke test for the browser-side contract in `tests/smoke.test.ts` to confirm the page renders and the API route is reachable

### Implementation for User Story 3

- [ ] T022 [P] [US3] Replace the placeholder content in `app/page.tsx` with the exported React component from Claude Design, keeping `'use client'` on the first line
- [ ] T023 [US3] Implement the form state and fetch logic in `app/page.tsx` using `fetch('/api/harmonogram?...')` with query-string parameters
- [ ] T024 [US3] Render the first and last installment, total interest, and the amortization table in `app/page.tsx`
- [ ] T025 [US3] Implement the CSV export button in `app/page.tsx` without adding new dependencies
- [ ] T026 [US3] Verify the page is connected to the route handler and the UI remains thin, with no business logic embedded in the component

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting all user stories, before final validation and merge.

- [ ] T027 [P] Review the API response shape and ensure it matches the table contract expected by the UI in `app/api/harmonogram/route.ts`
- [ ] T028 [P] Run the end-to-end validation from `quickstart.md`, including `npm test`, `npm run typecheck` and `npm run build`
- [ ] T029 Clean up naming, comments, and documentation in `src/domena/harmonogram.ts`, `src/dane/wskazniki.ts`, `app/api/harmonogram/route.ts` and `app/page.tsx`
- [ ] T030 [P] Confirm the business acceptance value matches the BRIEF example and tolerance in the final output

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - already satisfied by the existing skeleton
- **Foundational (Phase 2)**: Must be complete before any user story can start
- **User Stories (Phase 3+)**: All depend on the foundational work; they can then be completed in priority order P1 → P2 → P3
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational completion and is the main MVP slice
- **User Story 2 (P2)**: Builds on the same domain model but should remain independently testable
- **User Story 3 (P3)**: Final UI integration that depends on the backend data contract and results

### Parallel Opportunities

- Foundational tasks T001–T006 can run in parallel because they touch distinct files and share only the common contract.
- Tests within a story (`[US1]`, `[US2]`) can be written in parallel.
- Different user stories can be implemented in parallel if the team has capacity.

---

## Parallel Example: User Story 1

```bash
# Write tests for the first story in parallel
Task: "Add equal-installment control-number test in tests/harmonogram-rowne-raty.test.ts"
Task: "Add final-adjustment validation test in tests/harmonogram-rowne-raty.test.ts"

# Implement domain work in parallel where independent
Task: "Implement equal installments in src/domena/harmonogram.ts"
Task: "Implement final payment adjustment in src/domena/harmonogram.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (already satisfied)
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the business control number before proceeding to richer scenarios
5. Only then add User Story 2 and User Story 3

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate control number → deploy/demo if ready
3. Add User Story 2 → validate rate change and overpayment behavior
4. Add User Story 3 → validate UI integration and CSV export

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps a task to a specific user story for traceability
- Each user story should remain independently completable and testable
- The first implementation wave is User Story 1, because it is the acceptance-control requirement in BRIEF
- Avoid vague tasks and cross-story coupling that breaks independence
