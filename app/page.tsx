'use client';

import { useId, useState, type CSSProperties, type FormEvent } from 'react';

const API_URL = process.env.NEXT_PUBLIC_HARMONOGRAM_URL ?? '/api/harmonogram';
const ZDJECIE: string | null = '/image.png';
const ZDJECIE_ALT = 'Ilustracja rodziny przed nowym domem';

type Wskaznik = 'POLSTR1M' | 'WIBOR3M';
type TypRat = 'rowne' | 'malejace';
type TrybNadplaty = 'rata' | 'okres';

interface Nadplata { miesiac: string; kwota: string; tryb: TrybNadplaty }
interface Rata { nr: number; data: string; kapital: number; odsetki: number; rata: number; saldo: number; nadplata?: number }
interface OdpowiedzApi { raty?: Rata[]; rataPierwsza?: number; rataOstatnia?: number; sumaOdsetek?: number }
interface Wynik { raty: Rata[]; rataPierwsza?: number; rataOstatnia?: number; sumaOdsetek: number }
interface Formularz { kwota: string; liczbaRat: string; pierwszaRata: string; marza: string; wskaznik: Wskaznik; typRat: TypRat }

const THEME = {
  '--color-bg': '#ffffff', '--color-surface': '#eef1f6', '--color-text': '#22262d',
  '--color-neutral-100': '#f5f6f8', '--color-neutral-200': '#e9ebef', '--color-neutral-300': '#d5d9e0',
  '--color-neutral-400': '#b4bac5', '--color-neutral-500': '#8e95a3', '--color-neutral-700': '#525a67',
  '--color-neutral-800': '#3a404b', '--color-accent': '#1b3566', '--color-accent-600': '#24427a',
  '--color-accent-700': '#142850', '--color-accent-100': '#e8edf6', '--color-accent-200': '#d3dcec',
  '--color-accent-2-700': '#b3261e', '--kh-heading': '#1b3566', '--kh-band': '#1b3566',
  '--kh-mark': '#12a5a8', '--kh-mark-text': '#0b6e73',
  '--font-body': '"Source Serif 4", Georgia, serif', '--font-heading': '"Source Serif 4", Georgia, serif',
} as CSSProperties;

function formatPLN(v: unknown): string {
  const n = Number(v);
  if (!isFinite(n)) return '—';
  const [intPart, decPart] = Math.abs(n).toFixed(2).split('.');
  const int = intPart ?? '0';
  return (n < 0 ? '−' : '') + int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ',' + (decPart ?? '00');
}
const csvNum = (v: unknown) => Number(v).toFixed(2).replace('.', ',');
const formatDate = (s: string) => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const toNum = (s: string) => String(s).replace(/\s/g, '').replace(',', '.');

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
const H = 'text-[var(--kh-heading)]';
const T = {
  text: 'text-[var(--color-text)]',
  muted: 'text-[var(--color-neutral-700)]',
  input:
    'w-full h-11 px-3 rounded-[2px] bg-[var(--color-neutral-100)] border border-[var(--color-neutral-300)] text-[var(--color-text)] tabular-nums outline-none hover:border-[var(--color-neutral-500)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
  label: 'block text-[15px] mb-1.5 text-[var(--color-neutral-800)]',
  btnPrimary:
    'h-11 px-6 rounded-[2px] bg-[var(--color-accent)] text-white font-semibold hover:bg-[var(--color-accent-600)] active:bg-[var(--color-accent-700)] disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
  btnGhost:
    'h-11 px-4 rounded-[2px] text-[var(--color-accent-700)] hover:bg-[var(--color-accent-100)] active:bg-[var(--color-accent-200)] disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
};

