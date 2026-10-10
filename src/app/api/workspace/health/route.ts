import { auth } from '@/auth';
import { apiError, apiResponse } from '@/lib/api-utils';
import { DockerManager } from '@/lib/docker-manager';
import { getWorkspaceProject } from '@/lib/workspace-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return apiError('Unauthorized', 401);

  const { searchParams } = new URL(request.url);
  const requestedWorkspaceId = searchParams.get('workspaceId');
  if (!requestedWorkspaceId || requestedWorkspaceId.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(requestedWorkspaceId)) {
    return apiError('Invalid workspaceId', 400);
  }

  try {
    const project = await getWorkspaceProject(userId, requestedWorkspaceId);
    if (!project) return apiError('Workspace not found or access denied', 404);

    // Always derive the Docker name from the authorized canonical database project ID,
    // never from a browser-provided Docker container name or ID.
    const health = await DockerManager.getWorkspaceHealth(project.id);
    const response = apiResponse({ health });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    console.error('[Workspace Health] Status check failed');
    return apiError('Workspace health is temporarily unavailable', 503);
  }
}
