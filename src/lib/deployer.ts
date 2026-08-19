import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

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
    const workspacePath = path.resolve(process.cwd(), 'workspaces', workspaceId);
    
    // Check if Docker is installed
    try {
      await execAsync('docker --version');
    } catch (e) {
      return { success: false, error: 'Docker is not installed or not running on the host.' };
    }

    try {
      // 1. Ensure Dockerfile exists, if not create a default Node.js one
      const fs = require('fs');
      const dockerfilePath = path.join(workspacePath, 'Dockerfile');
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
      await execAsync(`docker build -t ${imageName} .`, { cwd: workspacePath });

      // 3. Stop existing container if it exists
      try {
        await execAsync(`docker stop ${imageName}-container`);
        await execAsync(`docker rm ${imageName}-container`);
      } catch (e) {
        // Container might not exist, ignore
      }

      // 4. Run the container
      const hostPort = Math.floor(Math.random() * 10000) + 10000;
      const envArgs = Object.entries(envVars).map(([k, v]) => `-e ${k}="${v}"`).join(' ');
      
      const packageJsonPath = path.join(workspacePath, 'package.json');
      let targetPort = '3000';
      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
          targetPort = '5173';
        }
      }

      await execAsync(`docker run -d -p ${hostPort}:${targetPort} ${envArgs} --name ${imageName}-container ${imageName}`);

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
