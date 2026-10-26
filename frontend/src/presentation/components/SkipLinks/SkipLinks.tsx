import type { MouseEvent } from 'react';
import { prefersReducedMotion } from '../../accessibility/motion';
import { anchors } from '../../routes/anchors';
import { focusFirstVisible } from '../../utils/focus';
import styles from './SkipLinks.module.css';

type SkipTarget = 'content' | 'menu' | 'search' | 'footer';

const LINKS: Record<SkipTarget, { label: string; key: string }> = {
  content: { label: 'Ir para o conteúdo', key: '1' },
  menu: { label: 'Ir para o menu', key: '2' },
  search: { label: 'Ir para a busca', key: '3' },
  footer: { label: 'Ir para o rodapé', key: '4' },
};

/**
 * Leva foco e rolagem ao alvo por script. A navegação nativa por "#âncora" cria uma entrada no
 * histórico que o ScrollRestoration do React Router trata como "voltar": ele desfazia a rolagem e o
 * alvo focado ficava fora da tela. O href continua como alternativa sem JavaScript.
 */
function goTo(target: SkipTarget, event: MouseEvent<HTMLAnchorElement>) {
  // "Ir para o menu": primeiro item do menu ou, com ele recolhido (celular), o botão que o abre.
  if (target === 'menu') {
    const focused = focusFirstVisible([
      `#${anchors.menu} :is(a, button, input)`,
      `[aria-controls="${anchors.menu}"]`,
    ]);
    if (focused) event.preventDefault();
    return;
  }

  const element = document.getElementById(anchors[target]);
  if (!element) return;
  event.preventDefault();
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

interface SkipLinksProps {
  targets: readonly SkipTarget[];
}

/**
 * Atalhos do padrão eMAG (1 conteúdo, 2 menu, 3 busca, 4 rodapé). Ficam fora da tela até receberem
 * foco. A tecla de acesso é Alt + número (Chrome e Edge), Alt + Shift + número (Firefox) ou
 * Control + Option + número (Mac).
 */
export function SkipLinks({ targets }: SkipLinksProps) {
  return (
    <div className={styles.skipLinks}>
      {targets.map((target) => (
        <a
          key={target}
          href={`#${anchors[target]}`}
          accessKey={LINKS[target].key}
          className={styles.link}
          onClick={(event) => goTo(target, event)}
        >
          {LINKS[target].label} [{LINKS[target].key}]
        </a>
      ))}
    </div>
  );
}
