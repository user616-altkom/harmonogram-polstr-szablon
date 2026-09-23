# Data Model

## Kontrakt wejściowy domeny

```ts
export interface ParametryKredytu {
  kwotaGr: number;
  liczbaRat: number;
  marza: number;
  typRat: 'rowne' | 'malejace';
  wskaznik: 'POLSTR_1M' | 'WIBOR_3M';
  pierwszaRata: string;
}
```

**Uwagi**:

- `kwotaGr` jest w groszach, np. `40000000` dla 400 000 zł.
- `marza` jest ułamkiem, np. `0.0211` dla 2,11 pp.
- `pierwszaRata` ma format `YYYY-MM-DD`.

## Serie wskaźników

```ts
export interface WpisSerii {
  od: string;
  stopa: number;
}
```

- `stopa` to wartość wskaźnika jako ułamek roczny.
- Wartość obowiązuje od `od` do dnia przed następnym wpisem.

## Wynik harmonogramu

```ts
export interface Rata {
  numer: number;
  data: string;
  czescKapitalowaGr: number;
  odsetkiGr: number;
  rataGr: number;
  saldoPoSplacieGr: number;
}

export interface Harmonogram {
  raty: Rata[];
  sumaOdsetekGr: number;
}
```

**Zasada**:

- `sumaOdsetekGr` jest sumą odsetek z całego okresu wyrażoną w groszach.
- `raty` ma pełną tabelę wynikową używaną przez API i ekran.
- Wszystkie pola pieniężne przechowujemy w groszach jako liczby całkowite.

## Kontrakt API

Route handler `app/api/harmonogram/route.ts` przyjmuje parametry w query string:

- `kwota`
- `liczbaRat`
- `marza`
- `wskaznik`
- `typRat`
- `pierwszaRata`
- `nadplaty` (opcjonalnie, serializowane jako lista obiektów z `miesiac`, `kwotaGr`, `tryb`)

Route zwraca JSON z następującym typem:

```ts
export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: 'obnizRate' | 'skrocOkres';
}

export interface ApiRata {
  nr: number;
  data: string;
  kapital: number;
  odsetki: number;
  rata: number;
  saldo: number;
  nadplata?: number;
}

export interface ApiHarmonogramResponse {
  raty: ApiRata[];
  rataPierwsza: number;
  rataOstatnia: number;
  sumaOdsetek: number;
  blad?: string;
}
```

Pola pieniężne odpowiedzi API są wyrażone w złotych jako liczby dziesiętne, ponieważ ten kontrakt jest bezpośrednio konsumowany przez ekran. Wejściowa kwota `kwota` jest podawana w złotych, natomiast drugi składnik każdego fragmentu `nadplaty` jest całkowitą liczbą groszy, np. `1:200000:obnizRate`.

## Ekran

Komponent strony `app/page.tsx`:

- przechowuje stan formularza w React
- wysyła `fetch('/api/harmonogram?...')`
- renderuje ratę pierwszą i ostatnią, sumę odsetek i tabelę rat
- udostępnia przycisk eksportu CSV po stronie klienta

UI nie zawiera obliczeń finansowych; korzysta wyłącznie z danych z API.
