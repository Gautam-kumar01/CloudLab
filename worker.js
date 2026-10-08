const { PgBoss } = require('pg-boss');
require('dotenv').config();

function getPostgresUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  if (url.startsWith('prisma+postgres://')) {
    try {
      const urlObj = new URL(url);
      const apiKey = urlObj.searchParams.get('api_key');
      if (apiKey) {
        let base64 = apiKey.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const decoded = Buffer.from(base64, 'base64').toString('utf-8');
        const json = JSON.parse(decoded);
        if (json.databaseUrl) {
          return json.databaseUrl;
        }
      }
    } catch (e) {
      console.warn('Failed to parse prisma+postgres API key, falling back to original URL', e);
    }
  }

  return url;
}

const boss = new PgBoss(getPostgresUrl());
boss.on('error', (error) => console.error('pg-boss error:', error));

let db = null;
function getDb() {
  if (!db) {
    const { PrismaClient } = require('./src/generated/prisma/client');
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pool = new Pool({ connectionString: getPostgresUrl() });
    const adapter = new PrismaPg(pool);
    db = new PrismaClient({ adapter });
  }
  return db;
}

async function startWorker() {
  await boss.start();
  console.log('[Worker] Background job worker started and listening for jobs.');

  // 1. Workspace cleanup & idle container termination reaper
  await boss.work('workspace-cleanup', async (job) => {
    console.log(`[Job workspace-cleanup] Processing job ${job.id} for workspace ${job.data?.workspaceId}`);
    try {
      const { DockerManager } = require('./src/lib/docker-manager');
      const reaped = await DockerManager.terminateIdleContainers(
        parseInt(process.env.CONTAINER_IDLE_TIMEOUT_MINUTES || '30', 10)
      );
      console.log(`[Job workspace-cleanup] Reaped ${reaped.length} idle container(s)`);
    } catch (err) {
      console.warn('[Job workspace-cleanup] Non-fatal idle reaper error:', err.message);
    }
    console.log(`[Job workspace-cleanup] Completed job ${job.id}`);
  });

  // 2. Git operations worker
  await boss.work('git-operation', async (job) => {
    console.log(`[Job git-operation] Executing ${job.data.operation} for repo ${job.data.repoId}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`[Job git-operation] Completed job ${job.id}`);
  });

  // 3. Deployment queue worker: processes asynchronous deployments
  await boss.work('deployment', async (job) => {
    const { deploymentId, projectId, envVars, userId } = job.data;
    console.log(`[Job deployment] Starting deployment ${deploymentId} for project ${projectId}`);
    const prisma = getDb();

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'RUNNING' },
    });

    try {
      const { LocalDockerDeployer } = require('./src/lib/deployer');
      const deployer = new LocalDockerDeployer();
      const result = await deployer.deploy(projectId, envVars || {});

      await prisma.deployment.update({
        where: { id: deploymentId },
        data: result.success
          ? { status: 'SUCCESS', url: result.url }
          : { status: 'FAILED' },
      });

      if (userId) {
        try {
          await prisma.auditLog.create({
            data: {
              userId,
              action: result.success ? 'DEPLOYMENT_SUCCESS' : 'DEPLOYMENT_FAILURE',
              details: JSON.stringify({
                workspaceId: projectId,
                deploymentId,
                url: result.url,
                error: result.error,
              }),
            },
          });
        } catch {}
      }

      if (!result.success) {
        console.error(`[Job deployment] Deployment ${deploymentId} failed:`, result.error);
      } else {
        console.log(`[Job deployment] Successfully deployed ${deploymentId} to ${result.url}`);
      }
    } catch (err) {
      console.error(`[Job deployment] Exception during deployment ${deploymentId}:`, err);
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'FAILED' },
      });

      if (userId) {
        try {
          await prisma.auditLog.create({
            data: {
              userId,
              action: 'DEPLOYMENT_FAILURE',
              details: JSON.stringify({
                workspaceId: projectId,
                deploymentId,
                error: err.message,
              }),
            },
          });
        } catch {}
      }

      throw err;
    }
  });
}

async function runWorkerWithRetry(maxRetries = 10, delayMs = 3000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      await startWorker();
      return;
    } catch (err) {
      console.error(`[Worker] Connection attempt ${i}/${maxRetries} failed:`, err.message);
      if (i === maxRetries) {
        console.error('[Worker] Fatal: Unable to establish database worker connection. Exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

// Graceful termination handling
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, stopping pg-boss worker gracefully...');
  try { await boss.stop(); } catch {}
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, stopping pg-boss worker gracefully...');
  try { await boss.stop(); } catch {}
  process.exit(0);
});

runWorkerWithRetry().catch((err) => {
  console.error('[Worker] Unhandled error in worker lifecycle:', err);
  process.exit(1);
});
