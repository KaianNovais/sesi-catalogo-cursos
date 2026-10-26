import { cx } from '@/shared/utils/cx';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ButtonLink, Button } from '../../components/Button/Button';
import { StateMessage } from '../../components/StateMessage/StateMessage';
import { paths } from '../../routes/paths';
import styles from './ErrorPages.module.css';

/** Fallback para erros inesperados de renderização ou de carregamento de rotas. */
export function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className={cx('container', styles.page)}>
      <title>Algo deu errado | SESI Indústria</title>
      <StateMessage
        role="alert"
        headingLevel="h1"
        icon="error"
        title={notFound ? 'Página não encontrada' : 'Algo deu errado'}
        description={
          notFound
            ? 'O endereço acessado não existe ou foi removido.'
            : 'Ocorreu um erro inesperado ao exibir esta página. Tente recarregar ou volte para o início.'
        }
        action={
          <div className={styles.actions}>
            <Button variant="dark" startIcon="refresh" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
            <ButtonLink to={paths.home} variant="outline">
              Ir para o início
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
