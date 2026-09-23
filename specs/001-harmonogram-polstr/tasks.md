# Zadania: Harmonogram POLSTR

**Wejście**: Dokumenty projektowe z `/specs/001-harmonogram-polstr/`

**Wymagania wstępne**: plan.md (wymagany), spec.md (wymagany dla historii użytkownika), research.md, data-model.md, quickstart.md

**Testy**: W tej funkcji testy są wymagane dla logiki domeny i przypadku biznesowego liczby kontrolnej.

**Organizacja**: Zadania są pogrupowane według historii użytkownika, aby można było je implementować i testować niezależnie.

## Format: `[ID] [P?] [Story] Opis`

- **[P]**: Można uruchomić równolegle (inne pliki, brak zależności)
- **[Story]**: Do której historii użytkownika należy zadanie (np. US1, US2, US3)
- W opisie należy podawać dokładne ścieżki plików

## Faza 1: Setup (Wspólna infrastruktura)

**Cel**: Repo zawiera już działający szkielet projektu; nie ma zadań setupu dla tej funkcji.

- Brak zadań w tej fazie. Szkielet projektu i konfiguracja Next.js/Vitest/Tailwind są już obecne.

---

## Faza 2: Foundational (Warunki wstępne)

**Cel**: Podstawowa infrastruktura, która MUSI być kompletna przed rozpoczęciem prac nad historiami użytkownika.

- [ ] T001 [P] Zweryfikuj i potwierdź granice domeny, danych, API i UI w `src/domena/harmonogram.ts`, `src/dane/wskazniki.ts`, `app/api/harmonogram/route.ts` i `app/page.tsx`
- [ ] T002 [P] Zdefiniuj kontrakt danych harmonogramu w `src/domena/harmonogram.ts` i dopasuj go do kontraktu odpowiedzi API
- [ ] T003 [P] Zdefiniuj politykę zaokrągleń i jednostki pieniężnej w `src/domena/harmonogram.ts`, aby kwoty były przechowywane w groszach i zaokrąglane w jednym miejscu
- [ ] T004 Utwórz typ wejściowy dla parametrów kredytu i interfejs wyniku harmonogramu w `src/domena/harmonogram.ts`
- [ ] T005 Dodaj kontrakt użycia `seriaWskaznika` i notatki walidacyjne w `src/dane/wskazniki.ts`, aby dane JSON były pobierane wyłącznie przez warstwę danych
- [ ] T006 Zweryfikuj kontrakt API w `app/api/harmonogram/route.ts`, tak aby query params były parsowane i mapowane do wejścia domenowego bez logiki biznesowej w routingu

**Punkt kontrolny**: Podstawa gotowa - prace nad historiami użytkownika mogą się rozpocząć.

---

## Faza 3: User Story 1 - Rata równa przy stałej stopie (Priority: P1) 🎯 MVP

**Cel**: Obliczyć poprawny harmonogram dla rat równych przy stałej stopie i potwierdzić liczbę kontrolną z BRIEF.

**Test niezależny**: Dla kwoty 400 000 zł, 300 rat, stopy 5,66 % rocznie i stałej serii wskaźnika `[{ od: '2026-01-01', stopa: 0.0355 }]`, rata równa musi wynosić 2 494,72 zł ±0,05 zł.

### Testy dla User Story 1 (WYMAGANE)

> Uwaga: testy MUSZĄ zostać napisane najpierw i powinny failować przed implementacją.

- [ ] T007 [US1] Dodaj test liczby kontrolnej dla rat równych w `tests/harmonogram-rowne-raty.test.ts` na podstawie przykładu z BRIEF i oczekiwanej raty 2 494,72 zł
- [ ] T008 [US1] Dodaj test walidacji końcowego wyrównania w `tests/harmonogram-rowne-raty.test.ts`, aby sprawdzić, że suma części kapitałowych jest równa kwocie kredytu po zaokrągleniach

### Implementacja dla User Story 1

