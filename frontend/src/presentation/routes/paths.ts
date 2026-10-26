/** Rotas da aplicação centralizadas (evita strings de URL espalhadas pelos componentes). */
export const paths = {
  home: '/',
  about: { pathname: '/', hash: '#sobre' },
  catalog: '/cursos',
  studentArea: '/area-do-aluno',
  accessibility: '/acessibilidade',
} as const;

export function coursePath(slug: string): string {
  return `/cursos/${slug}`;
}

export function learningPath(slug: string): string {
  return `/area-do-aluno/${slug}`;
}

export function infoPath(slug: string): string {
  return `/institucional/${slug}`;
}
