/**
 * Gera as imagens otimizadas (WebP) usadas pela aplicação.
 *
 * Uso: node scripts/optimize-images.mjs "<pasta dos materiais>" ["<pasta das fotos do Figma>"]
 *
 * - Pasta dos materiais: os PNGs do pacote da atividade (~3 MB cada, 1920x1080): hero-image.png,
 *   banner-ava.png e video-thumb.png.
 * - Pasta das fotos do Figma (opcional): as fotos originais dos seis cursos que aparecem no
 *   protótipo, baixadas do servidor de imagens do Figma ao abrir o protótipo (já vêm em 3:2).
 *   Sem essa pasta, as imagens desses cursos não são regeradas.
 *
 * - Banner do AVA e miniatura do vídeo vão para src/assets/images e são importados pelo Vite
 *   (recebem hash de cache). O hero vai para public/images/hero.
 * - Imagens de apresentação dos cursos vão para public/images/courses, pois o caminho é um dado
 *   do curso (vem da API) e precisa ser estável.
 */
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const [materialsDir, figmaDir] = process.argv.slice(2);
if (!materialsDir) {
  console.error('Informe a pasta com hero-image.png, banner-ava.png e video-thumb.png');
  process.exit(1);
}

const root = resolve(import.meta.dirname, '..');
const assetsDir = join(root, 'src/assets/images');
const heroDir = join(root, 'public/images/hero');
const coursesDir = join(root, 'public/images/courses');
await mkdir(assetsDir, { recursive: true });
await mkdir(heroDir, { recursive: true });
await mkdir(coursesDir, { recursive: true });

const material = (name) => join(materialsDir, `${name}.png`);

/**
 * Imagens institucionais em múltiplas larguras (para srcset). A do hero fica em
 * public/ (caminho estável) porque o index.html a pré-carrega na página inicial.
 */
const responsive = [
  { name: 'hero-image', widths: [640, 1280, 1920], dir: heroDir },
  { name: 'banner-ava', widths: [800, 1600], dir: assetsDir },
  { name: 'video-thumb', widths: [640, 1280], dir: assetsDir },
];

for (const { name, widths, dir } of responsive) {
  for (const width of widths) {
    const out = join(dir, `${name}-${width}.webp`);
    await sharp(material(name)).resize({ width }).webp({ quality: 72 }).toFile(out);
    console.log('✓', out);
  }
}

/**
 * Imagens de apresentação dos cursos, em 3:2 (funciona no card, em retrato com object-fit: cover,
 * e no destaque da página do curso).
 * - `figma`: foto original do protótipo. O `crop` (left, top, width, height em px do original)
 *   reproduz o enquadramento de cada card do Figma — zoom e centro medidos por correlação de
 *   imagem —, de modo que o card, centralizado, mostre a mesma parte da foto. Sem `crop`, a foto
 *   é usada inteira (o Figma também a centraliza).
 * - `from` + `crop`: recorte de uma foto do pacote (PNG de 1920x1080), para os cursos que não
 *   aparecem no Figma. Como o véu do card só deixa a foto visível no terço de cima, o recorte põe
 *   o rosto da pessoa centralizado e a ~25% da altura, como nas fotos do Figma.
 */
const courseImages = [
  { slug: 'matematica-para-a-precisao', figma: 'paquimetro.png' },
  {
    slug: 'geometria-e-modelagem-no-design-textil',
    figma: 'textil.jpg',
    crop: [1327, 1071, 2409, 1606],
  },
  {
    slug: 'estatistica-e-controle-de-qualidade',
    figma: 'tablet.jpg',
    crop: [623, 690, 3057, 2038],
  },
  { slug: 'fisica-do-movimento-e-da-energia', figma: 'faiscas.jpg', crop: [114, 901, 2732, 1821] },
  { slug: 'quimica-e-sustentabilidade', figma: 'laboratorio.jpg', crop: [334, 1280, 2136, 1424] },
  { slug: 'ciencia-dos-materiais-na-metalurgia', figma: 'maquina.jpg' },
  { slug: 'comunicacao-tecnica-na-industria', from: 'video-thumb', crop: [350, 110, 1350, 900] },
  { slug: 'economia-circular-na-industria', from: 'hero-image', crop: [630, 214, 1290, 860] },
];

/**
 * Duas larguras por curso: `<slug>.webp` (1200px, telas de alta densidade) e
 * `<slug>-600.webp` (600px). O front monta o srcset a partir do caminho.
 * Fotos menores que 1200px não são ampliadas: o arquivo fica mais leve e o navegador redimensiona
 * do mesmo jeito. A primeira foto do catálogo é o LCP no celular, então o peso importa.
 */
const courseWidths = [
  { width: 1200, suffix: '' },
  { width: 600, suffix: '-600' },
];

function sourcePath(image) {
  return image.figma ? join(figmaDir, image.figma) : material(image.from);
}

function courseSource(image) {
  const source = sharp(sourcePath(image));
  if (!image.crop) return source;
  const [left, top, width, height] = image.crop;
  return source.extract({ left, top, width, height });
}

for (const image of courseImages) {
  if (image.figma && !figmaDir) {
    console.log(`- ${image.slug}: mantido (informe a pasta das fotos do Figma para regerar)`);
    continue;
  }
  const sourceWidth = image.crop
    ? image.crop[2]
    : (await sharp(sourcePath(image)).metadata()).width;
  for (const size of courseWidths) {
    const out = join(coursesDir, `${image.slug}${size.suffix}.webp`);
    const width = Math.min(size.width, sourceWidth);
    await courseSource(image)
      .resize({ width, height: Math.round((width * 2) / 3), fit: 'cover' })
      .webp({ quality: 55, effort: 6 })
      .toFile(out);
    console.log('✓', out);
  }
}
