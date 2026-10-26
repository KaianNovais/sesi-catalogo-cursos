import type { ReactNode } from 'react';
import { cx } from '@/shared/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './StateMessage.module.css';

interface StateMessageProps {
  icon: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /**
   * "alert" para erros (anunciado imediatamente por leitores de tela) e
   * "status" para avisos informativos. Omitir quando outro elemento já anuncia.
   */
  role?: 'alert' | 'status';
  headingLevel?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/** Mensagem de estado reutilizada para vazio, erro e "não encontrado". */
export function StateMessage({
  icon,
  title,
  description,
  action,
  role,
  headingLevel: Heading = 'h2',
  className,
}: StateMessageProps) {
  return (
    <div role={role} className={cx(styles.message, className)}>
      <span className={styles.icon}>
        <Icon name={icon} size={32} />
      </span>
      <Heading className={styles.title}>{title}</Heading>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
