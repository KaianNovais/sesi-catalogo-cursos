import { cx } from '@/shared/utils/cx';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './FeatureList.module.css';

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

interface FeatureListProps {
  features: readonly Feature[];
  /** "brand": ícone vermelho (página inicial); "accent": cor da categoria (página do curso). */
  tone?: 'brand' | 'accent';
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/**
 * Lista de diferenciais. As colunas dependem da largura do próprio componente
 * (container query) e da quantidade de itens, evitando "órfãos" (3+1, 2+1).
 */
export function FeatureList({
  features,
  tone = 'brand',
  headingLevel: Heading = 'h3',
  className,
}: FeatureListProps) {
  return (
    <div className={cx(styles.root, className)}>
      <ul role="list" className={cx(styles.list, styles[tone])} data-count={features.length}>
        {features.map((feature) => (
          <li key={feature.title} className={styles.item}>
            <span className={styles.icon}>
              <Icon name={feature.icon} size={32} />
            </span>
            <Heading className={styles.title}>{feature.title}</Heading>
            <p className={styles.description}>{feature.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
