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
}

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

function zaokraglijDoMiesiaca(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function dataDoIso(data: string): Date {
  const fragmenty = data.split('-');

  if (fragmenty.length !== 3) {
    throw new Error(`niepoprawny format daty: ${data}`);
  }

  const rok = Number(fragmenty[0]);
  const miesiac = Number(fragmenty[1]);
  const dzien = Number(fragmenty[2]);

  if (!Number.isInteger(rok) || !Number.isInteger(miesiac) || !Number.isInteger(dzien)) {
    throw new Error(`niepoprawny format daty: ${data}`);
  }

  return new Date(Date.UTC(rok, miesiac - 1, dzien));
}

function dataPoMiesiacu(data: Date, offset: number): Date {
  const wynik = new Date(data);
  wynik.setUTCMonth(wynik.getUTCMonth() + offset);
  return wynik;
}

function formatujDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function pobierzStawkeBazowa(wskaznik: ParametryKredytu['wskaznik']): number {
  const serie = seriaWskaznika(wskaznik);
  const ostatniWpis = serie[serie.length - 1];
  const stawka = ostatniWpis?.stopa ?? 0;
  return zaokraglijDoMiesiaca(stawka);
}

function policzRatyMalejace(parametry: ParametryKredytu): Harmonogram {
  const stawkaRoczna = pobierzStawkeBazowa(parametry.wskaznik) + parametry.marza;
  const stawkaMiesieczna = stawkaRoczna / 12;
  const czescKapitalowaBazowa = Math.round(parametry.kwotaGr / parametry.liczbaRat);
  let saldoGr = parametry.kwotaGr;
  let sumaOdsetekGr = 0;
  const raty: Rata[] = [];

  for (let numer = 1; numer <= parametry.liczbaRat; numer += 1) {
    const data = formatujDate(dataPoMiesiacu(dataDoIso(parametry.pierwszaRata), numer - 1));
    const odsetkiGr = Math.round(saldoGr * stawkaMiesieczna);
    const czescKapitalowaGr = numer === parametry.liczbaRat ? saldoGr : Math.min(czescKapitalowaBazowa, saldoGr);
    const rataGr = czescKapitalowaGr + odsetkiGr;
    saldoGr = Math.max(0, saldoGr - czescKapitalowaGr);
    sumaOdsetekGr += odsetkiGr;

    raty.push({
      numer,
      data,
      czescKapitalowaGr,
      odsetkiGr,
      rataGr,
      saldoPoSplacieGr: saldoGr,
    });
  }

  return { raty, sumaOdsetekGr };
}

function policzRatyRowne(parametry: ParametryKredytu): Harmonogram {
  const stawkaRoczna = pobierzStawkeBazowa(parametry.wskaznik) + parametry.marza;
  const stawkaMiesieczna = stawkaRoczna / 12;
  const rataGr = Math.round(
    (parametry.kwotaGr * stawkaMiesieczna) /
      (1 - Math.pow(1 + stawkaMiesieczna, -parametry.liczbaRat)),
  );

  let saldoGr = parametry.kwotaGr;
  let sumaOdsetekGr = 0;
  const raty: Rata[] = [];

  for (let numer = 1; numer <= parametry.liczbaRat; numer += 1) {
    const data = formatujDate(dataPoMiesiacu(dataDoIso(parametry.pierwszaRata), numer - 1));
    const odsetkiGr = Math.round(saldoGr * stawkaMiesieczna);
    const rataDoZaplatyGr = numer === parametry.liczbaRat ? saldoGr + odsetkiGr : rataGr;
    const czescKapitalowaGr = Math.min(rataDoZaplatyGr - odsetkiGr, saldoGr);
    saldoGr = Math.max(0, saldoGr - czescKapitalowaGr);
    sumaOdsetekGr += odsetkiGr;

    raty.push({
      numer,
      data,
      czescKapitalowaGr,
      odsetkiGr,
      rataGr: rataDoZaplatyGr,
      saldoPoSplacieGr: saldoGr,
    });
  }

  return { raty, sumaOdsetekGr };
}

export function policzHarmonogram(parametry: ParametryKredytu): Harmonogram {
  if (parametry.liczbaRat <= 0) {
    throw new Error('liczbaRat musi być dodatnia');
  }

  if (parametry.kwotaGr <= 0) {
    throw new Error('kwotaGr musi być dodatnia');
  }

  if (parametry.typRat === 'rowne') {
    return policzRatyRowne(parametry);
  }

  return policzRatyMalejace(parametry);
}
