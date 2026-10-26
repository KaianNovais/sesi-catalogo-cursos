/**
 * Adaptadores entre os casos de uso e o React (TanStack Query): cache,
 * deduplicação de requisições, cancelamento e estados de carregamento/erro.
 */
import { keepPreviousData, queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCourseDetails, getCourseFilterOptions, listCourses } from '@/application/courses';
import type { CourseRepository } from '@/domain/course/CourseRepository';
import { normalizeFilters, type CourseFilters } from '@/domain/course/courseFilters';
import { useDependencies } from '../providers/dependencies';
import { preloadRoute } from '../routes/routeModules';

export const courseKeys = {
  all: ['courses'] as const,
  list: (filters: CourseFilters) => [...courseKeys.all, 'list', filters] as const,
  detail: (slug: string) => [...courseKeys.all, 'detail', slug] as const,
  filterOptions: () => [...courseKeys.all, 'filter-options'] as const,
};

/** Definições das consultas (chave + função), reutilizadas pelos hooks e pelo prefetch. */
const courseQueries = {
  list: (repository: CourseRepository, filters: CourseFilters) =>
    queryOptions({
      queryKey: courseKeys.list(filters),
      queryFn: ({ signal }) => listCourses(repository, filters, { signal }),
    }),
  detail: (repository: CourseRepository, slug: string) =>
    queryOptions({
      queryKey: courseKeys.detail(slug),
      queryFn: ({ signal }) => getCourseDetails(repository, slug, { signal }),
    }),
  filterOptions: (repository: CourseRepository) =>
    queryOptions({
      queryKey: courseKeys.filterOptions(),
      queryFn: ({ signal }) => getCourseFilterOptions(repository, { signal }),
      staleTime: Infinity,
    }),
};

export function useCourseList(filters: CourseFilters) {
  const { courseRepository } = useDependencies();

  return useQuery({
    ...courseQueries.list(courseRepository, normalizeFilters(filters)),
    // Mantém os resultados anteriores visíveis enquanto a nova consulta carrega.
    placeholderData: keepPreviousData,
  });
}

export function useCourseDetails(slug: string) {
  const { courseRepository } = useDependencies();
  return useQuery(courseQueries.detail(courseRepository, slug));
}

export function useCourseFilterOptions() {
  const { courseRepository } = useDependencies();
  return useQuery(courseQueries.filterOptions(courseRepository));
}

/**
 * Prefetch por intenção: quando o usuário aponta ou foca o link de um curso,
 * os dados e o código da página de detalhes começam a ser baixados antes do clique.
 */
export function usePrefetchCourse() {
  const queryClient = useQueryClient();
  const { courseRepository } = useDependencies();

  return (slug: string) => {
    preloadRoute('courseDetails');
    void queryClient.prefetchQuery(courseQueries.detail(courseRepository, slug));
  };
}
