# Data Model: CR-A tryb nadpłaty

## Parametry kredytu

Istniejące parametry kredytu pozostają bez zmian. Nadpłaty są listą uporządkowanych wpisów:

```ts
interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb?: 'obnizRate' | 'skrocOkres';
}
```

## Reguły walidacji

- `miesiac` jest dodatnią liczbą całkowitą i nie przekracza pierwotnej liczby rat.
- `kwotaGr` jest dodatnią liczbą całkowitą w groszach.
- Brak `tryb` jest prawidłowy i oznacza `skrocOkres`.
- Inna wartość trybu jest odrzucana na granicy kontraktu.
- Wiele wpisów z tym samym `miesiac` jest prawidłowe; ich kolejność na liście jest zachowana.

## Przejście harmonogramu

Dla każdej raty wykonywana jest kolejność:

1. ustalenie daty i stopy okresu;
2. naliczenie odsetek od salda przed nadpłatą;
3. spłata części raty;
4. zastosowanie nadpłat z bieżącego miesiąca w kolejności wejścia;
5. zastosowanie skutku trybu nadpłaty do salda i kolejnych rat;
6. zakończenie po wyzerowaniu salda lub po pierwotnej liczbie rat.

## Skutek trybu

| Tryb | Liczba rat | Wysokość kolejnych rat | Saldo końcowe |
|---|---:|---|---:|
| `obnizRate` | bez zmian | przeliczona od salda po nadpłacie | 0 gr |
| `skrocOkres` | krótsza lub równa | zachowana do ostatniej raty wyrównującej | 0 gr |

## Nieznormalizowane dane

Jeżeli API otrzyma nadpłatę bez trybu, domena normalizuje ją do `skrocOkres` przed obliczeniem. Adapter API przekazuje brak trybu bez powielania tej reguły. Odpowiedź zachowuje informację o zastosowanej kwocie nadpłaty w groszach.
