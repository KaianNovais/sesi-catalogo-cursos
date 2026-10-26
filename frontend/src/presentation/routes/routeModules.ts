/**
 * Importações das páginas carregadas sob demanda (code splitting).
 * O roteador e o prefetch usam as mesmas funções, então o navegador baixa
 * cada arquivo uma única vez (o módulo fica em cache após o primeiro import).
 */
export const routeModules = {
  catalog: () => import('../features/catalog/CatalogPage'),
  courseDetails: () => import('../features/course-details/CourseDetailsPage'),
  learning: () => import('../features/learning/LearningPage'),
  info: () => import('../features/institutional/InfoPage'),
  accessibility: () => import('../features/accessibility/AccessibilityPage'),
};

/** Antecipa o download do código de uma página (ex.: ao passar o mouse sobre um link). */
export function preloadRoute(name: keyof typeof routeModules): void {
  routeModules[name]().catch(() => {
    // Falha no prefetch não é crítica: a navegação tenta carregar de novo.
  });
}

/** Props para antecipar uma página quando o usuário aponta (mouse/toque) ou foca um link. */
export function preloadOnIntent(name: keyof typeof routeModules) {
  const preload = () => preloadRoute(name);
  return { onPointerEnter: preload, onFocus: preload };
}
