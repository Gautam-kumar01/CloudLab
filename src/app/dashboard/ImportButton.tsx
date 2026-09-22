'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Loader2,
  X,
  GitBranch,
  AlertCircle,
  Sparkles,
  GitFork,
  FolderGit2,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
} from 'lucide-react';

const popularQuickPicks = [
  { name: 'Next.js SaaS', url: 'https://github.com/vercel/next.js', icon: '▲' },
  { name: 'FastAPI Agent', url: 'https://github.com/tiangolo/fastapi', icon: '⚡' },
  { name: 'React + Vite', url: 'https://github.com/vitejs/vite', icon: '⚛️' },
];

export default function ImportButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValidUrl = url.trim().length > 0 && (url.includes('github.com') || url.includes('gitlab.com') || url.includes('.git') || url.startsWith('http'));

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setErrorMsg(null);
    setIsImporting(true);

    // Extract repo name from URL or use custom name
    const nameMatch = url.trim().match(/\/([^\/]+?)(?:\.git)?(?:\/)?$/);
    const finalName = customName.trim() || (nameMatch ? nameMatch[1] : `imported-${Date.now()}`);

    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloneUrl: url.trim(), name: finalName }),
      });

      const data = await res.json();

      if (res.ok && (data.projectId || data.success)) {
        const targetId = data.projectId || finalName;
        router.push(`/workspace?id=${encodeURIComponent(targetId)}`);
      } else {
        setErrorMsg(data.error || 'Failed to import repository');
        setIsImporting(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Network error occurred while importing repository');
      setIsImporting(false);
    }
  };

  const handleQuickPick = (quickUrl: string, defaultName: string) => {
    setUrl(quickUrl);
    if (!customName) {
      setCustomName(defaultName.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  };

  return (
    <>
      {/* Catchy, High-Visibility Secondary CTA Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setErrorMsg(null);
        }}
        className="btn-secondary-glow group flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold tracking-wide cursor-pointer transition-all"
        title="Import a repository from GitHub or Git remote URL"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-200">
          <Download size={14} strokeWidth={2.5} />
        </div>
        <span className="text-white font-medium">Import Repo</span>
        <span className="hidden md:inline-flex items-center text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
          Git
        </span>
      </button>

      {/* Luxury Glassmorphic Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className="modal-animate-in w-full max-w-xl rounded-2xl bg-[#090d1a] border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.15)] overflow-hidden flex flex-col"
          >
            {/* Top Radiant Gradient Accent Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between pb-5 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                    <GitBranch size={24} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      Import Git Repository
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Clone any public or private repository into a dedicated microVM sandbox.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Quick Template Repositories */}
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span>Quick Starter Repositories:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularQuickPicks.map((pick) => (
                    <button
                      key={pick.name}
                      type="button"
                      onClick={() => handleQuickPick(pick.url, pick.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-emerald-500/15 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <span>{pick.icon}</span>
                      <span>{pick.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleImport} className="space-y-4">
                {/* Clone URL Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <GitFork size={13} className="text-emerald-400" />
                      <span>Repository Clone URL</span>
                      <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    {isValidUrl && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Valid URL
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/username/repository.git"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Supports GitHub, GitLab, and any public Git HTTPS URL.
                  </p>
                </div>

                {/* Custom Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <FolderGit2 size={13} className="text-teal-400" />
                      <span>Workspace Name</span>
                      <span className="text-slate-500 font-normal">(Optional)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Leave blank to use repository name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono transition-all"
                  />
                </div>

                {/* Feature Pills Strip */}
                <div className="pt-2 pb-1 grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-white/5">
                    <Zap size={13} className="text-amber-400 shrink-0" />
                    <span className="truncate">NVMe Hot Storage</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-white/5">
                    <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                    <span className="truncate">Rootless Sandbox</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-white/5">
                    <Sparkles size={13} className="text-cyan-400 shrink-0" />
                    <span className="truncate">AI Pair Coder</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-5 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !url.trim()}
                    className="btn-cta-glow flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Cloning Workspace...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Clone & Open IDE</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
