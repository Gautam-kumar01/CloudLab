'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { builtInTemplates } from '@/lib/templates';
import { Layout, Terminal, File, Coffee, Cpu, Loader2, Plus, X, Sparkles } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  Layout: <Layout size={20} />,
  Terminal: <Terminal size={20} />,
  File: <File size={20} />,
  Coffee: <Coffee size={20} />,
  Cpu: <Cpu size={20} />,
};

export default function NewProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), template: selectedTemplate }),
      });

      const data = await res.json();

      if (res.ok && data.project?.id) {
        router.push(`/workspace?id=${encodeURIComponent(data.project.id)}`);
      } else {
        setErrorMsg(data.error || 'Failed to create project');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error creating project workspace');
      setIsLoading(false);
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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono tracking-wide text-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:brightness-110 transition-all duration-200 shadow-lg shadow-emerald-500/20 active:scale-95"
      >
        <Plus size={15} strokeWidth={2.5} />
        <span>New Project</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/10 shadow-2xl"
            style={{ boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(16, 185, 129, 0.1)' }}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Workspace</h2>
                  <p className="text-xs text-slate-400">Choose a high-performance cloud template or start from scratch.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">
                  Project Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. saas-analytics-app"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2.5 font-mono">
                  Select Starter Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {builtInTemplates.map((t) => {
                    const isSelected = selectedTemplate === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-slate-950/60 border-white/5 hover:border-white/20 hover:bg-slate-950'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                            isSelected
                              ? 'bg-emerald-500 text-black shadow-sm'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {icons[t.icon] || <File size={18} />}
                        </div>
                        <h4 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                          {t.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {t.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold font-mono text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Provisioning VM...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Launch Workspace</span>
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
