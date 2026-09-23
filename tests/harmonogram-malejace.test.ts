import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  seriaWskaznika: () => [{ od: '2026-01-01', stopa: 0.12 }],
}));

import { policzHarmonogram } from '../src/domena/harmonogram';

describe('harmonogram rat malejących', () => {
  it('utrzymuje stałą część kapitałową i malejące odsetki', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 1_200_000,
      liczbaRat: 3,
      marza: 0,
      typRat: 'malejace',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
    });

    expect(wynik.raty.map((rata) => rata.czescKapitalowaGr)).toEqual([400_000, 400_000, 400_000]);
    expect(wynik.raty.map((rata) => rata.odsetkiGr)).toEqual([12_000, 8_000, 4_000]);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });
});