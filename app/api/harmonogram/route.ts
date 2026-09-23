import { NextResponse } from 'next/server';
import { policzHarmonogram, type Nadplata, type ParametryKredytu } from '../../../src/domena/harmonogram';

// Route handler jest cienki: parsuje parametry z query string, woła domenę, zwraca JSON.
// Kwota kredytu i pola odpowiedzi są w złotych; nadpłaty w query używają groszy.

const PRZYKLAD =
  '/api/harmonogram?kwota=400000&liczbaRat=300&marza=2.11&wskaznik=POLSTR_1M&typRat=rowne&pierwszaRata=2026-10-01';

function parsujNadplaty(wartosc: string | null): Nadplata[] | string {
  if (!wartosc) return [];

  const nadplaty: Nadplata[] = [];
  for (const fragment of wartosc.split(',')) {
    const czesci = fragment.split(':');
    if (czesci.length < 2 || czesci.length > 3) {
      return 'nadplaty: lista w formacie miesiac:kwota:obnizRate albo miesiac:kwota:skrocOkres';
    }

    const [miesiacTekst, kwotaTekst, trybTekst] = czesci;
    const miesiac = Number(miesiacTekst);
    const kwotaGr = Number(kwotaTekst);
    const tryb = trybTekst === undefined || trybTekst === 'skrocOkres' || trybTekst === 'okres'
      ? 'skrocOkres'
      : trybTekst === 'obnizRate' || trybTekst === 'rata'
        ? 'obnizRate'
        : null;

    if (!Number.isInteger(miesiac) || miesiac <= 0 || !Number.isInteger(kwotaGr) || kwotaGr <= 0 || tryb === null) {
      return 'nadplaty: lista w formacie miesiac:kwota:obnizRate albo miesiac:kwota:skrocOkres';
    }

    nadplaty.push({ miesiac, kwotaGr, tryb });
  }

  return nadplaty;
}

function parsujParametry(szukane: URLSearchParams): ParametryKredytu | string {
  const kwota = Number(szukane.get('kwota'));
  const liczbaRat = Number(szukane.get('liczbaRat'));
  const marza = Number(szukane.get('marza'));
  const wskaznik = szukane.get('wskaznik');
  const typRat = szukane.get('typRat');
  const pierwszaRata = szukane.get('pierwszaRata') ?? '';
  const nadplaty = parsujNadplaty(szukane.get('nadplaty'));

  if (!Number.isFinite(kwota) || kwota <= 0) return 'kwota: liczba dodatnia w złotych, np. 400000';
  if (!Number.isInteger(liczbaRat) || liczbaRat <= 0) return 'liczbaRat: liczba całkowita dodatnia, np. 300';
  if (!Number.isFinite(marza) || marza < 0) return 'marza: punkty procentowe, np. 2.11';
  if (wskaznik !== 'POLSTR_1M' && wskaznik !== 'WIBOR_3M') return 'wskaznik: POLSTR_1M albo WIBOR_3M';
  if (typRat !== 'rowne' && typRat !== 'malejace') return 'typRat: rowne albo malejace';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pierwszaRata)) return 'pierwszaRata: data YYYY-MM-DD';
  if (typeof nadplaty === 'string') return nadplaty;

  return {
    kwotaGr: Math.round(kwota * 100),
    liczbaRat,
    marza: marza / 100,
    wskaznik,
    typRat,
    pierwszaRata,
    nadplaty,
  };
}

export function GET(request: Request) {
  const parametry = parsujParametry(new URL(request.url).searchParams);
  if (typeof parametry === 'string') {
    return NextResponse.json({ blad: parametry, przyklad: PRZYKLAD }, { status: 400 });
  }

  try {
    const harmonogram = policzHarmonogram(parametry);
    const raty = harmonogram.raty.map((rata) => ({
      nr: rata.numer,
      data: rata.data,
      kapital: rata.czescKapitalowaGr / 100,
      odsetki: rata.odsetkiGr / 100,
      rata: rata.rataGr / 100,
      saldo: rata.saldoPoSplacieGr / 100,
      nadplata: rata.nadplataGr === undefined ? undefined : rata.nadplataGr / 100,
    }));

    return NextResponse.json({
      raty,
      rataPierwsza: raty[0]?.rata ?? 0,
      rataOstatnia: raty[raty.length - 1]?.rata ?? 0,
      sumaOdsetek: harmonogram.sumaOdsetekGr / 100,
    });
  } catch (blad) {
    const komunikat = blad instanceof Error ? blad.message : String(blad);
    if (komunikat.startsWith('nie zaimplementowano')) {
      return NextResponse.json({ blad: komunikat, parametry, przyklad: PRZYKLAD }, { status: 501 });
    }
    return NextResponse.json({ blad: komunikat }, { status: 400 });
  }
}
