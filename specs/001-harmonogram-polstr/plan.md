# Implementation Plan: Harmonogram POLSTR

**Branch**: `001-harmonogram-polstr` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-harmonogram-polstr/spec.md`

## Summary

MVP ma dostarczyć kalkulator harmonogramu spłat kredytu hipotecznego dla POLSTR 1M i WIBOR 3M z obsługą rat równych i malejących, nadpłat oraz zmiennych stóp procentowych. Główna logika mieszka w domenie `src/domena/`, a dane wskaźników są odczytywane z JSON w katalogu `dane/` przez warstwę `src/dane/`.

Implementacja będzie zbudowana w stylu warstwowym: route handler `app/api/harmonogram/route.ts` pobiera parametry query string, waliduje kontrakt wejścia i przekazuje je do czystych funkcji domenowych; ekran `app/page.tsx` będzie osobną, ostatnią historią użytkownika i pobierze dane przez `fetch('/api/harmonogram?...')`. Wszystkie obliczenia będą miały testy vitest w katalogu `tests/`, a UI nie będzie miało testów jednostkowych.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22+

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest 4

**Storage**: Static JSON files in `dane/` for `polstr-1m.json` and `wibor-3m.json`; no database in MVP

**Testing**: Vitest run via `npm test`, with domain and data tests only; UI is not unit-tested

**Target Platform**: Web application for Vercel deployment via GitHub

**Project Type**: Web application

**Performance Goals**: Fast calculation for up to a few hundred installments; single-request evaluation and lightweight render

**Constraints**: Domain layer must stay pure; no React in `src/domena/`; no `Date.now()` or I/O; no new dependencies without approval; kwoty in groszach as integers; one place for rounding

**Scale/Scope**: Single-page MVP with form, calculation API, schedule table, CSV export, and static indicator datasets

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Next.js App Router is used as the framework.
- [x] Domain logic remains in `src/domena/` as pure functions without React or I/O.
- [x] Data series are loaded from `dane/*.json` through `src/dane/`.
- [x] The API route is thin and delegates calculation to domain functions.
- [x] The page is a `'use client'` component that fetches data from `/api/harmonogram`.
- [x] Tests are in `tests/` and cover domain and dataset logic only.
- [x] No new dependencies are introduced without justification.
- [x] Amounts are handled in grosz as integers and rounded centrally.
- [x] The business acceptance value from BRIEF is treated as the KPI: rata 2 494,72 zł ±0,05 zł.
- [x] The project documentation and commit messages stay in Polish.

## Project Structure

```text
specs/001-harmonogram-polstr/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/

src/
├── dane/
│   └── wskazniki.ts
├── domena/
│   └── harmonogram.ts
└── ...

app/
├── api/
│   └── harmonogram/
│       └── route.ts
├── globals.css
├── layout.tsx
├── page.tsx

TESTY:
└── tests/
    ├── smoke.test.ts
    └── ...

dane/
├── polstr-1m.json
└── wibor-3m.json
```

**Structure Decision**: The feature remains inside the existing Next.js repository structure. The domain model is isolated in `src/domena/`, data access is isolated in `src/dane/`, API is a thin adapter in `app/api/harmonogram/route.ts`, and the final UI remains in `app/page.tsx` as a single exported client component.

## Complexity Tracking

> No constitution violations require justification. The architecture stays within the repository’s current constraints and avoids unnecessary abstraction.

## Notes for Implementation

1. The first implementation slice should be the core domain calculation for equal installments under a constant rate, validated against the business control number.
2. The second slice adds the rate change logic for period-based series and the mixed-rate behavior between POLSTR and WIBOR.
3. The third slice introduces overpayment modes and the final adjustment of the last instalment.
4. The final UI slice is kept separate and should consume the API without embedding calculation logic.
