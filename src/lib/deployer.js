const path = require('node:path');
const fs = require('node:fs');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { workspacePath } = require('./workspace-paths');

const execFileAsync = promisify(execFile);

async function runCommand(cmd, args, options = {}) {
  return execFileAsync(cmd, args, {
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
    ...options,
  });
}

class LocalDockerDeployer {
  async deploy(workspaceId, envVars = {}) {
    const cwd = workspacePath(workspaceId);

    // Check if Docker is installed
    try {
      await runCommand('docker', ['--version']);
    } catch (e) {
      return { success: false, error: 'Docker is not installed or not running on the host.' };
    }

    try {
      // 1. Ensure Dockerfile exists, if not create a default Node.js one
      const dockerfilePath = path.join(cwd, 'Dockerfile');
      if (!fs.existsSync(dockerfilePath)) {
        const defaultDockerfile = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 5173 8080
CMD ["npm", "run", "dev"]
        `.trim();
        fs.writeFileSync(dockerfilePath, defaultDockerfile, 'utf-8');
      }

      // 2. Build the Docker image
      const imageName = `cloudlab-${workspaceId.toLowerCase()}`;
      await runCommand('docker', ['build', '--tag', imageName, '.'], { cwd, timeout: 10 * 60 * 1000 });

      // 3. Stop existing container if it exists
      try {
        await runCommand('docker', ['stop', `${imageName}-container`]);
        await runCommand('docker', ['rm', `${imageName}-container`]);
      } catch (e) {
        // Container might not exist
      }

      // 4. Run the container
      const hostPort = Math.floor(Math.random() * 10000) + 10000;
      const envArgs = Object.entries(envVars).flatMap(([key, value]) => {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new Error(`Invalid environment variable name: ${key}`);
        return ['--env', `${key}=${value}`];
      });

      const packageJsonPath = path.join(cwd, 'package.json');
      let targetPort = '3000';
      if (fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
            targetPort = '5173';
          }
        } catch {}
      }

      const previewDomain = process.env.PREVIEW_BASE_DOMAIN || 'preview.localhost:3000';
      const now = Date.now();

      // Ensure network exists
      try {
        await runCommand('docker', ['network', 'create', '--driver', 'bridge', 'cloudlab-net']);
      } catch {}

      await runCommand(
        'docker',
        [
          'run',
          '-d',
          '--publish',
          `${hostPort}:${targetPort}`,
          ...envArgs,
          '--name',
          `${imageName}-container`,
          '--network',
          'cloudlab-net',
          '--cpus',
          '1.0',
          '--memory',
          '1g',
          '--pids-limit',
          '100',
          '--tmpfs',
          '/tmp:rw,noexec,nosuid,size=256m',
          '--label',
          'cloudlab.deployment=true',
          '--label',
          `cloudlab.workspace-id=${workspaceId}`,
          '--label',
          `cloudlab.last-activity=${now}`,
          '--label',
          'traefik.enable=true',
          '--label',
          `traefik.http.routers.${workspaceId}.rule=Host(\`${workspaceId}.${previewDomain}\`)`,
          '--label',
          `traefik.http.services.${workspaceId}.loadbalancer.server.port=${targetPort}`,
          '--label',
          `caddy=${workspaceId}.${previewDomain}`,
          '--cap-drop',
          'ALL',
          '--security-opt',
          'no-new-privileges:true',
          imageName,
        ],
        { timeout: 60_000 }
      );

      const useSubdomain = process.env.PREVIEW_USE_SUBDOMAINS === 'true';
      const displayUrl = useSubdomain
        ? `http://${workspaceId}.${previewDomain}`
        : `/api/preview/${workspaceId}/`;

      return {
        success: true,
        url: displayUrl,
      };
    } catch (error) {
      console.error('Docker Deployment Error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = { LocalDockerDeployer };
