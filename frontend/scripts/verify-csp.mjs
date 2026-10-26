/**
 * Confere se a Content-Security-Policy do firebase.json libera os scripts inline do build
 * (dist/index.html) pelo hash SHA-256. Mudou um script inline do index.html? O hash muda, e sem esta
 * verificação o navegador bloquearia o script em produção sem nenhum aviso no build.
 *
 * Uso: node scripts/verify-csp.mjs (roda no fim do `npm run build:firebase`).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const frontendDir = resolve(import.meta.dirname, '..');
const html = readFileSync(join(frontendDir, 'dist', 'index.html'), 'utf8');
const firebase = JSON.parse(readFileSync(join(frontendDir, '..', 'firebase.json'), 'utf8'));

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1] ?? '',
);
const expected = inlineScripts.map(
  (code) => `'sha256-${createHash('sha256').update(code, 'utf8').digest('base64')}'`,
);

const csp = firebase.hosting.headers
  .flatMap((rule) => rule.headers)
  .find((header) => header.key === 'Content-Security-Policy')?.value;

if (!csp) {
  console.error('firebase.json não tem o cabeçalho Content-Security-Policy.');
  process.exit(1);
}

const missing = expected.filter((hash) => !csp.includes(hash));
if (missing.length > 0) {
  console.error(
    `A CSP do firebase.json não libera ${missing.length} script(s) inline do index.html.\n` +
      `Use em script-src os hashes atuais: ${expected.join(' ')}`,
  );
  process.exit(1);
}

console.log(`CSP ok: ${expected.length} script(s) inline liberados por hash.`);
