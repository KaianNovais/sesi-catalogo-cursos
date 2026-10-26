import { cx } from '@/shared/utils/cx';
import { SectionHeading } from '../../components/SectionHeading/SectionHeading';
import { useCourseFilterOptions, useCourseList } from '../../queries/courseQueries';
import { CatalogResults } from './CatalogResults';
import { CatalogToolbar } from './CatalogToolbar';
import { useCatalogFilters } from './useCatalogFilters';
import styles from './Catalog.module.css';

/**
 * Catálogo de cursos. Não existe no Figma: foi construído com os mesmos
 * componentes e tokens visuais do protótipo (cards, tags, botões, tipografia).
 */
export function CatalogPage() {
  const { filters, updateFilters, clearFilters, hasActiveFilters } = useCatalogFilters();
  const coursesQuery = useCourseList(filters);
  const optionsQuery = useCourseFilterOptions();

  const pageTitle = filters.search
    ? `Busca por “${filters.search}” | Cursos | SESI Indústria`
    : 'Cursos | SESI Indústria';

  return (
    <>
      <title>{pageTitle}</title>
      <section className={styles.intro} aria-labelledby="catalogo-titulo">
        <div className="container">
          <SectionHeading as="h1" id="catalogo-titulo" eyebrow="Catálogo" title="Todos os cursos" />
          <p className={styles.lead}>
            Pesquise pelo nome e combine filtros de categoria, modalidade e status para encontrar o
            curso ideal para a sua carreira.
          </p>
        </div>
      </section>

      <div className={cx('container', styles.body)}>
        <CatalogToolbar
          filters={filters}
          options={optionsQuery.data}
          // Aviso só faz sentido se a listagem funciona e apenas os filtros falharam.
          optionsUnavailable={optionsQuery.isError && !coursesQuery.isError}
          hasActiveFilters={hasActiveFilters}
          onChange={updateFilters}
          onClear={clearFilters}
        />
        <CatalogResults
          query={coursesQuery}
          search={filters.search}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </div>
    </>
  );
}
