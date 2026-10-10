import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RepoCard from '@/app/dashboard/RepoCard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('RepoCard workspace health', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('does not claim the workspace is ready before a real status check', () => {
    render(<RepoCard project={{ id: 'project-123', name: 'Demo', status: 'ACTIVE', lastAccessed: 'today' }} />);

    expect(screen.getByText('Not checked')).toBeInTheDocument();
    expect(screen.getByText(/Check the container state and configured limits on demand/)).toBeInTheDocument();
  });

  it('fetches authorized runtime health and displays the returned status and actual limits', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          health: {
            status: 'running',
            limits: { cpus: 1, memoryBytes: 1073741824, processLimit: 100 },
            usage: { cpuPercent: '2.5%', memoryUsage: '28MiB / 1GiB', memoryPercent: '2.8%' },
            checkedAt: '2026-10-10T10:00:00.000Z',
          },
        },
      }),
    });

    render(<RepoCard project={{ id: 'project-123', name: 'Demo', status: 'ACTIVE', lastAccessed: 'today' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Check runtime health for Demo' }));

    await waitFor(() => expect(screen.getByText('Running')).toBeInTheDocument());
    expect(screen.getByText(/Limits: 1 vCPU · 1\.0 GiB RAM · 100 processes/)).toBeInTheDocument();
    expect(screen.getByText(/Usage: CPU 2\.5% · RAM 28MiB \/ 1GiB/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/workspace/health?workspaceId=project-123', { cache: 'no-store' });
  });
});
