#!/usr/bin/env node

/**
 * Test del flujo completo con save=true: commit, push y etiqueta.
 *
 * Monta un repositorio git temporal con un remoto local y una API de GitHub
 * falsa (solo recibe la llamada que crea la release), ejecuta la action y
 * comprueba que:
 *   - el commit de version contiene SOLO el fichero de version, aunque en el
 *     workspace haya otros ficheros sin seguimiento (credenciales que deja
 *     google-github-actions/auth, .env generados en el build...) o cambios
 *     ya preparados en el indice;
 *   - la etiqueta se crea sobre ese commit.
 *
 * No toca GitHub ni la red: el push va a un repositorio local y la API es un
 * servidor en 127.0.0.1.
 *
 * Uso:
 *   node test-git.js          # prueba el codigo fuente (index.js)
 *   node test-git.js --dist   # prueba el bundle publicado (dist/index.js)
 */

const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const ENTRY = process.argv.includes('--dist')
  ? path.join(__dirname, 'dist', 'index.js')
  : path.join(__dirname, 'index.js');

const git = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** Servidor que imita POST /repos/{owner}/{repo}/releases */
function startFakeApi() {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, body: body ? JSON.parse(body) : {} });
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end('{"id":1}');
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, requests, port: server.address().port }));
  });
}

/** Crea remoto + copia de trabajo con un fichero de version ya subido */
function setupRepo(versionFile) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pbtc-'));
  const remote = path.join(root, 'remote.git');
  const work = path.join(root, 'work');

  git(root, 'init', '-q', '--bare', '-b', 'main', remote);
  git(root, 'clone', '-q', remote, work);
  git(work, 'config', 'core.autocrlf', 'false');

  const versionPath = path.join(work, versionFile);
  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, JSON.stringify({ name: 'demo', version: '1.0.0' }, null, 2) + '\n');
  fs.writeFileSync(path.join(work, 'README.md'), 'demo\n');
  git(work, 'add', '-A');
  git(work, '-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-q', '-m', 'init');
  git(work, 'push', '-q', 'origin', 'main');

  return { root, remote, work };
}

/** Deja en el workspace lo que un job real puede dejar y nunca debe subirse */
function dirtyWorkspace(work) {
  fs.writeFileSync(path.join(work, 'gha-creds-0123456789abcdef.json'), '{"type":"service_account"}\n');
  fs.writeFileSync(path.join(work, 'build.env'), 'SECRET=1\n');
  fs.writeFileSync(path.join(work, 'README.md'), 'modificado por un paso anterior\n');
  fs.writeFileSync(path.join(work, 'staged.txt'), 'ya en el indice\n');
  git(work, 'add', 'staged.txt');
}

function runAction(work, port, inputs) {
  const outputFile = path.join(work, '..', 'github-output');
  fs.writeFileSync(outputFile, '');

  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('INPUT_') && !key.startsWith('GITHUB_') && !key.startsWith('RUNNER_')) {
      env[key] = value;
    }
  }
  Object.assign(env, {
    GITHUB_WORKSPACE: work,
    GITHUB_OUTPUT: outputFile,
    GITHUB_REPOSITORY: 'demo-owner/demo-repo',
    GITHUB_REF: 'refs/heads/main',
    GITHUB_SHA: git(work, 'rev-parse', 'HEAD'),
    GITHUB_API_URL: `http://127.0.0.1:${port}`,
    INPUT_LANG: 'js',
    INPUT_SAVE: 'true',
    INPUT_GITHUBTOKEN: 'token-de-prueba',
    INPUT_BUMPLVL: 'patch',
    INPUT_TAGPREFIX: '',
    INPUT_PATH: '',
  });
  for (const [name, value] of Object.entries(inputs)) {
    env[`INPUT_${name.toUpperCase()}`] = value;
  }

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [ENTRY], { cwd: work, env });
    let log = '';
    child.stdout.on('data', (d) => { log += d; });
    child.stderr.on('data', (d) => { log += d; });
    child.on('close', (code) => resolve({ code, log, output: fs.readFileSync(outputFile, 'utf8') }));
  });
}

const CASES = [
  { name: 'package.json en la raiz', versionFile: 'package.json', inputs: {} },
  {
    name: 'monorepo con path y tagPrefix',
    versionFile: 'projects/agencies/package.json',
    inputs: { path: './projects/agencies/package.json', tagPrefix: 'agencies-' },
    expectedTag: 'agencies-v1.0.1',
  },
];

async function runCase(testCase) {
  const failures = [];
  const check = (ok, message) => { if (!ok) failures.push(message); };

  const { root, remote, work } = setupRepo(testCase.versionFile);
  const api = await startFakeApi();
  try {
    dirtyWorkspace(work);
    const result = await runAction(work, api.port, testCase.inputs);

    check(result.code === 0, `la action termino con codigo ${result.code}\n${result.log}`);
    check(/version<<[^\r\n]*\r?\n1\.0\.1\r?\n/.test(result.output), 'la salida "version" no es 1.0.1');

    const head = git(remote, 'rev-parse', 'main');
    const message = git(remote, 'log', '-1', '--format=%s', 'main');
    const files = git(remote, 'show', '--name-only', '--format=', 'main').split('\n').filter(Boolean);
    const expectedFile = testCase.versionFile;

    check(message === 'CI: Publish new version', `el ultimo commit del remoto es "${message}"`);
    check(
      files.length === 1 && files[0] === expectedFile,
      `el commit de version debe contener solo ${expectedFile} y contiene: ${files.join(', ')}`,
    );
    const pushedVersion = JSON.parse(git(remote, 'show', `main:${expectedFile}`)).version;
    check(pushedVersion === '1.0.1', `la version subida es ${pushedVersion}`);

    const untracked = git(work, 'status', '--porcelain');
    check(/\?\? gha-creds-0123456789abcdef\.json/.test(untracked), 'gha-creds-*.json no deberia haberse anadido a git');
    check(/\?\? build\.env/.test(untracked), 'build.env no deberia haberse anadido a git');

    const release = api.requests.find((r) => r.method === 'POST' && r.url.endsWith('/releases'));
    check(Boolean(release), 'no se llamo a la API para crear la release');
    if (release) {
      const expectedTag = testCase.expectedTag || 'v1.0.1';
      check(release.body.tag_name === expectedTag, `etiqueta ${release.body.tag_name}, se esperaba ${expectedTag}`);
      check(release.body.target_commitish === head, 'la etiqueta no apunta al commit de version');
    }
  } finally {
    api.server.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
  return failures;
}

(async () => {
  console.log(`Probando ${path.relative(__dirname, ENTRY)}\n`);
  let failed = 0;
  for (const testCase of CASES) {
    const failures = await runCase(testCase);
    if (failures.length === 0) {
      console.log(`✅ ${testCase.name}`);
    } else {
      failed++;
      console.log(`❌ ${testCase.name}`);
      failures.forEach((f) => console.log(`   - ${f}`));
    }
  }
  console.log(failed === 0 ? '\nTodo correcto.' : `\n${failed} caso(s) fallido(s).`);
  process.exit(failed === 0 ? 0 : 1);
})();
