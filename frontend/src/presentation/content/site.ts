import { infoPath, paths } from '../routes/paths';

/** Conteúdo institucional fixo (fictício), conforme o protótipo no Figma. */
export const site = {
  name: 'SESI Indústria',
  email: 'contato@sesindustria.com.br',
  address: 'Av. Paulista, 1313',
  /** Curso usado como atalho da "Área do aluno" na demonstração (fluxo 03 do Figma). */
  demoCourseSlug: 'matematica-para-a-precisao',
} as const;

export const mainNavigation = [
  { label: 'Início', to: paths.home, end: true },
  { label: 'Cursos', to: paths.catalog, end: false },
] as const;

export const footerNavigation = [
  { label: 'Início', to: paths.home },
  { label: 'Certificação', to: infoPath('certificacao') },
  { label: 'Cursos', to: paths.catalog },
  { label: 'Sobre', to: paths.about },
  { label: 'Blog', to: infoPath('blog') },
] as const;

/**
 * "Cursos populares" exatamente como no Figma. Esses cursos não fazem parte do catálogo fictício,
 * então os links levam ao catálogo completo (README, seção 12).
 */
export const popularCourses = [
  'Cultura Organizacional',
  'Ferramentas Google para Produtividade',
  'Excel Básico ao Avançado',
  'Trabalho em Equipe e Colaboração',
  'Gestão do Tempo e Produtividade',
  'Comunicação Assertiva',
  'Inteligência Emocional no Trabalho',
] as const;

export const supportLinks = [
  { label: 'Termos de Uso', to: infoPath('termos-de-uso') },
  { label: 'Política de Privacidade', to: infoPath('politica-de-privacidade') },
  { label: 'Trabalhe Conosco', to: infoPath('trabalhe-conosco') },
  { label: 'Fale Conosco', to: infoPath('fale-conosco') },
  { label: 'Central de Ajuda', to: infoPath('central-de-ajuda') },
  // Não está no Figma: a declaração de acessibilidade fica acessível em todas as páginas (README §12)
  { label: 'Acessibilidade', to: paths.accessibility },
] as const;

/** Títulos das páginas institucionais (fora do escopo; exibidas como "em construção"). */
export const infoPages: Record<string, string> = {
  certificacao: 'Certificação',
  blog: 'Blog',
  'termos-de-uso': 'Termos de Uso',
  'politica-de-privacidade': 'Política de Privacidade',
  'trabalhe-conosco': 'Trabalhe Conosco',
  'fale-conosco': 'Fale Conosco',
  'central-de-ajuda': 'Central de Ajuda',
};

export const socialLinks = [
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/company/sesi-sp/' },
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/sesisp/' },
  { label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/sesisp' },
] as const;
