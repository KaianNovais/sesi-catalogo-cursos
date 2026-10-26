import type { CSSProperties } from 'react';
import { cx } from '@/shared/utils/cx';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
  tone?: 'light' | 'dark';
  className?: string;
}

/** Bloco de carregamento (decorativo). O anúncio para leitores de tela fica no container. */
export function Skeleton({
  width = '100%',
  height = '1rem',
  radius,
  tone = 'light',
  className,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.skeleton, styles[tone], className)}
      style={{ width, height, borderRadius: radius }}
    />
  );
}
