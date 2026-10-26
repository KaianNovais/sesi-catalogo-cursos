import type { ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/shared/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'light' | 'dark' | 'outline' | 'outline-light';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: IconName;
  endIcon?: IconName;
  fullWidth?: boolean;
}

function buttonClassName(
  { variant = 'dark', size = 'md', fullWidth }: ButtonStyleProps,
  className?: string,
) {
  return cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className);
}

function ButtonContent({
  startIcon,
  endIcon,
  children,
}: Pick<ButtonStyleProps, 'startIcon' | 'endIcon'> & { children: ReactNode }) {
  return (
    <>
      {startIcon ? <Icon name={startIcon} size={20} className={styles.icon} /> : null}
      <span>{children}</span>
      {endIcon ? <Icon name={endIcon} size={20} className={styles.icon} /> : null}
    </>
  );
}

type ButtonProps = ButtonStyleProps & ComponentProps<'button'>;

export function Button({
  variant,
  size,
  startIcon,
  endIcon,
  fullWidth,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth }, className)}
      {...rest}
    >
      <ButtonContent startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonStyleProps & LinkProps;

/** Mesmo visual do Button, mas navega (rotas internas, âncoras ou mailto:). */
export function ButtonLink({
  variant,
  size,
  startIcon,
  endIcon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName({ variant, size, fullWidth }, className)} {...rest}>
      <ButtonContent startIcon={startIcon} endIcon={endIcon}>
        {children}
      </ButtonContent>
    </Link>
  );
}
