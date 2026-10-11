const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const fs = require('node:fs');

const execFileAsync = promisify(execFile);
const WORKSPACES_ROOT = path.resolve(process.cwd(), 'workspaces');

function assertWorkspaceId(workspaceId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(workspaceId)) throw new Error('Invalid workspace identifier');
}

function containerName(workspaceId) {
  assertWorkspaceId(workspaceId);
  return `cloudlab-workspace-${workspaceId}`;
}

function getTerminalStartupMessage(error) {
  const details = `${error?.stderr || ''} ${error?.message || ''}`;
  if (/spawn docker ENOENT|docker(?:\.exe)? is not recognized|command not found/i.test(details)) {
    return 'Docker CLI is missing from the CloudLab server. Rebuild and redeploy the app image with Docker CLI support.';
  }
  if (/permission denied.*docker\.sock|docker\.sock.*permission denied/i.test(details)) {
    return 'CloudLab cannot access the Docker socket. Grant the app service access to /var/run/docker.sock using the socket group ID.';
  }
  if (/cannot connect to the docker daemon|is the docker daemon running|docker\.sock|no such file or directory.*docker/i.test(details)) {
    return 'No Docker Engine is reachable from this app. Run CloudLab on a Docker-capable host and mount /var/run/docker.sock (or configure a supported Docker Engine endpoint).';
  }
  if (/Dockerfile\.workspace|cloudlab-base-image/i.test(details)) {
    return 'CloudLab could not prepare its workspace terminal image. Check that Dockerfile.workspace is present and Docker can build images.';
  }
  return 'CloudLab could not start the workspace container. Check Docker Engine access and the server logs, then retry.';
}

