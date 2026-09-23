import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { canEditWorkspace } from '@/lib/workspace-auth';
import { workspacePath } from '@/lib/workspace-paths';
import { apiResponse, apiError, apiValidationError } from '@/lib/api-utils';
import { DockerDeploySchema } from '@/lib/validations/api';
import { promises as fs } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function runDocker(args: string[], cwd?: string, timeout = 120000) {
  try {
    return await execFileAsync('docker', args, { cwd, timeout, maxBuffer: 10 * 1024 * 1024, windowsHide: true });
  } catch (err: any) {
    const errorOutput = err.stderr || err.stdout || err.message;
    throw new Error(errorOutput);
  }
}

// In-memory deployment logs & ports tracker
const deploymentLogs = new Map<string, string[]>();
const workspacePorts = new Map<string, number>();

function appendLog(workspaceId: string, text: string) {
  const logs = deploymentLogs.get(workspaceId) || [];
  const lines = text.split('\n').filter(Boolean);
  logs.push(...lines);
  // Keep last 300 lines
  if (logs.length > 300) logs.splice(0, logs.length - 300);
  deploymentLogs.set(workspaceId, logs);
}

// Detect stack and generate Dockerfile
async function detectStackAndGenerateDockerfile(root: string): Promise<{
  stack: string;
  defaultPort: number;
  dockerfile: string;
  isGenerated: boolean;
}> {
  const dockerfilePath = path.join(root, 'Dockerfile');
  try {
    const existing = await fs.readFile(dockerfilePath, 'utf-8');
    // Extract port from EXPOSE if present
    const exposeMatch = existing.match(/EXPOSE\s+(\d+)/i);
    const port = exposeMatch ? parseInt(exposeMatch[1], 10) : 3000;
    return { stack: 'Custom Dockerfile', defaultPort: port, dockerfile: existing, isGenerated: false };
  } catch {}

  // Check package.json
  try {
    const pkgRaw = await fs.readFile(path.join(root, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);

    if (pkg.dependencies?.next || pkg.devDependencies?.next) {
      return {
        stack: 'Next.js Application',
        defaultPort: 3000,
        isGenerated: true,
        dockerfile: `FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || true
EXPOSE 3000
CMD ["npm", "run", "start"]
`,
      };
    }

    if (pkg.dependencies?.vite || pkg.devDependencies?.vite || pkg.dependencies?.react) {
      return {
        stack: 'React + Vite Web App',
        defaultPort: 5173,
        isGenerated: true,
        dockerfile: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
`,
      };
    }

    return {
      stack: 'Node.js Application',
      defaultPort: 3000,
      isGenerated: true,
      dockerfile: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`,
    };
  } catch {}

  // Check Python
  try {
    const hasRequirements = await fs.access(path.join(root, 'requirements.txt')).then(() => true).catch(() => false);
    const hasMainPy = await fs.access(path.join(root, 'main.py')).then(() => true).catch(() => false);
    const hasAppPy = await fs.access(path.join(root, 'app.py')).then(() => true).catch(() => false);

    if (hasRequirements || hasMainPy || hasAppPy) {
      return {
        stack: 'Python Service',
        defaultPort: 8000,
        isGenerated: true,
        dockerfile: `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
`,
      };
    }
  } catch {}

  // Check Go
  try {
    const hasGo = await fs.access(path.join(root, 'go.mod')).then(() => true).catch(() => false);
    if (hasGo) {
      return {
        stack: 'Go Microservice',
        defaultPort: 8080,
        isGenerated: true,
        dockerfile: `FROM golang:1.22-alpine
WORKDIR /app
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
`,
      };
    }
  } catch {}

  // Default Static Web / Universal
  return {
    stack: 'Static Web / Universal',
    defaultPort: 80,
    isGenerated: true,
    dockerfile: `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const parseResult = DockerDeploySchema.safeParse(body);

    if (!parseResult.success) {
      return apiValidationError(parseResult.error);
    }

    const { workspaceId, action, port: customPort, customDockerfile } = parseResult.data;

    const hasAccess = await canEditWorkspace(userId, workspaceId);
    if (!hasAccess) {
      return apiError('Forbidden', 403);
    }

    const root = workspacePath(workspaceId);
    const containerName = `cloudlab-deploy-${workspaceId}`;
    const imageName = `cloudlab-app-${workspaceId}`;

    // Action: detect-stack
    if (action === 'detect-stack') {
      const detection = await detectStackAndGenerateDockerfile(root);
      return apiResponse(detection);
    }

    // Action: logs
    if (action === 'logs') {
      const logs = deploymentLogs.get(workspaceId) || [];
      try {
        const { stdout, stderr } = await runDocker(['logs', '--tail', '100', containerName]);
        const containerLogs = (stdout + '\n' + stderr).split('\n').filter(Boolean);
        return apiResponse({ logs: [...logs, ...containerLogs] });
      } catch {
        return apiResponse({ logs });
      }
    }

    // Action: status
    if (action === 'status') {
      try {
        const { stdout } = await runDocker(['inspect', '--format={{.State.Status}}', containerName]);
        const status = stdout.trim();
        const hostPort = workspacePorts.get(workspaceId) || 3000;
        return apiResponse({
          status,
          containerName,
          hostPort,
          url: status === 'running' ? `http://localhost:${hostPort}` : null,
        });
      } catch {
        return apiResponse({ status: 'not_found', containerName });
      }
    }

    // Action: stop
    if (action === 'stop') {
      try {
        await runDocker(['rm', '-f', containerName]);
        appendLog(workspaceId, `[Docker] Container ${containerName} stopped and removed.`);
        return apiResponse({ success: true, status: 'stopped' });
      } catch (err: any) {
        return apiResponse({ success: true, status: 'stopped', message: err.message });
      }
    }

    // Action: start / build / restart
    if (action === 'start' || action === 'build' || action === 'restart') {
      // 1. Prepare Dockerfile
      const detection = await detectStackAndGenerateDockerfile(root);
      const dockerfileContent = customDockerfile || detection.dockerfile;
      const targetPort = customPort || detection.defaultPort;

      // Save Dockerfile to workspace root
      const dockerfilePath = path.join(root, 'Dockerfile');
      await fs.writeFile(dockerfilePath, dockerfileContent, 'utf-8');

      appendLog(workspaceId, `[Docker] Starting build for stack: ${detection.stack}`);
      appendLog(workspaceId, `[Docker] Building image: ${imageName}...`);

      // 2. Build Docker image
      try {
        const buildRes = await runDocker(['build', '-t', imageName, '.'], root);
        appendLog(workspaceId, buildRes.stdout || buildRes.stderr || 'Build finished successfully.');
      } catch (buildErr: any) {
        appendLog(workspaceId, `[Build Error] ${buildErr.message}`);
        return apiError(`Docker build failed: ${buildErr.message}`, 500);
      }

      // 3. Stop existing container if running
      try {
        await runDocker(['rm', '-f', containerName]);
      } catch {}

      // 4. Find host port (dynamic or assigned)
      const hostPort = customPort || 3100 + (Math.abs(hashCode(workspaceId)) % 500);
      workspacePorts.set(workspaceId, hostPort);

      // 5. Run new container
      appendLog(workspaceId, `[Docker] Running container ${containerName} mapped to host port ${hostPort}...`);
      try {
        await runDocker([
          'run', '-d',
          '--name', containerName,
          '-p', `${hostPort}:${targetPort}`,
          '--restart', 'unless-stopped',
          imageName,
        ]);
        appendLog(workspaceId, `[Docker] Container started successfully on http://localhost:${hostPort}`);
      } catch (runErr: any) {
        appendLog(workspaceId, `[Run Error] ${runErr.message}`);
        return apiError(`Failed to run Docker container: ${runErr.message}`, 500);
      }

      return apiResponse({
        success: true,
        status: 'running',
        containerName,
        stack: detection.stack,
        hostPort,
        url: `http://localhost:${hostPort}`,
      });
    }

    return apiError('Unknown action', 400);
  } catch (error: any) {
    console.error('Docker deployment API error:', error);
    return apiError('Docker operation failed. Ensure Docker Desktop is running.', 500, error.message);
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
