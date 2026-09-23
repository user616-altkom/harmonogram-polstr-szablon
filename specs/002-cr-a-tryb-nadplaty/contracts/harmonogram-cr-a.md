# Kontrakt API: CR-A

## Wejście

Endpoint `GET /api/harmonogram` zachowuje istniejące parametry kredytu. Parametr `nadplaty` jest opcjonalną listą wpisów rozdzielanych przecinkami:

```text
miesiac:kwotaGr:tryb,miesiac:kwotaGr:tryb
```

Przykład:

```text
1:3000000:obnizRate
```

Dla kompatybilności wpis bez trybu jest dozwolony:

```text
1:3000000
```

i oznacza `skrocOkres`.

## Odpowiedź sukcesu

Odpowiedź zawiera pełną tabelę rat, ratę pierwszą i ostatnią oraz sumę odsetek. Wiersz raty zawiera numer, datę, kapitał, odsetki, ratę, saldo i opcjonalnie kwotę nadpłaty. Pieniądze w odpowiedzi są prezentowane w złotych zgodnie z istniejącym kontraktem UI; domena przechowuje je w groszach.

## Odpowiedź błędu

Niepoprawny miesiąc, kwota lub tryb zwraca błąd walidacji bez harmonogramu. Błąd nie może częściowo zastosować nadpłat.

## Kompatybilność

Klienci wysyłający wpisy bez trzeciego składnika zachowują dotychczasowe zachowanie `skrocOkres`. Klienci wysyłający `obnizRate` otrzymują ten tryb wyłącznie dla wskazanego wpisu.
