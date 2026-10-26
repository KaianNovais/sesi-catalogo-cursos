/**
 * Critérios de consulta do catálogo. Todos são opcionais e combináveis:
 * a busca por nome pode ser usada junto com qualquer filtro.
 */
export interface CourseFilters {
  /** Texto buscado no nome completo ou no nome breve. */
  search?: string;
  /** Slug da categoria. */
  category?: string;
  /** Código da modalidade. */
  modality?: string;
  /** Código do status. */
  status?: string;
  featured?: boolean;
}

/** Tamanho máximo aceito para o termo de busca (evita consultas abusivas). */
export const SEARCH_MAX_LENGTH = 100;

/** Remove espaços extras e limita o tamanho do termo de busca. */
export function normalizeSearchTerm(value: string | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').slice(0, SEARCH_MAX_LENGTH);
}

/**
 * Remove valores vazios. Filtros normalizados geram sempre a mesma chave de
 * cache e a mesma URL para consultas equivalentes.
 */
export function normalizeFilters(filters: CourseFilters): CourseFilters {
  const normalized: CourseFilters = {};
  const search = normalizeSearchTerm(filters.search);

  if (search) normalized.search = search;
  if (filters.category) normalized.category = filters.category;
  if (filters.modality) normalized.modality = filters.modality;
  if (filters.status) normalized.status = filters.status;
  if (filters.featured) normalized.featured = true;

  return normalized;
}

/** Indica se há algum critério aplicado pelo usuário (busca ou filtros). */
export function hasActiveFilters(filters: CourseFilters): boolean {
  const { search, category, modality, status } = normalizeFilters(filters);
  return Boolean(search || category || modality || status);
}
