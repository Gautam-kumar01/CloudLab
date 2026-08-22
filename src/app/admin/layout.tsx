'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full" style={{ background: '#0a0a0a', color: 'var(--text-primary)', backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(239, 68, 68, 0.03) 0%, transparent 30%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 30%)' }}>
      {/* Sidebar */}
      <style>{`
        .admin-nav-link {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 4px;
        }
        .admin-nav-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          transform: translateX(4px);
        }
        .admin-nav-link.active {
          background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(168, 85, 247, 0.1));
          color: #fff;
          border-left: 3px solid #a855f7;
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
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
          <Link href="/admin" className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}>
            <span style={{ marginRight: '14px', fontSize: '1.2rem', opacity: pathname === '/admin' ? 1 : 0.6 }}>📊</span> Overview
          </Link>
          <Link href="/admin/users" className={`admin-nav-link ${pathname === '/admin/users' ? 'active' : ''}`}>
            <span style={{ marginRight: '14px', fontSize: '1.2rem', opacity: pathname === '/admin/users' ? 1 : 0.6 }}>👥</span> Users
          </Link>
          <Link href="/admin/workspaces" className={`admin-nav-link ${pathname === '/admin/workspaces' ? 'active' : ''}`}>
            <span style={{ marginRight: '14px', fontSize: '1.2rem', opacity: pathname === '/admin/workspaces' ? 1 : 0.6 }}>💻</span> Workspaces
          </Link>
          <Link href="/admin/containers" className={`admin-nav-link ${pathname === '/admin/containers' ? 'active' : ''}`}>
            <span style={{ marginRight: '14px', fontSize: '1.2rem', opacity: pathname === '/admin/containers' ? 1 : 0.6 }}>🐳</span> Containers
          </Link>
          <Link href="/admin/ai" className={`admin-nav-link ${pathname === '/admin/ai' ? 'active' : ''}`}>
            <span style={{ marginRight: '14px', fontSize: '1.2rem', opacity: pathname === '/admin/ai' ? 1 : 0.6 }}>🤖</span> AI Usage
          </Link>
          <Link href="/admin/audit" className={`admin-nav-link ${pathname === '/admin/audit' ? 'active' : ''}`}>
            <span style={{ marginRight: '14px', fontSize: '1.2rem', opacity: pathname === '/admin/audit' ? 1 : 0.6 }}>📜</span> Audit Logs
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
