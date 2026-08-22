import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getQueue } from '@/lib/queue';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ideally, add a role check here for ADMIN role.
  // if (session.user.role !== 'ADMIN') return ...

  try {
    const queue = await getQueue();
    // Use pg-boss built-in counts or custom queries to get queue stats
    const [created, active, completed, failed, cancelled] = await Promise.all([
      queue.getQueueSize('workspace-cleanup', { state: 'created' }),
      queue.getQueueSize('workspace-cleanup', { state: 'active' }),
      queue.getQueueSize('workspace-cleanup', { state: 'completed' }),
      queue.getQueueSize('workspace-cleanup', { state: 'failed' }),
      queue.getQueueSize('workspace-cleanup', { state: 'cancelled' }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        queues: {
          'workspace-cleanup': {
            created,
            active,
            completed,
            failed,
            cancelled,
          },
        },
      },
    });
  } catch (error: any) {
    console.error('Failed to get job stats:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
