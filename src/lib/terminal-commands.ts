import type { Socket } from 'socket.io-client';

const PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);

function quotePosixArgument(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function buildPackageScriptCommand(packageManager: string, scriptName: string): string {
  const manager = PACKAGE_MANAGERS.has(packageManager) ? packageManager : 'npm';
  return `${manager} run ${quotePosixArgument(scriptName)}`;
}

export function sendTerminalInput(socket: Socket | null, terminalId: string, data: string): boolean {
  if (!socket?.connected || !terminalId || typeof data !== 'string' || data.length === 0) {
    return false;
  }
  socket.emit('terminal.toTerm', { id: terminalId, data });
  return true;
}
