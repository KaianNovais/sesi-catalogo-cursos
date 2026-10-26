import type { CSSProperties, ReactNode } from 'react';
import type { Category } from '@/domain/course/Course';
import { cx } from '@/shared/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import { getCategoryIcon } from './categoryIcons';
import styles from './Tag.module.css';

interface TagProps {
  icon?: IconName;
  /** Cor de fundo (hex). */
  color?: string;
  className?: string;
  children: ReactNode;
}

export function Tag({ icon, color, className, children }: TagProps) {
  return (
    <span
      className={cx(styles.tag, className)}
      style={color ? ({ '--tag-bg': color } as CSSProperties) : undefined}
    >
      {icon ? <Icon name={icon} size={20} /> : null}
      {children}
    </span>
  );
}

export function CategoryTag({ category, className }: { category: Category; className?: string }) {
  return (
    <Tag icon={getCategoryIcon(category.slug)} color={category.color} className={className}>
      {category.name}
    </Tag>
  );
}
