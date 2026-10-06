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
  X,
} from 'lucide-react';
import { getErrorMessage } from '@/lib/error-utils';

interface DeploymentPanelProps {
  workspaceId: string;
}

interface StackDetection {
  stack: string;
  defaultPort: number;
  dockerfile: string;
  isGenerated: boolean;
  runCommand?: string;
  dockerAvailable?: boolean;
  dockerReason?: string;
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
  const [dockerAvailable, setDockerAvailable] = useState<boolean | null>(null);
  const [dockerReason, setDockerReason] = useState<string | null>(null);
  const [runCommand, setRunCommand] = useState<string>('npm run dev');

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
        if (typeof data.data.dockerAvailable === 'boolean') {
          setDockerAvailable(data.data.dockerAvailable);
        }
        if (data.data.dockerReason) {
          setDockerReason(data.data.dockerReason);
        }
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
        if (typeof data.data.dockerAvailable === 'boolean') {
          setDockerAvailable(data.data.dockerAvailable);
        }
        if (data.data.dockerReason) {
          setDockerReason(data.data.dockerReason);
        }
        if (data.data.runCommand) {
          setRunCommand(data.data.runCommand);
        }
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
        const errorText = getErrorMessage(data, 'Operation failed. Ensure Docker Desktop is running.');
        setErrorMsg(errorText);
      }
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err, 'Network error while contacting Docker API'));
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
      <div className="px-3.5 py-2.5 bg-[#0a0f1d] border-b border-white/[0.08] flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <Rocket size={14} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
              <span>Docker Deployment</span>
              <span
                className={`text-[9.5px] font-sans font-medium px-2 py-0.5 rounded-full border ${
                  dockerAvailable === false
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                    : status === 'running'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                    : status === 'building' || isDeploying
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
              >
                {dockerAvailable === false
                  ? 'Offline'
                  : status === 'running'
                  ? '● Live'
                  : isDeploying
                  ? 'Building...'
                  : 'Stopped'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans tracking-normal mt-0.5 truncate">
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          title="Refresh Status"
        >
          <RefreshCw size={13} className={isDeploying ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <div className="flex-1 space-y-1 min-w-0">
              <span className="font-semibold block text-red-300">Deployment Error</span>
              <p className="leading-normal font-mono text-[11px] text-red-200/90 whitespace-pre-wrap break-words">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-200 transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Docker Offline Notice / Alternative Command */}
        {dockerAvailable === false && !errorMsg && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300/90 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <span>Docker Daemon Offline</span>
            </div>
            <p className="text-[11.5px] leading-normal text-amber-200/80">
              Docker Desktop is not currently running. To deploy in a container, start Docker Desktop. Or run your project right now in the <strong>Terminal</strong>:
            </p>
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-amber-500/20 font-mono text-[11px] gap-2">
              <span className="text-slate-300 truncate">Run: <span className="text-emerald-400 font-bold">{runCommand}</span></span>
              <span className="text-[10px] text-slate-400 shrink-0">Terminal ready</span>
            </div>
          </div>
        )}

        {/* Live Container Status Banner */}
        {status === 'running' && url ? (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 size={15} />
                <span>Container Live & Serving</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Port {hostPort}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/90 border border-emerald-500/20 text-xs gap-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-mono text-[11px] truncate">
                <Globe size={12} className="text-emerald-400 shrink-0" />
                <span className="truncate">{url}</span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
              >
                <span>Open</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                disabled={isDeploying}
                onClick={() => handleAction('restart')}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Restart</span>
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
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0e172a] to-[#0a0f1d] border border-white/10 shadow-lg space-y-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" />
                <span>Isolated Docker Container</span>
              </div>
              <p className="text-[11.5px] text-slate-400 leading-normal">
                Builds an isolated container sandbox for <strong className="text-slate-200">{detection?.stack || 'your app'}</strong> with port forwarding.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/5 text-slate-300 font-medium">
                <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                <span>Rootless Sandbox</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/5 text-slate-300 font-medium">
                <Globe size={12} className="text-blue-400 shrink-0" />
                <span>Port {detection?.defaultPort || 3000}</span>
              </span>
            </div>

            <button
              type="button"
              disabled={isDeploying}
              onClick={() => handleAction('start')}
              className="btn-cta-glow w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Building Container...</span>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>Build & Deploy to Docker</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Dockerfile Viewer / Editor Toggle */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <FileCode size={13} className="text-teal-400 shrink-0" />
              <span>Dockerfile Config</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDockerfile(!showDockerfile)}
              className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors font-medium cursor-pointer"
            >
              {showDockerfile ? 'Hide' : 'Inspect'}
            </button>
          </div>

          {showDockerfile && (
            <textarea
              rows={6}
              value={customDockerfile}
              onChange={(e) => setCustomDockerfile(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-emerald-300 leading-relaxed outline-none focus:border-teal-400 resize-none"
            />
          )}
        </div>

        {/* Live Streaming Build & Container Logs */}
        <div className="rounded-xl bg-[#050811] border border-white/10 overflow-hidden shadow-lg flex flex-col">
          <div className="px-3 py-2 bg-[#0a0f1d] border-b border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Terminal size={12} className="text-emerald-400 shrink-0" />
              <span className="font-medium text-slate-300 text-[11px]">Deployment Logs</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLogs}
              className="flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {copiedLogs ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 font-mono text-[11px] text-slate-300 max-h-52 overflow-y-auto space-y-1 select-text">
            {logs.length === 0 ? (
              <div className="text-slate-500 font-sans text-xs py-2 text-center">No logs yet. Click Deploy to start.</div>
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
