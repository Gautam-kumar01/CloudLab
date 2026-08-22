'use client';

import React, { useEffect, useState } from 'react';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card {
          padding: 32px;
          background: rgba(20, 20, 20, 0.4);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
        }
        .stat-card:nth-child(1)::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .stat-card:nth-child(2)::before { background: linear-gradient(90deg, #10b981, #34d399); }
        .stat-card:nth-child(3)::before { background: linear-gradient(90deg, #a855f7, #c084fc); }
      `}</style>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>Platform Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.2rem' }}>Real-time metrics for CloudLab.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        
        <div className="stat-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats?.totalUsers || 0}</p>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Workspaces</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats?.activeWorkspaces || 0}</p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${stats?.totalWorkspaces ? Math.round((stats.activeWorkspaces / stats.totalWorkspaces) * 100) : 0}%`, height: '100%', background: '#10b981' }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Out of {stats?.totalWorkspaces || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Requests</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats?.totalAiRequests || 0}</p>
        </div>

      </div>
    </div>
  );
}
