/**
 * Casos de uso do catálogo. Orquestram o domínio sem conhecer React nem HTTP:
 * recebem o repositório (porta) por parâmetro, o que facilita testes e a troca
 * da fonte de dados (API real, mock em memória ou, no futuro, o Moodle).
 */
import type { Course, CourseFilterOptions, CourseList } from '@/domain/course/Course';
import type { CourseRepository, RequestOptions } from '@/domain/course/CourseRepository';
import { normalizeFilters, type CourseFilters } from '@/domain/course/courseFilters';
import { NotFoundError } from '@/domain/errors';

export function listCourses(
  repository: CourseRepository,
  filters: CourseFilters,
  options?: RequestOptions,
): Promise<CourseList> {
  return repository.list(normalizeFilters(filters), options);
}

export function getCourseDetails(
  repository: CourseRepository,
  slug: string,
  options?: RequestOptions,
): Promise<Course> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
    return Promise.reject(new NotFoundError(`Curso "${slug}" não encontrado.`));
  }
  return repository.getBySlug(normalizedSlug, options);
}

export async function getCourseFilterOptions(
  repository: CourseRepository,
  options?: RequestOptions,
): Promise<CourseFilterOptions> {
  const [categories, modalities, statuses] = await Promise.all([
    repository.listCategories(options),
    repository.listModalities(options),
    repository.listStatuses(options),
  ]);
  return { categories, modalities, statuses };
}
