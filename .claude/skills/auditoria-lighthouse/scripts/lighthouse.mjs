/**
 * Roda o Lighthouse (mobile e desktop) nas páginas principais e imprime um resumo.
 *
 * Uso: node lighthouse.mjs [baseUrl] [pastaDeSaida]
 *   baseUrl       padrão: http://localhost:4173 (npm run preview)
 *   pastaDeSaida  padrão: <pasta temporária do sistema>/lighthouse-sesi (relatórios JSON completos)
 *
 * Requer o Google Chrome (ou CHROME_PATH). O npx baixa o lighthouse@13.5.0 na primeira execução.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const baseUrl = (process.argv[2] ?? 'http://localhost:4173').replace(/\/+$/, '');
const outDir = process.argv[3] ?? join(tmpdir(), 'lighthouse-sesi');
mkdirSync(outDir, { recursive: true });

const pages = [
  { name: 'home', path: '/' },
  { name: 'catalogo', path: '/cursos' },
  { name: 'detalhes', path: '/cursos/matematica-para-a-precisao' },
];
const formFactors = ['mobile', 'desktop'];
const metrics = [
  ['FCP', 'first-contentful-paint'],
  ['LCP', 'largest-contentful-paint'],
  ['TBT', 'total-blocking-time'],
  ['CLS', 'cumulative-layout-shift'],
];

const isWindows = process.platform === 'win32';
// No Windows o npx é um .cmd e precisa de shell; os argumentos com caminho vão entre aspas.
const quote = (value) => (isWindows ? `"${value}"` : value);

function runLighthouse(url, formFactor, outputPath) {
  const args = [
    '--yes',
    'lighthouse@13.5.0',
    url,
    '--output=json',
    `--output-path=${quote(outputPath)}`,
    '--chrome-flags=--headless=new',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--quiet',
  ];
  if (formFactor === 'desktop') args.push('--preset=desktop');
  return spawnSync(isWindows ? 'npx.cmd' : 'npx', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'ignore', 'pipe'],
    shell: isWindows,
  });
}

function summarize(report) {
  const score = (key) => Math.round((report.categories[key]?.score ?? 0) * 100);
  const failing = Object.values(report.audits)
    .filter(
      (audit) =>
        audit.score !== null &&
        audit.score < 0.9 &&
        !['informative', 'notApplicable', 'manual'].includes(audit.scoreDisplayMode),
    )
    .map((audit) => `${audit.id}${audit.displayValue ? ` (${audit.displayValue})` : ''}`);
  return {
    scores: [
      score('performance'),
      score('accessibility'),
      score('best-practices'),
      score('seo'),
    ],
    metrics: metrics.map(([, id]) => report.audits[id]?.displayValue ?? '–'),
    failing,
  };
}

const rows = [];
for (const page of pages) {
  for (const formFactor of formFactors) {
    const outputPath = join(outDir, `${page.name}-${formFactor}.json`);
    process.stderr.write(`Lighthouse ${page.path} (${formFactor})…\n`);
    const result = runLighthouse(baseUrl + page.path, formFactor, outputPath);
    if (result.status !== 0) {
      const reason = (result.stderr ?? '').trim().split('\n').slice(-3).join(' ');
      rows.push({ page, formFactor, error: reason || `código de saída ${result.status}` });
      continue;
    }
    rows.push({ page, formFactor, ...summarize(JSON.parse(readFileSync(outputPath, 'utf8'))) });
  }
}

console.log(`\n| Página | Dispositivo | Desempenho | Acessibilidade | Boas práticas | SEO | ${metrics.map(([label]) => label).join(' | ')} |`);
console.log(`| --- | --- | --- | --- | --- | --- | ${metrics.map(() => '---').join(' | ')} |`);
for (const row of rows) {
  const cells = row.error
    ? [`erro: ${row.error}`, '', '', '', ...metrics.map(() => '')]
    : [...row.scores, ...row.metrics];
  console.log(`| ${row.page.name} | ${row.formFactor} | ${cells.join(' | ')} |`);
}

for (const row of rows.filter((item) => item.failing?.length)) {
  console.log(`\nAuditorias abaixo de 90 — ${row.page.name} (${row.formFactor}):`);
  for (const audit of row.failing.slice(0, 8)) console.log(`  - ${audit}`);
}
console.log(`\nRelatórios completos (JSON): ${outDir}`);
