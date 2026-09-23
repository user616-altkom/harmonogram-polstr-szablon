# Kontrakt interfejsu: CR-A

## Dane wejściowe

Punkt dostępu `GET /api/harmonogram` zachowuje istniejące parametry kredytu. Parametr `nadplaty` jest opcjonalną listą wpisów rozdzielanych przecinkami:

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

## Odpowiedź poprawna

Odpowiedź zawiera pełną tabelę rat, ratę pierwszą i ostatnią oraz sumę odsetek. Wiersz raty zawiera numer, datę, kapitał, odsetki, ratę, saldo i opcjonalnie kwotę nadpłaty. Pieniądze w odpowiedzi są prezentowane w złotych zgodnie z istniejącym kontraktem UI; domena przechowuje je w groszach.

## Odpowiedź błędna

Niepoprawny miesiąc, kwota lub tryb zwraca błąd walidacji bez harmonogramu. Błąd nie może częściowo zastosować nadpłat.

## Zgodność wsteczna

Klienci wysyłający wpisy bez trzeciego składnika zachowują dotychczasowe zachowanie `skrocOkres`. Klienci wysyłający `obnizRate` otrzymują ten tryb wyłącznie dla wskazanego wpisu.
