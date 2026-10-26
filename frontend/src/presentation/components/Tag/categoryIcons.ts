import type { IconName } from '../Icon/Icon';

/** Ícones das categorias fornecidos no pacote de materiais da atividade. */
const CATEGORY_ICONS: Record<string, IconName> = {
  matematica: 'calculate',
  'ciencias-da-natureza': 'eco',
  linguagens: 'languages',
  sustentabilidade: 'sustainability',
};

export function getCategoryIcon(slug: string): IconName {
  return CATEGORY_ICONS[slug] ?? 'menuBook';
}
