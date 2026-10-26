import type {
  Category,
  Course,
  CourseStatus,
  CourseSummary,
  Modality,
  ModalityCode,
  StatusCode,
} from '@/domain/course/Course';
import type {
  CategoryDto,
  CourseDetailDto,
  CourseSummaryDto,
  ModalityDto,
  StatusDto,
} from './courseDtos';

const MODALITY_CODES: readonly ModalityCode[] = ['ead', 'presencial', 'hibrido'];
const STATUS_CODES: readonly StatusCode[] = ['inscricoes-abertas', 'em-breve', 'encerrado'];

function isModalityCode(code: string): code is ModalityCode {
  return (MODALITY_CODES as readonly string[]).includes(code);
}

function isStatusCode(code: string): code is StatusCode {
  return (STATUS_CODES as readonly string[]).includes(code);
}

export function toCategory(dto: CategoryDto): Category {
  return { id: dto.id, slug: dto.slug, name: dto.name, color: dto.color };
}

export function toModality(dto: ModalityDto): Modality {
  // Código desconhecido é tratado como EAD apenas para fins de exibição; o nome vem da API.
  return { code: isModalityCode(dto.code) ? dto.code : 'ead', name: dto.name };
}

export function toStatus(dto: StatusDto): CourseStatus {
  // Status desconhecido nunca habilita matrícula (regra de negócio mais segura).
  return { code: isStatusCode(dto.code) ? dto.code : 'encerrado', name: dto.name };
}

export function toCourseSummary(dto: CourseSummaryDto): CourseSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    fullName: dto.fullName,
    shortName: dto.shortName,
    summary: dto.summary,
    category: toCategory(dto.category),
    modality: toModality(dto.modality),
    status: toStatus(dto.status),
    workloadHours: dto.workloadHours,
    imageUrl: dto.imageUrl,
    availableFrom: dto.availableFrom ?? null,
    featured: Boolean(dto.featured),
  };
}

export function toCourse(dto: CourseDetailDto): Course {
  return {
    ...toCourseSummary(dto),
    description: dto.description,
    targetAudience: dto.targetAudience,
    certification: dto.certification,
    modules: (dto.modules ?? []).map((module) => ({
      title: module.title,
      lessons: (module.lessons ?? []).map((lesson) => ({
        title: lesson.title,
        description: lesson.description,
      })),
    })),
  };
}
