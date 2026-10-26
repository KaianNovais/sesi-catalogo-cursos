import { cx } from '@/shared/utils/cx';
import { FeatureList } from '../../../components/FeatureList/FeatureList';
import { SectionHeading } from '../../../components/SectionHeading/SectionHeading';
import { impactStats, institutionalFeatures } from '../../../content/home';
import styles from './ImpactSection.module.css';

/** Seção "Sobre" (âncora do menu): resultados institucionais e diferenciais. */
export function ImpactSection() {
  return (
    <section id="sobre" className={styles.section} aria-labelledby="impacto-titulo">
      <div className={cx('container', styles.grid)}>
        <div className={styles.intro}>
          <SectionHeading id="impacto-titulo" title="Impacto transformador" />
          <p className={styles.lead}>
            Resultados que demonstram o sucesso da nossa metodologia de capacitação contínua para a
            indústria
          </p>
        </div>

        <div className={styles.details}>
          <ul role="list" className={styles.stats}>
            {impactStats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <strong className={styles.value}>{stat.value}</strong>
                <span className={styles.label}>{stat.label}</span>
              </li>
            ))}
          </ul>
          <FeatureList features={institutionalFeatures} tone="brand" />
        </div>
      </div>
    </section>
  );
}
