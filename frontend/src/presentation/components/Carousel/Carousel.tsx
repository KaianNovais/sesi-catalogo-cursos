import { useId, useRef, type Key, type ReactNode } from 'react';
import { cx } from '@/shared/utils/cx';
import { useScrollControls } from '../../hooks/useScrollControls';
import { IconButton } from '../IconButton/IconButton';
import styles from './Carousel.module.css';

interface CarouselProps<T> {
  /** Nome acessível do carrossel (ex.: "Principais cursos"). */
  label: string;
  items: readonly T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
  /** Conteúdo exibido à esquerda das setas (ex.: botão "Ver todos os cursos"). */
  footerStart?: ReactNode;
  /** Cor das setas: escura (fundo claro) ou clara (fundo escuro). */
  tone?: 'dark' | 'light';
  busy?: boolean;
  className?: string;
}

/**
 * Carrossel horizontal com scroll-snap nativo: funciona com toque, trackpad e
 * teclado (Tab percorre os cards). As setas apenas complementam a navegação.
 */
export function Carousel<T>({
  label,
  items,
  getKey,
  renderItem,
  footerStart,
  tone = 'dark',
  busy = false,
  className,
}: CarouselProps<T>) {
  const trackId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const { canScrollPrev, canScrollNext, scrollByPage } = useScrollControls(trackRef);

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      aria-busy={busy || undefined}
      className={cx(styles.carousel, styles[tone], className)}
    >
      <ul ref={trackRef} id={trackId} role="list" className={styles.track}>
        {items.map((item) => (
          <li key={getKey(item)} className={styles.slide}>
            {renderItem(item)}
          </li>
        ))}
      </ul>

      <div className={cx('container', styles.footer)}>
        <div>{footerStart}</div>
        {/* Sem conteúdo para rolar (telas largas), as setas somem sem alterar o layout */}
        <div className={styles.controls} data-scrollable={canScrollPrev || canScrollNext}>
          <IconButton
            icon="arrowLeft"
            label="Itens anteriores"
            iconSize={32}
            aria-controls={trackId}
            disabled={!canScrollPrev}
            onClick={() => scrollByPage(-1)}
          />
          <IconButton
            icon="arrowRight"
            label="Próximos itens"
            iconSize={32}
            aria-controls={trackId}
            disabled={!canScrollNext}
            onClick={() => scrollByPage(1)}
          />
        </div>
      </div>
    </div>
  );
}
