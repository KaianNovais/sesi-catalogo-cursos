/**
 * Move o foco para o primeiro elemento visível da lista (ex.: atalho "Ir para o menu", que no
 * celular cai no botão do menu recolhível). Retorna false se nenhum estiver visível.
 */
export function focusFirstVisible(selectors: readonly string[]): boolean {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element && element.getClientRects().length > 0) {
      element.focus();
      return true;
    }
  }
  return false;
}
