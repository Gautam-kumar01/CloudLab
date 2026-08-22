'use client';

import React, { useEffect, useState } from 'react';

export default function AdminContainers() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContainers = () => {
    setLoading(true);
    fetch('/api/admin/containers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setContainers(data);
        else setContainers([]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleKill = async (id: string) => {
    if (!confirm('Are you sure you want to FORCE KILL this container? This will instantly terminate the runtime.')) return;
    try {
      const res = await fetch(`/api/admin/containers?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchContainers();
      else alert('Failed to kill container');
    } catch (err) {
      console.error(err);
      alert('Error killing container');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-table th { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-secondary); padding: 16px 24px; font-weight: 600; }
        .admin-table td { padding: 16px 24px; vertical-align: middle; color: var(--text-primary); }
        .admin-table tr:hover { background: rgba(255,255,255,0.02); }
        .kill-btn { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
        .kill-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>Containers</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>Direct view into the Docker Engine.</p>
        </div>
        <button 
          onClick={fetchContainers}
          style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Refresh List
        </button>
      </div>
      
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--text-secondary)' }}>Loading containers...</div>
      ) : containers.length === 0 ? (
        <div style={{ background: 'rgba(20, 20, 20, 0.4)', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No workspace containers running right now.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(20, 20, 20, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <tr>
                <th>Container ID</th>
                <th>Name</th>
                <th>Image</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {containers.map(c => (
                <tr key={c.ID} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{c.ID}</td>
                  <td style={{ fontWeight: 500 }}>{c.Names}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.Image}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: c.State === 'running' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.1)', color: c.State === 'running' ? '#10b981' : 'var(--text-secondary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                      {c.Status}
                    </span>
                  </td>
                  <td>
                    <button className="kill-btn" onClick={() => handleKill(c.ID)}>Force Kill</button>
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
