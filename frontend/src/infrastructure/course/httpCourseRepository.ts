import type { CourseRepository } from '@/domain/course/CourseRepository';
import type { HttpClient } from '@/infrastructure/http/httpClient';
import type {
  CategoryDto,
  CourseDetailDto,
  CourseListDto,
  ModalityDto,
  StatusDto,
} from './courseDtos';
import { toCategory, toCourse, toCourseSummary, toModality, toStatus } from './courseMappers';

/** Implementação do repositório consumindo a API REST do back-end (.NET). */
export function createHttpCourseRepository(http: HttpClient): CourseRepository {
  return {
    async list(filters, options) {
      const dto = await http.get<CourseListDto>('/api/courses', {
        signal: options?.signal,
        query: {
          search: filters.search,
          category: filters.category,
          modality: filters.modality,
          status: filters.status,
          featured: filters.featured,
        },
      });
      return { items: dto.items.map(toCourseSummary), total: dto.total };
    },

    async getBySlug(slug, options) {
      const dto = await http.get<CourseDetailDto>(`/api/courses/${encodeURIComponent(slug)}`, {
        signal: options?.signal,
      });
      return toCourse(dto);
    },

    async listCategories(options) {
      const dto = await http.get<CategoryDto[]>('/api/categories', { signal: options?.signal });
      return dto.map(toCategory);
    },

    async listModalities(options) {
      const dto = await http.get<ModalityDto[]>('/api/modalities', { signal: options?.signal });
      return dto.map(toModality);
    },

    async listStatuses(options) {
      const dto = await http.get<StatusDto[]>('/api/statuses', { signal: options?.signal });
      return dto.map(toStatus);
    },
  };
}
