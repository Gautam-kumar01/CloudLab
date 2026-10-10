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
  RefreshCw,
  Server,
} from 'lucide-react';
import { getErrorMessage } from '@/lib/error-utils';

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

interface WorkspaceHealth {
  status: 'running' | 'exited' | 'created' | 'restarting' | 'paused' | 'dead' | 'removing' | 'stopped' | 'unavailable' | 'unknown';
  limits: { cpus: number | null; memoryBytes: number | null; processLimit: number | null } | null;
  usage: { cpuPercent: string | null; memoryUsage: string | null; memoryPercent: string | null } | null;
  checkedAt: string;
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
  const [health, setHealth] = useState<WorkspaceHealth | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const langConfig = languageColors[project.language || ''] || {
    bg: 'rgba(16, 185, 129, 0.15)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.35)',
    label: (project.language || 'CODE').slice(0, 3).toUpperCase(),
  };

  const handleHealthCheck = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isCheckingHealth) return;

    setIsCheckingHealth(true);
    setHealthError(null);
    try {
      const response = await fetch(`/api/workspace/health?workspaceId=${encodeURIComponent(project.id)}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message || 'Unable to check workspace status.');
      setHealth(body?.data?.health ?? null);
    } catch (error) {
      setHealthError(getErrorMessage(error, 'Unable to check workspace status.'));
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const healthLabel = health?.status === 'running' ? 'Running'
    : health?.status === 'exited' || health?.status === 'stopped' ? 'Stopped'
      : health?.status === 'created' ? 'Created'
        : health?.status === 'restarting' ? 'Restarting'
          : health?.status === 'paused' ? 'Paused'
            : health?.status === 'dead' ? 'Failed'
              : health?.status === 'removing' ? 'Stopping'
                : health?.status === 'unavailable' ? 'Runtime unavailable'
                  : health?.status === 'unknown' ? 'Unknown'
                    : 'Not checked';
  const healthDotColor = health?.status === 'running' ? '#34d399'
    : health?.status === 'unavailable' || health?.status === 'unknown' ? '#fbbf24'
      : health?.status ? '#94a3b8' : '#64748b';
  const limitSummary = health?.limits
    ? [
        health.limits.cpus ? `${health.limits.cpus} vCPU` : null,
        health.limits.memoryBytes ? `${(health.limits.memoryBytes / (1024 ** 3)).toFixed(1)} GiB RAM` : null,
        health.limits.processLimit ? `${health.limits.processLimit} processes` : null,
      ].filter(Boolean).join(' · ')
    : null;

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
          setErrorMsg(getErrorMessage(data, 'Failed to clone repository'));
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
          {project.description || `Docker-backed development workspace for ${project.name}.`}
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

        <div className="dash-health-panel" role="group" aria-label={`Runtime health for ${project.name}`} onClick={(event) => event.stopPropagation()}>
          <div className="dash-health-panel__head">
            <span className="dash-health-panel__state" data-status={health?.status || 'not-checked'} aria-live="polite">
              <i style={{ background: healthDotColor }} />
              {healthLabel}
            </span>
            <button
              type="button"
              className="dash-health-panel__refresh"
              onClick={handleHealthCheck}
              disabled={isCheckingHealth}
              aria-label={`${isCheckingHealth ? 'Checking' : 'Check'} runtime health for ${project.name}`}
            >
              <RefreshCw size={12} className={isCheckingHealth ? 'animate-spin' : ''} />
              {isCheckingHealth ? 'Checking…' : health ? 'Refresh' : 'Check runtime'}
            </button>
          </div>
          {health && (
            <div className="dash-health-panel__details" aria-live="polite">
              {limitSummary && <span><Server size={11} /> Limits: {limitSummary}</span>}
              {health.usage && <span>Usage: CPU {health.usage.cpuPercent || '—'} · RAM {health.usage.memoryUsage || 'unavailable'}</span>}
              {health.status === 'running' && !health.usage && <span>Live CPU/RAM sample unavailable on this host.</span>}
              {health.status === 'stopped' && <span>No workspace container is currently present.</span>}
              {health.status === 'exited' && <span>The workspace container is stopped.</span>}
              {health.status === 'unavailable' && <span>Docker runtime status is unavailable from this server.</span>}
              <small>Checked {new Date(health.checkedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
            </div>
          )}
          {healthError && <p className="dash-health-panel__error" role="status">{healthError}</p>}
          {!health && !healthError && !isCheckingHealth && <p className="dash-health-panel__hint">Check the container state and configured limits on demand.</p>}
        </div>

        <div className="dash-card-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-geist-mono), monospace' }}>
            <Calendar size={11} />
            <span>Last opened {project.lastAccessed}</span>
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
