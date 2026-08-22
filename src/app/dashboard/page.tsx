import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { db } from '@/lib/db';
import RepoCard from './RepoCard';
import ImportButton from './ImportButton';
import NewProjectButton from './NewProjectButton';

export default async function Dashboard() {
  const session = await auth();
  
  let isAdmin = false;
  if (session?.user?.id) {
    const dbUser = await db.user.findUnique({ where: { id: session.user.id }});
    isAdmin = dbUser?.role === 'ADMIN';
  }
  
  // Fetch GitHub repos
  let repos: any[] = [];
  if (session && (session as any).accessToken) {
    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
        headers: {
          Authorization: `Bearer ${(session as any).accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        repos = await res.json();
      } else {
        console.error("Failed to fetch repos", await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Fallback dummy projects if we have no repos or just to show the UI
  const projects = repos.length > 0 ? repos.map(r => ({
    id: r.name,
    name: r.name,
    status: 'Sleeping', 
    lastAccessed: new Date(r.updated_at).toLocaleDateString(),
    language: r.language || 'Code',
    cloneUrl: r.clone_url
  })) : [
    { id: '1', name: 'react-ecommerce', status: 'Sleeping', lastAccessed: '2 hours ago', language: 'TypeScript' },
    { id: '2', name: 'python-data-api', status: 'Running', lastAccessed: 'Just now', language: 'Python' },
    { id: '3', name: 'personal-blog', status: 'Stopped', lastAccessed: '3 days ago', language: 'JavaScript' },
  ];

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <nav className="flex justify-between items-center" style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <Link href="/" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff' }}>CL</Link>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, var(--accent-orange), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
        </div>
        <div className="flex items-center" style={{ gap: '24px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
            <span>System Operational</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/settings" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden' }}>
              {session?.user?.image ? (
                <img src={session.user.image} alt="Avatar" style={{ width: '100%', height: '100%' }} />
              ) : (
                session?.user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </Link>
            <form action={async () => { "use server"; await signOut(); }}>
              <button type="submit" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }} className="hover:text-white">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-col" style={{ display: 'flex', flex: 1, padding: '48px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Your GitHub Repositories</h1>
          <div className="flex" style={{ gap: '16px' }}>
            {isAdmin && (
              <Link href="/admin/workspaces" style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                transition: 'transform 0.2s',
              }} className="hover:scale-105">
                Admin Panel
              </Link>
            )}
            <ImportButton />
            <NewProjectButton />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {projects.map((project) => (
            <RepoCard key={project.id} project={project} />
          ))}
        </div>

      </main>
    </div>
  );
}
