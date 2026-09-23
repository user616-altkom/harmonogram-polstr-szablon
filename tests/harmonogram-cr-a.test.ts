import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/dane/wskazniki', () => ({
  seriaWskaznika: () => [{ od: '2026-01-01', stopa: 0.0455 }],
}));

import { policzHarmonogram } from '../src/domena/harmonogram';

const parametryBazowe = {
  kwotaGr: 30_000_000,
  liczbaRat: 240,
  marza: 0.0211,
  typRat: 'rowne' as const,
  wskaznik: 'WIBOR_3M' as const,
  pierwszaRata: '2026-01-01',
};

function sumaKapitaluINadplat(wynik: ReturnType<typeof policzHarmonogram>): number {
  return wynik.raty.reduce((suma, rata) => suma + rata.czescKapitalowaGr + (rata.nadplataGr ?? 0), 0);
}

describe('CR-A: tryb rozliczenia nadpłaty', () => {
  it('obniza rate po nadplacie i zachowuje 240 rat', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 3_000_000, tryb: 'obnizRate' }],
    });

    expect(wynik.raty[0]?.rataGr).toBe(226_507);
    expect(wynik.raty[0]?.saldoPoSplacieGr).toBe(26_939_993);
    expect(wynik.raty[1]?.rataGr).toBe(203_811);
    expect(wynik.raty).toHaveLength(240);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
    expect(sumaKapitaluINadplat(wynik)).toBe(30_000_000);
  });

  it('skrac okres, zachowuje rate i wyrownuje ostatnia rate', () => {
    const wynik = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 3_000_000, tryb: 'skrocOkres' }],
    });

    expect(wynik.raty[0]?.rataGr).toBe(226_507);
    expect(wynik.raty).toHaveLength(196);
    expect(wynik.raty.at(-1)?.rataGr).toBe(220_053);
    expect(wynik.raty.at(-1)?.saldoPoSplacieGr).toBe(0);
    expect(sumaKapitaluINadplat(wynik)).toBe(30_000_000);
  });

  it('brak trybu traktuje jak skrocenie okresu', () => {
    const bezTrybu = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 3_000_000 }],
    });
    const jawnyTryb = policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 3_000_000, tryb: 'skrocOkres' }],
    });

    expect(bezTrybu).toEqual(jawnyTryb);
  });

  it('waliduje tryb, miesiac i kwote nadplaty', () => {
    expect(() => policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 0, kwotaGr: 1, tryb: 'skrocOkres' }],
    })).toThrow('miesiac nadplaty');

    expect(() => policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 0, tryb: 'skrocOkres' }],
    })).toThrow('kwota nadplaty');

    expect(() => policzHarmonogram({
      ...parametryBazowe,
      nadplaty: [{ miesiac: 1, kwotaGr: 1, tryb: 'nieznany' as 'skrocOkres' }],
    })).toThrow('tryb nadplaty');
  });
});
