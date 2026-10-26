import { useEffect, useState } from 'react';

/** Indica se a página foi rolada além de `threshold` pixels (ex.: cabeçalho transparente → sólido). */
export function useScrolledPast(threshold: number): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return scrolled;
}
