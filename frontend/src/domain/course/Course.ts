/**
 * Entidades do catálogo. Os nomes seguem os campos de curso do Moodle
 * (fullname, shortname, summary, category, startdate) para facilitar uma
 * futura integração via Web Services.
 */

export interface Category {
  id: number;
  slug: string;
  name: string;
  /** Cor de destaque (hex). Tematiza tags e a página de detalhes do curso. */
  color: string;
}

export type ModalityCode = 'ead' | 'presencial' | 'hibrido';

export interface Modality {
  code: ModalityCode;
  name: string;
}

export type StatusCode = 'inscricoes-abertas' | 'em-breve' | 'encerrado';

export interface CourseStatus {
  code: StatusCode;
  name: string;
}

export interface Lesson {
  title: string;
  description: string;
}

export interface CourseModule {
  title: string;
  lessons: Lesson[];
}

/** Dados necessários para listar o curso (cards do catálogo). */
export interface CourseSummary {
  id: number;
  slug: string;
  /** Nome completo (Moodle: fullname). */
  fullName: string;
  /** Nome breve (Moodle: shortname). */
  shortName: string;
  /** Descrição curta exibida nos cards. */
  summary: string;
  category: Category;
  modality: Modality;
  status: CourseStatus;
  workloadHours: number;
  /** Imagem de apresentação. */
  imageUrl: string;
  /** Data de disponibilização (ISO yyyy-mm-dd), quando aplicável. */
  availableFrom: string | null;
  featured: boolean;
}

/** Curso completo, exibido na página de detalhes e no AVA. */
export interface Course extends CourseSummary {
  description: string;
  targetAudience: string;
  certification: string;
  modules: CourseModule[];
}

export interface CourseList {
  items: CourseSummary[];
  total: number;
}

export interface CourseFilterOptions {
  categories: Category[];
  modalities: Modality[];
  statuses: CourseStatus[];
}
