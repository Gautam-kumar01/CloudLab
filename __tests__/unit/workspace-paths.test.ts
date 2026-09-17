import { describe, expect, it } from 'vitest';
import { workspaceFilePath, workspacePath } from '@/lib/workspace-paths';

describe('workspace paths', () => {
  it('creates paths only from safe project identifiers', () => {
    expect(workspacePath('project_123')).toMatch(/workspaces[\\/]project_123$/);
    expect(() => workspacePath('../outside')).toThrow('Invalid workspace identifier');
    expect(() => workspacePath('project/name')).toThrow('Invalid workspace identifier');
  });

  it('rejects absolute and traversal file paths', () => {
    expect(() => workspaceFilePath('project_123', '../secret')).toThrow('Invalid workspace file path');
    expect(() => workspaceFilePath('project_123', '/etc/passwd')).toThrow('Invalid workspace file path');
    expect(workspaceFilePath('project_123', 'src/index.ts')).toMatch(/workspaces[\\/]project_123[\\/]src[\\/]index.ts$/);
  });
});
