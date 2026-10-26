import { NotFoundError, ServiceUnavailableError } from '@/domain/errors';

type QueryValue = string | number | boolean | null | undefined;

export interface RequestConfig {
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T>(path: string, config?: RequestConfig): Promise<T>;
}

interface HttpClientOptions {
  baseUrl: string;
  timeoutMs: number;
}

function buildUrl(baseUrl: string, path: string, query: RequestConfig['query']): URL {
  // baseUrl vazio => mesma origem (útil com proxy/reverse proxy).
  const url = new URL(`${baseUrl}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

/**
 * Cliente HTTP mínimo sobre fetch: timeout, cancelamento e tradução de falhas
 * técnicas para os erros do domínio (NotFoundError / ServiceUnavailableError).
 */
export function createHttpClient({ baseUrl, timeoutMs }: HttpClientOptions): HttpClient {
  return {
    async get<T>(path: string, { query, signal }: RequestConfig = {}): Promise<T> {
      const url = buildUrl(baseUrl, path, query);
      const timeout = AbortSignal.timeout(timeoutMs);
      const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

      let response: Response;
      try {
        response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: combinedSignal,
        });
      } catch (error) {
        // Cancelamento pedido pelo chamador: propaga sem converter (o React Query trata).
        if (signal?.aborted) throw error;
        const reason = timeout.aborted
          ? 'A API demorou demais para responder.'
          : 'Não foi possível conectar à API.';
        throw new ServiceUnavailableError(reason, { cause: error });
      }

      if (response.status === 404) {
        throw new NotFoundError('Recurso não encontrado.');
      }
      if (!response.ok) {
        throw new ServiceUnavailableError(`A API respondeu com erro ${response.status}.`);
      }

      try {
        return (await response.json()) as T;
      } catch (error) {
        throw new ServiceUnavailableError('A API retornou uma resposta inválida.', {
          cause: error,
        });
      }
    },
  };
}
