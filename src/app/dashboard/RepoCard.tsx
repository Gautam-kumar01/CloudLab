'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GitBranch,
  Lock,
  Globe,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
  Code2,
} from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status: 'Running' | 'Sleeping' | 'Ready' | 'Stopped' | string;
  lastAccessed: string;
  language?: string;
  cloneUrl?: string;
  isPrivate?: boolean;
  stars?: number;
  defaultBranch?: string;
}

const languageColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  TypeScript: { bg: 'rgba(49, 120, 198, 0.15)', text: '#60a5fa', border: 'rgba(49, 120, 198, 0.35)', label: 'TS' },
  JavaScript: { bg: 'rgba(247, 223, 30, 0.12)', text: '#fde047', border: 'rgba(247, 223, 30, 0.3)', label: 'JS' },
  Python: { bg: 'rgba(53, 114, 165, 0.15)', text: '#38bdf8', border: 'rgba(53, 114, 165, 0.35)', label: 'PY' },
  HTML: { bg: 'rgba(227, 76, 38, 0.15)', text: '#fb923c', border: 'rgba(227, 76, 38, 0.35)', label: 'HTML' },
  CSS: { bg: 'rgba(86, 61, 124, 0.15)', text: '#c084fc', border: 'rgba(86, 61, 124, 0.35)', label: 'CSS' },
  Rust: { bg: 'rgba(222, 90, 38, 0.15)', text: '#f97316', border: 'rgba(222, 90, 38, 0.35)', label: 'RS' },
  Go: { bg: 'rgba(0, 173, 216, 0.15)', text: '#22d3ee', border: 'rgba(0, 173, 216, 0.35)', label: 'GO' },
  C: { bg: 'rgba(85, 85, 85, 0.15)', text: '#94a3b8', border: 'rgba(85, 85, 85, 0.35)', label: 'C' },
  'C++': { bg: 'rgba(243, 75, 125, 0.15)', text: '#f43f5e', border: 'rgba(243, 75, 125, 0.35)', label: 'C++' },
};

export default function RepoCard({ project }: { project: ProjectData }) {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const langConfig = languageColors[project.language || ''] || {
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.25)',
    label: (project.language || 'CODE').slice(0, 3).toUpperCase(),
  };

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCloning) return;
    setErrorMsg(null);

    if (project.cloneUrl) {
      setIsCloning(true);
      try {
        const res = await fetch('/api/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cloneUrl: project.cloneUrl, name: project.name }),
        });

        const data = await res.json();

        if (res.ok && (data.projectId || data.success)) {
          const targetId = data.projectId || project.id || project.name;
          router.push(`/workspace?id=${encodeURIComponent(targetId)}`);
        } else {
          setErrorMsg(data.error || 'Failed to clone repository');
          setIsCloning(false);
        }
      } catch (err: any) {
        console.error('Cloning error:', err);
        setErrorMsg('Network error while connecting to workspace');
        setIsCloning(false);
      }
    } else {
      router.push(`/workspace?id=${encodeURIComponent(project.id)}`);
    }
  };

  return (
    <div
      onClick={handleOpen}
      className="group relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.85), rgba(11, 17, 26, 0.95))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(12px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.45)';
      }}
    >
      {/* Top Bar: Language Badge & Visibility Indicator */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider"
              style={{
                background: langConfig.bg,
                color: langConfig.text,
                border: `1px solid ${langConfig.border}`,
              }}
            >
              {langConfig.label}
            </div>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Code2 size={12} className="text-slate-500" />
              {project.language || 'Generic'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10">
            {project.isPrivate ? (
              <>
                <Lock size={10} className="text-amber-400" /> Private
              </>
            ) : (
              <>
                <Globe size={10} className="text-emerald-400" /> Public
              </>
            )}
          </div>
        </div>

        {/* Repository Title & Description */}
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors duration-200 truncate mb-1.5">
          {project.name}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed mb-4">
          {project.description || `CloudLab instant cloud runtime container for ${project.name}.`}
        </p>
      </div>

      {/* Footer Info: Status, Timestamp, Open Action */}
      <div>
        {errorMsg && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-slate-300">Ready</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Calendar size={11} />
              <span>{project.lastAccessed}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isCloning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-200 shadow-sm"
          >
            {isCloning ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Cloning...</span>
              </>
            ) : (
              <>
                <span>Open IDE</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
