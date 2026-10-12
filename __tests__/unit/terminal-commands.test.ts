import { describe, expect, it, vi } from 'vitest';
import type { Socket } from 'socket.io-client';
import { buildPackageScriptCommand, sendTerminalInput } from '@/lib/terminal-commands';

describe('terminal command helpers', () => {
  it('uses the detected package manager and shell-quotes script names', () => {
    expect(buildPackageScriptCommand('pnpm', 'dev')).toBe("pnpm run 'dev'");
    expect(buildPackageScriptCommand('yarn', 'build; touch /tmp/pwned')).toBe("yarn run 'build; touch /tmp/pwned'");
    expect(buildPackageScriptCommand('unexpected', 'dev')).toBe("npm run 'dev'");
  });

  it('escapes embedded single quotes in package script names', () => {
    expect(buildPackageScriptCommand('npm', "build'test")).toBe("npm run 'build'\\''test'");
  });

  it('sends input using the event handled by the terminal server', () => {
    const emit = vi.fn();
    const socket = { connected: true, emit } as unknown as Socket;

    expect(sendTerminalInput(socket, 'term-1', "pnpm run 'dev'\r")).toBe(true);
    expect(emit).toHaveBeenCalledWith('terminal.toTerm', {
      id: 'term-1',
      data: "pnpm run 'dev'\r",
    });
  });

  it('does not silently report success when the socket is disconnected', () => {
    const emit = vi.fn();
    const socket = { connected: false, emit } as unknown as Socket;

    expect(sendTerminalInput(socket, 'term-1', 'npm run dev\r')).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });
});
