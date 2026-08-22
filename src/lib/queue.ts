import { PgBoss, SendOptions } from 'pg-boss';
import { logger } from './logger';

function getPostgresUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  // If using Prisma's proxy (prisma+postgres://), we must extract the actual postgres URL
  // because pg-boss expects standard pg wire protocol.
  if (url.startsWith('prisma+postgres://')) {
    try {
      const urlObj = new URL(url);
      const apiKey = urlObj.searchParams.get('api_key');
      if (apiKey) {
        // Base64 decode without strict padding
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
      logger.warn(
        { err: e },
        'Failed to parse prisma+postgres API key, falling back to original URL',
      );
    }
  }

  return url;
}

const boss = new PgBoss(getPostgresUrl());

boss.on('error', (error: Error) => logger.error({ err: error }, 'pg-boss error'));

let isStarting = false;
let isReady = false;

export async function getQueue() {
  if (isReady) return boss;
  if (!isStarting) {
    isStarting = true;
    try {
      await boss.start();
      isReady = true;
    } catch (err) {
      isStarting = false;
      throw err;
    }
  } else {
    // Wait for it to become ready if another call initiated it
    while (!isReady) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return boss;
}

export async function addJob(name: string, data: any, options?: SendOptions) {
  const queue = await getQueue();
  return queue.send(name, data, options);
}
