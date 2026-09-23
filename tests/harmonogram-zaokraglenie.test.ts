import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  seriaWskaznika: () => [{ od: '2026-01-01', stopa: 0.12 }],
}));

import { policzHarmonogram } from '../src/domena/harmonogram';

describe('wyrównanie ostatniej raty', () => {
  it('zamyka saldo po zaokrągleniu rat równych', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 101,
      liczbaRat: 2,
      marza: 0,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-01-01',
    });

    expect(wynik.raty.map((rata) => rata.rataGr)).toEqual([51, 52]);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });
});