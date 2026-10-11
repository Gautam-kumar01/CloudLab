import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const {
  createRuntimeDockerfile,
  createSafeBuildContext,
  parseCloudLabConfig,
  selectRuntimeEnvVars,
} = require('../../src/lib/runtime-config.js');

const tempDirs: string[] = [];
const nodeConfig = `version: 1\nruntime: node20\ninstall: npm-ci\nstart: vite-dev\nport: 5173\nenv:\n  - APP_API_URL\n`;

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

describe('cloudlab.yaml runtime configuration', () => {
  it('parses an allowlisted Node manifest and returns only normalized fields', () => {
    expect(parseCloudLabConfig(nodeConfig)).toEqual({
      version: 1,
      runtime: 'node20',
      install: 'npm-ci',
      start: 'vite-dev',
      port: 5173,
      env: ['APP_API_URL'],
    });
  });

  it('parses the supported Python HTTP preset', () => {
    expect(parseCloudLabConfig('version: 1\nruntime: python3.12\ninstall: none\nstart: python-http\nport: 8000')).toMatchObject({
      runtime: 'python3.12',
      start: 'python-http',
      port: 8000,
      env: [],
    });
  });

  it.each([
    ['arbitrary image key', `${nodeConfig}image: attacker/privileged:latest\n`],
    ['arbitrary command key', `${nodeConfig}command: "curl bad | sh"\n`],
    ['unsupported port', nodeConfig.replace('5173', '2375')],
    ['runtime/install mismatch', nodeConfig.replace('npm-ci', 'pip-requirements')],
    ['reserved port environment', nodeConfig.replace('APP_API_URL', 'PORT')],
    ['duplicate env reference', `${nodeConfig}  - APP_API_URL\n`],
    ['duplicate YAML key', `${nodeConfig}port: 8080\n`],
    ['invalid YAML', 'version: [\n'],
  ])('rejects %s', (_name, source) => {
    expect(() => parseCloudLabConfig(source)).toThrow();
  });

  it('generates only fixed, non-root image commands and never interpolates free-form shell text', () => {
    const config = parseCloudLabConfig(nodeConfig);
    const dockerfile = createRuntimeDockerfile(config);
    expect(dockerfile).toContain('FROM node:20-alpine');
    expect(dockerfile).toContain('USER node');
    expect(dockerfile).toContain('RUN npm ci');
    expect(dockerfile).toContain('EXPOSE 5173');
    expect(dockerfile).toContain('CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]');
    expect(dockerfile).not.toContain('sh -c');
  });

  it('passes only explicitly referenced environment variables', () => {
    const config = parseCloudLabConfig(nodeConfig);
    expect(selectRuntimeEnvVars(config, {
      APP_API_URL: 'https://api.example.test',
      UNUSED_SECRET: 'not-passed',
    })).toEqual({ APP_API_URL: 'https://api.example.test' });
    expect(() => selectRuntimeEnvVars(config, {})).toThrow(/APP_API_URL/);
  });

  it('stages a build context without environment files, registry credentials, or symlinks', async () => {
    const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'cloudlab-runtime-test-'));
    tempDirs.push(workspace);
    await fs.writeFile(path.join(workspace, 'index.js'), 'console.log("ok")');
    await fs.writeFile(path.join(workspace, '.env'), 'SECRET=must-not-copy');
    await fs.writeFile(path.join(workspace, '.npmrc'), '//registry.example/:_authToken=hidden');
    const outside = path.join(workspace, '..', `outside-${path.basename(workspace)}.txt`);
    await fs.writeFile(outside, 'outside');
    tempDirs.push(outside);
    await fs.symlink(outside, path.join(workspace, 'linked-secret.txt'));

    const staged = await createSafeBuildContext(workspace, parseCloudLabConfig(nodeConfig));
    tempDirs.push(path.dirname(staged.contextRoot));
    const names = await fs.readdir(staged.contextRoot);
    expect(names).toContain('index.js');
    expect(names).toContain('Dockerfile');
    expect(names).not.toContain('.env');
    expect(names).not.toContain('.npmrc');
    expect(names).not.toContain('linked-secret.txt');
    await staged.cleanup();
  });
});
