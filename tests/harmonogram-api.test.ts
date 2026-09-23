import { describe, expect, it } from 'vitest';

import { GET } from '../app/api/harmonogram/route';

describe('kontrakt API CR-A', () => {
  it('przyjmuje nadplate bez trybu jako skrocOkres', async () => {
    const request = new Request('http://localhost/api/harmonogram?kwota=300000&liczbaRat=240&marza=2.11&wskaznik=WIBOR_3M&typRat=rowne&pierwszaRata=2026-01-01&nadplaty=1:3000000');
    const response = await GET(request);
    const body: { raty?: Array<{ nadplata?: number }>; blad?: string } = await response.json();

    expect(response.status).toBe(200);
    expect(body.blad).toBeUndefined();
    expect(body.raty?.[0]?.nadplata).toBe(30_000);
  });

  it('odrzuca niepoprawny tryb nadplaty', async () => {
    const request = new Request('http://localhost/api/harmonogram?kwota=300000&liczbaRat=240&marza=2.11&wskaznik=WIBOR_3M&typRat=rowne&pierwszaRata=2026-01-01&nadplaty=1:3000000:nieznany');
    const response = await GET(request);
    const body: { blad?: string } = await response.json();

    expect(response.status).toBe(400);
    expect(body.blad).toContain('nadplaty');
  });
});
