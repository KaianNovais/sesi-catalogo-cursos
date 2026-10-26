/**
 * Normaliza texto para busca: minúsculas e sem acentos ("Matemática" → "matematica"). Remove só as
 * marcas combinantes (\p{Mn}) da forma decomposta, a mesma regra da API (CatalogText.ToSearchKey):
 * os casos de data/search-cases.json garantem que front e back-end busquem igual.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

/** Pluralização simples em português: pluralize(1, 'curso') → "1 curso". */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
