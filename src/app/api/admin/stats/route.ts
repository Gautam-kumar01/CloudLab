import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const totalUsers = await db.user.count();
    const totalWorkspaces = await db.project.count();
    const activeWorkspaces = await db.project.count({
      where: { status: 'ACTIVE' },
    });
    const totalAiRequests = await db.aiLog.count();

    return NextResponse.json({
      totalUsers,
      totalWorkspaces,
      activeWorkspaces,
      totalAiRequests,
    });
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
