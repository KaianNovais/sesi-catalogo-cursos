import { useId, useState, type ReactNode } from 'react';
import { cx } from '@/shared/utils/cx';
import { Icon } from '../Icon/Icon';
import styles from './Accordion.module.css';

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.accordion, className)}>{children}</div>;
}

interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  headingLevel?: 'h2' | 'h3' | 'h4';
}

/**
 * Item de acordeão no padrão WAI-ARIA: o título é um botão dentro de um
 * heading, com aria-expanded/aria-controls apontando para o painel.
 */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  headingLevel: Heading = 'h3',
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  return (
    <div className={styles.item}>
      <Heading className={styles.heading}>
        <button
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={panelId}
          className={styles.trigger}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{title}</span>
          <Icon name={open ? 'minus' : 'plus'} size={24} className={styles.icon} />
        </button>
      </Heading>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className={styles.panel}
      >
        {children}
      </div>
    </div>
  );
}