function Segmented<V extends string>({ name, value, options, onChange }: {
  name: string; value: V; options: { value: V; label: string }[]; onChange: (v: V) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-flow-col auto-cols-fr gap-1 p-1 rounded-[2px] bg-[var(--color-surface)]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'h-9 px-3 rounded-[1px] text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]',
            value === o.value
              ? 'bg-[var(--color-bg)] text-[var(--color-text)] font-semibold [box-shadow:inset_0_-2px_0_var(--kh-mark),0_1px_2px_rgba(20,30,50,.08)]'
              : 'text-[var(--color-neutral-700)] hover:text-[var(--color-text)]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Page() {
  const [form, setForm] = useState<Formularz>({
    kwota: '400000',
    liczbaRat: '300',
    pierwszaRata: '2026-10-01',
    marza: '2.11',
    wskaznik: 'POLSTR1M',
    typRat: 'rowne',
  });
  const [nadplaty, setNadplaty] = useState<Nadplata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wynik, setWynik] = useState<Wynik | null>(null);
  const [zdjecieOk, setZdjecieOk] = useState(true);
  const uid = useId().replace(/:/g, '');

  const set = <K extends keyof Formularz>(k: K, v: Formularz[K]) => setForm((f) => ({ ...f, [k]: v }));
  const addNadplata = () => setNadplaty((l) => [...l, { miesiac: '', kwota: '', tryb: 'rata' }]);
  const setNad = <K extends keyof Nadplata>(i: number, k: K, v: Nadplata[K]) =>
    setNadplaty((l) => l.map((n, j) => (j === i ? { ...n, [k]: v } : n)));
  const delNad = (i: number) => setNadplaty((l) => l.filter((_, j) => j !== i));

  function validate(): string {
    const kwota = Number(toNum(form.kwota));
    const n = Number.parseInt(form.liczbaRat, 10);
    const marza = Number(toNum(form.marza));

    if (!(kwota > 0)) return 'Podaj kwotę kredytu większą od zera.';
    if (!(n > 0 && n <= 420)) return 'Liczba rat musi mieścić się w zakresie 1–420.';
    if (!form.pierwszaRata) return 'Podaj datę pierwszej raty.';
    if (!(marza >= 0)) return 'Podaj marżę (pp).';

    for (const x of nadplaty) {
      const m = Number.parseInt(x.miesiac, 10);
      if (!(m >= 1 && m <= n)) return `Miesiąc nadpłaty musi być w zakresie 1–${n}.`;
      if (!(Number(toNum(x.kwota)) > 0)) return 'Kwota nadpłaty musi być większa od zera.';
    }

    return '';
  }

  async function policz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setError('');
    setLoading(true);
    const q = new URLSearchParams({
      kwota: toNum(form.kwota),
      liczbaRat: form.liczbaRat,
      marza: toNum(form.marza),
      wskaznik: form.wskaznik === 'POLSTR1M' ? 'POLSTR_1M' : 'WIBOR_3M',
      typRat: form.typRat,
      pierwszaRata: form.pierwszaRata,
    });

    if (nadplaty.length) {
      q.set(
        'nadplaty',
        nadplaty.map((n) => `${n.miesiac}:${Math.round(Number(toNum(n.kwota)) * 100)}:${n.tryb}`).join(','),
      );
    }

    try {
      const res = await fetch(`${API_URL}?${q.toString()}`, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        const data: { blad?: string } = await res.json().catch(() => ({}));
        throw new Error(data.blad ?? `Serwer zwrócił błąd ${res.status}.`);
      }

      const data: OdpowiedzApi = await res.json();
      const raty = data.raty ?? [];
      setWynik({
        raty,
        rataPierwsza: data.rataPierwsza ?? raty[0]?.rata,
        rataOstatnia: data.rataOstatnia ?? raty[raty.length - 1]?.rata,
        sumaOdsetek: data.sumaOdsetek ?? raty.reduce((s, r) => s + Number(r.odsetki), 0),
      });
    } catch (ex) {
      setWynik(null);
      setError(ex instanceof Error && ex.message ? ex.message : 'Nie udało się pobrać harmonogramu.');
    } finally {
      setLoading(false);
    }
  }

  function eksportCSV() {
    if (!wynik) return;
    const rows: string[][] = [['Nr', 'Data', 'Kapitał', 'Odsetki', 'Rata', 'Nadpłata', 'Saldo']].concat(
      wynik.raty.map((r) => [
        String(r.nr),
        String(r.data),
        csvNum(r.kapital),
        csvNum(r.odsetki),
        csvNum(r.rata),
        csvNum(r.nadplata ?? 0),
        csvNum(r.saldo),
      ]),
    );
    const csv = '\ufeff' + rows.map((r) => r.join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmonogram_${form.pierwszaRata}_${form.liczbaRat}rat.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={THEME} className={cx('min-h-screen bg-[var(--color-bg)] [font-family:var(--font-body)] text-[17px] leading-relaxed', T.text)}>
      <div aria-hidden="true" className="h-1.5 bg-[var(--kh-band)]" />
      <div className="max-w-[1280px] px-6 md:px-10 py-10">
        <header className="mb-10">
          <p className={cx('text-[15px] mb-1', T.muted)}>Kredyt hipoteczny · oprocentowanie zmienne</p>
          <h1 className={cx('[font-family:var(--font-heading)] font-semibold text-[40px] leading-tight tracking-tight', H)}>Harmonogram spłat</h1>
        </header>

        <div className="grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)] items-start">
          <form onSubmit={policz} noValidate className="grid gap-5">
            <div>
              <label className={T.label} htmlFor={uid + 'kwota'}>Kwota kredytu (PLN)</label>
              <input id={uid + 'kwota'} inputMode="decimal" className={cx(T.input, 'text-right')} value={form.kwota} onChange={(e) => set('kwota', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={T.label} htmlFor={uid + 'liczbaRat'}>Liczba rat</label>
                <input id={uid + 'liczbaRat'} type="number" min={1} max={420} className={cx(T.input, 'text-right')} value={form.liczbaRat} onChange={(e) => set('liczbaRat', e.target.value)} />
              </div>
              <div>
                <label className={T.label} htmlFor={uid + 'marza'}>Marża (pp)</label>
                <input id={uid + 'marza'} inputMode="decimal" className={cx(T.input, 'text-right')} value={form.marza} onChange={(e) => set('marza', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={T.label} htmlFor={uid + 'pierwszaRata'}>Data pierwszej raty</label>
              <input id={uid + 'pierwszaRata'} type="date" className={T.input} value={form.pierwszaRata} onChange={(e) => set('pierwszaRata', e.target.value)} />
            </div>
            <div>
              <span className={T.label}>Wskaźnik referencyjny</span>
              <Segmented<Wskaznik> name="Wskaźnik" value={form.wskaznik} onChange={(v) => set('wskaznik', v)} options={[{ value: 'POLSTR1M', label: 'POLSTR 1M' }, { value: 'WIBOR3M', label: 'WIBOR 3M' }]} />
            </div>
            <div>
              <span className={T.label}>Typ rat</span>
              <Segmented<TypRat> name="Typ rat" value={form.typRat} onChange={(v) => set('typRat', v)} options={[{ value: 'rowne', label: 'Równe' }, { value: 'malejace', label: 'Malejące' }]} />
            </div>

            <fieldset className="grid gap-3 mt-3">
              <legend className={cx('[font-family:var(--font-heading)] font-semibold text-[20px] mb-2', H)}>Nadpłaty</legend>
              {nadplaty.length === 0 && <p className={cx('text-[15px]', T.muted)}>Brak zaplanowanych nadpłat.</p>}
              {nadplaty.map((n, i) => (
                <div key={i} className="grid grid-cols-[72px_minmax(0,1fr)_40px] gap-2 items-end">
                  <div>
                    <label className="block text-[13px] mb-1 text-[var(--color-neutral-700)]" htmlFor={`${uid}nm${i}`}>Miesiąc</label>
                    <input id={`${uid}nm${i}`} type="number" min={1} className={cx(T.input, 'text-right px-2')} value={n.miesiac} onChange={(e) => setNad(i, 'miesiac', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[13px] mb-1 text-[var(--color-neutral-700)]" htmlFor={`${uid}nk${i}`}>Kwota (PLN)</label>
                    <input id={`${uid}nk${i}`} inputMode="decimal" className={cx(T.input, 'text-right')} value={n.kwota} onChange={(e) => setNad(i, 'kwota', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => delNad(i)} aria-label={`Usuń nadpłatę ${i + 1}`} className="h-11 w-10 rounded-[2px] text-[22px] leading-none text-[var(--color-neutral-700)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]">×</button>
                  <div className="col-span-3 pb-2">
                    <Segmented<TrybNadplaty> name="Tryb nadpłaty" value={n.tryb} onChange={(v) => setNad(i, 'tryb', v)} options={[{ value: 'rata', label: 'Obniż ratę' }, { value: 'okres', label: 'Skróć okres' }]} />
                  </div>
                </div>
              ))}
              <div><button type="button" onClick={addNadplata} className={cx(T.btnGhost, '-ml-4')}>+ Dodaj nadpłatę</button></div>
            </fieldset>

            {error && <p role="alert" className="text-[15px] text-[var(--color-accent-2-700)]">{error}</p>}
            <div className="mt-2">
              <button type="submit" disabled={loading} className={cx(T.btnPrimary, 'w-full')}>{loading ? 'Liczę…' : 'Policz'}</button>
            </div>
          </form>

          <section aria-live="polite" className="min-w-0">
            {!wynik && !loading && (
              <div className="grid gap-6 pt-2">
                <p className={cx('max-w-[42ch] text-[19px]', T.muted)}>Uzupełnij parametry kredytu i wybierz „Policz”, aby wyświetlić harmonogram rat.</p>
                {ZDJECIE && zdjecieOk && (
                  <div className="max-w-[720px] aspect-[4/3] overflow-hidden rounded-[4px] bg-[var(--color-surface)]">
                    <img src={ZDJECIE} alt={ZDJECIE_ALT} onError={() => setZdjecieOk(false)} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
            {loading && !wynik && <p className={cx('pt-2', T.muted)}>Pobieram harmonogram…</p>}
            {wynik && (
              <div className={cx('grid gap-10', loading && 'opacity-60')}>
                <dl className="grid gap-x-10 gap-y-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                  {([
                    ['Rata pierwsza', wynik.rataPierwsza],
                    ['Rata ostatnia', wynik.rataOstatnia],
                    ['Suma odsetek', wynik.sumaOdsetek],
                  ] as const).map(([k, v]) => (
                    <div key={k}>
                      <dt className={cx('text-[15px]', T.muted)}>{k}</dt>
                      <dd className={cx('[font-family:var(--font-heading)] font-semibold text-[32px] leading-tight tabular-nums whitespace-nowrap', H)}>
                        {formatPLN(v)} <span className={cx('text-[17px] font-normal', T.muted)}>PLN</span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4 mb-3">
                    <h2 className={cx('[font-family:var(--font-heading)] font-semibold text-[24px]', H)}>
                      Tabela rat{' '}
                      <span className={cx('text-[17px] font-normal', T.muted)}>
                        · {wynik.raty.length} rat
                      </span>
                    </h2>
                    <button type="button" onClick={eksportCSV} className={T.btnGhost}>Eksport CSV</button>
                  </div>
                  <div className="max-h-[560px] overflow-auto">
                    <table className="w-full text-[15px] tabular-nums border-collapse">
                      <thead className="sticky top-0 bg-[var(--color-bg)]">
                        <tr className="text-[var(--color-neutral-700)] border-b border-[var(--color-neutral-400)]">
                          <th className="text-right font-normal py-2 pr-4 w-12">Nr</th>
                          <th className="text-left font-normal py-2 pr-4">Data</th>
                          <th className="text-right font-normal py-2 pr-4">Kapitał</th>
                          <th className="text-right font-normal py-2 pr-4">Odsetki</th>
                          <th className="text-right font-normal py-2 pr-4">Rata</th>
                          <th className="text-right font-normal py-2">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wynik.raty.map((r) => (
                          <tr key={r.nr} className="border-b border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-100)]">
                            <td className={cx('text-right py-2 pr-4', T.muted)}>{r.nr}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{formatDate(r.data)}</td>
                            <td className="text-right py-2 pr-4 whitespace-nowrap">{formatPLN(r.kapital)}</td>
                            <td className="text-right py-2 pr-4 whitespace-nowrap">{formatPLN(r.odsetki)}</td>
                            <td className="text-right py-2 pr-4 whitespace-nowrap font-semibold">{formatPLN(r.rata)}</td>
                            <td className="text-right py-2 whitespace-nowrap">
                              {formatPLN(r.saldo)}
                              {Number(r.nadplata) > 0 && (
                                <span className="block text-[13px] text-[var(--kh-mark-text)]">po nadpłacie {formatPLN(r.nadplata)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
