import type { Feature } from '../components/FeatureList/FeatureList';
import type { Testimonial } from '../components/TestimonialCard/TestimonialCard';

/** Textos institucionais fictícios, transcritos do protótipo no Figma. */

export const impactStats = [
  { value: '25.000+', label: 'Profissionais Capacitados' },
  { value: '500+', label: 'Empresas parceiras' },
  { value: '4.8/5', label: 'Avaliação média' },
  { value: '2.5M+', label: 'Horas de capacitação' },
] as const;

export const institutionalFeatures: readonly Feature[] = [
  {
    icon: 'certificate',
    title: 'Certificação SESI',
    description: 'Cursos com a melhor certificação do mercado industrial reconhecidos pelo SESI.',
  },
  {
    icon: 'teacher',
    title: 'Professores especialistas',
    description: 'Contamos com professores reconhecidos por sua excelência no mercado.',
  },
  {
    icon: 'support',
    title: 'Suporte contínuo',
    description: 'Você não está sozinho! Acompanhamento online durante todo o curso.',
  },
];

export const testimonials: readonly Testimonial[] = [
  {
    id: 'lucas-pereira',
    quote:
      'A experiência do curso foi incrível! As aulas foram muito bem estruturadas e o cronograma foi cuidadosamente planejado, facilitando muito o aprendizado.',
    author: 'Lucas Pereira',
    role: 'Analista na Empresa X',
    rating: 5,
  },
  {
    id: 'mariana-costa',
    quote:
      'Concluir o curso foi uma jornada enriquecedora. As aulas eram dinâmicas e o horário foi organizado para maximizar nosso tempo de estudo.',
    author: 'Mariana Costa',
    role: 'Gestora na Empresa X',
    rating: 5,
  },
  {
    id: 'thiago-almeida',
    quote:
      'O curso superou minhas expectativas! As aulas eram bem elaboradas e o planejamento do horário ajudou a manter o foco e a produtividade.',
    author: 'Thiago Almeida',
    role: 'Técnico na Empresa X',
    rating: 5,
  },
  {
    id: 'fernanda-silva',
    quote:
      'Finalizar o curso foi uma experiência motivadora. As aulas foram muito bem preparadas e o cronograma foi ideal para o aprendizado.',
    author: 'Fernanda Silva',
    role: 'Analista na Empresa X',
    rating: 5,
  },
  {
    id: 'gabriel-santos',
    quote:
      'A conclusão do curso foi uma etapa gratificante. As aulas foram bem organizadas e o horário foi pensado para facilitar o aprendizado.',
    author: 'Gabriel Santos',
    role: 'Analista na Empresa X',
    rating: 5,
  },
];
