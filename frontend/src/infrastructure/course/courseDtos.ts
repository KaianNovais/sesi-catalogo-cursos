/**
 * Contrato JSON da API (.NET). Mantido separado das entidades do domínio para
 * que mudanças no formato da API fiquem isoladas nos mapeadores.
 */
export interface CategoryDto {
  id: number;
  slug: string;
  name: string;
  color: string;
}

export interface ModalityDto {
  code: string;
  name: string;
}

export interface StatusDto {
  code: string;
  name: string;
}

export interface LessonDto {
  title: string;
  description: string;
}

export interface ModuleDto {
  title: string;
  lessons: LessonDto[];
}

export interface CourseSummaryDto {
  id: number;
  slug: string;
  fullName: string;
  shortName: string;
  summary: string;
  category: CategoryDto;
  modality: ModalityDto;
  status: StatusDto;
  workloadHours: number;
  imageUrl: string;
  availableFrom: string | null;
  featured: boolean;
}

export interface CourseDetailDto extends CourseSummaryDto {
  description: string;
  targetAudience: string;
  certification: string;
  modules: ModuleDto[];
}

export interface CourseListDto {
  items: CourseSummaryDto[];
  total: number;
}
