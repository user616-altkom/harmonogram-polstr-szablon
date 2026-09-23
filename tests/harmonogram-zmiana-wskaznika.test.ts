import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  seriaWskaznika: () => [
    { od: '2026-01-01', stopa: 0.03 },
    { od: '2026-03-01', stopa: 0.06 },
  ],
}));

import { policzHarmonogram } from '../src/domena/harmonogram';

describe('zmiana wskaźnika w harmonogramie', () => {
  it('wybiera stawkę obowiązującą w dniu raty i używa ostatniej znanej stawki', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 1_200_000,
      liczbaRat: 3,
      marza: 0,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-02-01',
    });

    expect(wynik.raty[0]?.odsetkiGr).toBe(3_000);
    expect(wynik.raty[1]?.odsetkiGr).toBeGreaterThan(wynik.raty[0]?.odsetkiGr ?? 0);
    expect(wynik.raty[1]?.data).toBe('2026-03-01');
    expect(wynik.raty[2]?.data).toBe('2026-04-01');
  });
});