/** Imagens locais geradas pelo script de otimização: `<slug>.webp` (1200px) e `<slug>-600.webp`. */
const LOCAL_COURSE_IMAGE = /^(\/images\/courses\/[\w-]+)\.webp$/;

/**
 * Monta o srcset das imagens de apresentação hospedadas pela aplicação, para o
 * navegador escolher a menor imagem suficiente para a tela. URLs externas (ex.:
 * imagens vindas do Moodle) não têm variantes conhecidas e usam apenas o src.
 */
export function getCourseImageSrcSet(imageUrl: string): string | undefined {
  const match = LOCAL_COURSE_IMAGE.exec(imageUrl);
  return match ? `${match[1]}-600.webp 600w, ${imageUrl} 1200w` : undefined;
}
