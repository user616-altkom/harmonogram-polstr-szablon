# Plan implementacji: Tryb rozliczenia nadpłaty

**Gałąź**: `002-cr-a-tryb-nadplaty` | **Data**: 2026-09-23 | **Specyfikacja**: [spec.md](spec.md)

**Wejście**: Specyfikacja funkcji z `/specs/002-cr-a-tryb-nadplaty/spec.md`

**Uwaga**: Ten szablon został wypełniony przez komendę `/speckit-plan`; jego struktura opisuje przebieg prac.

## Podsumowanie

CR-A dodaje wybór skutku nadpłaty: `obnizRate` zachowuje liczbę rat i przelicza ratę po nadpłacie, a `skrocOkres` zachowuje ratę i kończy harmonogram wcześniej. Nadpłata jest stosowana po racie, a brak trybu zachowuje dotychczasowy domyślny tryb `skrocOkres`. Zmiana pozostaje w istniejącym modelu domenowym, z cienkim adapterem API i UI konsumującym wynik.

## Kontekst techniczny

**Język i wersja**: TypeScript 5.x, Node.js 22+

**Główne zależności**: Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest 4; bez nowych zależności

**Przechowywanie danych**: Statyczne serie wskaźników w `dane/*.json`; brak bazy danych

**Testowanie**: Vitest dla domeny i danych; testy CR-A z liczbami kontrolnymi; końcowo `npm test`, `npm run typecheck`, `npm run build`

**Platforma docelowa**: Aplikacja webowa wdrażana na Vercel z GitHuba

**Typ projektu**: Jednostronicowa aplikacja webowa z API

**Cele wydajnościowe**: Przeliczenie harmonogramu do kilkuset rat w pojedynczym żądaniu i wynik dostępny bez zauważalnego opóźnienia dla doradcy

**Ograniczenia**: Domena pozostaje czysta; kwoty są w całkowitych groszach; zaokrąglanie jest centralne; API nie liczy; UI nie zawiera logiki finansowej; brak zmian w `dane/`

**Skala i zakres**: Jedna lista nadpłat dla jednego harmonogramu; wiele nadpłat w tym samym miesiącu jest wykonywanych kolejno według kolejności wejścia; zakres ograniczony do CR-A

## Kontrola konstytucji

*BRAMKA: Musi przejść przed fazą 0, czyli badaniem. Sprawdź ponownie po fazie 1, czyli projekcie.*

- [x] Obliczenia pozostają w `src/domena/` jako czyste funkcje bez React, I/O i efektów ubocznych.
- [x] Serie wskaźników są używane z istniejącej warstwy `src/dane/` bez zmian w plikach `dane/`.
- [x] Adapter trasy pozostaje cienki: parsuje tryb nadpłaty, deleguje do domeny i serializuje wynik.
- [x] UI tylko przekazuje tryb przy każdej nadpłacie i renderuje wynik.
- [x] Każda zmiana finansowa ma test z liczbą kontrolną przed implementacją.
- [x] Kwoty pozostają w groszach, a ostatnia rata wyrównuje saldo do zera.
- [x] Nie są potrzebne nowe zależności ani zmiana konstytucji.

## Struktura projektu

### Dokumentacja tej funkcji

```text
specs/002-cr-a-tryb-nadplaty/
├── plan.md              # Ten plik (wynik komendy /speckit-plan)
├── research.md          # Wynik fazy 0 (komenda /speckit-plan)
├── data-model.md        # Wynik fazy 1 (komenda /speckit-plan)
├── quickstart.md        # Wynik fazy 1 (komenda /speckit-plan)
├── contracts/           # Wynik fazy 1 (komenda /speckit-plan)
└── tasks.md             # Wynik fazy 2 (komenda /speckit-tasks)
```

### Kod źródłowy (katalog główny repozytorium)

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

**Decyzja dotycząca struktury**: Funkcja rozszerza istniejący moduł domeny harmonogramu. Model trybu nadpłaty i reguły księgowania pozostają w `src/domena/harmonogram.ts`, parser transportowy w `app/api/harmonogram/route.ts`, a formularz i serializacja wyboru w `app/page.tsx`. Testy trafiają do `tests/`. Dokumentacja kontraktu CR-A pozostaje w katalogu specyfikacji.

## Kontrola konstytucji po projekcie

- [x] Badanie nie wprowadza nowych bibliotek ani zmian w danych wskaźników.
- [x] Model danych zachowuje kwoty w groszach i opisuje jednoznaczny moment księgowania nadpłaty.
- [x] Kontrakt rozdziela wejście transportowe od domenowego i zachowuje domyślne `skrocOkres`.
- [x] Szybki start wymaga testów, sprawdzenia typów i buildu oraz obejmuje liczby kontrolne CR-A.
- [x] Zakres implementacji pozostaje w istniejących granicach domena/API/UI i nie wymaga zmiany konstytucji.

## Kolejność implementacji

1. Dodać czerwone testy CR-A dla `obnizRate`, `skrocOkres`, trybu domyślnego i kolejnych nadpłat w tym samym miesiącu.
2. Zmienić model nadpłaty tak, aby brak trybu normalizował się do `skrocOkres`, a tryby były stosowane po racie.
3. Rozdzielić obliczanie raty po nadpłacie: reamortyzacja dla `obnizRate`, zachowanie raty i skrócenie okresu dla `skrocOkres`.
4. Zaktualizować parser API i UI, zachowując istniejący kontrakt groszy oraz kompatybilność wejść bez trybu.
5. Dodać README i szybki start oraz uruchomić pełną regresję.

## Śledzenie złożoności

Brak odstępstw od konstytucji projektu.
