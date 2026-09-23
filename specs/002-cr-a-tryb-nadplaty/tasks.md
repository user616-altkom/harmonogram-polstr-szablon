# Zadania: Tryb rozliczenia nadpłaty

**Wejście**: Dokumenty projektowe z `/specs/002-cr-a-tryb-nadplaty/`

**Wymagania wstępne**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/harmonogram-cr-a.md`, `quickstart.md`

**Testy**: Wymagane test-first dla logiki finansowej i liczb kontrolnych CR-A.

**Organizacja**: Zadania są pogrupowane według historii użytkownika. Każda historia ma własne testy i może być walidowana niezależnie po ukończeniu zależności foundational.

## Format: `[ID] [P?] [Story] Opis`

- **[P]**: Można wykonać równolegle, bo zadania dotyczą różnych plików i nie mają nieukończonych zależności.
- **[Story]**: Historia użytkownika, której dotyczy zadanie.
- Każdy opis wskazuje konkretny plik.

## Faza 1: Setup

**Cel**: Wykorzystać istniejący projekt Next.js/Vitest bez dodawania zależności.

- Brak zadań setupu: repozytorium, konfiguracja i zależności już istnieją.

## Faza 2: Foundational

**Cel**: Przygotować wspólny kontrakt trybów nadpłat przed implementacją historii użytkownika.

- [ ] T001 [P] Zweryfikuj zgodność istniejących kontraktów `ParametryKredytu`, `Nadplata`, `Rata` i `Harmonogram` z CR-A w `src/domena/harmonogram.ts` oraz `specs/002-cr-a-tryb-nadplaty/data-model.md`.
- [ ] T002 [P] Zaktualizuj kontrakt wejściowy nadpłat w `specs/002-cr-a-tryb-nadplaty/contracts/harmonogram-cr-a.md`, zachowując format `miesiac:kwotaGr:tryb` i kompatybilny wpis bez trybu.
- [ ] T003 Dodaj normalizację braku trybu do `skrocOkres` w modelu domenowym `src/domena/harmonogram.ts`, bez zmiany zachowania istniejących wywołań bez nadpłat.
- [ ] T004 [P] Dodaj test walidacji niepoprawnego trybu, miesiąca i kwoty nadpłaty w `tests/harmonogram-cr-a.test.ts`.
- [ ] T005 [P] Dodaj test kolejności wielu nadpłat w tym samym miesiącu, także z mieszanymi trybami, w `tests/harmonogram-nadplaty.test.ts`, zgodnie z decyzją z sekcji Clarifications w `specs/002-cr-a-tryb-nadplaty/spec.md`.

**Punkt kontrolny**: Kontrakt trybu, domyślny `skrocOkres`, walidacja i kolejność nadpłat są określone testami.

## Faza 3: User Story 1 - Obniżenie raty po nadpłacie (Priority: P1)

**Cel**: Zachować pierwotną liczbę rat i przeliczyć ratę po nadpłacie.

**Test niezależny**: Jawna stała seria WIBOR `0.0455`, marża `0.0211`, kredyt `30000000` groszy, 240 rat i nadpłata `3000000` groszy po pierwszej racie. Oczekiwane saldo po nadpłacie: `26939993` grosze, rata od drugiej raty: `203811` groszy, 240 rat łącznie.

### Testy US1 (WYMAGANE PRZED IMPLEMENTACJĄ)

- [ ] T006 [US1] Dodaj czerwony test liczby kontrolnej `obnizRate` w `tests/harmonogram-cr-a.test.ts`: rata przed nadpłatą `226507` gr, saldo po pierwszej racie i nadpłacie `26939993` gr, rata od drugiej raty `203811` gr.
- [ ] T007 [US1] Dodaj test US1, że suma `czescKapitalowaGr` rat i `nadplataGr` wynosi `30000000` gr oraz saldo końcowe wynosi zero w `tests/harmonogram-cr-a.test.ts`.
- [ ] T008 [US1] Dodaj test US1, że wynik zawiera dokładnie 240 rat po nadpłacie w `tests/harmonogram-cr-a.test.ts`.

### Implementacja US1

- [ ] T009 [US1] Zaimplementuj reamortyzację raty po nadpłacie `obnizRate` dla pozostałej liczby rat w `src/domena/harmonogram.ts`, z odsetkami liczonymi przed nadpłatą.
- [ ] T010 [US1] Zaimplementuj zastosowanie jednej lub wielu nadpłat po racie, w kolejności wejścia, z ograniczeniem każdej kwoty do bieżącego salda w `src/domena/harmonogram.ts`.
- [ ] T011 [US1] Dodaj serializację i walidację trybu `obnizRate` w `app/api/harmonogram/route.ts`, bez obliczeń finansowych w route handlerze.

**Punkt kontrolny**: US1 działa niezależnie, przechodzi liczby kontrolne CR-A i zachowuje 240 rat.

## Faza 4: User Story 2 - Skrócenie okresu po nadpłacie (Priority: P1)

**Cel**: Zachować ratę i zakończyć harmonogram wcześniej z ostatnią ratą wyrównującą.

**Test niezależny**: Ten sam przypadek CR-A w trybie `skrocOkres`: 196 rat łącznie, rata bazowa `226507` gr, ostatnia rata `220053` gr i saldo końcowe zero.

### Testy US2 (WYMAGANE PRZED IMPLEMENTACJĄ)

- [ ] T012 [US2] Dodaj czerwony test liczby kontrolnej `skrocOkres` w `tests/harmonogram-cr-a.test.ts`: 196 rat łącznie i ostatnia rata `220053` gr.
- [ ] T013 [US2] Dodaj test US2, że rata pozostaje `226507` gr przed ostatnią ratą wyrównującą oraz że suma kapitału rat i nadpłat wynosi `30000000` gr w `tests/harmonogram-cr-a.test.ts`.
- [ ] T014 [US2] Dodaj test kompatybilności: nadpłata bez trybu daje ten sam wynik co `skrocOkres` w `tests/harmonogram-cr-a.test.ts`.

### Implementacja US2

- [ ] T015 [US2] Zaimplementuj zachowanie bieżącej raty i skracanie harmonogramu po nadpłacie `skrocOkres`, także przy kolejnych nadpłatach w tym samym miesiącu, w `src/domena/harmonogram.ts`.
- [ ] T016 [US2] Zaimplementuj ostatnią ratę wyrównującą pozostałe saldo w `src/domena/harmonogram.ts`, także po zaokrągleniach i nadpłacie większej niż pozostałe saldo.
- [ ] T017 [US2] Przekaż brak trybu bez normalizacji w parserze `app/api/harmonogram/route.ts`; znormalizuj go wyłącznie w domenie do `skrocOkres`, zachowując dotychczasowy format żądań.

**Punkt kontrolny**: US2 zachowuje ratę, skraca okres, obsługuje brak trybu i zamyka saldo.

## Faza 5: User Story 3 - Porównanie skutków nadpłaty (Priority: P2)

**Cel**: Pozwolić doradcy obliczyć i porównać oba warianty dla tych samych parametrów.

**Test niezależny**: Dwa wyliczenia CR-A różnią się ratą/liczbą rat, ale w obu mają saldo końcowe zero i identyczną sumę spłaconego kapitału.

### Testy US3 (WYMAGANE PRZED IMPLEMENTACJĄ)

- [ ] T018 [P] [US3] Dodaj test kontraktu sukcesu i błędu dla parametru `nadplaty` w `tests/harmonogram-api.test.ts` zgodnie z `specs/002-cr-a-tryb-nadplaty/contracts/harmonogram-cr-a.md`.
- [ ] T019 [US3] Dodaj test porównawczy obu trybów w `tests/harmonogram-cr-a.test.ts`: `obnizRate` zachowuje 240 rat, `skrocOkres` kończy się po 196 ratach, a oba salda końcowe wynoszą zero.

### Implementacja US3

- [ ] T020 [US3] Zaktualizuj stan formularza nadpłat w `app/page.tsx`, aby każda nadpłata miała tryb `obnizRate` albo `skrocOkres`, z domyślnym `skrocOkres`.
- [ ] T021 [US3] Zaktualizuj serializację wielu nadpłat w `app/page.tsx`, zachowując kolejność wejścia i format groszy opisany w `specs/002-cr-a-tryb-nadplaty/contracts/harmonogram-cr-a.md`.
- [ ] T022 [US3] Wyświetl w `app/page.tsx` harmonogram dla wybranego wariantu nadpłaty; dwa warianty porównawcze powstają przez osobne wyliczenia, bez dodawania logiki finansowej do komponentu.
- [ ] T023 [US3] Zaktualizuj `app/api/harmonogram/route.ts`, aby przekazywał wiele nadpłat i tryby do domeny oraz zwracał nadpłaty w tabeli odpowiedzi.

**Punkt kontrolny**: Doradca może przygotować oba warianty, a UI nie zawiera obliczeń finansowych.

## Faza 6: Polish & Cross-Cutting Concerns

**Cel**: Ujednolicić dokumentację, quickstart i walidację końcową.

- [ ] T024 [P] Zaktualizuj `README.md` o kolejność księgowania nadpłaty, tryby, domyślne `skrocOkres` i format kwoty w groszach.
- [ ] T025 [P] Zaktualizuj `specs/002-cr-a-tryb-nadplaty/quickstart.md` o uruchamialne przykłady obu trybów i wielu nadpłat w tym samym miesiącu.
- [ ] T026 [P] Zweryfikuj, że nie zmieniono plików `dane/*.json` ani nie dodano zależności w `package.json`.
- [ ] T027 Uruchom `npm test`, `npm run typecheck` i `npm run build`; zapisz wyniki w raporcie PR.
- [ ] T028 [P] Zweryfikuj `git diff --check`, kontrakt API i zgodność z konstytucją w `specs/002-cr-a-tryb-nadplaty/plan.md`.

**Punkt kontrolny**: CR-A jest gotowe do ręcznego review i PR.

## Zależności i kolejność wykonania

```text
Faza 2 → US1 → US2 → US3 → Polish
```

- US1 zależy od foundational i dostarcza reamortyzację `obnizRate`.
- US2 zależy od modelu nadpłaty z US1, ale zachowuje niezależny test trybu `skrocOkres`.
- US3 zależy od obu trybów, kontraktu API i modelu UI.
- Polish zależy od zakończenia wszystkich wybranych historii.

## Możliwości równoległe

### Foundational

- T001, T002, T004 i T005 mogą być przygotowane równolegle, jeśli kontrakt domeny jest uzgadniany wspólnie.

### User Story 1

- T006, T007 i T008 mogą być napisane równolegle przed T009–T011.

### User Story 2

- T012, T013 i T014 mogą być napisane równolegle przed T015–T017.

### User Story 3

- T018 i T019 mogą być przygotowane równolegle przed T020–T023.
- T020 może być rozwijane równolegle z T018–T019, ale T021 zależy od finalnego kontraktu API.

### Polish

- T024, T025, T026 i T028 mogą być wykonane równolegle; T027 wykonaj po ich zakończeniu.

## Strategia implementacji

1. MVP: Faza 2, US1 i US2, ponieważ oba warianty są wymaganiami P1.
2. Następnie US3: porównanie wariantów, API i UI.
3. Na końcu Polish: dokumentacja, pełna walidacja i przygotowanie do PR.
4. Każdą zmianę logiki finansowej wykonuj test-first: czerwony test, najmniejsza poprawka, zielona regresja.
