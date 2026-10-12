import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NpmScriptsPanel from '@/app/workspace/NpmScriptsPanel';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NpmScriptsPanel', () => {
  it('runs a script when its full row is clicked', async () => {
    const onRunScript = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({
        data: {
          hasPackageJson: true,
          name: 'demo',
          version: '1.0.0',
          packageManager: 'pnpm',
          scripts: { dev: 'vite --host 0.0.0.0' },
          dependencyCount: 1,
        },
      }),
    }));

    render(<NpmScriptsPanel workspaceId="workspace-1" onRunScript={onRunScript} />);
    const runButton = await screen.findByRole('button', { name: 'Run pnpm script dev' });
    fireEvent.click(runButton);

    expect(onRunScript).toHaveBeenCalledWith('dev', "pnpm run 'dev'");
  });
});
