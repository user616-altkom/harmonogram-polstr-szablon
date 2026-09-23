import { seriaWskaznika } from '../dane/wskazniki';

export interface ParametryKredytu {
  /** Kwota kredytu w groszach (liczba całkowita). */
  kwotaGr: number;
  liczbaRat: number;
  /** Marża banku jako ułamek, np. 0.0211 dla 2,11 pp. */
  marza: number;
  typRat: 'rowne' | 'malejace';
  wskaznik: 'POLSTR_1M' | 'WIBOR_3M';
  /** Data pierwszej raty w formacie YYYY-MM-DD. */
  pierwszaRata: string;
  nadplaty?: Nadplata[];
}

export interface Nadplata {
  miesiac: number;
  kwotaGr: number;
  tryb: 'obnizRate' | 'skrocOkres';
}

export interface Rata {
  numer: number;
  data: string;
  czescKapitalowaGr: number;
  odsetkiGr: number;
  rataGr: number;
  saldoPoSplacieGr: number;
  nadplataGr?: number;
}

export interface Harmonogram {
  raty: Rata[];
  sumaOdsetekGr: number;
}

function dataDoIso(data: string): Date {
  const fragmenty = data.split('-');

  if (fragmenty.length !== 3 || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error(`niepoprawny format daty: ${data}`);
  }

  const rok = Number(fragmenty[0]);
  const miesiac = Number(fragmenty[1]);
  const dzien = Number(fragmenty[2]);

  if (!Number.isInteger(rok) || !Number.isInteger(miesiac) || !Number.isInteger(dzien)) {
    throw new Error(`niepoprawny format daty: ${data}`);
  }

  const wynik = new Date(Date.UTC(rok, miesiac - 1, dzien));

  if (
    wynik.getUTCFullYear() !== rok ||
    wynik.getUTCMonth() !== miesiac - 1 ||
    wynik.getUTCDate() !== dzien
  ) {
    throw new Error(`niepoprawny format daty: ${data}`);
  }

  return wynik;
}

function dataPoMiesiacu(data: Date, offset: number): Date {
  const rok = data.getUTCFullYear();
  const miesiac = data.getUTCMonth();
  const dzien = data.getUTCDate();
  const docelowyMiesiac = miesiac + offset;
  const ostatniDzienMiesiaca = new Date(Date.UTC(rok, docelowyMiesiac + 1, 0)).getUTCDate();

  return new Date(Date.UTC(rok, docelowyMiesiac, Math.min(dzien, ostatniDzienMiesiaca)));
}

function formatujDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function pobierzStawkeBazowa(wskaznik: ParametryKredytu['wskaznik'], data: string): number {
  const serie = seriaWskaznika(wskaznik);
  const wpisObowiazujacy = serie.reduce<typeof serie[number] | undefined>((wybrany, wpis) => {
    if (wpis.od > data || (wybrany && wpis.od < wybrany.od)) return wybrany;
    return wpis;
  }, undefined);

  return wpisObowiazujacy?.stopa ?? serie[0]?.stopa ?? 0;
}

function policzRatyMalejace(parametry: ParametryKredytu): Harmonogram {
  let saldoGr = parametry.kwotaGr;
  let sumaOdsetekGr = 0;
  const raty: Rata[] = [];
  let czescKapitalowaBazowaGr = Math.round(parametry.kwotaGr / parametry.liczbaRat);

  for (let numer = 1; numer <= parametry.liczbaRat; numer += 1) {
    const data = formatujDate(dataPoMiesiacu(dataDoIso(parametry.pierwszaRata), numer - 1));
    const stawkaMiesieczna = (pobierzStawkeBazowa(parametry.wskaznik, data) + parametry.marza) / 12;
    const odsetkiGr = Math.round(saldoGr * stawkaMiesieczna);
    const czescKapitalowaGr = numer === parametry.liczbaRat
      ? saldoGr
      : Math.min(czescKapitalowaBazowaGr, saldoGr);
    const rataGr = czescKapitalowaGr + odsetkiGr;
    saldoGr = Math.max(0, saldoGr - czescKapitalowaGr);
    const nadplata = znajdzNadplate(parametry.nadplaty, numer);
    const nadplataGr = Math.min(nadplata?.kwotaGr ?? 0, saldoGr);
    saldoGr = Math.max(0, saldoGr - nadplataGr);
    sumaOdsetekGr += odsetkiGr;

    raty.push({
      numer,
      data,
      czescKapitalowaGr,
      odsetkiGr,
      rataGr,
      saldoPoSplacieGr: saldoGr,
      ...(nadplataGr > 0 ? { nadplataGr } : {}),
    });

    if (nadplata?.tryb === 'obnizRate' && saldoGr > 0) {
      czescKapitalowaBazowaGr = Math.round(saldoGr / (parametry.liczbaRat - numer));
    }

    if (saldoGr === 0) break;
  }

  return { raty, sumaOdsetekGr };
}

