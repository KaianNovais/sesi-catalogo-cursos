import { cx } from '@/shared/utils/cx';
import { Icon } from '../Icon/Icon';
import styles from './MediaFrame.module.css';

interface MediaFrameProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  /** Miniatura de vídeo do Figma: escurece a imagem e exibe o selo de "play". */
  showPlayBadge?: boolean;
  priority?: boolean;
  className?: string;
}

/** Imagem 16:9 com cantos arredondados, usada nos destaques de vídeo/curso. */
export function MediaFrame({
  src,
  srcSet,
  sizes,
  alt,
  showPlayBadge = false,
  priority = false,
  className,
}: MediaFrameProps) {
  return (
    <div className={cx(styles.frame, showPlayBadge && styles.video, className)}>
      <img
        className={styles.image}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={1280}
        height={720}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      {showPlayBadge ? (
        <span className={styles.play} aria-hidden="true">
          <Icon name="play" size={48} />
        </span>
      ) : null}
    </div>
  );
}
