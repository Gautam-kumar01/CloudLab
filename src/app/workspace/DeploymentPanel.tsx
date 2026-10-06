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
    <div className="flex flex-col h-full bg-[#070b14] text-slate-100 select-none cloudlab-panel">
      {/* Header Bar */}
      <div className="px-4 py-3.5 bg-[#0a0f1d] border-b border-white/[0.08] flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <Rocket size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide">Docker Deployment</span>
              <span
                className={`inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${
                  dockerAvailable === false
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                    : status === 'running'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                    : status === 'building' || isDeploying
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                    : 'bg-slate-800/80 text-slate-400 border-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dockerAvailable === false
                      ? 'bg-amber-400'
                      : status === 'running'
                      ? 'bg-emerald-400 animate-pulse'
                      : isDeploying
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-slate-500'
                  }`}
                />
                {dockerAvailable === false
                  ? 'Offline'
                  : status === 'running'
                  ? 'Live'
                  : isDeploying
                  ? 'Building...'
                  : 'Stopped'}
              </span>
            </div>
            <div className="text-[11.5px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">Stack:</span>
              <span className="text-slate-200 font-semibold whitespace-normal break-words">{detection?.stack || 'Scanning stack...'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStatus();
            fetchLogs();
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          title="Refresh Status"
        >
          <RefreshCw size={13} className={isDeploying ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Error Notice */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5 shadow-md">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-red-400" />
            <div className="flex-1 space-y-1 min-w-0">
              <span className="font-semibold block text-red-300 text-xs">Deployment Error</span>
              <p className="leading-relaxed cloudlab-mono text-[11px] text-red-200/90 whitespace-normal break-words">{errorMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-200 transition-colors cursor-pointer shrink-0"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Docker Offline Notice / Alternative Command */}
        {dockerAvailable === false && !errorMsg && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/[0.08] to-amber-950/[0.04] border border-amber-500/25 text-slate-200 text-xs space-y-3.5 shadow-md shadow-amber-950/20">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle size={13} />
              </div>
              <span className="text-xs font-bold">Docker Daemon Offline</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-200/85 whitespace-normal break-words">
              Docker Desktop is not currently running. Start Docker Desktop to deploy in a container, or run locally right now via <strong>Terminal</strong>:
            </p>
            <div className="p-3 rounded-xl bg-[#050811] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Terminal Command</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 cloudlab-mono text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Terminal ready
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/60 border border-white/5 rounded-lg px-3 py-2 gap-2">
                <code className="text-emerald-300 cloudlab-mono text-xs font-bold break-all whitespace-normal select-all">
                  {runCommand}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(runCommand)}
                  className="text-slate-400 hover:text-white text-xs transition-colors p-1 rounded hover:bg-white/10 cursor-pointer shrink-0"
                  title="Copy command"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Container Status Banner */}
        {status === 'running' && url ? (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-500/15 via-[#0c1f20] to-[#0a0f1d] border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 size={16} />
                <span>Container Live & Serving</span>
              </div>
              <span className="text-[10.5px] cloudlab-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-medium">
                Port {hostPort}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-xl bg-slate-950/90 border border-emerald-500/20 text-xs gap-2.5">
              <div className="flex items-center gap-2 text-slate-200 cloudlab-mono text-xs break-all whitespace-normal min-w-0">
                <Globe size={14} className="text-emerald-400 shrink-0" />
                <span className="break-all">{url}</span>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
              >
                <span>Open</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              <button
                type="button"
                disabled={isDeploying}
                onClick={() => handleAction('restart')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Restart</span>
              </button>
              <button
                type="button"
                disabled={isDeploying}
                onClick={() => handleAction('stop')}
                className="py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <Square size={13} />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          /* Deploy Action Card */
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border border-white/10 shadow-xl space-y-4">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap size={13} />
                </div>
                <span className="tracking-wide">Isolated Docker Container</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-normal break-words pt-0.5">
                Builds an isolated container sandbox for <strong className="text-white font-semibold">{detection?.stack || 'your app'}</strong> with port forwarding.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex-1 min-w-[120px] p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-2 text-slate-300">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-medium whitespace-normal">Rootless Sandbox</span>
              </div>
              <div className="flex-1 min-w-[100px] p-2.5 rounded-xl bg-slate-950/80 border border-white/5 flex items-center gap-2 text-slate-300">
                <Globe size={14} className="text-blue-400 shrink-0" />
                <span className="text-xs font-medium whitespace-normal">Port {detection?.defaultPort || 3000}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isDeploying}
              onClick={() => handleAction('start')}
              className="btn-cta-glow w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 min-h-[42px]"
            >
              {isDeploying ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Building Container...</span>
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
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FileCode size={14} className="text-teal-400 shrink-0" />
              <span>Dockerfile Configuration</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDockerfile(!showDockerfile)}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 transition-colors cursor-pointer"
            >
              {showDockerfile ? 'Hide' : 'Inspect'}
            </button>
          </div>

          {showDockerfile && (
            <textarea
              rows={7}
              value={customDockerfile}
              onChange={(e) => setCustomDockerfile(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-xl p-3 text-xs cloudlab-mono text-emerald-300 leading-relaxed outline-none focus:border-teal-400 resize-none"
            />
          )}
        </div>

        {/* Live Streaming Build & Container Logs */}
        <div className="rounded-2xl bg-[#050811] border border-white/10 overflow-hidden shadow-xl flex flex-col">
          <div className="px-4 py-3 bg-[#0a0f1d] border-b border-white/[0.08] flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-300 text-xs">Deployment Logs</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLogs}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-white/5"
            >
              {copiedLogs ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedLogs ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 cloudlab-mono text-xs text-slate-300 max-h-56 overflow-y-auto space-y-1.5 select-text scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
            {logs.length === 0 ? (
              <div className="text-slate-500 cloudlab-panel text-xs py-5 text-center leading-relaxed">
                No logs recorded yet. Click Build & Deploy to view live container output.
              </div>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap break-all leading-relaxed">
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
