'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Minus,
  RefreshCw,
  Check,
  AlertCircle,
  GitBranch,
  GitPullRequest,
  GitFork,
  Upload,
  Globe,
  Lock,
  Loader2,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  FileCode,
  Layers,
} from 'lucide-react';

interface GitPanelProps {
  workspaceId: string;
}

export default function GitPanel({ workspaceId }: GitPanelProps) {
  const [isRepo, setIsRepo] = useState<boolean | null>(null);
  const [currentBranch, setCurrentBranch] = useState('');
  const [staged, setStaged] = useState<{ file: string; state: string }[]>([]);
  const [unstaged, setUnstaged] = useState<{ file: string; state: string }[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);

  // GitHub Publish Modal State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [repoName, setRepoName] = useState(workspaceId);
  const [isPrivate, setIsPrivate] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [publishSuccessUrl, setPublishSuccessUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/git/status?id=${encodeURIComponent(workspaceId)}`);
      const data = await res.json();
      if (data.isRepo !== undefined) setIsRepo(data.isRepo);
      if (data.currentBranch) setCurrentBranch(data.currentBranch);
      if (data.staged) setStaged(data.staged);
      if (data.unstaged) setUnstaged(data.unstaged);
      if (data.remoteUrl !== undefined) setRemoteUrl(data.remoteUrl);
    } catch (e) {
      console.error('Failed to fetch git status', e);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleAction = async (action: string, file?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/git/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          action,
          file,
          message: action === 'commit' ? commitMessage : undefined,
          branch: file,
        }),
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

  const handlePublishToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setPublishError(null);

    try {
      const res = await fetch('/api/github/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          repoName: repoName.trim() || workspaceId,
          isPrivate,
          githubToken: githubToken.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.repoUrl) {
        setPublishSuccessUrl(data.repoUrl);
        setRemoteUrl(data.cloneUrl);
        await fetchStatus();
      } else {
        setPublishError(data.error || 'Failed to publish to GitHub');
      }
    } catch (err: any) {
      setPublishError(err.message || 'Error communicating with GitHub');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isRepo === null) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-slate-400 p-4">
        <Loader2 size={16} className="animate-spin text-emerald-400 mr-2" />
        Loading Source Control...
      </div>
    );
  }

  if (isRepo === false) {
    return (
      <div className="p-4 flex flex-col gap-4 text-slate-200">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <GitBranch size={16} />
            <span>Initialize Source Control</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            This workspace folder is not currently tracked by Git. Initialize a repository to track changes, commit history, and push to GitHub.
          </p>
          <button
            type="button"
            onClick={() => handleAction('init')}
            className="btn-cta-glow w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <GitBranch size={14} />
            <span>Initialize Git Repository</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#070b14] text-slate-100 font-sans select-none">
      {/* Top Header & Branch Bar */}
      <div className="px-3.5 py-2.5 bg-[#0c1426] border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <GitBranch size={13} />
          </div>
          <span className="text-xs font-bold font-mono text-emerald-300 truncate max-w-[120px]">
            {currentBranch || 'main'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              const name = prompt('Enter existing branch name to switch to:');
              if (name) handleAction('checkout', name);
            }}
            className="px-2 py-1 rounded-md text-[10.5px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-white/10 transition-colors cursor-pointer"
            title="Switch Git Branch"
          >
            Switch
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              const name = prompt('Enter new branch name:');
              if (name) handleAction('create-branch', name);
            }}
            className="px-2 py-1 rounded-md text-[10.5px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Create New Branch"
          >
            + Branch
          </button>
        </div>
      </div>

      {/* Publish to GitHub Banner (if not already published) */}
      {!remoteUrl && (
        <div className="m-3 p-3.5 rounded-xl bg-gradient-to-br from-[#0e1d3a] to-[#0a1426] border border-emerald-500/30 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <GitPullRequest size={14} />
              <span>Publish to GitHub</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              1-Click
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Create a repository on your GitHub and push this workspace code directly.
          </p>
          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            className="btn-cta-glow w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Upload size={13} strokeWidth={2.5} />
            <span>Publish Repository</span>
          </button>
        </div>
      )}

      {/* Commit Input Area */}
      <div className="p-3 bg-[#0a0f1d] border-b border-white/[0.08] flex flex-col gap-2 shrink-0">
        <textarea
          placeholder="Commit message (Ctrl+Enter to commit)..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              handleAction('commit');
            }
          }}
          className="w-full h-16 bg-slate-950 border border-slate-700/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 resize-none font-sans outline-none leading-relaxed transition-all"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading || (staged.length === 0 && unstaged.length === 0) || !commitMessage.trim()}
            onClick={() => handleAction('commit')}
            className="btn-cta-glow flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Check size={13} strokeWidth={2.5} />
            <span>Commit</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAction('sync')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-40"
            title="Sync with Remote (Pull & Push)"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Changes & Staged Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Staged Changes */}
        {staged.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={12} />
                Staged Changes
              </span>
              <div className="flex items-center gap-1">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {staged.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleAction('unstage', '.')}
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Unstage all changes"
                >
                  <Minus size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {staged.map((item) => (
                <div
                  key={item.file}
                  className="group flex items-center justify-between p-2 rounded-lg bg-[#0c1426] hover:bg-[#111e38] border border-white/[0.06] hover:border-emerald-500/30 transition-all text-xs text-emerald-300 font-mono"
                >
                  <span className="truncate max-w-[180px]" title={item.file}>
                    {item.file}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAction('unstage', item.file)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    title="Unstage file"
                  >
                    <Minus size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unstaged Changes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400">
              <RotateCcw size={12} />
              Changes
            </span>
            <div className="flex items-center gap-1">
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {unstaged.length}
              </span>
              {unstaged.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleAction('stage', '.')}
                  className="text-slate-400 hover:text-emerald-400 p-0.5 rounded cursor-pointer"
                  title="Stage all changes"
                >
                  <Plus size={13} />
                </button>
              )}
            </div>
          </div>

          {unstaged.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-500">
              Working tree clean. No modified files.
            </div>
          ) : (
            <div className="space-y-1">
              {unstaged.map((item) => (
                <div
                  key={item.file}
                  className="group flex items-center justify-between p-2 rounded-lg bg-[#0c1426] hover:bg-[#111e38] border border-white/[0.06] hover:border-amber-500/30 transition-all text-xs text-amber-300 font-mono"
                >
                  <span className="truncate max-w-[180px]" title={item.file}>
                    {item.file}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleAction('stage', item.file)}
                      className="p-1 rounded hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
                      title="Stage file"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Publish to GitHub Modal Dialog */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="modal-animate-in w-full max-w-md rounded-2xl bg-[#090d1a] border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <GitPullRequest size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Publish to GitHub</h3>
                    <p className="text-xs text-slate-400">Create remote repository and push all code</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPublishModalOpen(false);
                    setPublishSuccessUrl(null);
                    setPublishError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {publishSuccessUrl ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white mb-1">Repository Published Successfully!</div>
                      <p className="text-slate-300 leading-relaxed mb-2">
                        Your workspace code has been pushed to GitHub on branch <code>main</code>.
                      </p>
                      <a
                        href={publishSuccessUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold underline"
                      >
                        <span>Open on GitHub</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPublishModalOpen(false);
                      setPublishSuccessUrl(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePublishToGitHub} className="space-y-4">
                  {publishError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />
                      <span>{publishError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Repository Name <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="e.g. my-awesome-app"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-white/10">
                    <div className="flex items-center gap-2">
                      {isPrivate ? <Lock size={15} className="text-amber-400" /> : <Globe size={15} className="text-emerald-400" />}
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {isPrivate ? 'Private Repository' : 'Public Repository'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {isPrivate ? 'Only you can view and commit' : 'Visible to anyone on GitHub'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      GitHub Personal Access Token <span className="text-slate-500">(Optional if signed in with GitHub)</span>
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx (Requires repo scope)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setPublishModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPublishing || !repoName.trim()}
                      className="btn-cta-glow px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Publishing to GitHub...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} strokeWidth={2.5} />
                          <span>Publish & Push</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
