/**
 * Repositório em memória (modo "mock"), alimentado pelo mesmo arquivo de seed
 * usado pelo banco de dados. Reproduz o contrato da API — inclusive busca sem
 * acentos, filtros combinados, latência e falhas — para que o front-end possa
 * ser desenvolvido e testado sem o back-end em execução.
 */
import seed from '@data/courses.seed.json';
import type { CourseRepository } from '@/domain/course/CourseRepository';
import type { CourseFilters } from '@/domain/course/courseFilters';
import { NotFoundError, ServiceUnavailableError } from '@/domain/errors';
import { normalizeText } from '@/shared/utils/text';
import type {
  CategoryDto,
  CourseDetailDto,
  CourseSummaryDto,
  ModalityDto,
  StatusDto,
} from './courseDtos';
import { toCategory, toCourse, toCourseSummary, toModality, toStatus } from './courseMappers';

interface SeedCourse extends Omit<CourseDetailDto, 'category' | 'modality' | 'status'> {
  categoryId: number;
  modalityCode: string;
  statusCode: string;
}

export interface SeedData {
  categories: CategoryDto[];
  modalities: ModalityDto[];
  statuses: StatusDto[];
  courses: SeedCourse[];
}

/** "Join" das tabelas do seed, produzindo o mesmo DTO que a API retornaria. */
export function buildCatalog(data: SeedData): CourseDetailDto[] {
  return data.courses.map(({ categoryId, modalityCode, statusCode, ...course }) => {
    const category = data.categories.find((item) => item.id === categoryId);
    const modality = data.modalities.find((item) => item.code === modalityCode);
    const status = data.statuses.find((item) => item.code === statusCode);
    if (!category || !modality || !status) {
      throw new Error(`Seed inconsistente para o curso "${course.slug}".`);
    }
    return { ...course, category, modality, status };
  });
}

type FilterableCourse = Pick<
  CourseSummaryDto,
  'fullName' | 'shortName' | 'category' | 'modality' | 'status' | 'featured'
>;

export function matchesFilters(course: FilterableCourse, filters: CourseFilters): boolean {
  if (filters.search) {
    const term = normalizeText(filters.search);
    const names = [course.fullName, course.shortName].map(normalizeText);
    if (!names.some((name) => name.includes(term))) return false;
  }
  if (filters.category && course.category.slug !== filters.category) return false;
  if (filters.modality && course.modality.code !== filters.modality) return false;
  if (filters.status && course.status.code !== filters.status) return false;
  if (filters.featured && !course.featured) return false;
  return true;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

interface InMemoryOptions {
  data?: SeedData;
  latencyMs?: number;
  /** Quando retorna true, as chamadas falham (permite visualizar o estado de erro). */
  shouldFail?: () => boolean;
}

export function createInMemoryCourseRepository({
  data = seed,
  latencyMs = 0,
  shouldFail = () => false,
}: InMemoryOptions = {}): CourseRepository {
  const catalog = buildCatalog(data);

  async function simulateNetwork(signal?: AbortSignal) {
    await delay(latencyMs, signal);
    if (shouldFail()) {
      throw new ServiceUnavailableError('Falha simulada: serviço de cursos indisponível.');
    }
  }

  return {
    async list(filters, options) {
      await simulateNetwork(options?.signal);
      const items = catalog
        .filter((course) => matchesFilters(course, filters))
        .map(toCourseSummary);
      return { items, total: items.length };
    },

    async getBySlug(slug, options) {
      await simulateNetwork(options?.signal);
      const course = catalog.find((item) => item.slug === slug);
      if (!course) throw new NotFoundError(`Curso "${slug}" não encontrado.`);
      return toCourse(course);
    },

    async listCategories(options) {
      await simulateNetwork(options?.signal);
      return data.categories.map(toCategory);
    },

    async listModalities(options) {
      await simulateNetwork(options?.signal);
      return data.modalities.map(toModality);
    },

    async listStatuses(options) {
      await simulateNetwork(options?.signal);
      return data.statuses.map(toStatus);
    },
  };
}
