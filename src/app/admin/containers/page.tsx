'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface ContainerData {
  ID: string;
  Names: string;
  Image: string;
  Status: string;
  State?: string;
  cpu?: string;
  memory?: string;
  netIo?: string;
}

interface SystemMetrics {
  platform: string;
  cpus: number;
  memoryUsagePercent: number;
  usedMemoryBytes: number;
  totalMemoryBytes: number;
  processUptimeSeconds: number;
}

export default function AdminContainers() {
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [system, setSystem] = useState<SystemMetrics | null>(null);
  const [dockerOnline, setDockerOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const [containersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/containers').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/admin/metrics').then((r) => (r.ok ? r.json() : null)),
      ]);

      const statsMap = new Map<string, any>();
      if (metricsRes?.containers && Array.isArray(metricsRes.containers)) {
        for (const st of metricsRes.containers) {
          if (st.ID) statsMap.set(st.ID.substring(0, 12), st);
          if (st.Name) statsMap.set(st.Name, st);
        }
      }

      if (metricsRes?.system) {
        setSystem(metricsRes.system);
      }
      setDockerOnline(metricsRes?.dockerRunning ?? true);

      if (Array.isArray(containersRes)) {
        const enriched: ContainerData[] = containersRes.map((c: any) => {
          const shortId = (c.ID || '').substring(0, 12);
          const st = statsMap.get(shortId) || statsMap.get(c.Names) || {};
          return {
            ...c,
            cpu: st.CPUPerc || '—',
            memory: st.MemUsage || '—',
            netIo: st.NetIO || '—',
          };
        });
        setContainers(enriched);
      } else {
        setContainers([]);
      }
    } catch (err) {
      console.error('Error fetching admin container telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const handleKill = async (id: string) => {
    if (!confirm('Are you sure you want to FORCE KILL this container? This will instantly terminate the runtime.')) return;
    try {
      const res = await fetch(`/api/admin/containers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTelemetry();
      } else {
        alert('Failed to kill container');
      }
    } catch (err) {
      console.error(err);
      alert('Error killing container');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-table th { text-transform: uppercase; font-size: 0.72rem; letter-spacing: 0.06em; color: var(--text-secondary); padding: 14px 20px; font-weight: 600; }
        .admin-table td { padding: 14px 20px; vertical-align: middle; color: var(--text-primary); font-size: 0.88rem; }
        .admin-table tr:hover { background: rgba(255,255,255,0.02); }
        .kill-btn { background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
        .kill-btn:hover { background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.5); }
        .metric-card { background: rgba(20, 20, 20, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px 20px; flex: 1; min-width: 200px; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>Containers & Runtime</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '1rem' }}>
            Real-time Docker engine metrics, isolated workloads, and container process controls.
          </p>
        </div>
        <button
          onClick={fetchTelemetry}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.88rem',
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Telemetry Metric Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div className="metric-card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Active Containers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: '#10b981' }}>
            {containers.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Running in isolated sandbox
          </div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Host RAM Usage
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: '#38bdf8' }}>
            {system ? `${system.memoryUsagePercent}%` : '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {system ? `${formatBytes(system.usedMemoryBytes)} / ${formatBytes(system.totalMemoryBytes)}` : 'Calculating...'}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Compute Cores
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: '#f59e0b' }}>
            {system ? `${system.cpus} Cores` : '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {system ? `Arch: ${system.platform}` : 'Host Platform'}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
            Docker Engine
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '8px', color: dockerOnline ? '#10b981' : '#ef4444' }}>
            {dockerOnline ? 'Online' : 'Offline'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {dockerOnline ? 'Socket responding' : 'Daemon unreachable'}
          </div>
        </div>
      </div>

      {loading && containers.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
          Loading containers and telemetry...
        </div>
      ) : containers.length === 0 ? (
        <div
          style={{
            background: 'rgba(20, 20, 20, 0.4)',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No workspace containers running right now.</p>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(20, 20, 20, 0.4)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <tr>
                <th>Container ID</th>
                <th>Name</th>
                <th>Image</th>
                <th>CPU %</th>
                <th>Memory</th>
                <th>Network I/O</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {containers.map((c) => (
                <tr key={c.ID} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {(c.ID || '').substring(0, 12)}
                  </td>
                  <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{c.Names}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.Image}</td>
                  <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{c.cpu}</td>
                  <td style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{c.memory}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {c.netIo}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: c.State === 'running' || c.Status?.includes('Up') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.1)',
                        color: c.State === 'running' || c.Status?.includes('Up') ? '#10b981' : 'var(--text-secondary)',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      {c.Status}
                    </span>
                  </td>
                  <td>
                    <button className="kill-btn" onClick={() => handleKill(c.ID)}>
                      Force Kill
                    </button>
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
