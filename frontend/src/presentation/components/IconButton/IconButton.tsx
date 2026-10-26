import type { ComponentProps } from 'react';
import { cx } from '@/shared/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName;
  /** Nome acessível obrigatório: o botão não tem texto visível. */
  label: string;
  iconSize?: number;
}

export function IconButton({
  icon,
  label,
  iconSize = 24,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button type={type} aria-label={label} className={cx(styles.button, className)} {...rest}>
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
