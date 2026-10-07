import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';

export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    let containerStats: any[] = [];
    let dockerRunning = false;

    try {
      const { stdout } = await execFileAsync(
        'docker',
        ['stats', '--no-stream', '--format', '{{json .}}'],
        { timeout: 8000, windowsHide: true }
      );
      dockerRunning = true;
      const lines = stdout.split('\n').filter((line) => line.trim().length > 0);
      containerStats = lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (dockerErr: any) {
      dockerRunning = false;
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);

    const systemMetrics = {
      platform: os.platform(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      totalMemoryBytes: totalMem,
      freeMemoryBytes: freeMem,
      usedMemoryBytes: usedMem,
      memoryUsagePercent: parseFloat(memPercentage),
      uptimeSeconds: Math.floor(os.uptime()),
      processUptimeSeconds: Math.floor(process.uptime()),
      processMemory: process.memoryUsage(),
    };

    return NextResponse.json({
      success: true,
      dockerRunning,
      containers: containerStats,
      system: systemMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error fetching admin metrics:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err?.message }, { status: 500 });
  }
}
