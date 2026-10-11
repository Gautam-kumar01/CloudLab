const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { parseDocument } = require('yaml');

const ALLOWED_PREVIEW_PORTS = new Set([3000, 3001, 3002, 5173, 5174, 8000, 8080, 4200, 5000]);
const MAX_CONFIG_BYTES = 16 * 1024;
const MAX_CONTEXT_BYTES = 500 * 1024 * 1024;
const MAX_CONTEXT_FILES = 20000;
const MAX_CONTEXT_DEPTH = 30;
const BLOCKED_ENV_NAMES = new Set([
  'HOME', 'PATH', 'PWD', 'SHELL', 'HOSTNAME', 'PORT', 'LD_PRELOAD', 'LD_LIBRARY_PATH',
  'NODE_OPTIONS', 'PYTHONPATH', 'PYTHONHOME', 'BASH_ENV', 'ENV',
]);
const SKIP_DIRECTORIES = new Set([
  '.git', '.ssh', '.aws', '.azure', '.config', 'node_modules', '.next', '.venv', 'venv', '__pycache__', '.pytest_cache',
  '.mypy_cache', '.turbo', 'coverage',
]);
const SKIP_FILES = new Set([
  'cloudlab.yaml', '.dockerignore', '.npmrc', '.pypirc', '.netrc', '.git-credentials',
  'id_rsa', 'id_ed25519', 'credentials.json',
]);

class RuntimeConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RuntimeConfigError';
  }
}

function fail(message) {
  throw new RuntimeConfigError(message);
}

function validateEnvironmentVariableName(name) {
  if (typeof name !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(name)) {
    fail('Environment variable names must be valid identifiers no longer than 64 characters.');
  }
  if (BLOCKED_ENV_NAMES.has(name)) fail(`The environment variable ${name} is reserved and cannot be configured.`);
  return name;
}

function parseCloudLabConfig(source) {
  if (typeof source !== 'string' || Buffer.byteLength(source, 'utf8') > MAX_CONFIG_BYTES) {
    fail('cloudlab.yaml must be a UTF-8 text file no larger than 16 KB.');
  }

  let document;
  try {
    document = parseDocument(source, {
      schema: 'core',
      version: '1.2',
      uniqueKeys: true,
      maxAliasCount: 0,
      prettyErrors: false,
    });
  } catch {
    fail('cloudlab.yaml contains invalid YAML syntax.');
  }
  if (document.errors?.length) fail('cloudlab.yaml contains invalid or unsupported YAML syntax.');

  let value;
  try {
    value = document.toJS({ maxAliasCount: 0 });
  } catch {
    fail('cloudlab.yaml contains invalid or unsupported YAML values.');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('cloudlab.yaml must contain a single configuration object.');
  }

  const allowedKeys = new Set(['version', 'runtime', 'install', 'start', 'port', 'env']);
  const unknownKeys = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length) fail(`Unsupported cloudlab.yaml key: ${unknownKeys[0]}.`);
  if (value.version !== 1) fail('cloudlab.yaml requires version: 1.');
  if (!['node20', 'python3.12'].includes(value.runtime)) {
    fail('runtime must be one of the supported values: node20 or python3.12.');
  }
  if (!Number.isInteger(value.port) || !ALLOWED_PREVIEW_PORTS.has(value.port)) {
    fail('port must be one of CloudLab’s approved preview ports.');
  }

  const nodeInstall = ['none', 'npm-ci', 'npm-install'];
  const pythonInstall = ['none', 'pip-requirements'];
  const nodeStarts = ['npm-start', 'vite-dev', 'next-dev'];
  const pythonStarts = ['python-http', 'python-main'];
  const validInstall = value.runtime === 'node20' ? nodeInstall : pythonInstall;
  const validStart = value.runtime === 'node20' ? nodeStarts : pythonStarts;
  if (!validInstall.includes(value.install)) {
    fail(`install is not supported for runtime ${value.runtime}.`);
  }
  if (!validStart.includes(value.start)) {
    fail(`start is not supported for runtime ${value.runtime}.`);
  }
  if (value.start === 'vite-dev' && ![5173, 5174].includes(value.port)) {
    fail('vite-dev must use port 5173 or 5174.');
  }
  if (value.start === 'next-dev' && ![3000, 3001, 3002].includes(value.port)) {
    fail('next-dev must use port 3000, 3001, or 3002.');
  }
  if (value.start === 'python-http' && ![8000, 8080].includes(value.port)) {
    fail('python-http must use port 8000 or 8080.');
  }

  const env = value.env === undefined ? [] : value.env;
  if (!Array.isArray(env) || env.length > 32) fail('env must be a list of at most 32 environment-variable names.');
  const seenEnv = new Set();
  for (const name of env) {
    validateEnvironmentVariableName(name);
    if (seenEnv.has(name)) fail(`Duplicate environment-variable reference: ${name}.`);
    seenEnv.add(name);
  }

  return {
    version: 1,
    runtime: value.runtime,
    install: value.install,
    start: value.start,
    port: value.port,
    env,
  };
}

