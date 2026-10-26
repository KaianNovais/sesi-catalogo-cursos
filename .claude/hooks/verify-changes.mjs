/**
 * Portão de verificação (hooks SessionStart e Stop).
 *
 * - SessionStart: cria um marcador de tempo para a sessão, se ainda não existir.
 * - Stop: se algo mudou depois do marcador, roda a verificação da parte afetada:
 *     frontend/ ou data/ → `npm run check` em frontend/;
 *     backend/ ou data/  → build, `dotnet format --verify-no-changes` e `dotnet test` em backend/.
 *   Passou: avança o marcador e libera o fim do turno. Falhou: sai com código 2 e o fim da saída no
 *   stderr, e o Claude Code mantém o turno aberto para o Claude corrigir.
 *
 * Não depende de git (o projeto ainda não tem repositório) e enxerga também mudanças feitas via Bash.
 * Pula a parte cujas ferramentas não estão instaladas (front sem node_modules; back sem .NET SDK) e
 * libera quando o turno já foi estendido por este hook (stop_hook_active), para não prender o Claude
 * em laço. Os testes do back-end precisam do PostgreSQL local rodando (README §6).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, relative, resolve } from 'node:path';

const IGNORED = new Set([
  'node_modules',
  'dist',
  'coverage',
  'public',
  'bin',
  'obj',
  'TestResults',
  '.DS_Store',
]);
const OUTPUT_LINES = 40;
const isWindows = process.platform === 'win32';

const projectRoot = resolve(import.meta.dirname, '..', '..');
const frontendDir = join(projectRoot, 'frontend');
const backendDir = join(projectRoot, 'backend');
const dataDir = join(projectRoot, 'data');

const input = (await readInput()) ?? {};
const sessionId = String(input.session_id ?? 'sem-sessao').replace(/[^\w-]/g, '');
const stampDir = join(tmpdir(), 'claude-sesi-catalogo-cursos');
const stampFile = join(stampDir, `${sessionId}.stamp`);

if (input.hook_event_name === 'SessionStart') {
  ensureStamp();
  process.exit(0);
}

if (input.hook_event_name !== 'Stop' || input.stop_hook_active) process.exit(0);

// Hooks registrados no meio de uma sessão não viram o SessionStart: a linha de base começa agora.
if (!existsSync(stampFile)) {
  ensureStamp();
  process.exit(0);
}

const since = statSync(stampFile).mtimeMs;
const dataChanges = findChanges(dataDir, since);
const checks = [
  {
    name: '`npm run check` em frontend/',
    changed: [...findChanges(frontendDir, since), ...dataChanges],
    available: existsSync(join(frontendDir, 'node_modules')),
    // No Windows, o npm.cmd só roda via shell; o dotnet.exe roda direto (e o caminho dele tem espaço).
    run: () => runSteps(frontendDir, [[isWindows ? 'npm.cmd' : 'npm', ['run', 'check'], isWindows]]),
  },
  {
    name: 'build + format + testes em backend/',
    changed: [...findChanges(backendDir, since), ...dataChanges],
    available: findDotnet() !== null,
    run: () => {
      const dotnet = findDotnet();
      return runSteps(backendDir, [
        [dotnet, ['build', 'CourseCatalog.slnx', '--nologo', '-v', 'q']],
        [dotnet, ['format', 'CourseCatalog.slnx', '--verify-no-changes', '--no-restore']],
        [dotnet, ['test', '--solution', 'CourseCatalog.slnx', '--no-build']],
      ]);
    },
  },
].filter((check) => check.changed.length > 0 && check.available);

if (checks.length === 0) process.exit(0);

const startedAt = new Date();
for (const check of checks) {
  const result = check.run();
  if (result.error) {
    // Falha de infraestrutura (ferramenta ausente, tempo esgotado): avisa sem bloquear o turno.
    process.stderr.write(`Verificação automática não executou (${check.name}): ${result.error}\n`);
    process.exit(1);
  }
  if (!result.ok) {
    const files = check.changed.slice(0, 5).join(', ') + (check.changed.length > 5 ? ', …' : '');
    process.stderr.write(
      `Verificação automática falhou: ${check.name} (alterados: ${files}).\n` +
        'Corrija antes de encerrar o turno. Se a falha for esperada, explique isso ao autor.\n\n' +
        `${result.output}\n`,
    );
    process.exit(2);
  }
}

utimesSync(stampFile, startedAt, startedAt);
process.exit(0);

/** Roda os comandos ([comando, argumentos, usarShell]) em sequência e para no primeiro que falhar. */
function runSteps(cwd, steps) {
  for (const [command, args, shell = false] of steps) {
    const result = spawnSync(command, args, {
      cwd,
      encoding: 'utf8',
      shell,
      timeout: 170_000,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1' },
    });
    if (result.error) return { ok: false, error: result.error.message };
    if (result.status !== 0) {
      const output = `${result.stdout}\n${result.stderr}`.trim().split('\n').slice(-OUTPUT_LINES).join('\n');
      return { ok: false, output: `$ ${[command, ...args].join(' ')}\n${output}` };
    }
  }
  return { ok: true };
}

/** O SDK do .NET pode não estar no PATH do aplicativo (ex.: instalado depois de abri-lo). */
function findDotnet() {
  const executable = isWindows ? 'dotnet.exe' : 'dotnet';
  const candidates = [
    process.env.DOTNET_ROOT && join(process.env.DOTNET_ROOT, executable),
    ...(process.env.PATH ?? '').split(delimiter).map((dir) => dir && join(dir, executable)),
    '/usr/local/share/dotnet/dotnet',
    '/usr/share/dotnet/dotnet',
    'C:\\Program Files\\dotnet\\dotnet.exe',
  ];
  return candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

function ensureStamp() {
  if (existsSync(stampFile)) return;
  mkdirSync(stampDir, { recursive: true });
  writeFileSync(stampFile, '');
}

/** Arquivos modificados e pastas com entradas criadas ou apagadas (o mtime da pasta muda). */
function findChanges(dir, since) {
  if (!existsSync(dir)) return [];
  const changes = statSync(dir).mtimeMs > since ? [`${relative(projectRoot, dir)}/`] : [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) changes.push(...findChanges(fullPath, since));
    else if (statSync(fullPath).mtimeMs > since) changes.push(relative(projectRoot, fullPath));
  }
  return changes;
}

async function readInput() {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
