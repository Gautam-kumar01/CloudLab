'use client';

import React, { useState } from 'react';
import { Share } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceRole: 'OWNER' | 'EDITOR' | 'VIEWER' | null;
  membersData: { owner?: any; members: any[] };
  onRefreshMembers: () => void;
}

export default function ShareModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceRole,
  membersData,
  onRefreshMembers,
}: ShareModalProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [isInviting, setIsInviting] = useState(false);

  if (!isOpen) return null;

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/workspace/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setInviteEmail('');
        onRefreshMembers();
        alert('Collaborator added successfully!');
      } else {
        alert(data.error?.message || data.error || 'Failed to add collaborator');
      }
    } catch (e: any) {
      alert(`Error inviting collaborator: ${e.message}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      const res = await fetch(
        `/api/workspace/members?workspaceId=${encodeURIComponent(workspaceId)}&memberId=${encodeURIComponent(memberId)}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        onRefreshMembers();
      } else {
        alert('Failed to remove collaborator');
      }
    } catch (e: any) {
      alert(`Error removing collaborator: ${e.message}`);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0c1426] border border-white/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Share size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Workspace Collaborators</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage permissions and team access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1"
          >
            ✕
          </button>
        </div>

        {/* Invite Input (Only for Owners) */}
        {workspaceRole === 'OWNER' && (
          <div className="flex flex-col gap-2 bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
            <span className="text-xs font-semibold text-slate-300">Invite Collaborator</span>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="bg-black/40 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                onClick={handleInviteMember}
                disabled={isInviting || !inviteEmail.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                {isInviting ? 'Adding...' : 'Invite'}
              </button>
            </div>
          </div>
        )}

        {/* Collaborators List */}
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Members & Roles</span>
          {membersData.owner && (
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-600/40 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-200">
                  {(membersData.owner.name || membersData.owner.email || 'O')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{membersData.owner.name || 'Owner'}</div>
                  <div className="text-[11px] text-slate-400">{membersData.owner.email}</div>
                </div>
              </div>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                OWNER
              </span>
            </div>
          )}

          {membersData.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-cyan-600/40 border border-cyan-500/50 flex items-center justify-center text-xs font-bold text-cyan-200">
                  {(m.user?.name || m.user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{m.user?.name || 'Member'}</div>
                  <div className="text-[11px] text-slate-400">{m.user?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                    m.role === 'EDITOR'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {m.role}
                </span>
                {workspaceRole === 'OWNER' && (
                  <button
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-red-400 hover:text-red-300 text-xs px-1.5 py-0.5"
                    title="Remove member"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Copy URL */}
        <div className="pt-2 border-t border-white/10 flex justify-between items-center">
          <span className="text-xs text-slate-400">Share workspace URL directly</span>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Workspace URL copied to clipboard!');
              }
            }}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            📋 Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