- [ ] T009 [US1] Zaimplementuj czystą kalkulację rat równych w `src/domena/harmonogram.ts` zgodnie z konwencją stopy rocznej i okresu miesięcznego z briefu
- [ ] T010 [US1] Zaimplementuj logikę wyrównania ostatniej raty w `src/domena/harmonogram.ts`, aby ostatnia rata dopłacała lub korygowała saldo końcowe
- [ ] T011 [US1] Dodaj model wyniku harmonogramu i wiersze rat w `src/domena/harmonogram.ts` z polami: numer, data, część kapitałowa, odsetki, rata i saldo końcowe
- [ ] T012 [US1] Udostępnij wynik przez funkcję wejściową domeny, aby API i testy używały tego samego kontraktu wynikowego
- [ ] T013 [US1] Zweryfikuj tę samą funkcję domenową z `app/api/harmonogram/route.ts` dla poprawnego żądania `rowne` i zwróć JSON zamiast 501

**Punkt kontrolny**: W tej chwili User Story 1 jest w pełni funkcjonalny i testowalny niezależnie.

---

## Faza 4: User Story 2 - Zmienne wskaźniki i nadpłaty (Priority: P2)

**Cel**: Dodać obsługę wskaźników POLSTR 1M i WIBOR 3M, zmiany stóp w trakcie spłaty oraz nadpłat w trybie obniż raty i skrócenia okresu.

**Test niezależny**: Dla zmienionej serii wskaźnika albo nadpłaty w trybie `obnizRate`/`skrocOkres`, harmonogram musi odzwierciedlać nowe saldo i ratę bez naruszenia reguły wyrównania końcowego.

### Testy dla User Story 2 (WYMAGANE)

- [ ] T014 [P] [US2] Dodaj test dla zmiany okresowej stopy w `tests/harmonogram-zmiana-wskaznika.test.ts` obejmujący zmiany POLSTR/WIBOR i zachowanie dla ostatniej znanej wartości
- [ ] T015 [P] [US2] Dodaj test dla nadpłat w `tests/harmonogram-nadplaty.test.ts` obejmujący oba tryby: `obnizRate` i `skrocOkres`

### Implementacja dla User Story 2

- [ ] T016 [P] [US2] Zaimplementuj logikę wyboru wskaźnika w `src/domena/harmonogram.ts` na podstawie okresowych serii z `src/dane/wskazniki.ts`
- [ ] T017 [US2] Dodaj logikę wyboru kolejnej poprawnej wartości wskaźnika i fallbacku do ostatniej znanej wartości w `src/domena/harmonogram.ts`
- [ ] T018 [US2] Zaimplementuj obliczanie harmonogramu dla rat malejących w `src/domena/harmonogram.ts` obok logiki rat równych
- [ ] T019 [US2] Zaimplementuj przetwarzanie nadpłat w `src/domena/harmonogram.ts` z dwoma trybami: `obnizRate` i `skrocOkres`
- [ ] T020 [US2] Zaktualizuj kontrakt route handlra w `app/api/harmonogram/route.ts`, aby dodatkowe parametry były przyjmowane i przekazywane bez wprowadzania logiki biznesowej do routingu

**Punkt kontrolny**: W tej chwili User Stories 1 i 2 powinny działać niezależnie.

---

## Faza 5: User Story 3 - Ekran www podłączony do API (Priority: P3)

**Cel**: Dostarczyć ostatnią historię użytkownika: ekran kalkulatora z formularzem, pobieraniem danych z `/api/harmonogram` i eksportem CSV.

**Test niezależny**: Nie dodajemy osobnych testów UI. Zamiast nich walidujemy, że komponent korzysta z API i nie zawiera logiki finansowej.

### Implementacja dla User Story 3

- [ ] T021 [US3] Zamień placeholder w `app/page.tsx` na eksportowany komponent React z Claude Design, zachowując `'use client'` w pierwszej linii
- [ ] T022 [US3] Zaimplementuj stan formularza i logikę pobierania danych w `app/page.tsx` z użyciem `fetch('/api/harmonogram?...')`
- [ ] T023 [US3] Wyświetl ratę pierwszą i ostatnią, sumę odsetek oraz tabelę rat w `app/page.tsx`
- [ ] T024 [US3] Zaimplementuj przycisk eksportu CSV w `app/page.tsx` bez dodawania nowych zależności
- [ ] T025 [US3] Zweryfikuj, że strona jest podłączona do route handlra i że UI pozostaje cienkie, bez logiki biznesowej w komponencie

**Punkt kontrolny**: Wszystkie historie użytkownika powinny być teraz niezależnie funkcjonalne.

---

## Faza 6: Polish & Cross-Cutting Concerns

