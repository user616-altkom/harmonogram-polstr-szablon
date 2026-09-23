import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  seriaWskaznika: () => [{ od: '2026-01-01', stopa: 0.12 }],
}));

import { policzHarmonogram } from '../src/domena/harmonogram';

const parametryBazowe = {
  kwotaGr: 1_200_000,
  liczbaRat: 3,
  marza: 0,
  typRat: 'rowne' as const,
  wskaznik: 'POLSTR_1M' as const,
  pierwszaRata: '2026-01-01',
};

describe('nadpłaty', () => {
  it('obniża kolejne raty w trybie obnizRate', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 200_000, tryb: 'obnizRate' }],
    });

    expect(wynik.raty[0]?.rataGr).toBe(408_027);
    expect(wynik.raty[0]?.nadplataGr).toBe(200_000);
    expect(wynik.raty[1]?.rataGr).toBeLessThan(wynik.raty[0]?.rataGr ?? 0);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('skraca harmonogram w trybie skrocOkres', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 500_000, tryb: 'skrocOkres' }],
    });

    expect(wynik.raty).toHaveLength(2);
    expect(wynik.raty[0]?.nadplataGr).toBe(500_000);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
  });

  it('nie pobiera pełnej raty po dużej nadpłacie w trybie skrocOkres', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 800_000, tryb: 'skrocOkres' }],
    });

    expect(wynik.raty).toHaveLength(2);
    expect(wynik.raty[1]?.rataGr).toBe(4_013);
    expect(wynik.raty[1]?.saldoPoSplacieGr).toBe(0);
  });
});