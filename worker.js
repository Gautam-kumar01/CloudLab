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

async function startWorker() {
  await boss.start();
  console.log('Background job worker started');

  // Register worker for basic workspace cleanup
  await boss.work('workspace-cleanup', async (job) => {
    console.log(
      `[Job workspace-cleanup] Processing job ${job.id} for workspace ${job.data.workspaceId}`,
    );
    // Simulate cleanup logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`[Job workspace-cleanup] Completed job ${job.id}`);
  });

  // Example: queue git operations
  await boss.work('git-operation', async (job) => {
    console.log(`[Job git-operation] Executing ${job.data.operation} for repo ${job.data.repoId}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`[Job git-operation] Completed`);
  });
}

startWorker().catch(console.error);
