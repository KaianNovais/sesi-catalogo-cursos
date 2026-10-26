import { Link } from 'react-router';
import { Icon } from '../Icon/Icon';
import { paths } from '../../routes/paths';
import { preloadOnIntent } from '../../routes/routeModules';
import styles from './AllCoursesCard.module.css';

/** Último item do carrossel "Principais cursos" no Figma: atalho para o catálogo. */
export function AllCoursesCard() {
  return (
    <Link to={paths.catalog} className={styles.card} {...preloadOnIntent('catalog')}>
      <span className={styles.label}>Todos os cursos</span>
      <Icon name="arrowRight" size={32} className={styles.icon} />
    </Link>
  );
}
