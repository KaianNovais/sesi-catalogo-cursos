/**
 * Hook PostToolUse (Edit|Write): formata com o Prettier o arquivo que o Claude acabou de editar em
 * frontend/. É silencioso e nunca bloqueia: um erro de sintaxe aparece na verificação do hook Stop.
 *
 * Entrada: JSON do Claude Code no stdin (usa tool_input.file_path, sempre absoluto).
 * Usa o Prettier instalado em frontend/node_modules; sem `npm install`, não faz nada.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

const FORMATTABLE = /\.(?:[cm]?[jt]sx?|css|json|html)$/;
const SKIPPED_DIRECTORY = /(?:^|[\\/])(?:node_modules|dist|coverage)[\\/]/;

const projectRoot = resolve(import.meta.dirname, '..', '..');
const frontendDir = join(projectRoot, 'frontend');
const prettierBin = join(frontendDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs');

const filePath = (await readInput())?.tool_input?.file_path;

if (typeof filePath === 'string' && existsSync(prettierBin)) {
  const relativePath = relative(frontendDir, resolve(filePath));
  const insideFrontend =
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath);

  if (insideFrontend && FORMATTABLE.test(relativePath) && !SKIPPED_DIRECTORY.test(relativePath)) {
    // O cwd em frontend/ faz o Prettier usar .prettierrc.json e .prettierignore de lá.
    spawnSync(process.execPath, [prettierBin, '--write', '--log-level', 'silent', relativePath], {
      cwd: frontendDir,
      stdio: 'ignore',
      timeout: 20_000,
    });
  }
}

process.exit(0);

async function readInput() {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
