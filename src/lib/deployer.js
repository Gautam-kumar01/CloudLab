const path = require('node:path');
const fs = require('node:fs/promises');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { workspacePath } = require('./workspace-paths');
const runtimeConfig = require('./runtime-config');

const execFileAsync = promisify(execFile);

async function runCommand(cmd, args, options = {}) {
  return execFileAsync(cmd, args, {
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
    ...options,
  });
}

function getEnvArgs(envVars) {
  return Object.entries(envVars).flatMap(([key, value]) => {
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(key)) {
      throw new Error(`Invalid environment variable name: ${key}`);
    }
    if (typeof value !== 'string' || value.includes('\0')) {
      throw new Error(`Invalid value for environment variable ${key}`);
    }
    return ['--env', `${key}=${value}`];
  });
}

function fallbackDockerfile() {
  return [
    'FROM node:20-alpine',
    'WORKDIR /app',
    'COPY package*.json ./',
    'RUN npm install',
    'COPY . .',
    'EXPOSE 3000 5173 8080',
    'CMD ["npm", "run", "dev"]',
    '',
  ].join('\n');
}

class LocalDockerDeployer {
  async deploy(workspaceId, envVars = {}) {
    const cwd = workspacePath(workspaceId);
    let context = null;
    let selectedEnvVars = envVars;
    let config = null;

    try {
      await runCommand('docker', ['--version'], { timeout: 6000 });
      config = await runtimeConfig.readCloudLabConfigFile(cwd);
      if (config) selectedEnvVars = runtimeConfig.selectRuntimeEnvVars(config, envVars);

      const imageName = `cloudlab-${workspaceId.toLowerCase()}`;
      let targetPort = 3000;

      if (config) {
        targetPort = config.port;
        context = await runtimeConfig.createSafeBuildContext(cwd, config);
        await runCommand(
          'docker',
          ['build', '--tag', imageName, '--file', path.join(context.contextRoot, 'Dockerfile'), context.contextRoot],
          { timeout: 10 * 60 * 1000 },
        );
      } else {
        const dockerfilePath = path.join(cwd, 'Dockerfile');
        try {
          await fs.access(dockerfilePath);
        } catch {
          await fs.writeFile(dockerfilePath, fallbackDockerfile(), 'utf8');
        }
        try {
          const pkg = JSON.parse(await fs.readFile(path.join(cwd, 'package.json'), 'utf8'));
          if (pkg.dependencies?.vite || pkg.devDependencies?.vite) targetPort = 5173;
        } catch {}
        await runCommand('docker', ['build', '--tag', imageName, '.'], {
          cwd,
          timeout: 10 * 60 * 1000,
        });
      }

      const containerName = `${imageName}-container`;
      try {
        await runCommand('docker', ['rm', '-f', containerName], { timeout: 30000 });
      } catch {}

      const hostPort = Math.floor(Math.random() * 10000) + 10000;
      const envArgs = getEnvArgs(selectedEnvVars);
      if (config) envArgs.push('--env', `PORT=${targetPort}`);
      const previewDomain = process.env.PREVIEW_BASE_DOMAIN || 'preview.localhost:3000';
      const now = Date.now();

      try {
        await runCommand('docker', ['network', 'inspect', 'cloudlab-net'], { timeout: 6000 });
      } catch {
        try {
          await runCommand('docker', ['network', 'create', '--driver', 'bridge', 'cloudlab-net'], { timeout: 15000 });
        } catch {}
      }

      await runCommand('docker', [
        'run', '-d', '--publish', `${hostPort}:${targetPort}`,
        ...envArgs,
        '--name', containerName,
        '--network', 'cloudlab-net',
        '--cpus', '1.0',
        '--memory', '1g',
        '--pids-limit', '100',
        '--tmpfs', '/tmp:rw,noexec,nosuid,size=256m',
        '--label', 'cloudlab.deployment=true',
        '--label', `cloudlab.workspace-id=${workspaceId}`,
        '--label', `cloudlab.last-activity=${now}`,
        '--label', 'traefik.enable=true',
        '--label', `traefik.http.routers.${workspaceId}.rule=Host(\`${workspaceId}.${previewDomain}\`)`,
        '--label', `traefik.http.services.${workspaceId}.loadbalancer.server.port=${targetPort}`,
        '--label', `caddy=${workspaceId}.${previewDomain}`,
        '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges:true',
        imageName,
      ], { timeout: 60000 });

      const useSubdomains = process.env.PREVIEW_USE_SUBDOMAINS === 'true';
      return {
        success: true,
        url: useSubdomains
          ? `http://${workspaceId}.${previewDomain}`
          : `/api/preview/${workspaceId}/`,
        targetPort,
        runtime: config?.runtime || null,
      };
    } catch (error) {
      const message = runtimeConfig.redactSecrets(error?.stderr || error?.stdout || error?.message || 'Deployment failed.', envVars);
      console.error('[LocalDockerDeployer] Deployment failed:', message);
      return { success: false, error: message };
    } finally {
      if (context?.cleanup) await context.cleanup().catch(() => {});
    }
  }
}

module.exports = { LocalDockerDeployer, runCommand };
