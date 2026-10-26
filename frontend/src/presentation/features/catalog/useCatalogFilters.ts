import { useSearchParams } from 'react-router';
import {
  hasActiveFilters,
  normalizeFilters,
  normalizeSearchTerm,
  type CourseFilters,
} from '@/domain/course/courseFilters';

type UrlFilterKey = 'search' | 'category' | 'modality' | 'status';

/** Nomes dos parâmetros na URL (em português, pois a URL é visível ao usuário). */
const PARAMS: Record<UrlFilterKey, string> = {
  search: 'busca',
  category: 'categoria',
  modality: 'modalidade',
  status: 'status',
};

/**
 * Estado dos filtros sincronizado com a URL: a busca pode ser compartilhada,
 * favoritada e respeita os botões voltar/avançar do navegador.
 */
export function useCatalogFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = normalizeFilters({
    search: searchParams.get(PARAMS.search) ?? undefined,
    category: searchParams.get(PARAMS.category) ?? undefined,
    modality: searchParams.get(PARAMS.modality) ?? undefined,
    status: searchParams.get(PARAMS.status) ?? undefined,
  });

  function updateFilters(
    patch: Partial<Pick<CourseFilters, UrlFilterKey>>,
    options?: { replace?: boolean },
  ) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const key of Object.keys(patch) as UrlFilterKey[]) {
          const raw = patch[key];
          const value = key === 'search' ? normalizeSearchTerm(raw) : raw;
          if (value) next.set(PARAMS[key], value);
          else next.delete(PARAMS[key]);
        }
        return next;
      },
      { replace: options?.replace, preventScrollReset: true },
    );
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { preventScrollReset: true });
  }

  return { filters, updateFilters, clearFilters, hasActiveFilters: hasActiveFilters(filters) };
}
