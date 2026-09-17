import { getQueue } from './src/lib/queue';
import { db } from './src/lib/db'; // Just to show we can use DB
import { logger } from './src/lib/logger';
import { LocalDockerDeployer } from './src/lib/deployer';

async function startWorker() {
  logger.info('Starting background job worker...');
  const queue = await getQueue();

  // Register worker for basic workspace cleanup
  await queue.work('workspace-cleanup', async (jobs: any[]) => {
    for (const job of jobs) {
      logger.info(
        { jobId: job.id, workspaceId: (job.data as any).workspaceId },
        'Processing workspace-cleanup job',
      );
      // Simulate cleanup logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info({ jobId: job.id }, 'Completed workspace-cleanup job');
    }
  });

  // Example: queue git operations
  await queue.work('git-operation', async (jobs: any[]) => {
    for (const job of jobs) {
      logger.info(
        { jobId: job.id, operation: (job.data as any).operation, repoId: (job.data as any).repoId },
        'Executing git-operation job',
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      logger.info({ jobId: job.id }, 'Completed git-operation job');
    }
  });

  await queue.work('deployment', async (jobs: any[]) => {
    for (const job of jobs) {
      const { deploymentId, projectId, envVars } = job.data as {
        deploymentId: string;
        projectId: string;
        envVars: Record<string, string>;
      };
      await db.deployment.update({ where: { id: deploymentId }, data: { status: 'RUNNING' } });
      try {
        const result = await new LocalDockerDeployer().deploy(projectId, envVars);
        await db.deployment.update({
          where: { id: deploymentId },
          data: result.success ? { status: 'SUCCESS', url: result.url } : { status: 'FAILED' },
        });
        if (!result.success) logger.error({ deploymentId, error: result.error }, 'Deployment failed');
      } catch (err) {
        await db.deployment.update({ where: { id: deploymentId }, data: { status: 'FAILED' } });
        logger.error({ err, deploymentId }, 'Deployment worker failed');
        throw err;
      }
    }
  });

  logger.info('Background job worker started and waiting for jobs.');
}

startWorker().catch((err) => logger.error({ err }, 'Worker failed'));
