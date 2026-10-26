import type { Course } from '@/domain/course/Course';
import { normalizeText } from '@/shared/utils/text';

/** Estrutura de navegação do AVA: módulo de boas-vindas (padrão) + módulos do curso. */
export interface OutlineLesson {
  id: string;
  /** Numeração exibida (ex.: "1.2"). */
  number: string;
  title: string;
  description: string;
  kind: 'intro' | 'course';
}

export interface OutlineModule {
  id: string;
  number: number;
  title: string;
  lessons: OutlineLesson[];
}

/** Módulo introdutório presente em todos os cursos do AVA (fluxo 03 do Figma). */
const INTRO_LESSONS = [
  {
    slug: 'boas-vindas',
    title: 'Introdução',
    description: 'Boas-vindas e orientações sobre o curso.',
  },
  {
    slug: 'boas-praticas',
    title: 'Boas práticas',
    description: 'Dicas para aproveitar melhor a experiência online.',
  },
  { slug: 'extras', title: 'Extras', description: 'Materiais complementares e canais de suporte.' },
] as const;

export function buildOutline(course: Pick<Course, 'modules'>): OutlineModule[] {
  const intro: OutlineModule = {
    id: 'introducao',
    number: 1,
    title: 'Introdução',
    lessons: INTRO_LESSONS.map((lesson, index) => ({
      id: `introducao-${lesson.slug}`,
      number: `1.${index + 1}`,
      title: lesson.title,
      description: lesson.description,
      kind: 'intro',
    })),
  };

  const modules = course.modules.map((module, moduleIndex): OutlineModule => {
    const number = moduleIndex + 2;
    return {
      id: `modulo-${moduleIndex + 1}`,
      number,
      title: module.title,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        id: `modulo-${moduleIndex + 1}-aula-${lessonIndex + 1}`,
        number: `${number}.${lessonIndex + 1}`,
        title: lesson.title,
        description: lesson.description,
        kind: 'course',
      })),
    };
  });

  return [intro, ...modules];
}

export function flattenLessons(outline: OutlineModule[]): OutlineLesson[] {
  return outline.flatMap((module) => module.lessons);
}

/** Filtra o sumário pelo título da aula ou do módulo (sem diferenciar acentos). */
export function filterOutline(outline: OutlineModule[], term: string): OutlineModule[] {
  const query = normalizeText(term);
  if (!query) return outline;

  return outline
    .map((module) => {
      if (normalizeText(module.title).includes(query)) return module;
      const lessons = module.lessons.filter((lesson) =>
        normalizeText(lesson.title).includes(query),
      );
      return { ...module, lessons };
    })
    .filter((module) => module.lessons.length > 0);
}
