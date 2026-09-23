# Implementation Plan: Tryb rozliczenia nadpłaty

**Branch**: `002-cr-a-tryb-nadplaty` | **Date**: 2026-09-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-cr-a-tryb-nadplaty/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

CR-A dodaje wybór skutku nadpłaty: `obnizRate` zachowuje liczbę rat i przelicza ratę po nadpłacie, a `skrocOkres` zachowuje ratę i kończy harmonogram wcześniej. Nadpłata jest stosowana po racie, a brak trybu zachowuje dotychczasowy domyślny tryb `skrocOkres`. Zmiana pozostaje w istniejącym modelu domenowym, z cienkim adapterem API i UI konsumującym wynik.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22+

**Primary Dependencies**: Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest 4; bez nowych zależności

**Storage**: Statyczne serie wskaźników w `dane/*.json`; brak bazy danych

**Testing**: Vitest dla domeny i danych; testy CR-A z liczbami kontrolnymi; końcowo `npm test`, `npm run typecheck`, `npm run build`

**Target Platform**: Aplikacja webowa wdrażana na Vercel z GitHuba

**Project Type**: Jednostronicowa aplikacja webowa z API

**Performance Goals**: Przeliczenie harmonogramu do kilkuset rat w pojedynczym żądaniu i wynik dostępny bez zauważalnego opóźnienia dla doradcy

**Constraints**: Domena pozostaje czysta; kwoty są w całkowitych groszach; zaokrąglanie jest centralne; API nie liczy; UI nie zawiera logiki finansowej; brak zmian w `dane/`

**Scale/Scope**: Jedna lista nadpłat dla jednego harmonogramu; wiele nadpłat w tym samym miesiącu jest wykonywanych kolejno według kolejności wejścia; zakres ograniczony do CR-A

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Obliczenia pozostają w `src/domena/` jako czyste funkcje bez React, I/O i efektów ubocznych.
- [x] Serie wskaźników są używane z istniejącej warstwy `src/dane/` bez zmian w plikach `dane/`.
- [x] Route handler pozostaje cienki: parsuje tryb nadpłaty, deleguje do domeny i serializuje wynik.
- [x] UI tylko przekazuje tryb przy każdej nadpłacie i renderuje wynik.
- [x] Każda zmiana finansowa ma test z liczbą kontrolną przed implementacją.
- [x] Kwoty pozostają w groszach, a ostatnia rata wyrównuje saldo do zera.
- [x] Nie są potrzebne nowe zależności ani zmiana konstytucji.

## Project Structure

### Documentation (this feature)

```text
specs/002-cr-a-tryb-nadplaty/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domena/harmonogram.ts
└── dane/wskazniki.ts

app/
├── api/harmonogram/route.ts
└── page.tsx

tests/
├── harmonogram-cr-a.test.ts
├── harmonogram-nadplaty.test.ts
└── harmonogram-api.test.ts
```

**Structure Decision**: Funkcja rozszerza istniejący moduł domeny harmonogramu. Model trybu nadpłaty i reguły księgowania pozostają w `src/domena/harmonogram.ts`, parser transportowy w `app/api/harmonogram/route.ts`, a formularz i serializacja wyboru w `app/page.tsx`. Testy trafiają do `tests/`. Dokumentacja kontraktu CR-A pozostaje w katalogu specyfikacji.

## Post-design Constitution Check

- [x] Research nie wprowadza nowych bibliotek ani zmian w danych wskaźników.
- [x] Model danych zachowuje kwoty w groszach i opisuje jednoznaczny moment księgowania nadpłaty.
- [x] Kontrakt rozdziela wejście transportowe od domenowego i zachowuje domyślne `skrocOkres`.
- [x] Quickstart wymaga testów, typechecku i buildu oraz obejmuje liczby kontrolne CR-A.
- [x] Zakres implementacji pozostaje w istniejących granicach domena/API/UI i nie wymaga zmiany konstytucji.

## Implementation Sequence

1. Dodać czerwone testy CR-A dla `obnizRate`, `skrocOkres`, trybu domyślnego i kolejnych nadpłat w tym samym miesiącu.
2. Zmienić model nadpłaty tak, aby brak trybu normalizował się do `skrocOkres`, a tryby były stosowane po racie.
3. Rozdzielić obliczanie raty po nadpłacie: reamortyzacja dla `obnizRate`, zachowanie raty i skrócenie okresu dla `skrocOkres`.
4. Zaktualizować parser API i UI, zachowując istniejący kontrakt groszy oraz kompatybilność wejść bez trybu.
5. Dodać README/quickstart oraz uruchomić pełną regresję.

## Complexity Tracking

Brak odstępstw od konstytucji projektu.
