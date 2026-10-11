export interface DeployResult {
  success: boolean;
  url?: string;
  targetPort?: number;
  runtime?: string | null;
  error?: string;
}

export interface Deployer {
  deploy(workspaceId: string, envVars: Record<string, string>): Promise<DeployResult>;
}

const CjsLocalDockerDeployer = require('./deployer.js').LocalDockerDeployer as new () => Deployer;

export class LocalDockerDeployer implements Deployer {
  private readonly delegate = new CjsLocalDockerDeployer();

  deploy(workspaceId: string, envVars: Record<string, string> = {}): Promise<DeployResult> {
    return this.delegate.deploy(workspaceId, envVars);
  }
}
