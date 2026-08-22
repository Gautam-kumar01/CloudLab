import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 68, 68, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 20%)' }}>
      {/* Sidebar */}
      <style>{`
        .admin-nav-link {
          display: block;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .admin-nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .admin-back-link {
          font-size: 0.9rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .admin-back-link:hover {
          color: #fff;
        }
      `}</style>
      <aside style={{ 
        width: '280px', 
        background: 'rgba(20, 20, 20, 0.6)', 
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #ef4444, #a855f7)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff', fontSize: '0.8rem' }}>CL</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ef4444, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Console</h2>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/admin" className="px-4 py-3 rounded-xl admin-nav-link">
            <span style={{ marginRight: '12px', opacity: 0.7 }}>📊</span> Overview
          </Link>
          <Link href="/admin/users" className="px-4 py-3 rounded-xl admin-nav-link">
            <span style={{ marginRight: '12px', opacity: 0.7 }}>👥</span> Users
          </Link>
          <Link href="/admin/workspaces" className="px-4 py-3 rounded-xl admin-nav-link">
            <span style={{ marginRight: '12px', opacity: 0.7 }}>💻</span> Workspaces
          </Link>
        </nav>
        <div style={{ padding: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Link href="/dashboard" className="admin-back-link">
            &larr; Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 64px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
