import type { UseQueryResult } from '@tanstack/react-query';
import type { CourseList } from '@/domain/course/Course';
import { pluralize } from '@/shared/utils/text';
import { Button } from '../../components/Button/Button';
import { CourseCard } from '../../components/CourseCard/CourseCard';
import { CourseCardSkeleton } from '../../components/CourseCard/CourseCardSkeleton';
import { StateMessage } from '../../components/StateMessage/StateMessage';
import styles from './Catalog.module.css';

interface CatalogResultsProps {
  query: UseQueryResult<CourseList>;
  search: string | undefined;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const SKELETON_COUNT = 8;

export function CatalogResults({
  query,
  search,
  hasActiveFilters,
  onClearFilters,
}: CatalogResultsProps) {
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = query;

  if (isPending) {
    return (
      <div aria-busy="true">
        <p role="status" className="visually-hidden">
          Carregando cursos…
        </p>
        <ul role="list" className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <li key={index}>
              <CourseCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Erro sem dados (ou com dados de uma consulta anterior): não exibe resultados "velhos".
  if (isError && (!data || isPlaceholderData)) {
    return (
      <StateMessage
        role="alert"
        icon="error"
        title="Não foi possível carregar os cursos"
        description="O serviço de cursos não respondeu. Verifique sua conexão e tente novamente."
        action={
          <Button
            variant="dark"
            startIcon="refresh"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? 'Tentando novamente…' : 'Tentar novamente'}
          </Button>
        }
      />
    );
  }

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const summary =
    total === 0
      ? 'Nenhum curso encontrado'
      : pluralize(total, 'curso encontrado', 'cursos encontrados');

  return (
    <div className={styles.results}>
      <div className={styles.summary}>
        <p role="status" className={total === 0 ? 'visually-hidden' : styles.count}>
          {summary}
          {search ? (
            <>
              {' '}
              para <strong>“{search}”</strong>
            </>
          ) : null}
        </p>
        {isFetching ? (
          <span className={styles.updating} aria-hidden="true">
            Atualizando…
          </span>
        ) : null}
      </div>

      {total === 0 ? (
        <StateMessage
          icon="searchOff"
          headingLevel="h2"
          title="Nenhum curso encontrado"
          description="Revise o termo buscado ou remova alguns filtros para ver mais opções."
          action={
            hasActiveFilters ? (
              <Button variant="dark" startIcon="close" onClick={onClearFilters}>
                Limpar filtros
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <h2 className="visually-hidden">Resultados</h2>
          <ul role="list" className={styles.grid} aria-busy={isFetching || undefined}>
            {items.map((course, index) => (
              <li key={course.id}>
                {/* Só o primeiro card tem prioridade: no celular é o único visível sem rolar (o LCP)
                    e no desktop abre a primeira fileira. Outras fotos com prioridade alta dividiriam
                    a banda com ele. */}
                <CourseCard course={course} showDetails priority={index === 0} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
