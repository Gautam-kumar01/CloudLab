import { getQueue } from './src/lib/queue';
import { db } from './src/lib/db'; // Just to show we can use DB
import { logger } from './src/lib/logger';

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

  logger.info('Background job worker started and waiting for jobs.');
}

startWorker().catch((err) => logger.error({ err }, 'Worker failed'));
