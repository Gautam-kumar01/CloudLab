const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

const DockerManager = {
  /**
   * Starts a persistent Docker container for a workspace if it's not already running.
   */
  async startWorkspace(workspaceId, workspacePath) {
    const containerName = `cloudlab-workspace-${workspaceId}`;
    
    try {
      // Check if container already exists and is running
      const status = await this.getWorkspaceStatus(workspaceId);
      
      if (status === 'running') {
        return true;
      }
      
      if (status === 'exited') {
        // Start the stopped container
        await execAsync(`docker start ${containerName}`);
        return true;
      }
      
      // If it doesn't exist, create and start it
      // Using --network="host" (Option A) for easy local development access to ports like 3000
      const dockerCmd = `docker run -d --name ${containerName} --network="host" -v "${workspacePath}:/workspace" --cpus="1.0" --memory="1g" --pids-limit=100 --security-opt="no-new-privileges:true" --label cloudlab.workspace=true cloudlab-base-image sleep infinity`;
      
      await execAsync(dockerCmd);
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
    const containerName = `cloudlab-workspace-${workspaceId}`;
    try {
      await execAsync(`docker rm -f ${containerName}`);
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
    const containerName = `cloudlab-workspace-${workspaceId}`;
    try {
      const { stdout } = await execAsync(`docker inspect -f "{{.State.Status}}" ${containerName}`);
      const status = stdout.trim();
      if (status === 'running') return 'running';
      return 'exited';
    } catch (error) {
      return 'not_found';
    }
  }
};

module.exports = { DockerManager };
