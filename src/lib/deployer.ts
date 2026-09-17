import path from 'node:path';
import fs from 'node:fs';
import { workspacePath } from './workspace-paths';
import { runCommand } from './process';

export interface DeployResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface Deployer {
  deploy(workspaceId: string, envVars: Record<string, string>): Promise<DeployResult>;
}

export class LocalDockerDeployer implements Deployer {
  async deploy(workspaceId: string, envVars: Record<string, string>): Promise<DeployResult> {
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
        // Fallback Dockerfile for Node/React/Vite apps
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
        // Container might not exist, ignore
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
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
          targetPort = '5173';
        }
      }

      await runCommand('docker', [
        'run', '-d', '--publish', `${hostPort}:${targetPort}`,
        ...envArgs, '--name', `${imageName}-container`,
        '--label', 'cloudlab.deployment=true', '--network', 'bridge',
        '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges:true',
        imageName,
      ], { timeout: 60_000 });

      return {
        success: true,
        url: `http://localhost:${hostPort}`
      };

    } catch (error: any) {
      console.error('Docker Deployment Error:', error);
      return { success: false, error: error.message };
    }
  }
}