function getStartArgv(config) {
  if (config.runtime === 'node20') {
    if (config.start === 'npm-start') return ['npm', 'start'];
    if (config.start === 'vite-dev') return ['npm', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', String(config.port)];
    if (config.start === 'next-dev') return ['npm', 'run', 'dev', '--', '--hostname', '0.0.0.0', '--port', String(config.port)];
  }
  if (config.runtime === 'python3.12') {
    if (config.start === 'python-http') return ['python', '-m', 'http.server', String(config.port), '--bind', '0.0.0.0'];
    if (config.start === 'python-main') return ['python', 'main.py'];
  }
  fail('No safe start command is available for this configuration.');
}

function createRuntimeDockerfile(config) {
  const argv = getStartArgv(config);
  const json = (items) => JSON.stringify(items);
  if (config.runtime === 'node20') {
    const installLine = config.install === 'npm-ci'
      ? 'RUN npm ci'
      : config.install === 'npm-install'
        ? 'RUN npm install'
        : '';
    return [
      'FROM node:20-alpine',
      'WORKDIR /app',
      'COPY --chown=node:node . /app',
      'USER node',
      `ENV PORT=${config.port}`,
      `EXPOSE ${config.port}`,
      installLine,
      `CMD ${json(argv)}`,
      '',
    ].filter((line) => line !== '').join('\n');
  }

  const installLine = config.install === 'pip-requirements'
    ? 'RUN if [ -f requirements.txt ]; then python -m venv /home/cloudlab/.venv && /home/cloudlab/.venv/bin/pip install --no-cache-dir -r requirements.txt; fi'
    : '';
  return [
    'FROM python:3.12-slim',
    'RUN useradd --create-home --uid 10001 cloudlab',
    'WORKDIR /app',
    'COPY --chown=cloudlab:cloudlab . /app',
    'USER cloudlab',
    'ENV PYTHONUNBUFFERED=1',
    config.install === 'pip-requirements' ? 'ENV PATH=/home/cloudlab/.venv/bin:$PATH' : '',
    `ENV PORT=${config.port}`,
    `EXPOSE ${config.port}`,
    installLine,
    `CMD ${json(argv)}`,
    '',
  ].filter((line) => line !== '').join('\n');
}

function selectRuntimeEnvVars(config, envVars = {}) {
  const selected = {};
  for (const name of config.env) {
    if (!Object.prototype.hasOwnProperty.call(envVars, name)) {
      fail(`Required environment variable ${name} is not configured for this workspace.`);
    }
    const value = envVars[name];
    if (typeof value !== 'string' || value.includes('\0')) {
      fail(`Environment variable ${name} has an invalid value.`);
    }
    selected[name] = value;
  }
  return selected;
}

function redactSecrets(message, envVars = {}) {
  let result = String(message || 'Deployment failed.');
  const secrets = Object.values(envVars).filter((value) => typeof value === 'string' && value.length > 0);
  for (const secret of secrets.sort((a, b) => b.length - a.length)) {
    result = result.split(secret).join('[REDACTED]');
  }
  return result;
}

async function createSafeBuildContext(workspaceRoot, config) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cloudlab-runtime-build-'));
  const contextRoot = path.join(tempRoot, 'context');
  await fs.mkdir(contextRoot, { recursive: true });
  let copiedBytes = 0;
  let copiedFiles = 0;

  async function copyTree(sourceDir, targetDir, depth) {
    if (depth > MAX_CONTEXT_DEPTH) fail('Workspace build context is nested too deeply.');
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const name = entry.name;
      if (name === 'Dockerfile' || name.startsWith('Dockerfile.') || SKIP_FILES.has(name)) continue;
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(name)) continue;
      const sourcePath = path.join(sourceDir, name);
      const targetPath = path.join(targetDir, name);
      const stat = await fs.lstat(sourcePath);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
        await fs.mkdir(targetPath, { recursive: true });
        await copyTree(sourcePath, targetPath, depth + 1);
        continue;
      }
      if (!stat.isFile() || /^\.env(?:\.|$)/i.test(name) || /\.(?:pem|key|p12|pfx)$/i.test(name)) continue;
      copiedBytes += stat.size;
      copiedFiles += 1;
      if (copiedBytes > MAX_CONTEXT_BYTES) fail('Workspace source exceeds the 500 MB runtime build-context limit.');
      if (copiedFiles > MAX_CONTEXT_FILES) fail('Workspace source contains too many files for a runtime build.');
      await fs.copyFile(sourcePath, targetPath);
      await fs.chmod(targetPath, stat.mode & 0o777);
    }
  }

  try {
    await copyTree(workspaceRoot, contextRoot, 0);
    await fs.writeFile(path.join(contextRoot, 'Dockerfile'), createRuntimeDockerfile(config), { mode: 0o600 });
    return {
      contextRoot,
      cleanup: () => fs.rm(tempRoot, { recursive: true, force: true }),
      copiedBytes,
      copiedFiles,
    };
  } catch (error) {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

async function readCloudLabConfigFile(workspaceRoot) {
  const configPath = path.join(workspaceRoot, 'cloudlab.yaml');
  let stat;
  try {
    stat = await fs.lstat(configPath);
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail('cloudlab.yaml must be a regular file inside the workspace.');
  }
  if (stat.size > MAX_CONFIG_BYTES) fail('cloudlab.yaml must be no larger than 16 KB.');
  const [realRoot, realConfigPath] = await Promise.all([fs.realpath(workspaceRoot), fs.realpath(configPath)]);
  if (realConfigPath !== realRoot && !realConfigPath.startsWith(`${realRoot}${path.sep}`)) {
    fail('cloudlab.yaml resolves outside the workspace.');
  }
  return parseCloudLabConfig(await fs.readFile(realConfigPath, 'utf8'));
}

module.exports = {
  ALLOWED_PREVIEW_PORTS,
  RuntimeConfigError,
  validateEnvironmentVariableName,
  parseCloudLabConfig,
  getStartArgv,
  createRuntimeDockerfile,
  selectRuntimeEnvVars,
  redactSecrets,
  createSafeBuildContext,
  readCloudLabConfigFile,
};
