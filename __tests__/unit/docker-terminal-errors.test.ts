import { describe, expect, it } from 'vitest';

const { getTerminalStartupMessage } = require('../../src/lib/docker-manager.js');

describe('workspace terminal startup diagnostics', () => {
  it('explains when Docker CLI is missing from the application image', () => {
    expect(getTerminalStartupMessage({ message: 'spawn docker ENOENT' })).toMatch(/Docker CLI is missing/);
  });

  it('explains when the application cannot reach a Docker Engine', () => {
    expect(getTerminalStartupMessage({ stderr: 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock' }))
      .toMatch(/No Docker Engine is reachable/);
  });

  it('explains Docker socket permission failures', () => {
    expect(getTerminalStartupMessage({ stderr: 'permission denied while trying to connect to /var/run/docker.sock' }))
      .toMatch(/cannot access the Docker socket/i);
  });

  it('explains when the terminal image cannot be prepared', () => {
    expect(getTerminalStartupMessage({ message: 'Dockerfile.workspace is missing' }))
      .toMatch(/could not prepare its workspace terminal image/i);
  });

  it('does not expose arbitrary Docker error output to the terminal client', () => {
    expect(getTerminalStartupMessage({ stderr: 'private-host-path and private-secret-value' }))
      .toBe('No isolated workspace terminal could start. CloudLab will not run commands on the shared app host. Check Docker Engine/socket access and the workspace bind mount, or connect a dedicated isolated runner.');
  });
});
