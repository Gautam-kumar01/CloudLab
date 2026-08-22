import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { DockerManager } from '@/lib/docker-manager';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const containers = await DockerManager.listContainers();
    return NextResponse.json(containers);
  } catch (err: any) {
    console.error('Error fetching containers:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Container ID is required' }, { status: 400 });
    }

    const success = await DockerManager.killContainer(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to kill container' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error killing container:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
