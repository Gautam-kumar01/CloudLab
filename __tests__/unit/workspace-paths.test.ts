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

  it('rejects null bytes in file paths', () => {
    expect(() => workspaceFilePath('project_123', 'index.ts\0.exe')).toThrow('null byte detected');
  });

  it('blocks reading or modifying .git internal directory unless explicitly allowed', () => {
    expect(() => workspaceFilePath('project_123', '.git')).toThrow('restricted');
    expect(() => workspaceFilePath('project_123', '.git/config')).toThrow('restricted');
    expect(() => workspaceFilePath('project_123', '.git/credentials')).toThrow('restricted');
    expect(() => workspaceFilePath('project_123', 'sub/.git/HEAD')).toThrow('restricted');
    expect(workspaceFilePath('project_123', '.git/config', { allowGit: true })).toMatch(/workspaces[\\/]project_123[\\/]\.git[\\/]config$/);
  });
});

