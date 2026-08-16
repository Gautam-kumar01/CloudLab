import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !(session as any).accessToken) {
      return NextResponse.json({ error: 'Unauthorized or missing GitHub token' }, { status: 401 });
    }

    const token = (session as any).accessToken;
    
    // Fetch user's repositories
    const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('GitHub API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: res.status });
    }

    const repos = await res.json();
    
    // Map to a simpler structure
    const simplifiedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
      updatedAt: repo.updated_at
    }));

    return NextResponse.json({ repos: simplifiedRepos });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
