export type ApiMode = 'http' | 'mock';

function readApiMode(): ApiMode {
  const mode = import.meta.env.VITE_API_MODE;
  if (mode === 'http' || mode === 'mock') return mode;
  // Sem configuração explícita: usa a API se houver URL definida, senão o mock.
  return import.meta.env.VITE_API_BASE_URL ? 'http' : 'mock';
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const env = {
  apiMode: readApiMode(),
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  mockLatencyMs: readNumber(import.meta.env.VITE_MOCK_LATENCY_MS, 600),
  requestTimeoutMs: 15_000,
} as const;