**Cel**: Poprawki wpływające na wszystkie historie użytkownika, przed finalną walidacją i merge.

- [ ] T026 [P] Sprawdź kontrakt odpowiedzi API i upewnij się, że odpowiada tabeli oczekiwanej przez UI w `app/api/harmonogram/route.ts`
- [ ] T027 [P] Uruchom walidację z `quickstart.md`, w tym `npm test`, `npm run typecheck` i `npm run build`
- [ ] T028 Wyczyść nazewnictwo, komentarze i dokumentację w `src/domena/harmonogram.ts`, `src/dane/wskazniki.ts`, `app/api/harmonogram/route.ts` i `app/page.tsx`
- [ ] T029 [P] Potwierdź, że wartość biznesowa z BRIEF jest zachowana z tolerancją ±0,05 zł w finalnym wyniku
- [ ] T030 [P] Zweryfikuj poprawność GitHub Actions, podglądu Vercel i instrukcji PR przed merge do `main`

---

## Zależności i kolejność wykonania

### Zależności faz

- **Setup (Phase 1)**: Brak zależności - już spełnione przez istniejący szkielet
- **Foundational (Phase 2)**: Musi być kompletne przed rozpoczęciem jakiejkolwiek historii użytkownika
- **User Stories (Phase 3+)**: Wszystkie zależą od pracy foundational; potem można je realizować w kolejności priorytetów P1 → P2 → P3
- **Polish (Final Phase)**: Zależy od zakończenia wszystkich pożądanych historii użytkownika

### Zależności historii użytkownika

- **User Story 1 (P1)**: Może zacząć się po zakończeniu Foundational i jest głównym slice MVP
- **User Story 2 (P2)**: Buduje na tym samym modelu domenowym, ale powinna pozostać niezależnie testowalna
- **User Story 3 (P3)**: Integracja UI zależna od kontraktu backendu i wyników obliczeń

### Możliwości równoległe

- Zadania foundational T001–T006 można wykonywać równolegle, bo dotyczą różnych plików i mają wspólny kontrakt.
- Testy w ramach historii (`[US1]`, `[US2]`) można pisać równolegle.
- Równoległe rozwijanie historii użytkownika jest możliwe tylko po zakończeniu Foundational.

---

## Przykład równoległości: User Story 1

```bash
# Zapisz testy dla pierwszej historii równolegle
Zadanie: "Dodaj test liczby kontrolnej dla rat równych w tests/harmonogram-rowne-raty.test.ts"
Zadanie: "Dodaj test walidacji końcowego wyrównania w tests/harmonogram-rowne-raty.test.ts"

# Implementacja domeny może przebiegać równolegle, jeśli są niezależne
Zadanie: "Zaimplementuj raty równe w src/domena/harmonogram.ts"
Zadanie: "Zaimplementuj wyrównanie ostatniej raty w src/domena/harmonogram.ts"
```

---

## Strategia wdrożenia

### MVP najpierw (tylko User Story 1)

1. Ukończ Faza 1: Setup (już spełnione)
2. Ukończ Faza 2: Foundational
3. Ukończ Faza 3: User Story 1
4. Zatrzymaj się i zweryfikuj liczbę kontrolną przed przejściem do bogatszych scenariuszy
5. Dopiero potem dodaj User Story 2 i User Story 3

### Dostarczanie przyrostowe

1. Setup + Foundational → fundament gotowy
2. Dodaj User Story 1 → zweryfikuj kontrolną wartość → deploy/demo jeśli gotowe
3. Dodaj User Story 2 → sprawdź zmianę stóp i nadpłaty
4. Dodaj User Story 3 → sprawdź integrację UI i eksport CSV

### Strategia pracy równoległej

Przy wielu programistach:

1. Zespół kończy Setup + Foundational wspólnie
2. Po zakończeniu Foundational:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Historie są kończone i integracyjne niezależnie

---

## Uwagi

- [P] oznacza zadania na różnych plikach bez zależności
- [Story] mapuje zadanie do konkretnej historii użytkownika dla śledzenia
- Każda historia użytkownika powinna być niezależnie kompletna i testowalna
- Pierwsza fala implementacji to User Story 1, ponieważ to wymóg akceptacyjny z BRIEF
- Unikaj niejasnych zadań i zależności między historiami, które niszczą niezależność
