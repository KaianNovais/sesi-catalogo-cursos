import { useId, useState, type FormEvent } from 'react';
import type { CourseFilterOptions } from '@/domain/course/Course';
import {
  normalizeSearchTerm,
  SEARCH_MAX_LENGTH,
  type CourseFilters,
} from '@/domain/course/courseFilters';
import { cx } from '@/shared/utils/cx';
import { Button } from '../../components/Button/Button';
import { SearchField } from '../../components/FormField/SearchField';
import { Icon } from '../../components/Icon/Icon';
import { SelectField } from '../../components/FormField/SelectField';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { anchors } from '../../routes/anchors';
import styles from './Catalog.module.css';

type FilterPatch = Partial<Pick<CourseFilters, 'search' | 'category' | 'modality' | 'status'>>;

interface CatalogToolbarProps {
  filters: CourseFilters;
  options: CourseFilterOptions | undefined;
  optionsUnavailable: boolean;
  hasActiveFilters: boolean;
  onChange: (patch: FilterPatch, options?: { replace?: boolean }) => void;
  onClear: () => void;
}

const SEARCH_DEBOUNCE_MS = 350;

export function CatalogToolbar({
  filters,
  options,
  optionsUnavailable,
  hasActiveFilters,
  onChange,
  onClear,
}: CatalogToolbarProps) {
  const urlSearch = filters.search ?? '';
  const [search, setSearch] = useState(urlSearch);

  // Se a busca mudar fora do campo (voltar/avançar do navegador), atualiza o campo.
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    if (normalizeSearchTerm(search) !== urlSearch) setSearch(urlSearch);
  }

  // Digitação não cria entradas no histórico (replace); filtros e "Enter" criam.
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onChange({ search: value }, { replace: true });
  }, SEARCH_DEBOUNCE_MS);

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedSearch.run(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    debouncedSearch.cancel();
    onChange({ search });
  }

  function handleClear() {
    debouncedSearch.cancel();
    setSearch('');
    onClear();
  }

  const disabled = !options;
  const filtersId = useId();
  // No celular os seletores ficam recolhidos para os resultados aparecerem logo.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedCount = [filters.category, filters.modality, filters.status].filter(Boolean).length;

  return (
    <form
      role="search"
      aria-label="Buscar e filtrar cursos"
      className={styles.toolbar}
      onSubmit={handleSubmit}
    >
      <SearchField
        id={anchors.search}
        label="Buscar pelo nome"
        placeholder="Ex.: Matemática"
        value={search}
        maxLength={SEARCH_MAX_LENGTH}
        onChange={handleSearchChange}
        className={styles.searchField}
      />

      {/* Visível apenas em telas estreitas (CSS); no desktop os filtros ficam sempre à mostra. */}
      <button
        type="button"
        className={styles.filtersToggle}
        aria-expanded={filtersOpen}
        aria-controls={filtersId}
        // Nome explícito: textos em <span> seriam lidos colados ("Filtros2").
        aria-label={
          selectedCount > 0
            ? `Filtros (${selectedCount} ${selectedCount === 1 ? 'ativo' : 'ativos'})`
            : 'Filtros'
        }
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <Icon name="filter" size={20} />
        <span>
          Filtros
          {selectedCount > 0 ? (
            <span className={styles.filtersBadge} aria-hidden="true">
              {selectedCount}
            </span>
          ) : null}
        </span>
        <Icon
          name="chevronDown"
          size={20}
          className={cx(styles.filtersChevron, filtersOpen && styles.filtersChevronOpen)}
        />
      </button>

      <div id={filtersId} className={styles.filters} data-open={filtersOpen}>
        <SelectField
          label="Categoria"
          emptyLabel="Todas"
          value={filters.category ?? ''}
          options={
            options?.categories.map((item) => ({ value: item.slug, label: item.name })) ?? []
          }
          disabled={disabled}
          onChange={(category) => onChange({ category })}
        />
        <SelectField
          label="Modalidade"
          emptyLabel="Todas"
          value={filters.modality ?? ''}
          options={
            options?.modalities.map((item) => ({ value: item.code, label: item.name })) ?? []
          }
          disabled={disabled}
          onChange={(modality) => onChange({ modality })}
        />
        <SelectField
          label="Status"
          emptyLabel="Todos"
          value={filters.status ?? ''}
          options={options?.statuses.map((item) => ({ value: item.code, label: item.name })) ?? []}
          disabled={disabled}
          onChange={(status) => onChange({ status })}
        />
        <Button
          variant="outline"
          size="lg"
          startIcon="close"
          className={styles.clearButton}
          disabled={!hasActiveFilters && !search}
          onClick={handleClear}
        >
          Limpar filtros
        </Button>
      </div>

      {optionsUnavailable ? (
        <p className={styles.toolbarNote} role="status">
          Os filtros estão indisponíveis no momento, mas a busca por nome continua funcionando.
        </p>
      ) : null}
    </form>
  );
}
