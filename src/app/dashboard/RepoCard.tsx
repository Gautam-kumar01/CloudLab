'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Globe,
  ArrowRight,
  Loader2,
  Calendar,
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
  TypeScript: { bg: 'rgba(49, 120, 198, 0.18)', text: '#60a5fa', border: 'rgba(49, 120, 198, 0.4)', label: 'TS' },
  JavaScript: { bg: 'rgba(247, 223, 30, 0.15)', text: '#fde047', border: 'rgba(247, 223, 30, 0.35)', label: 'JS' },
  Python: { bg: 'rgba(53, 114, 165, 0.18)', text: '#38bdf8', border: 'rgba(53, 114, 165, 0.4)', label: 'PY' },
  HTML: { bg: 'rgba(227, 76, 38, 0.18)', text: '#fb923c', border: 'rgba(227, 76, 38, 0.4)', label: 'HTML' },
  CSS: { bg: 'rgba(86, 61, 124, 0.18)', text: '#c084fc', border: 'rgba(86, 61, 124, 0.4)', label: 'CSS' },
  Rust: { bg: 'rgba(222, 90, 38, 0.18)', text: '#f97316', border: 'rgba(222, 90, 38, 0.4)', label: 'RS' },
  Go: { bg: 'rgba(0, 173, 216, 0.18)', text: '#22d3ee', border: 'rgba(0, 173, 216, 0.4)', label: 'GO' },
  C: { bg: 'rgba(85, 85, 85, 0.18)', text: '#94a3b8', border: 'rgba(85, 85, 85, 0.4)', label: 'C' },
  'C++': { bg: 'rgba(243, 75, 125, 0.18)', text: '#f43f5e', border: 'rgba(243, 75, 125, 0.4)', label: 'C++' },
};

export default function RepoCard({ project }: { project: ProjectData }) {
  const router = useRouter();
  const [isCloning, setIsCloning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const langConfig = languageColors[project.language || ''] || {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.35)',
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
    <div onClick={handleOpen} className="dash-card">
      {/* Card Header & Body */}
      <div>
        <div className="dash-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-geist-mono), monospace',
                background: langConfig.bg,
                color: langConfig.text,
                border: `1px solid ${langConfig.border}`,
                letterSpacing: '0.04em',
              }}
            >
              {langConfig.label}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Code2 size={12} color="#64748b" />
              {project.language || 'Generic'}
            </span>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#94a3b8',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {project.isPrivate ? (
              <>
                <Lock size={10} color="#fbbf24" /> Private
              </>
            ) : (
              <>
                <Globe size={10} color="#34d399" /> Public
              </>
            )}
          </span>
        </div>

        <h3 className="dash-card-title">{project.name}</h3>

        <p className="dash-card-desc">
          {project.description || `CloudLab instant cloud runtime sandbox for ${project.name}.`}
        </p>
      </div>

      {/* Card Bottom / Footer */}
      <div>
        {errorMsg && (
          <div
            style={{
              marginBottom: '10px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '11.5px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <div className="dash-card-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
              <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '12px' }}>Ready</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-geist-mono), monospace' }}>
              <Calendar size={11} />
              <span>{project.lastAccessed}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={isCloning}
            className="dash-open-btn"
            style={{ cursor: isCloning ? 'wait' : 'pointer', opacity: isCloning ? 0.7 : 1 }}
          >
            {isCloning ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Cloning...</span>
              </>
            ) : (
              <>
                <span>Open IDE</span>
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
