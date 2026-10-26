import { cx } from '@/shared/utils/cx';
import { ButtonLink } from '../../components/Button/Button';
import { StateMessage } from '../../components/StateMessage/StateMessage';
import { paths } from '../../routes/paths';
import styles from './ErrorPages.module.css';

export function NotFoundPage() {
  return (
    <div className={cx('container', styles.page)}>
      <title>Página não encontrada | SESI Indústria</title>
      <StateMessage
        headingLevel="h1"
        icon="searchOff"
        title="Página não encontrada"
        description="O endereço acessado não existe. Que tal explorar o catálogo de cursos?"
        action={
          <ButtonLink to={paths.catalog} variant="dark" endIcon="arrowRight">
            Ver cursos
          </ButtonLink>
        }
      />
    </div>
  );
}
