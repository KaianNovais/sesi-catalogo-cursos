/*
 * Detecta overflow horizontal na página aberta. Execute no contexto da página (console do navegador
 * ou ferramenta de JavaScript do agente). Ignora o que está dentro de contêineres que cortam ou rolam
 * na horizontal (ex.: carrosséis com scroll-snap) e elementos ocultos ou visualmente escondidos.
 *
 * Retorna { viewport, scrollWidth, overflow, culprits }:
 * - overflow: true quando a página inteira rola na horizontal (o problema real);
 * - culprits: até 10 elementos que ultrapassam as bordas (candidatos; confirme com um screenshot).
 */
(() => {
  const root = document.documentElement;
  const viewport = root.clientWidth;

  const clipsHorizontally = (element) => getComputedStyle(element).overflowX !== 'visible';

  const insideHorizontalClipper = (element) => {
    for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
      if (clipsHorizontally(node)) return true;
    }
    return false;
  };

  const describe = (element) => {
    const id = element.id ? `#${element.id}` : '';
    const classes =
      typeof element.className === 'string' && element.className.trim()
        ? `.${element.className.trim().split(/\s+/).join('.')}`
        : '';
    return `${element.tagName.toLowerCase()}${id}${classes}`;
  };

  const culprits = [];
  for (const element of document.body.querySelectorAll('*')) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) continue;
    if (rect.right <= viewport + 1 && rect.left >= -1) continue;
    if (getComputedStyle(element).visibility === 'hidden') continue;
    if (insideHorizontalClipper(element)) continue;
    culprits.push({
      element: describe(element),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
    });
    if (culprits.length === 10) break;
  }

  return { viewport, scrollWidth: root.scrollWidth, overflow: root.scrollWidth > viewport, culprits };
})();