function policzRatyRowne(parametry: ParametryKredytu): Harmonogram {
  let saldoGr = parametry.kwotaGr;
  let sumaOdsetekGr = 0;
  const raty: Rata[] = [];
  let rataBiezacaGr: number | undefined;
  let poprzedniaStawkaRoczna: number | undefined;

  for (let numer = 1; numer <= parametry.liczbaRat; numer += 1) {
    const data = formatujDate(dataPoMiesiacu(dataDoIso(parametry.pierwszaRata), numer - 1));
    const stawkaRoczna = pobierzStawkeBazowa(parametry.wskaznik, data) + parametry.marza;
    const stawkaMiesieczna = stawkaRoczna / 12;
    const liczbaPozostalychRat = parametry.liczbaRat - numer + 1;
    const nadplata = znajdzNadplate(parametry.nadplaty, numer);
    const stawkaZmienilaSie = poprzedniaStawkaRoczna !== undefined && poprzedniaStawkaRoczna !== stawkaRoczna;

    if (rataBiezacaGr === undefined || stawkaZmienilaSie) {
      rataBiezacaGr = policzRataRowna(saldoGr, stawkaMiesieczna, liczbaPozostalychRat);
    }

    const odsetkiGr = Math.round(saldoGr * stawkaMiesieczna);
    const rataDoZaplatyGr = Math.min(rataBiezacaGr, saldoGr + odsetkiGr);
    const czescKapitalowaGr = Math.min(rataDoZaplatyGr - odsetkiGr, saldoGr);
    saldoGr = Math.max(0, saldoGr - czescKapitalowaGr);
    const nadplataGr = Math.min(nadplata?.kwotaGr ?? 0, saldoGr);
    saldoGr = Math.max(0, saldoGr - nadplataGr);
    sumaOdsetekGr += odsetkiGr;

    raty.push({
      numer,
      data,
      czescKapitalowaGr,
      odsetkiGr,
      rataGr: rataDoZaplatyGr,
      saldoPoSplacieGr: saldoGr,
      ...(nadplataGr > 0 ? { nadplataGr } : {}),
    });

    if (nadplata?.tryb === 'obnizRate') rataBiezacaGr = undefined;
    poprzedniaStawkaRoczna = stawkaRoczna;
    if (saldoGr === 0) break;
  }

  return { raty, sumaOdsetekGr };
}

function policzRataRowna(saldoGr: number, stawkaMiesieczna: number, liczbaRat: number): number {
  if (stawkaMiesieczna === 0) return Math.round(saldoGr / liczbaRat);

  return Math.round(
    (saldoGr * stawkaMiesieczna) /
      (1 - Math.pow(1 + stawkaMiesieczna, -liczbaRat)),
  );
}

function znajdzNadplate(nadplaty: Nadplata[] | undefined, numerRaty: number): Nadplata | undefined {
  return nadplaty?.find((nadplata) => nadplata.miesiac === numerRaty);
}

export function policzHarmonogram(parametry: ParametryKredytu): Harmonogram {
  if (!Number.isInteger(parametry.liczbaRat) || parametry.liczbaRat <= 0) {
    throw new Error('liczbaRat musi być dodatnią liczbą całkowitą');
  }

  if (!Number.isInteger(parametry.kwotaGr) || parametry.kwotaGr <= 0) {
    throw new Error('kwotaGr musi być dodatnią liczbą całkowitą w groszach');
  }

  if (!Number.isFinite(parametry.marza) || parametry.marza < 0) {
    throw new Error('marza musi być liczbą dodatnią lub równą zero');
  }

  for (const nadplata of parametry.nadplaty ?? []) {
    if (!Number.isInteger(nadplata.miesiac) || nadplata.miesiac <= 0 || nadplata.miesiac > parametry.liczbaRat) {
      throw new Error('miesiac nadplaty musi być dodatnią liczbą całkowitą w zakresie rat');
    }
    if (!Number.isInteger(nadplata.kwotaGr) || nadplata.kwotaGr <= 0) {
      throw new Error('kwota nadplaty musi być dodatnią liczbą całkowitą w groszach');
    }
  }

  dataDoIso(parametry.pierwszaRata);

  if (parametry.typRat === 'rowne') {
    return policzRatyRowne(parametry);
  }

  return policzRatyMalejace(parametry);
}
