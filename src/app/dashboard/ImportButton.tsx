'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Loader2, X, Github, AlertCircle, Sparkles } from 'lucide-react';

export default function ImportButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setErrorMsg(null);
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono tracking-wide text-white bg-slate-800/90 hover:bg-slate-700/90 border border-white/10 hover:border-white/20 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
      >
        <Download size={14} className="text-emerald-400" />
        <span>Import Repo</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 shadow-2xl"
            style={{ boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.08)' }}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Github size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Import GitHub Repository</h2>
                  <p className="text-xs text-slate-400">Clone and launch any public or private repository.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  Repository Clone URL <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  Custom Workspace Name <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Leave blank to use repository name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !url.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-mono text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Cloning Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Clone & Open IDE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
