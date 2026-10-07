'use client';

import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceRole: 'OWNER' | 'EDITOR' | 'VIEWER' | null;
  snapshots: any[];
  isLoading: boolean;
  onRefreshSnapshots: () => void;
  onWorkspaceRestored: () => void;
}

export default function SnapshotModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceRole,
  snapshots,
  isLoading,
  onRefreshSnapshots,
  onWorkspaceRestored,
}: SnapshotModalProps) {
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateSnapshot = async () => {
    const desc = prompt('Enter snapshot description (optional):', 'Point-in-time snapshot');
    if (desc === null) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/workspace/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, description: desc || 'Manual Snapshot' }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        alert('Snapshot created successfully!');
        onRefreshSnapshots();
      } else {
        alert(data.error?.message || data.error || 'Failed to create snapshot');
      }
    } catch (e: any) {
      alert(`Error creating snapshot: ${e.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!confirm('Are you sure you want to restore to this snapshot? Current unsaved workspace changes will be overwritten.')) return;
    try {
      const res = await fetch('/api/workspace/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, snapshotId }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        alert('Workspace restored successfully! Reloading workspace...');
        onWorkspaceRestored();
        onClose();
      } else {
        alert(data.error?.message || data.error || 'Failed to restore snapshot');
      }
    } catch (e: any) {
      alert(`Error restoring snapshot: ${e.message}`);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm('Are you sure you want to delete this snapshot?')) return;
    try {
      const res = await fetch(
        `/api/workspace/backup?workspaceId=${encodeURIComponent(workspaceId)}&snapshotId=${encodeURIComponent(snapshotId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        onRefreshSnapshots();
      } else {
        alert('Failed to delete snapshot');
      }
    } catch (e: any) {
      alert(`Error deleting snapshot: ${e.message}`);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0c1426] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Package size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Snapshots & Recovery</h3>
              <p className="text-xs text-slate-400 mt-0.5">Point-in-time workspace rollback and archives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Create Snapshot Button */}
        <div className="flex justify-between items-center bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
          <div>
            <div className="text-xs font-semibold text-slate-200">Create New Snapshot</div>
            <div className="text-[11px] text-slate-400">Captures workspace files instantly</div>
          </div>
          <button
            onClick={handleCreateSnapshot}
            disabled={isCreating || workspaceRole === 'VIEWER'}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isCreating ? 'Creating...' : '+ Create Snapshot'}
          </button>
        </div>

        {/* Snapshots List */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Snapshots</span>
          {isLoading ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading snapshots...</div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10">
              No snapshots taken yet. Create a snapshot before making big changes.
            </div>
          ) : (
            snapshots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{s.description || 'Snapshot'}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {new Date(s.createdAt).toLocaleString()} • {(s.sizeBytes / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestoreSnapshot(s.id)}
                    disabled={workspaceRole !== 'OWNER'}
                    title={workspaceRole !== 'OWNER' ? 'Only workspace owner can restore snapshots' : undefined}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/40 rounded-lg text-xs font-medium transition-colors"
                  >
                    Restore
                  </button>
                  {workspaceRole === 'OWNER' && (
                    <button
                      onClick={() => handleDeleteSnapshot(s.id)}
                      className="px-2 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-lg text-xs transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
