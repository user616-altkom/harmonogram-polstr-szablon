# Research

## Założenia architektoniczne

- Projekt używa Next.js App Router i TypeScript strict, bez nowych zależności.
- Domyślny model biznesowy jest w warstwie domenowej: czyste funkcje, brak I/O i brak React.
- Dane wskaźników są statyczne i wczytywane z plików JSON w katalogu `dane/`.
- Route handler jest cienki i nie liczy; deleguje do domeny.
- Strona główna jest osobnym komponentem React z `'use client'`, a obliczenia są zewnętrzne.

## Wartości wskaźników

- `POLSTR_1M` ma dane miesięczne, w pliku `dane/polstr-1m.json`.
- `WIBOR_3M` ma dane kwartalne, w pliku `dane/wibor-3m.json`.
- Każdy wpis ma pole `od` i `stopa` jako ułamek, np. `0.0355` dla 3,55 %.
- Po ostatnim wpisie serii obowiązuje ostatnia znana wartość.

## Reguły biznesowe wspólne dla MVP

- Oprocentowanie okresu = wskaźnik + marża.
- Odsetki za okres = saldo × roczna stopa / 12.
- Wartości są zaokrąglane do grosza.
- Ostatnia rata jest wyrównująca, aby suma części kapitałowych była równa kwocie kredytu.
- Odsetki proste, bez kapitalizacji w ramach miesiąca.
- W przypadku nadpłat tryb `obnizRate` zmienia wysokość raty, a tryb `skrocOkres` zmienia długość harmonogramu.

## Decyzja projektowa

Główny moduł obliczeń powinien przyjmować wejście znormalizowane do formatu wewnętrznego, np.:

- kwota kredytu w groszach
- liczba rat
- początek spłaty jako data ISO
- marża jako ułamek
- typ rat równych lub malejących
- wskaźnik `POLSTR_1M` lub `WIBOR_3M`

To pozwala uniknąć mieszania warstw i utrzymać testowalność domeny niezależnie od sieci i UI.

## Rekomendacja wdrożeniowa

1. Najpierw zbudować test kontrolny dla rat równych.
2. Następnie uzupełnić funkcję obliczającą harmonogram przy stałych danych i stałej stopie.
3. Dodać logikę zmiany wskaźnika i opcji nadpłat.
4. Dodać route handler i ekran zgodnie z kontraktem API.

## Rozstrzygnięte niezdefiniowane kwestie

- Dla MVP nie implementuje się składania dziennych stawek POLSTR wstecz za okres odsetkowy; to jest funkcja z listy gwiazdek.
- Nie dodajemy nowych bibliotek UI; ekran jest jednym komponentem React z Tailwind.
- Ekran jest osobną, ostatnią historią użytkownika i nie ma własnych testów jednostkowych.
