'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Rocket,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Play,
  Square,
  RotateCcw,
  Code2,
  Layers,
  Zap,
  Globe,
  Loader2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface DeploymentPanelProps {
  workspaceId: string;
}

interface StackDetection {
  stack: string;
  defaultPort: number;
  dockerfile: string;
  isGenerated: boolean;
}

export default function DeploymentPanel({ workspaceId }: DeploymentPanelProps) {
  const [status, setStatus] = useState<string>('loading');
  const [containerName, setContainerName] = useState<string>('');
  const [hostPort, setHostPort] = useState<number>(3000);
  const [url, setUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [detection, setDetection] = useState<StackDetection | null>(null);
  const [showDockerfile, setShowDockerfile] = useState(false);
  const [customDockerfile, setCustomDockerfile] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/deployments/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, action: 'status' }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setStatus(data.data.status || 'not_found');
        setContainerName(data.data.containerName || '');
        if (data.data.hostPort) setHostPort(data.data.hostPort);
        setUrl(data.data.url || null);
      }
    } catch (e) {
      console.error('Failed to fetch docker status:', e);
    }
  }, [workspaceId]);

  const fetchStack = useCallback(async () => {
    try {
      const res = await fetch('/api/deployments/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, action: 'detect-stack' }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setDetection(data.data);
        setCustomDockerfile(data.data.dockerfile);
      }
    } catch (e) {
      console.error('Stack detection failed:', e);
    }
  }, [workspaceId]);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/deployments/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, action: 'logs' }),
      });
      const data = await res.json();
      if (res.ok && data.data?.logs) {
        setLogs(data.data.logs);
      }
    } catch (e) {}
  }, [workspaceId]);

  useEffect(() => {
    fetchStatus();
    fetchStack();
    fetchLogs();
    const interval = setInterval(() => {
      fetchStatus();
      if (status === 'running' || isDeploying) {
        fetchLogs();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchStack, fetchLogs, status, isDeploying]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setIsDeploying(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/deployments/docker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          action,
          customDockerfile: showDockerfile ? customDockerfile : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setStatus(data.data.status || 'running');
        setUrl(data.data.url || null);
        await fetchLogs();
      } else {
        setErrorMsg(data.error || 'Operation failed. Ensure Docker Desktop is running.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while contacting Docker API');
    } finally {
      setIsDeploying(false);
      await fetchStatus();
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b14] text-slate-100 font-sans select-none">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-[#0a0f1d] border-b border-white/[0.08] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400">
            <Rocket size={15} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Docker Deployment</span>
              <span
                className={`text-[9.5px] font-mono px-2 py-0.5 rounded-full border ${
                  status === 'running'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : status === 'building' || isDeploying
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
              >
                {status === 'running' ? '● Live Running' : isDeploying ? 'Building Image...' : 'Stopped'}
              </span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono">
              {detection?.stack || 'Scanning stack...'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStatus();
            fetchLogs();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Refresh Status"
        >
          <RefreshCw size={14} className={isDeploying ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Live Container Status Banner */}
        {status === 'running' && url ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 size={16} />
                <span>Container Live & Serving Traffic</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Port {hostPort}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-mono truncate">
                <Globe size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate">{url}</span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
              >
                <span>Open App</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isDeploying}
                onClick={() => handleAction('restart')}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Rebuild & Restart</span>
              </button>
              <button
                type="button"
                disabled={isDeploying}
                onClick={() => handleAction('stop')}
                className="py-1.5 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <Square size={12} />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          /* Deploy Action Card */
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e172a] to-[#0a0f1d] border border-white/10 shadow-lg space-y-3.5">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                <span>Run in Isolated Docker Container</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Builds a multi-stage Docker container image for your <strong>{detection?.stack || 'project'}</strong> and maps internal ports to local host.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-medium">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Rootless Sandbox</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-2">
                <Globe size={14} className="text-blue-400 shrink-0" />
                <span>Exposed Port {detection?.defaultPort || 3000}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isDeploying}
              onClick={() => handleAction('start')}
              className="btn-cta-glow w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Building & Launching Container...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Build & Deploy to Docker</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Dockerfile Viewer / Editor Toggle */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileCode size={14} className="text-teal-400" />
              <span>Dockerfile Configuration</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDockerfile(!showDockerfile)}
              className="text-[11px] text-teal-400 hover:text-teal-300 underline cursor-pointer"
            >
              {showDockerfile ? 'Hide Dockerfile' : 'Inspect Dockerfile'}
            </button>
          </div>

          {showDockerfile && (
            <textarea
              rows={6}
              value={customDockerfile}
              onChange={(e) => setCustomDockerfile(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-300 leading-relaxed outline-none focus:border-teal-400"
            />
          )}
        </div>

        {/* Live Streaming Build & Container Logs */}
        <div className="rounded-2xl bg-[#050811] border border-white/10 overflow-hidden shadow-xl flex flex-col">
          <div className="px-3.5 py-2 bg-[#0a0f1d] border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal size={13} className="text-emerald-400" />
              <span className="font-semibold text-slate-300">Deployment & Build Logs</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLogs}
              className="flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {copiedLogs ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 font-mono text-[11px] text-slate-300 max-h-56 overflow-y-auto space-y-1 select-text">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic">No deployment logs yet. Click Deploy to start.</div>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all">
                  {line.startsWith('[Docker]') ? (
                    <span className="text-teal-400 font-semibold">{line}</span>
                  ) : line.includes('Error') || line.includes('ERR') ? (
                    <span className="text-rose-400">{line}</span>
                  ) : (
                    <span className="text-slate-300">{line}</span>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
