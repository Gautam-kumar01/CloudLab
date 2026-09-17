const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');

const execFileAsync = promisify(execFile);
const WORKSPACES_ROOT = path.resolve(process.cwd(), 'workspaces');

function assertWorkspaceId(workspaceId) {
  if (!/^[a-zA-Z0-9_-]+$/.test(workspaceId)) throw new Error('Invalid workspace identifier');
}

function containerName(workspaceId) {
  assertWorkspaceId(workspaceId);
  return `cloudlab-workspace-${workspaceId}`;
}

async function docker(args, timeout = 30000) {
  return execFileAsync('docker', args, { timeout, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
}

const DockerManager = {
  /**
   * Starts a persistent Docker container for a workspace if it's not already running.
   */
  async startWorkspace(workspaceId, workspacePath) {
    assertWorkspaceId(workspaceId);
    const name = containerName(workspaceId);
    const root = path.resolve(workspacePath || path.join(WORKSPACES_ROOT, workspaceId));
    if (root !== WORKSPACES_ROOT && !root.startsWith(`${WORKSPACES_ROOT}${path.sep}`)) {
      throw new Error('Workspace path is outside the workspace root');
    }
    try {
      const status = await this.getWorkspaceStatus(workspaceId);
      if (status === 'running') return true;
      if (status === 'exited') {
        await docker(['start', name]);
        return true;
      }
      await docker([
        'run', '-d', '--name', name,
        '--network', 'bridge',
        '--volume', `${root}:/workspace:rw`,
        '--cpus', '1.0', '--memory', '1g', '--pids-limit', '100',
        '--security-opt', 'no-new-privileges:true', '--cap-drop', 'ALL',
        '--tmpfs', '/tmp:rw,noexec,nosuid,size=256m',
        '--label', 'cloudlab.workspace=true',
        '--label', `cloudlab.workspace-id=${workspaceId}`,
        'cloudlab-base-image', 'sleep', 'infinity',
      ], 60000);
      return true;
    } catch (error) {
      console.error(`Failed to start Docker workspace ${workspaceId}:`, error);
      return false;
    }
  },

  /**
   * Stops and removes a workspace container.
   */
  async stopWorkspace(workspaceId) {
    try {
      await docker(['rm', '-f', containerName(workspaceId)]);
      return true;
    } catch (error) {
      // If it fails, the container probably doesn't exist, which is fine
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
   * Lists all running CloudLab workspace containers.
   */
  async listContainers() {
    try {
      // Get all containers labeled with cloudlab.workspace=true
      const { stdout } = await docker(['ps', '--filter', 'label=cloudlab.workspace=true', '--format', '{{json .}}']);
      const lines = stdout.trim().split('\n').filter(Boolean);
      return lines.map(line => {
        try {
          return JSON.parse(line);
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
    if (!/^[a-f0-9]{12,64}$/i.test(containerId) && !/^cloudlab-workspace-[a-zA-Z0-9_-]+$/.test(containerId)) {
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
  containerName,
};

module.exports = { DockerManager };
