import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError, ServiceUnavailableError } from '@/domain/errors';
import { createHttpClient } from './httpClient';

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('createHttpClient', () => {
  const client = createHttpClient({ baseUrl: 'https://api.exemplo.com', timeoutMs: 1_000 });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('monta a URL com os parâmetros preenchidos e retorna o JSON', async () => {
    const fetchMock = mockFetch(Response.json({ ok: true }));

    await expect(
      client.get('/api/courses', { query: { search: 'metal', category: '', status: undefined } }),
    ).resolves.toEqual({ ok: true });

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toBe('https://api.exemplo.com/api/courses?search=metal');
  });

  it('converte 404 em NotFoundError', async () => {
    mockFetch(new Response(null, { status: 404 }));
    await expect(client.get('/api/courses/x')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('converte erros 5xx em ServiceUnavailableError', async () => {
    mockFetch(new Response(null, { status: 503 }));
    await expect(client.get('/api/courses')).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it('converte falhas de rede em ServiceUnavailableError', async () => {
    mockFetch(new TypeError('Failed to fetch'));
    await expect(client.get('/api/courses')).rejects.toThrow('Não foi possível conectar à API.');
  });
});
