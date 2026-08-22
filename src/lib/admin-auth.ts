import { auth } from '@/auth';
import { apiError } from './api-utils';
import { db } from '@/lib/db';

export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    return { error: apiError('Unauthorized', 401), session: null };
  }

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return { error: apiError('Forbidden - Admin access required', 403), session: null };
  }

  return { error: null, session };
}
