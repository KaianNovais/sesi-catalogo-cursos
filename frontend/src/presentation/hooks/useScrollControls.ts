import { useEffect, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../accessibility/motion';

const EDGE_TOLERANCE = 4;

/**
 * Controla a rolagem horizontal de um contêiner (carrosséis): informa se ainda
 * há conteúdo antes/depois e rola uma "página" visível por vez.
 */
export function useScrollControls(ref: RefObject<HTMLElement | null>) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      setCanScrollPrev(scrollLeft > EDGE_TOLERANCE);
      setCanScrollNext(scrollLeft + clientWidth < scrollWidth - EDGE_TOLERANCE);
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);
    // Itens adicionados/removidos (ex.: fim do carregamento) mudam a largura total.
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(element, { childList: true });

    return () => {
      element.removeEventListener('scroll', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [ref]);

  function scrollByPage(direction: 1 | -1) {
    const element = ref.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  return { canScrollPrev, canScrollNext, scrollByPage };
}
