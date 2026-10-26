import type { Course } from '@/domain/course/Course';
import { countLessons } from '@/domain/course/courseRules';
import { pluralize } from '@/shared/utils/text';

/**
 * Conteúdo demonstrativo das aulas do AVA. O módulo de introdução reaproveita
 * os textos do protótipo (fluxo 03 do Figma), adaptados para qualquer curso.
 */
export interface LessonSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

type CourseInfo = Pick<
  Course,
  'fullName' | 'shortName' | 'description' | 'workloadHours' | 'modules'
>;

export function getIntroLessonContent(slug: string, course: CourseInfo): LessonSection[] {
  switch (slug) {
    case 'introducao-boas-vindas':
      return [
        {
          heading: 'Boas-vindas',
          paragraphs: [
            `Boas-vindas ao curso ${course.fullName}! ${course.description}`,
            `O curso tem carga horária de ${course.workloadHours} horas, organizadas em ${pluralize(course.modules.length, 'módulo', 'módulos')} e ${pluralize(countLessons(course.modules), 'aula', 'aulas')}.`,
          ],
        },
        {
          heading: 'Como navegar',
          paragraphs: [
            'Use o menu lateral para acessar os módulos e as aulas. Ao terminar uma aula, marque-a como concluída para acompanhar o seu progresso na barra do topo do menu.',
          ],
        },
      ];
    case 'introducao-boas-praticas':
      return [
        {
          heading: 'Boas práticas',
          paragraphs: [
            `Se você está interessado em se aprofundar em ${course.shortName}, aqui estão algumas dicas para maximizar sua experiência online. Primeiro, crie um espaço de estudo livre de distrações, onde você possa se concentrar totalmente no material.`,
            'Estabeleça uma rotina de estudos, reservando horários específicos para assistir às aulas e realizar as atividades. Além disso, interaja com seus colegas e instrutores nos fóruns e chats disponíveis, pois isso enriquece o aprendizado e ajuda a esclarecer dúvidas. Não se esqueça de revisar o conteúdo regularmente e aplicar os conhecimentos em situações práticas sempre que possível.',
            'Por fim, mantenha-se atualizado sobre as novas técnicas e normas da área, já que ela está sempre evoluindo. Com dedicação e as estratégias corretas, você estará preparado para se destacar no setor!',
          ],
        },
        {
          heading: 'Recomendações',
          paragraphs: [
            'Aproveite as aulas que incluem exercícios e estudos de caso: eles ajudam a entender como aplicar os conceitos na prática do dia a dia da indústria.',
            'Outro aspecto importante é a experiência dos instrutores. Participe dos encontros ao vivo e aproveite os insights de profissionais que vão além da teoria.',
            'Considere também a sua carga de trabalho ao planejar os estudos. Distribuir as aulas ao longo da semana costuma render mais do que concentrar tudo em um único dia.',
            'Por fim, conecte-se com outros alunos e profissionais da área. Isso pode abrir portas e proporcionar um aprendizado ainda mais enriquecedor.',
          ],
        },
      ];
    default:
      return [
        {
          heading: 'Materiais extras',
          paragraphs: [
            'Além das aulas, você tem acesso a recursos complementares para aprofundar os estudos:',
          ],
          items: [
            'Apostilas digitais e infográficos de cada módulo.',
            'Biblioteca de normas técnicas e artigos selecionados.',
            'Fórum de dúvidas com a equipe pedagógica.',
            'Webinários ao vivo com especialistas da indústria.',
          ],
        },
      ];
  }
}

export function getCourseLessonContent(lesson: {
  title: string;
  description: string;
}): LessonSection[] {
  return [
    { heading: 'Objetivo da aula', paragraphs: [lesson.description] },
    {
      heading: 'Conteúdo',
      paragraphs: [
        `Nesta aula sobre ${lesson.title.toLocaleLowerCase('pt-BR')}, você vai assistir a uma vídeo-aula com especialistas, consultar o material de apoio e analisar exemplos reais do ambiente industrial.`,
        'Conteúdo demonstrativo: em produção, esta área exibiria os recursos cadastrados no Moodle (vídeos, arquivos, páginas e questionários).',
      ],
    },
    {
      heading: 'Atividade',
      paragraphs: [
        'Ao final, responda ao questionário da aula para fixar o conteúdo. A correção é automática e o feedback é imediato.',
      ],
    },
  ];
}
