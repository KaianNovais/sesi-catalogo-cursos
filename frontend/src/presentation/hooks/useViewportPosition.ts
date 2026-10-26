import { useEffect, useState, type RefObject } from 'react';

/** Posição de um elemento em relação à área visível da janela. */
export type ViewportPosition = 'before' | 'visible' | 'after';

/**
 * Indica se o elemento ainda não foi alcançado ("before"), está visível ("visible") ou já ficou
 * para trás na rolagem ("after").
 *
 * Mede a posição a cada rolagem e mudança de tamanho (no máximo uma vez por quadro). Um
 * IntersectionObserver não serve aqui: ele só avisa quando o elemento cruza a tela, e um salto de
 * rolagem (rolagem restaurada ao recarregar, teclas Home/End) pode levá-lo de cima para baixo da tela
 * sem cruzá-la, deixando a posição desatualizada.
 */
export function useViewportPosition(
  ref: RefObject<Element | null>,
  initial: ViewportPosition = 'visible',
): ViewportPosition {
  const [position, setPosition] = useState<ViewportPosition>(initial);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) setPosition('visible');
      else setPosition(rect.top < 0 ? 'after' : 'before');
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Conteúdo que muda de altura (carregamento, texto ampliado) também move o elemento.
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resizeObserver.disconnect();
    };
  }, [ref]);

  return position;
}
