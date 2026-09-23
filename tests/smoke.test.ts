import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  seriaWskaznika: (wskaznik: 'POLSTR_1M' | 'WIBOR_3M') => {
    if (wskaznik === 'POLSTR_1M') {
      return [{ od: '2026-01-01', stopa: 0.0355 }];
    }

    return [{ od: '2026-01-01', stopa: 0.0399 }];
  },
}));

import { seriaWskaznika } from '../src/dane/wskazniki';
import { policzHarmonogram } from '../src/domena/harmonogram';

describe('dane wskaźników z katalogu dane/', () => {
  it.each(['POLSTR_1M', 'WIBOR_3M'] as const)('%s ma serię uporządkowaną rosnąco po dacie', (wskaznik) => {
    const seria = seriaWskaznika(wskaznik);
    expect(seria.length).toBeGreaterThan(0);
    for (const wpis of seria) {
      expect(wpis.od).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(wpis.stopa).toBeGreaterThan(0);
      expect(wpis.stopa).toBeLessThan(0.2);
    }
    const daty = seria.map((wpis) => wpis.od);
    expect([...daty].sort()).toEqual(daty);
  });
});

describe('domena', () => {
  it('policzHarmonogram zwraca pełny harmonogram dla rat równych', () => {
    const wynik = policzHarmonogram({
      kwotaGr: 400_000_00,
      liczbaRat: 300,
      marza: 0.0211,
      typRat: 'rowne',
      wskaznik: 'POLSTR_1M',
      pierwszaRata: '2026-10-01',
    });

    expect(wynik.raty).toHaveLength(300);
    expect(wynik.raty[0]?.rataGr).toBe(249_472);
    expect(wynik.raty[299]?.saldoPoSplacieGr).toBe(0);
    expect(wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowaGr, 0)).toBe(400_000_00);
  });

  it('testy działają w strefie Europe/Warsaw', () => {
    expect(process.env.TZ).toBe('Europe/Warsaw');
  });
});
