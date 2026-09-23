# Szybki start: CR-A tryb nadpłaty

## Wymagania wstępne

- Node.js 22+
- zainstalowane zależności projektu
- uruchomienie poleceń z katalogu repozytorium

## Walidacja testami

```powershell
npm test
npm run typecheck
npm run build
```

Oczekiwany wynik: wszystkie dotychczasowe testy oraz testy CR-A przechodzą, TypeScript nie zgłasza błędów, a build produkcyjny kończy się sukcesem.

## Scenariusz kontrolny

Użyj stałej serii WIBOR 3M `0.0455`, marży `0.0211`, kwoty `30000000` groszy, 240 rat i nadpłaty `3000000` groszy po pierwszej racie.

Sprawdź dwa warianty:

- `obnizRate`: rata przed nadpłatą 2265,07 zł, saldo po racie i nadpłacie 269399,93 zł, rata od drugiego okresu 2038,11 zł, 240 rat łącznie;
- `skrocOkres`: rata pozostaje 2265,07 zł, 196 rat łącznie, ostatnia rata wyrównująca 2200,53 zł.

W obu wariantach sprawdź saldo końcowe 0 oraz równość kwoty kredytu i sumy kapitału rat wraz z nadpłatami.

## Kompatybilność

Powtórz scenariusz z wpisem nadpłaty bez trybu. Wynik powinien odpowiadać `skrocOkres`.

Sprawdź także dwie nadpłaty w tym samym miesiącu. Powinny zostać zastosowane kolejno w kolejności wejścia.

Przykład dwóch nadpłat po pierwszej racie:

```text
1:200000:skrocOkres,1:100000:obnizRate
```

Pierwsza nadpłata zmniejsza saldo bez zmiany raty, druga działa na już zmniejszonym saldzie i powoduje przeliczenie kolejnych rat.
