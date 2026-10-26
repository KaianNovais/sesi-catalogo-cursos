import thumb640 from '@/assets/images/video-thumb-640.webp';
import thumb1280 from '@/assets/images/video-thumb-1280.webp';
import { cx } from '@/shared/utils/cx';
import { ButtonLink } from '../../../components/Button/Button';
import { MediaFrame } from '../../../components/MediaFrame/MediaFrame';
import { SectionHeading } from '../../../components/SectionHeading/SectionHeading';
import { paths } from '../../../routes/paths';
import { preloadOnIntent } from '../../../routes/routeModules';
import styles from './CtaSection.module.css';

export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="cta-titulo">
      <div className={cx('container', styles.grid)}>
        <div className={styles.text}>
          <SectionHeading id="cta-titulo" title="Pronto para transformar sua carreira?" />
          <p className={styles.lead}>
            Junte-se a milhares de profissionais que já estão transformando a indústria através dos
            nossos cursos. Invista no seu futuro hoje mesmo!
          </p>
          <ButtonLink
            to={paths.catalog}
            variant="light"
            endIcon="arrowRight"
            {...preloadOnIntent('catalog')}
          >
            Matricule-se
          </ButtonLink>
        </div>
        <MediaFrame
          src={thumb1280}
          srcSet={`${thumb640} 640w, ${thumb1280} 1280w`}
          sizes="(min-width: 64rem) 745px, 100vw"
          alt="Profissionais com capacete e óculos de proteção conversando diante de uma máquina industrial"
          showPlayBadge
        />
      </div>
    </section>
  );
}
