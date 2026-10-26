import type { ModalityCode } from '@/domain/course/Course';
import type { Feature } from '../components/FeatureList/FeatureList';
import { institutionalFeatures } from './home';

/**
 * Conteúdo institucional comum a todos os cursos (transcrito do Figma).
 * Trechos que dependem da modalidade são ajustados para não contradizer os
 * dados do curso (ex.: um curso presencial não é "totalmente online").
 */

export const courseFeatures: readonly Feature[] = [
  ...institutionalFeatures,
  {
    icon: 'flexibility',
    title: 'Flexibilidade',
    description: 'Turmas presenciais e online com horários que se adaptam à sua rotina.',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

const formatAnswers: Record<ModalityCode, string> = {
  ead: 'Sim. Todas as aulas, atividades e avaliações são realizadas pela plataforma digital, permitindo que o aluno estude de onde estiver, no seu próprio ritmo.',
  presencial:
    'Não. As aulas acontecem presencialmente nas unidades SESI, e os materiais de apoio e as atividades complementares ficam disponíveis na plataforma digital.',
  hibrido:
    'Não totalmente. O curso combina encontros presenciais nas unidades SESI com aulas, atividades e avaliações realizadas na plataforma digital.',
};

export function getFaq(modality: ModalityCode): FaqItem[] {
  return [
    { question: 'O curso é totalmente online?', answer: formatAnswers[modality] },
    {
      question: 'Preciso estar disponível em horários específicos?',
      answer:
        modality === 'ead'
          ? 'Não. As aulas são gravadas e ficam disponíveis 24 horas por dia. O aluno pode acessar o conteúdo quando for mais conveniente, respeitando os prazos de cada módulo.'
          : 'Sim, para os encontros presenciais, que seguem o cronograma da turma. O conteúdo online fica disponível 24 horas por dia, respeitando os prazos de cada módulo.',
    },
    {
      question: 'Como são feitas as avaliações?',
      answer:
        'As avaliações são realizadas diretamente na plataforma, por meio de provas objetivas, estudos de caso e atividades práticas. Algumas avaliações podem ter tempo limitado e exigem atenção às instruções.',
    },
    {
      question: 'O curso oferece certificado?',
      answer:
        'Sim. Ao concluir todos os módulos e ser aprovado nas avaliações, o aluno recebe um certificado digital de conclusão, válido em todo o território nacional.',
    },
    {
      question: 'Quem são os professores?',
      answer:
        'O corpo docente é formado por especialistas, engenheiros e professores com ampla experiência em segurança do trabalho e atuação direta na indústria. Os perfis dos docentes estão disponíveis na plataforma.',
    },
    {
      question: 'Há suporte para dúvidas durante o curso?',
      answer:
        'Sim. Os alunos podem enviar dúvidas por meio dos fóruns de discussão, chats da plataforma ou durante os webinários ao vivo. A equipe pedagógica está disponível para auxiliar durante todo o curso.',
    },
    {
      question: 'O curso exige algum conhecimento prévio?',
      answer:
        'Não é obrigatório, mas é recomendado que o aluno tenha interesse ou alguma familiaridade com o ambiente industrial. O curso foi estruturado para atender tanto iniciantes quanto profissionais em busca de atualização.',
    },
    {
      question: 'Posso acessar o curso pelo celular?',
      answer:
        'Sim. A plataforma é responsiva e compatível com computadores, tablets e smartphones, garantindo uma experiência completa em qualquer dispositivo.',
    },
    {
      question: 'Quanto tempo tenho para concluir o curso?',
      answer:
        'O prazo para conclusão varia conforme o plano escolhido. Em geral, o aluno tem entre 3 a 6 meses para finalizar todos os módulos e avaliações.',
    },
    {
      question: 'O curso é reconhecido por órgãos oficiais?',
      answer:
        'O curso segue as diretrizes das Normas Regulamentadoras (NRs) e boas práticas da área, sendo reconhecido como formação complementar. Para certificações oficiais, é necessário verificar os requisitos específicos de cada órgão regulador.',
    },
  ];
}

export interface LearningFormat {
  title: string;
  lessonsHeading: string;
  lessonsIntro: string;
  lessonItems: string[];
  accessibility: string;
  assessmentIntro: string;
  assessmentItems: string[];
  certificate: string;
}

const lessonsByModality: Record<
  ModalityCode,
  Pick<LearningFormat, 'title' | 'lessonsHeading' | 'lessonsIntro'>
> = {
  ead: {
    title: 'Aulas online e avaliações',
    lessonsHeading: 'Aulas online',
    lessonsIntro:
      'As aulas são organizadas em módulos temáticos e disponibilizadas em formato multimídia, combinando:',
  },
  presencial: {
    title: 'Aulas presenciais e avaliações',
    lessonsHeading: 'Aulas presenciais',
    lessonsIntro:
      'As aulas acontecem nas unidades SESI, com atividades práticas em laboratório, e são complementadas por recursos digitais, combinando:',
  },
  hibrido: {
    title: 'Aulas híbridas e avaliações',
    lessonsHeading: 'Aulas híbridas',
    lessonsIntro:
      'As aulas alternam encontros presenciais nas unidades SESI e conteúdos online organizados em módulos temáticos, combinando:',
  },
};

export function getLearningFormat(modality: ModalityCode): LearningFormat {
  return {
    ...lessonsByModality[modality],
    lessonItems: [
      'Vídeo-aulas com especialistas da área, gravadas em alta qualidade e com recursos visuais que facilitam a compreensão dos conteúdos técnicos.',
      'Materiais complementares como apostilas digitais, infográficos, artigos e estudos de caso.',
      'Atividades interativas, como quizzes, simulações e fóruns de discussão, que promovem o engajamento e a troca de experiências entre os participantes.',
      'Acesso multiplataforma, permitindo que os alunos estudem pelo computador, tablet ou celular, a qualquer hora e de qualquer lugar.',
    ],
    accessibility:
      'Cada aula é acompanhada de recursos de acessibilidade, como legendas, transcrição de áudio e navegação intuitiva, garantindo inclusão e autonomia para todos os perfis de usuários.',
    assessmentIntro:
      'As avaliações são realizadas diretamente na plataforma, com foco na verificação do aprendizado e na aplicação prática dos conhecimentos adquiridos:',
    assessmentItems: [
      'Provas objetivas ao final de cada módulo, com correção automática e feedback imediato.',
      'Estudos de caso e atividades práticas, que simulam situações reais da indústria e exigem análise crítica e tomada de decisão.',
      'Avaliação final integradora, que consolida os conteúdos do curso e valida a competência do aluno para atuar com segurança no ambiente industrial.',
      'Sistema antifraude, com controle de tempo, embaralhamento de questões e, opcionalmente, reconhecimento facial para garantir a integridade das avaliações.',
    ],
    certificate:
      'Ao concluir o curso e ser aprovado nas avaliações, o aluno recebe um certificado digital reconhecido, que pode ser compartilhado em redes profissionais e utilizado para comprovação de capacitação técnica.',
  };
}
