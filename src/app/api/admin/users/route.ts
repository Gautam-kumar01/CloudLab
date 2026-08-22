import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
