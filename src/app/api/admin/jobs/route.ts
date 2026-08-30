import { NextResponse } from 'next/server';
import { auth } from '@/auth';
export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ideally, add a role check here for ADMIN role.
  // if (session.user.role !== 'ADMIN') return ...

  try {
    // TODO: Add actual job queue processing if needed
    // Mock pg-boss stats for now since getQueueSize isn't available on this type
    const created = 0, active = 0, completed = 0, failed = 0, cancelled = 0;

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
