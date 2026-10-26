import { QueryClient } from '@tanstack/react-query';
import { NotFoundError } from '@/domain/errors';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // O catálogo muda pouco: evita requisições repetidas ao navegar entre páginas.
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        // Uma nova tentativa automática para falhas transitórias; "não encontrado" não é repetido.
        retry: (failureCount, error) => !(error instanceof NotFoundError) && failureCount < 1,
      },
    },
  });
}
