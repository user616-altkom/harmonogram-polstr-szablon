import { describe, expect, it } from 'vitest';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('harmonogram rat równych', () => {
  it('zwraca ratę kontrolną 2 494,72 zł dla stałej stopy 5,66 %', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
    });

    expect(wynik.raty[0]?.rataGr).toBe(249_472);
    expect(wynik.raty[299]?.rataGr).toBe(249_253);
  });

  it('wyrównuje ostatnią ratę tak, aby suma części kapitałowych była równa kredytowi', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
    });

    const sumaKapitalow = wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowaGr, 0);
    expect(sumaKapitalow).toBe(400_000_00);
  });
});
