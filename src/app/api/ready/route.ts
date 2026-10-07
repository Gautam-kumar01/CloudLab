import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { WORKSPACES_ROOT } from '@/lib/workspace-paths';
import { promises as fs } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, any> = {};
  let isReady = true;

  // 1. Database Connectivity Check
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    isReady = false;
    checks.database = {
      status: 'unhealthy',
      error: err?.message || 'Database connection error',
    };
  }

  // 2. Storage System Writeability Check
  const storageStart = Date.now();
  try {
    await fs.mkdir(WORKSPACES_ROOT, { recursive: true });
    const probeFile = path.join(WORKSPACES_ROOT, `.probe_${Date.now()}`);
    await fs.writeFile(probeFile, 'health-check', 'utf-8');
    await fs.unlink(probeFile);
    checks.storage = {
      status: 'healthy',
      latencyMs: Date.now() - storageStart,
      root: WORKSPACES_ROOT,
    };
  } catch (err: any) {
    isReady = false;
    checks.storage = {
      status: 'unhealthy',
      error: err?.message || 'Storage write failure',
    };
  }

  // 3. Docker Daemon Availability Check
  const dockerStart = Date.now();
  try {
    await execFileAsync('docker', ['version', '--format', '{{.Server.Version}}'], {
      timeout: 4000,
      windowsHide: true,
    });
    checks.docker = {
      status: 'healthy',
      latencyMs: Date.now() - dockerStart,
    };
  } catch (err: any) {
    // Docker unavailability is degraded mode (hosted sandboxes unavailable), does not completely kill the web server
    checks.docker = {
      status: 'degraded',
      warning: 'Docker daemon is unavailable. Containerized environments will be disabled.',
    };
  }

  const responsePayload = {
    status: isReady ? 'ready' : 'unhealthy',
    timestamp,
    checks,
  };

  return NextResponse.json(responsePayload, {
    status: isReady ? 200 : 503,
  });
}
