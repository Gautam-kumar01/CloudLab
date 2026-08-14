'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface GitPanelProps {
  workspaceId: string;
}

export default function GitPanel({ workspaceId }: GitPanelProps) {
  const [isRepo, setIsRepo] = useState<boolean | null>(null);
  const [currentBranch, setCurrentBranch] = useState('');
  const [staged, setStaged] = useState<{file: string, state: string}[]>([]);
  const [unstaged, setUnstaged] = useState<{file: string, state: string}[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/git/status?id=${encodeURIComponent(workspaceId)}`);
      const data = await res.json();
      if (data.isRepo !== undefined) setIsRepo(data.isRepo);
      if (data.currentBranch) setCurrentBranch(data.currentBranch);
      if (data.staged) setStaged(data.staged);
      if (data.unstaged) setUnstaged(data.unstaged);
    } catch (e) {
      console.error('Failed to fetch git status', e);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchStatus();
    // Poll every 5s for changes
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleAction = async (action: string, file?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/git/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, action, file, message: action === 'commit' ? commitMessage : undefined })
      });
      const data = await res.json();
      if (data.error) {
        alert(`Git ${action} failed: ` + data.error);
      } else {
        if (action === 'commit') setCommitMessage('');
        await fetchStatus();
      }
    } catch (e: any) {
      alert(`Git error: ` + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRepo === null) {
    return <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>Loading Source Control...</div>;
  }

  if (isRepo === false) {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The folder currently open doesn't have a git repository.</p>
        <button 
          onClick={() => handleAction('init')}
          style={{ padding: '8px', background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Initialize Repository
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Commit Input Area */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
        <textarea 
          placeholder="Message (Ctrl+Enter to commit)"
          value={commitMessage}
          onChange={e => setCommitMessage(e.target.value)}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleAction('commit'); }}
          style={{ 
            width: '100%', height: '60px', background: 'var(--bg-primary)', 
            border: '1px solid var(--border-color)', borderRadius: '4px', 
            padding: '8px', color: 'var(--text-primary)', resize: 'none',
            fontSize: '0.85rem'
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            disabled={isLoading || staged.length === 0 || !commitMessage.trim()}
            onClick={() => handleAction('commit')}
            style={{ flex: 1, padding: '6px', background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (isLoading || staged.length === 0 || !commitMessage.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Check size={14} /> Commit
          </button>
          <button 
            disabled={isLoading}
            onClick={() => handleAction('sync')}
            style={{ padding: '6px 12px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', opacity: isLoading ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Sync Changes (Pull & Push)"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Changes List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        
        {/* Staged Changes */}
        {staged.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>Staged Changes</span>
              <span style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '10px' }}>{staged.length}</span>
            </div>
            {staged.map(item => (
              <div key={item.file} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px', fontSize: '0.85rem', color: 'var(--accent-green)' }} className="git-file-row">
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file}</span>
                <div className="git-actions" style={{ display: 'flex', gap: '8px' }}>
                  <span title="Unstage Change" style={{ display: 'inline-flex', cursor: 'pointer' }} onClick={() => handleAction('unstage', item.file)}>
                    <Minus size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Unstaged Changes */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>Changes</span>
            <span style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '10px' }}>{unstaged.length}</span>
          </div>
          {unstaged.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No changes.</div>
          ) : (
            unstaged.map(item => (
              <div key={item.file} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px', fontSize: '0.85rem', color: 'var(--accent-orange)' }} className="git-file-row">
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file}</span>
                <div className="git-actions" style={{ display: 'flex', gap: '8px' }}>
                  <span title="Stage Change" style={{ display: 'inline-flex', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => handleAction('stage', item.file)}>
                    <Plus size={14} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <style jsx>{`
        .git-file-row:hover {
          background: var(--bg-primary);
        }
        .git-actions {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .git-file-row:hover .git-actions {
          opacity: 1;
        }
        .git-actions > *:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
