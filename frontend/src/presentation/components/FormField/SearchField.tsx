import { useId, useRef } from 'react';
import { cx } from '@/shared/utils/cx';
import { Icon } from '../Icon/Icon';
import styles from './FormField.module.css';

interface SearchFieldProps {
  /** id do campo (ex.: alvo do atalho "Ir para a busca"); gerado automaticamente se ausente. */
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hideLabel?: boolean;
  maxLength?: number;
  /** "compact": 28px de altura e lupa à direita (busca do menu do AVA no Figma). */
  variant?: 'default' | 'compact';
  className?: string;
}

export function SearchField({
  id: idProp,
  label,
  value,
  onChange,
  placeholder,
  hideLabel = false,
  maxLength,
  variant = 'default',
  className,
}: SearchFieldProps) {
  const compact = variant === 'compact';
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {compact ? null : <Icon name="search" size={20} className={styles.leadingIcon} />}
        {compact && !value ? (
          <Icon
            name="search"
            size={16}
            className={cx(styles.trailingIcon, styles.trailingIconCompact)}
          />
        ) : null}
        <input
          ref={inputRef}
          id={id}
          type="search"
          className={cx(styles.input, compact ? styles.compact : styles.withLeadingIcon)}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button
            type="button"
            className={cx(styles.clearButton, compact && styles.clearButtonCompact)}
            aria-label="Limpar busca"
            onClick={clear}
          >
            <Icon name="close" size={compact ? 16 : 20} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
