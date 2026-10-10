import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { db } from '@/lib/db';
import { Cloud, LogOut, Settings, ShieldCheck } from 'lucide-react';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const session = await auth();

  let isAdmin = false;
  if (session?.user?.id) {
    try {
      const dbUser = await db.user.findUnique({ where: { id: session.user.id } });
      isAdmin = dbUser?.role === 'ADMIN';
    } catch (e) {
      console.warn('Could not check admin role:', e);
    }
  }

  // 1. Fetch user's existing projects from database (including collaborative memberships)
  let dbProjects: any[] = [];
  if (session?.user?.id) {
    try {
      dbProjects = await db.project.findMany({
        where: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { userId: session.user.id } } },
          ],
        },
        include: {
          members: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (e) {
      console.warn('Could not fetch DB projects:', e);
    }
  }

  // 2. Fetch GitHub repos if GitHub OAuth account is connected
  let repos: any[] = [];
  let accessToken: string | null = null;
  if (session?.user?.id) {
    try {
      const ghAccount = await db.account.findFirst({
        where: { userId: session.user.id, provider: 'github' },
      });
      accessToken = ghAccount?.access_token || null;
    } catch {}
  }
  if (accessToken) {
    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        repos = await res.json();
      } else {
        console.error('Failed to fetch repos from GitHub:', await res.text());
      }
    } catch (e) {
      console.error('GitHub API error:', e);
    }
  }

  // 3. Merge GitHub repos and database projects
  const repoMap = new Map<string, any>();

  // Add DB projects first
  dbProjects.forEach((p) => {
    repoMap.set(p.name, {
      id: p.id,
      name: p.name,
      description: p.description || '',
      status: p.status === 'RUNNING' ? 'Running' : 'Ready',
      lastAccessed: new Date(p.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      language: 'TypeScript',
      isPrivate: false,
    });
  });

  // Add/overlay GitHub repos
  if (repos.length > 0) {
    repos.forEach((r) => {
      const existing = repoMap.get(r.name);
      repoMap.set(r.name, {
        id: existing?.id || r.name,
        name: r.name,
        description: r.description || existing?.description || '',
        status: 'Ready',
        lastAccessed: new Date(r.updated_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        language: r.language || 'TypeScript',
        cloneUrl: r.clone_url,
        isPrivate: r.private,
        stars: r.stargazers_count,
        defaultBranch: r.default_branch,
      });
    });
  }

  const initialProjects = Array.from(repoMap.values());

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#030712]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-bold shadow-md shadow-emerald-500/20">
                <Cloud size={16} strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                cloud<span className="text-emerald-400">lab</span>
              </span>
            </Link>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
              Dashboard
            </span>
          </div>

          {/* Runtime type — intentionally not shown as live health telemetry */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Docker-backed workspaces</span>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </Link>

            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30 bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-300">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  session?.user?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>

              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Dashboard */}
      <DashboardClient
        initialProjects={initialProjects}
        user={session?.user || null}
        isAdmin={isAdmin}
      />
    </div>
  );
}
