import React, { useState, useEffect } from 'react';
import { Rocket, RefreshCw, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Deployment {
  id: string;
  projectId: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  url: string | null;
  createdAt: string;
}

interface DeploymentPanelProps {
  workspaceId: string;
}

export default function DeploymentPanel({ workspaceId }: DeploymentPanelProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deployments?projectId=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments || []);
      }
    } catch (e) {
      console.error('Failed to fetch deployments:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeployments();
    // Poll every 5 seconds if there is a running deployment
    const interval = setInterval(() => {
      setDeployments(prev => {
        if (prev.some(d => d.status === 'QUEUED' || d.status === 'RUNNING')) {
          fetchDeployments();
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: workspaceId })
      });
      if (res.ok) {
        await fetchDeployments();
      }
    } catch (e) {
      console.error('Deployment failed to start:', e);
    }
    setDeploying(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 size={14} color="var(--accent-green)" />;
      case 'FAILED': return <XCircle size={14} color="var(--text-danger)" />;
      case 'QUEUED':
      case 'RUNNING': return <RefreshCw size={14} color="var(--accent-blue)" className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />;
      default: return <Clock size={14} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Rocket size={18} /> Deployments
        </h2>
        <button 
          onClick={fetchDeployments}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Deploy your workspace to a Local Docker container.
        </p>
        <button 
          onClick={handleDeploy}
          disabled={deploying}
          style={{ 
            background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', 
            fontWeight: 500, cursor: deploying ? 'not-allowed' : 'pointer', opacity: deploying ? 0.7 : 1,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
          }}
        >
          {deploying ? <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} /> : <Rocket size={14} />}
          {deploying ? 'Starting Deployment...' : 'Deploy Now'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '4px' }}>Deployment History</h3>
        
        {loading && deployments.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>Loading...</div>
        ) : deployments.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            No deployments yet.
          </div>
        ) : (
          deployments.map(dep => (
            <div key={dep.id} style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {getStatusIcon(dep.status)}
                  <span style={{ 
                    color: dep.status === 'SUCCESS' ? 'var(--accent-green)' : 
                           dep.status === 'FAILED' ? 'var(--text-danger)' : 
                           dep.status === 'RUNNING' ? 'var(--accent-blue)' : 'var(--text-secondary)'
                  }}>
                    {dep.status}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(dep.createdAt).toLocaleString()}
                </span>
              </div>
              
              {dep.url && (
                <a 
                  href={dep.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={12} /> {dep.url}
                </a>
              )}
              
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                ID: {dep.id.slice(-8)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
