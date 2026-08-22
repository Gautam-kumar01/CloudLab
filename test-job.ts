import { addJob, getQueue } from './src/lib/queue';

async function run() {
  console.log('Adding test job to queue...');

  const queue = await getQueue();
  await queue.createQueue('workspace-cleanup');
  await queue.createQueue('git-operation');

  const jobId = await addJob('workspace-cleanup', {
    workspaceId: 'test-workspace-123',
  });

  console.log(`Successfully added job with ID: ${jobId}`);

  const gitJobId = await addJob('git-operation', {
    repoId: 'test-repo',
    operation: 'git fetch',
  });

  console.log(`Successfully added git job with ID: ${gitJobId}`);

  process.exit(0);
}

run().catch(console.error);
