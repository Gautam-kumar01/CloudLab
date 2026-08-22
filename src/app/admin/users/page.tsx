'use client';

import React, { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected array of users, got:', data);
          setUsers([]);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-table th { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-secondary); padding: 16px 24px; font-weight: 600; }
        .admin-table td { padding: 16px 24px; vertical-align: middle; color: var(--text-primary); }
        .admin-table tr:hover { background: rgba(255,255,255,0.02); }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>Users</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>Manage platform accounts and roles.</p>
        </div>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--text-secondary)' }}>Loading users...</div>
      ) : (
        <div style={{ background: 'rgba(20, 20, 20, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Workspaces</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {user.image ? (
                        <img src={user.image} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '0.9rem' }}>
                          {user.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      {user.name || 'Unknown'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: user.role === 'ADMIN' ? '#f87171' : '#4ade80',
                      border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user._count?.projects || 0}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>projects</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
