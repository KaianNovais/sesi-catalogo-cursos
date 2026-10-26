import { useId } from 'react';
import { cx } from '@/shared/utils/cx';
import { Icon } from '../Icon/Icon';
import styles from './FormField.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  /** Rótulo da opção vazia (sem filtro). */
  emptyLabel: string;
  disabled?: boolean;
  className?: string;
}

/** Select nativo estilizado: acessível por padrão e com boa experiência no mobile. */
export function SelectField({
  label,
  value,
  options,
  onChange,
  emptyLabel,
  disabled,
  className,
}: SelectFieldProps) {
  const id = useId();

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <select
          id={id}
          className={cx(styles.input, styles.select, value && styles.selected)}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{emptyLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={20} className={styles.trailingIcon} />
      </div>
    </div>
  );
}
