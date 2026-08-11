import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function Dashboard() {
  const session = await auth();
  const projects = [
    { id: 1, name: 'react-ecommerce', status: 'Sleeping', lastAccessed: '2 hours ago', language: 'TypeScript' },
    { id: 2, name: 'python-data-api', status: 'Running', lastAccessed: 'Just now', language: 'Python' },
    { id: 3, name: 'personal-blog', status: 'Stopped', lastAccessed: '3 days ago', language: 'JavaScript' },
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
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Recent Workspaces</h1>
          <button style={{ padding: '10px 20px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', fontWeight: 600, border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Workspace
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {projects.map((project) => (
            <Link href={`/workspace?id=${project.id}`} key={project.id} style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'border-color 0.2s, transform 0.2s' }} className="project-card">
              
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                    {project.language === 'TypeScript' ? 'TS' : project.language === 'Python' ? 'PY' : 'JS'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{project.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{project.lastAccessed}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: project.status === 'Running' ? 'var(--accent-green)' : project.status === 'Sleeping' ? 'var(--accent-orange)' : 'var(--text-secondary)' }}></div>
                  {project.status}
                </div>
                
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent-green)' }}>Open ➔</span>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
