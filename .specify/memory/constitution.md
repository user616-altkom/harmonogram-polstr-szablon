<!--
Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles: none -> 5 principles
- Added sections: Core Principles, Additional Constraints, Development Workflow
- Removed sections: none
- Deferred items: none
-->

# Konstytucja projektu Harmonogram POLSTR

## Core Principles

### I. Domena jako źródło prawdy
Wszystkie obliczenia harmonogramu, rat, odsetek i walidacji danych muszą żyć w `src/domena`. Moduły React, API i UI nie mogą zawierać logiki finansowej. Każda operacja musi być wywoływana z funkcji domenowej i weryfikowana testem.

### II. Dane i wskaźniki są traktowane jako zewnętrzne źródła
Serie POLSTR 1M i WIBOR 3M są wczytywane z danych JSON i mają być odczytywane wyłącznie przez warstwę `src/dane`, bez modyfikacji w logice. Wartości są liczbami ułamkowymi w skali 1, data obowiązywania musi być zachowana, a każda zmiana wskaźnika wymaga aktualizacji testów danych.

### III. Test-first dla logiki finansowej
Każda zmiana algorytmu spłaty, odsetek, rat, stopy procentowej lub walidacji ma test jednostkowy w `tests/` przed implementacją. Test musi odtwarzać liczbę kontrolną; kod nie przechodzi do PR bez poprawnego `npm test`, `npm run typecheck` i `npm run build`.

### IV. API i frontend są cienkie
Endpoint `app/api/harmonogram/route.ts` służy do parsowania parametrów i przekazania ich do domeny; nie pobiera danych ani nie liczy. Ekran `app/page.tsx` pobiera dane z `/api/harmonogram` i renderuje wynik, nie przechowuje logiki obliczeniowej.

### V. Prostota, czytelność i przewidywalność
Kwoty w groszach są liczbami całkowitymi lub są zaokrąglane w jednym miejscu; nazwy domenowe są po polsku; brak `any` i ignorowanych błędów; każda decyzja techniczna musi być jasna i zgodna z celem MVP.

## Additional Constraints

- Projekt działa w Next.js App Router z TypeScript strict.
- W przestrzeni domenowej nie wolno używać React, `Date.now()`, I/O ani efektów ubocznych.
- Zmiany w danych z katalogu `dane/` są zakazane bez wyraźnego polecenia; testy odczytują te pliki.
- Wszystkie wartości procentowe muszą być przechowywane jako ułamek, nie procent; zaokrąglenia muszą występować w jednym miejscu.

## Development Workflow

- Każda faza pracy musi rozpoczynać się od zadania opisującego cel, zakładane dane wejściowe i kryteria akceptacji.
- PR jest akceptowany tylko po przejściu `npm test`, `npm run typecheck` i `npm run build`.
- Kod review musi sprawdzać zgodność z `AGENTS.md`, `.github/instructions/review.instructions.md` oraz zasadami domeny.
- Zmiana przepisów, zasad lub zachowań finansowych wymaga dopisania lub aktualizacji testu kontrolnego.

## Governance

Konstytucja ma pierwszeństwo przed innymi praktykami projektowymi. Wszelkie odchylenia od zasad wymagają uzasadnienia biznesowego, dokumentacji w PR i akceptacji przez właściciela projektu lub osobę zatwierdzającą zmianę.

- Zmiany konstytucji wymagają opisu zmiany, wersji i planu migracji dla istniejących wdrożeń.
- Wersjonowanie stosuje semantyczne: MAJOR dla łamiących zmian w zasadach, MINOR dla nowych zasad i rozszerzeń, PATCH dla uściśleń i poprawek.
- Każdy PR musi sprawdzić zgodność z konstytucją i wskazać, czy zmiana w niej była potrzebna.
- W przypadku niezgodności, zmiana musi zostać odrzucona lub uzupełniona w tej samej iteracji.

**Version**: 1.0.0 | **Ratified**: 2026-09-23 | **Last Amended**: 2026-09-23
