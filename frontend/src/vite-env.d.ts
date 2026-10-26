/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "http" usa a API .NET; "mock" usa os dados fictícios em memória. */
  readonly VITE_API_MODE?: 'http' | 'mock';
  /** URL base da API (ex.: http://localhost:5080). Vazio = mesma origem do front. */
  readonly VITE_API_BASE_URL?: string;
  /** Latência artificial do modo mock, em ms (padrão: 600). */
  readonly VITE_MOCK_LATENCY_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