async function docker(args, timeout = 30000) {
  return execFileAsync('docker', args, { timeout, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
}

// In-memory workspace activity tracking
const activityMap = new Map();

const DockerManager = {
  /**
   * Ensures the isolated bridge network exists for CloudLab multi-tenant routing.
   */
  async ensureNetwork(networkName = 'cloudlab-net') {
    try {
      await docker(['network', 'inspect', networkName]);
    } catch {
      try {
        await docker(['network', 'create', '--driver', 'bridge', networkName]);
        console.log(`[DockerManager] Created bridge network: ${networkName}`);
      } catch (createError) {
        try {
          await docker(['network', 'inspect', networkName]);
        } catch {
          throw createError;
        }
      }
    }
    return networkName;
  },

  async ensureWorkspaceImage() {
    const imageName = 'cloudlab-base-image';
    try {
      await docker(['image', 'inspect', imageName]);
      return imageName;
    } catch {
      const dockerfile = path.resolve(process.cwd(), 'Dockerfile.workspace');
      if (!fs.existsSync(dockerfile)) {
        throw new Error('Dockerfile.workspace is missing from the CloudLab server image');
      }
      console.log('[DockerManager] Building the workspace terminal image on first use');
      await docker(['build', '--tag', imageName, '--file', dockerfile, process.cwd()], 10 * 60 * 1000);
      return imageName;
    }
  },

  /**
   * Records recent user interaction with a workspace.
   */
  touchActivity(workspaceId) {
    if (workspaceId && /^[a-zA-Z0-9_-]+$/.test(workspaceId)) {
      activityMap.set(workspaceId, Date.now());
    }
  },

  /**
   * Gets the last activity timestamp for a workspace.
   */
  getActivity(workspaceId) {
    return activityMap.get(workspaceId) || 0;
  },

  /**
   * Starts a persistent Docker container for a workspace if it's not already running.
   */
  async startWorkspace(workspaceId, workspacePath) {
    assertWorkspaceId(workspaceId);
    const name = containerName(workspaceId);
    const root = path.resolve(/* turbopackIgnore: true */ workspacePath || path.join(WORKSPACES_ROOT, workspaceId));
    if (root !== WORKSPACES_ROOT && !root.startsWith(`${WORKSPACES_ROOT}${path.sep}`)) {
      throw new Error('Workspace path is outside the workspace root');
    }
    try {
      await docker(['info', '--format={{.ServerVersion}}'], 10000);
      this.touchActivity(workspaceId);
      const status = await this.getWorkspaceStatus(workspaceId);
      if (status === 'running') return true;
      if (status === 'exited') {
        await docker(['start', name]);
        return true;
      }

      const imageName = await this.ensureWorkspaceImage();
      await this.ensureNetwork();
      const previewDomain = process.env.PREVIEW_BASE_DOMAIN || 'preview.localhost:3000';
      const now = Date.now();
      const dockerWorkspaceRoot = path.resolve(process.env.CLOUDLAB_DOCKER_WORKSPACES_ROOT || WORKSPACES_ROOT);
      const dockerWorkspacePath = path.join(dockerWorkspaceRoot, workspaceId);

      await docker([
        'run', '-d', '--name', name,
        '--network', 'cloudlab-net',
        '--volume', `${dockerWorkspacePath}:/workspace:rw`,
        '--cpus', '1.0', '--memory', '1g', '--pids-limit', '100',
        '--security-opt', 'no-new-privileges:true', '--cap-drop', 'ALL',
        '--tmpfs', '/tmp:rw,noexec,nosuid,size=256m',
        '--label', 'cloudlab.workspace=true',
        '--label', `cloudlab.workspace-id=${workspaceId}`,
        '--label', `cloudlab.last-activity=${now}`,
        '--label', 'traefik.enable=true',
        '--label', `traefik.http.routers.${workspaceId}.rule=Host(\`${workspaceId}.${previewDomain}\`)`,
        '--label', `caddy=${workspaceId}.${previewDomain}`,
        imageName, 'sleep', 'infinity',
      ], 60000);
      return true;
    } catch (error) {
      console.error(`Failed to start Docker workspace ${workspaceId}:`, error);
      throw error;
    }
  },

  /**
   * Stops and removes a workspace container.
   */
  async stopWorkspace(workspaceId) {
    try {
      activityMap.delete(workspaceId);
      await docker(['rm', '-f', containerName(workspaceId)]);
      return true;
    } catch (error) {
      console.warn(`Failed to stop/remove Docker workspace ${workspaceId} (may not exist)`);
      return true;
    }
  },

  /**
   * Gets the status of a workspace container.
   * Returns 'running', 'exited', or 'not_found'.
   */
  async getWorkspaceStatus(workspaceId) {
    try {
      const { stdout } = await docker(['inspect', '--format={{.State.Status}}', containerName(workspaceId)]);
      const status = stdout.trim();
      if (status === 'running') return 'running';
      return 'exited';
    } catch (error) {
      return 'not_found';
    }
  },

  /**
   * Reads normalized health and actual resource limits for one authorized workspace.
   * The caller must authorize the project before invoking this method.
   */
  async getWorkspaceHealth(workspaceId) {
    const checkedAt = new Date().toISOString();
    try {
      const { stdout } = await docker(['inspect', containerName(workspaceId)], 10000);
      const inspected = JSON.parse(stdout);
      const info = Array.isArray(inspected) ? inspected[0] : inspected;
      if (!info || typeof info !== 'object') {
        return { status: 'unknown', limits: null, usage: null, checkedAt };
      }

      const state = info.State?.Status;
      const allowedStates = new Set(['running', 'exited', 'created', 'restarting', 'paused', 'dead', 'removing']);
      const status = allowedStates.has(state) ? state : 'unknown';
      const hostConfig = info.HostConfig || {};
      const nanoCpus = Number(hostConfig.NanoCpus);
      const cpuQuota = Number(hostConfig.CpuQuota);
      const cpuPeriod = Number(hostConfig.CpuPeriod);
      const cpus = nanoCpus > 0
        ? nanoCpus / 1e9
        : cpuQuota > 0 && cpuPeriod > 0
          ? cpuQuota / cpuPeriod
          : null;
      const memoryBytes = Number(hostConfig.Memory);
      const processLimit = Number(hostConfig.PidsLimit);
      const limits = {
        cpus: cpus === null ? null : Number(cpus.toFixed(2)),
        memoryBytes: memoryBytes > 0 ? memoryBytes : null,
        processLimit: processLimit > 0 ? processLimit : null,
      };

      let usage = null;
      if (status === 'running') {
        try {
          const { stdout: statsOutput } = await docker([
            'stats', '--no-stream', '--format', '{{json .}}', containerName(workspaceId),
          ], 10000);
          const stats = JSON.parse(statsOutput.trim().split('\n')[0]);
          const validPercent = (value) => typeof value === 'string' && /^\d+(?:\.\d+)?%$/.test(value) ? value : null;
          const memoryUsage = typeof stats.MemUsage === 'string' && /^[\d.,]+\s*[KMGT]?i?B\s*\/\s*[\d.,]+\s*[KMGT]?i?B$/i.test(stats.MemUsage)
            ? stats.MemUsage
            : null;
          usage = {
            cpuPercent: validPercent(stats.CPUPerc),
            memoryUsage,
            memoryPercent: validPercent(stats.MemPerc),
          };
        } catch (error) {
          // Keep lifecycle/limit data available when Docker stats is unsupported or unavailable.
        }
      }

      return { status, limits, usage, checkedAt };
    } catch (error) {
      const message = `${error?.stderr || ''} ${error?.message || ''}`;
      if (/no such (?:object|container)/i.test(message)) {
        return { status: 'stopped', limits: null, usage: null, checkedAt };
      }
      return { status: 'unavailable', limits: null, usage: null, checkedAt };
    }
  },

  /**
   * Lists all running CloudLab workspace and deployment containers.
   */
  async listContainers() {
    try {
      const { stdout } = await docker(['ps', '--filter', 'label=cloudlab.workspace-id', '--format', '{{json .}}']);
      const lines = stdout.trim().split('\n').filter(Boolean);
      return lines.map(line => {
        try {
          const item = JSON.parse(line);
          const labels = item.Labels || '';
          item.isDeployment = labels.includes('cloudlab.deployment=true');
          item.isWorkspace = labels.includes('cloudlab.workspace=true');
          return item;
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Error listing containers:', error);
      return [];
    }
  },

  /**
   * Kills any docker container by name or ID (useful for Admin force kill).
   */
  async killContainer(containerId) {
    if (!/^[a-f0-9]{12,64}$/i.test(containerId) && !/^cloudlab-[a-zA-Z0-9_-]+$/.test(containerId)) {
      throw new Error('Invalid container identifier');
    }
    try {
      await docker(['rm', '-f', containerId]);
      return true;
    } catch (error) {
      console.error(`Failed to force kill container ${containerId}:`, error);
      return false;
    }
  },

  /**
   * Reaps idle workspace and deployment containers that have had no user activity.
   */
  async terminateIdleContainers(maxIdleMinutes = 30) {
    const maxIdleMs = maxIdleMinutes * 60 * 1000;
    const now = Date.now();
    const reaped = [];

    try {
      // Query all CloudLab managed containers (both workspace sandboxes and deployment containers)
      const { stdout } = await docker([
        'ps',
        '--filter', 'label=cloudlab.workspace-id',
        '--format', '{{.ID}}\t{{.Names}}\t{{.Labels}}'
      ]);

      const lines = stdout.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        const parts = line.split('\t');
        const cName = parts[1];
        const labelsStr = parts[2] || '';
        if (!cName) continue;

        const wsMatch = labelsStr.match(/cloudlab\.workspace-id=([^,]+)/);
        const workspaceId = wsMatch ? wsMatch[1] : null;

        let lastAct = workspaceId ? activityMap.get(workspaceId) : 0;
        if (!lastAct) {
          const actMatch = labelsStr.match(/cloudlab\.last-activity=([^,]+)/);
          if (actMatch) {
            lastAct = parseInt(actMatch[1], 10) || 0;
          }
        }

        if (!lastAct) {
          if (workspaceId) activityMap.set(workspaceId, now);
          continue;
        }

        if (now - lastAct > maxIdleMs) {
          const idleMins = Math.round((now - lastAct) / 60000);
          const isDeployment = labelsStr.includes('cloudlab.deployment=true');
          const typeStr = isDeployment ? 'deployment' : 'workspace';
          console.log(`[Idle Reaper] Terminating idle ${typeStr} container ${cName} (inactive for ${idleMins}m)`);
          try {
            await docker(['stop', cName]);
            if (workspaceId) activityMap.delete(workspaceId);
            reaped.push({ container: cName, workspaceId, idleMinutes: idleMins, type: typeStr });
          } catch (stopErr) {
            console.error(`[Idle Reaper] Error stopping ${cName}:`, stopErr);
          }
        }
      }
    } catch (err) {
      // Docker may not be available or command timed out
    }

    return reaped;
  },

  containerName,
};

module.exports = { DockerManager, getTerminalStartupMessage };
