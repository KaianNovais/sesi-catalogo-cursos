import { cx } from '@/shared/utils/cx';
import { ButtonLink } from '../../../components/Button/Button';
import { paths } from '../../../routes/paths';
import { preloadOnIntent } from '../../../routes/routeModules';
import styles from './HeroSection.module.css';

/*
 * Caminhos estáveis (pasta public): o index.html pré-carrega esta imagem na página
 * inicial, antes do JavaScript executar — ela é o maior elemento da tela (LCP).
 * Se mudar os arquivos, atualize também o script de preload do index.html.
 */
const HERO_SRC = '/images/hero/hero-image-1280.webp';
const HERO_SRCSET = [640, 1280, 1920]
  .map((w) => `/images/hero/hero-image-${w}.webp ${w}w`)
  .join(', ');
/** No desktop a foto ocupa 140,9% da largura (enquadramento do Figma; ver o CSS). */
const HERO_SIZES = '(min-width: 64rem) 141vw, 100vw';

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <img
        className={styles.image}
        src={HERO_SRC}
        srcSet={HERO_SRCSET}
        sizes={HERO_SIZES}
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
      />
      <div className={cx('container', styles.content)}>
        <h1 id="hero-title" className={styles.title}>
          Impulsione sua carreira na indústria
        </h1>
        <p className={styles.lead}>
          Amplie seus conhecimentos com excelência na melhor plataforma de estudos da indústria
          brasileira
        </p>
        <ButtonLink
          to={paths.catalog}
          variant="light"
          endIcon="arrowRight"
          {...preloadOnIntent('catalog')}
        >
          Conhecer cursos
        </ButtonLink>
      </div>
    </section>
  );
}
