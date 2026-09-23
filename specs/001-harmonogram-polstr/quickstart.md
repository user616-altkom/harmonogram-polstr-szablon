# Quickstart

## Uruchomienie lokalne

```bash
npm install
npm test
npm run typecheck
npm run dev
```

Po uruchomieniu serwera sprawdź:

- http://localhost:3000
- http://localhost:3000/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01

## Przykład danych wejściowych

Przykładowy kontrolny przypadek z BRIEF:

- kwota: 400000
- liczbaRat: 300
- marza: 2.11
- wskaznik: POLSTR_1M
- typRat: rowne
- pierwszaRata: 2026-10-01

Oczekiwany wynik:

- rata równa: 2494,72 zł
- ostatnia rata wyrównująca: 2492,53 zł
- tolerancja: ±0,05 zł

## Dodatkowe sprawdzenia

```bash
npm run build
```

Budowa produkcyjna musi przejść przed PR i merge, zgodnie z wymaganiami projektu.
