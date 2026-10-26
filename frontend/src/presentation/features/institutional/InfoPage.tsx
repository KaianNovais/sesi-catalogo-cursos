import { useParams } from 'react-router';
import { cx } from '@/shared/utils/cx';
import { ButtonLink } from '../../components/Button/Button';
import { StateMessage } from '../../components/StateMessage/StateMessage';
import { infoPages } from '../../content/site';
import { paths } from '../../routes/paths';
import { NotFoundPage } from '../errors/NotFoundPage';
import styles from '../errors/ErrorPages.module.css';

/** Páginas institucionais do rodapé (fora do escopo da atividade). */
export function InfoPage() {
  const { slug = '' } = useParams();
  const title = infoPages[slug];

  if (!title) return <NotFoundPage />;

  return (
    <div className={cx('container', styles.page)}>
      <title>{`${title} | SESI Indústria`}</title>
      <StateMessage
        headingLevel="h1"
        icon="info"
        title={title}
        description="Esta página institucional não faz parte do escopo da demonstração e está em construção."
        action={
          <ButtonLink to={paths.catalog} variant="dark" endIcon="arrowRight">
            Explorar cursos
          </ButtonLink>
        }
      />
    </div>
  );
}
