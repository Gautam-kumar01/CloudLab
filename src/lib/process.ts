import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function runCommand(
  command: string,
  args: string[],
  options: { cwd?: string; timeout?: number; maxBuffer?: number; env?: NodeJS.ProcessEnv } = {},
) {
  return execFileAsync(command, args, {
    cwd: options.cwd,
    env: options.env,
    timeout: options.timeout ?? 30_000,
    maxBuffer: options.maxBuffer ?? 2 * 1024 * 1024,
    windowsHide: true,
  });
}
