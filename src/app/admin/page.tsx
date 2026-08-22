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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

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

      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em', background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Platform Overview</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '1.2rem', maxWidth: '600px' }}>Real-time metrics and health indicators for your CloudLab infrastructure.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
        
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(20, 20, 20, 0.4) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</h3>
            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '8px', borderRadius: '12px', fontSize: '1.2rem' }}>👥</span>
          </div>
          <p style={{ fontSize: '4rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats?.totalUsers || 0}</p>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 20, 20, 0.4) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Workspaces</h3>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '8px', borderRadius: '12px', fontSize: '1.2rem' }}>💻</span>
          </div>
          <p style={{ fontSize: '4rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats?.activeWorkspaces || 0}</p>
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${stats?.totalWorkspaces ? Math.round((stats.activeWorkspaces / stats.totalWorkspaces) * 100) : 0}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500 }}>Out of {stats?.totalWorkspaces || 0}</span>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.05) 0%, rgba(20, 20, 20, 0.4) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Requests</h3>
            <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '8px', borderRadius: '12px', fontSize: '1.2rem' }}>🤖</span>
          </div>
          <p style={{ fontSize: '4rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{stats?.totalAiRequests || 0}</p>
        </div>

      </div>
    </div>
  );
}
