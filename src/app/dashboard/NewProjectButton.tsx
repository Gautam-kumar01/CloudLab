'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { builtInTemplates } from '@/lib/templates';
import {
  Layout,
  Terminal,
  File,
  Coffee,
  Cpu,
  Loader2,
  Plus,
  X,
  Sparkles,
  Dices,
  FolderGit2,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Zap,
  Layers,
  Code2,
  Atom,
  Server,
} from 'lucide-react';

interface TemplateMeta {
  id: string;
  badge: string;
  badgeColor: string;
  glowColor: string;
  techStack: string;
  iconNode: React.ReactNode;
}

const templateMetadata: Record<string, TemplateMeta> = {
  blank: {
    id: 'blank',
    badge: 'Clean Slate',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    glowColor: 'group-hover:border-emerald-500/40',
    techStack: 'Terminal • Node 20 • Python 3',
    iconNode: <File size={20} className="text-emerald-400" />,
  },
  'react-vite': {
    id: 'react-vite',
    badge: 'POPULAR',
    badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
    glowColor: 'group-hover:border-cyan-500/40',
    techStack: 'React 19 • Vite 5 • Tailwind',
    iconNode: <Layout size={20} className="text-cyan-400" />,
  },
  nodejs: {
    id: 'nodejs',
    badge: 'BACKEND',
    badgeColor: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    glowColor: 'group-hover:border-emerald-500/40',
    techStack: 'Node.js 20 • NPM • ES Modules',
    iconNode: <Terminal size={20} className="text-emerald-400" />,
  },
  python: {
    id: 'python',
    badge: 'AI & DATA',
    badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    glowColor: 'group-hover:border-amber-500/40',
    techStack: 'Python 3.12 • Pip • Venv',
    iconNode: <Code2 size={20} className="text-amber-400" />,
  },
  java: {
    id: 'java',
    badge: 'ENTERPRISE',
    badgeColor: 'text-orange-300 bg-orange-500/15 border-orange-500/30',
    glowColor: 'group-hover:border-orange-500/40',
    techStack: 'OpenJDK 21 • Standard JRE',
    iconNode: <Coffee size={20} className="text-orange-400" />,
  },
  cpp: {
    id: 'cpp',
    badge: 'SYSTEMS',
    badgeColor: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30',
    glowColor: 'group-hover:border-indigo-500/40',
    techStack: 'GCC / Clang • GDB • CMake',
    iconNode: <Cpu size={20} className="text-indigo-400" />,
  },
  go: {
    id: 'go',
    badge: 'CLOUD NATIVE',
    badgeColor: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
    glowColor: 'group-hover:border-teal-500/40',
    techStack: 'Go 1.22 • Microservices',
    iconNode: <Zap size={20} className="text-teal-400" />,
  },
};

const funProjectAdjectives = [
  'hyper', 'quantum', 'turbo', 'stellar', 'cosmic', 'prism', 'swift', 'zenith', 'nexus', 'apex', 'blaze', 'orbit'
];
const funProjectNouns = [
  'matrix', 'nebula', 'cluster', 'engine', 'pulse', 'beacon', 'flow', 'forge', 'fusion', 'core', 'stack', 'craft'
];

function generateRandomName() {
  const adj = funProjectAdjectives[Math.floor(Math.random() * funProjectAdjectives.length)];
  const noun = funProjectNouns[Math.floor(Math.random() * funProjectNouns.length)];
  const randNum = Math.floor(10 + Math.random() * 89);
  return `${adj}-${noun}-${randNum}`;
}

export default function NewProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setIsOpen(true);
    setErrorMsg(null);
    if (!name.trim()) {
      setName(generateRandomName());
    }
  };

  const handleShuffleName = () => {
    setName(generateRandomName());
  };

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
      {/* High-Impact Primary Call to Action Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="btn-cta-glow flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-bold tracking-wide cursor-pointer transition-all"
        title="Create a new isolated cloud workspace"
      >
        <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center text-black">
          <Plus size={16} strokeWidth={3} />
        </div>
        <span>New Project</span>
        <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/20 text-black font-extrabold">
          + Instant
        </span>
      </button>

      {/* Luxury Glassmorphic Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className="modal-animate-in w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#090d1a] border border-white/15 shadow-[0_25px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(16,185,129,0.18)] overflow-hidden flex flex-col"
          >
            {/* Top Radiant Gradient Accent Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between pb-5 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                    <Sparkles size={24} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      Create New Workspace
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select a high-performance starter template or launch an empty sandbox container.
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
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-6">
                {/* Project Name Field with Randomizer Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <FolderGit2 size={13} className="text-emerald-400" />
                      <span>Workspace Name</span>
                      <span className="text-emerald-400 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleShuffleName}
                      className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                      title="Generate a random name"
                    >
                      <Dices size={12} />
                      <span>Randomize</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. saas-analytics-app"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Starter Templates Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Layers size={13} className="text-teal-400" />
                      <span>Select Starter Environment</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {builtInTemplates.length} templates available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {builtInTemplates.map((t) => {
                      const isSelected = selectedTemplate === t.id;
                      const meta = templateMetadata[t.id] || {
                        id: t.id,
                        badge: 'TEMPLATE',
                        badgeColor: 'text-slate-300 bg-slate-800 border-white/10',
                        glowColor: 'hover:border-white/20',
                        techStack: t.language,
                        iconNode: <File size={20} className="text-slate-300" />,
                      };

                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTemplate(t.id)}
                          className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none ${
                            isSelected
                              ? 'bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)] scale-[1.02]'
                              : 'bg-slate-950/60 border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/80 hover:shadow-lg'
                          }`}
                        >
                          {/* Top Row: Icon and Badge */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 shadow-sm'
                                  : 'bg-slate-900 border border-white/10 group-hover:scale-105'
                              }`}
                            >
                              {meta.iconNode}
                            </div>
                            <span
                              className={`text-[9.5px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                            >
                              {meta.badge}
                            </span>
                          </div>

                          {/* Middle: Title & Description */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4
                                className={`text-sm font-bold tracking-tight transition-colors ${
                                  isSelected ? 'text-emerald-300' : 'text-white group-hover:text-emerald-300'
                                }`}
                              >
                                {t.name}
                              </h4>
                              {isSelected && (
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-snug line-clamp-2 mb-2">
                              {t.description}
                            </p>
                          </div>

                          {/* Bottom: Tech specs */}
                          <div className="pt-2 border-t border-white/5 text-[10.5px] font-mono text-slate-500 truncate">
                            {meta.techStack}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Telemetry Hardware Spec Banner */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-emerald-400" />
                    <span><strong className="text-white font-semibold">2 vCPU</strong> Dedicated</span>
                  </div>
                  <div className="hidden sm:block w-px h-3.5 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Server size={14} className="text-blue-400" />
                    <span><strong className="text-white font-semibold">4 GB</strong> Memory</span>
                  </div>
                  <div className="hidden sm:block w-px h-3.5 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Rocket size={14} className="text-amber-400" />
                    <span><strong className="text-white font-semibold">140ms</strong> Cold Boot</span>
                  </div>
                  <div className="hidden sm:block w-px h-3.5 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">Strict Isolation</span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
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
                    disabled={isLoading || !name.trim()}
                    className="btn-cta-glow flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Provisioning Sandbox...</span>
                      </>
                    ) : (
                      <>
                        <Rocket size={15} />
                        <span>Launch Workspace</span>
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
