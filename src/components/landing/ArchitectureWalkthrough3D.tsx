"use client";

import { useEffect, useRef, useState } from "react";
import {
  Code2,
  Server,
  Layers,
  Boxes,
  Cpu,
  Globe2,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Terminal,
  Activity,
  Maximize2,
  Info,
} from "lucide-react";

export interface ArchitectureStage {
  id: string;
  step: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
  beginnerTitle: string;
  beginnerSummary: string;
  underTheHood: string;
  codeReality: string;
  techSpecs: { label: string; value: string }[];
}

export const ARCHITECTURE_STAGES: ArchitectureStage[] = [
  {
    id: "browser-ide",
    step: "01",
    name: "Browser / CloudLab IDE",
    shortName: "Browser IDE",
    icon: Code2,
    tag: "Client Workspace",
    beginnerTitle: "You write code in your browser",
    beginnerSummary:
      "Open CloudLab in any web browser to start coding. You get a full Monaco code editor with syntax highlighting, a multi-file tree, and an interactive terminal tab.",
    underTheHood:
      "Runs Monaco Editor client-side. The terminal connects over WebSocket (/terminal) to xterm.js. Multiplayer collaboration connects to the Yjs synchronization engine (/collaboration).",
    codeReality: "Monaco Editor (@monaco-editor/react) + xterm.js + Yjs CRDT WebSockets",
    techSpecs: [
      { label: "Editor", value: "Monaco Editor" },
      { label: "Terminal", value: "xterm.js via WebSocket" },
      { label: "Collaboration", value: "Yjs CRDT protocol" },
    ],
  },
  {
    id: "api-server",
    step: "02",
    name: "CloudLab App & API",
    shortName: "CloudLab API",
    icon: Server,
    tag: "Control Plane",
    beginnerTitle: "CloudLab verifies access and coordinates requests",
    beginnerSummary:
      "When you edit files or run commands, CloudLab checks that you have permission (Owner, Member, or Viewer) and routes your requests securely to your workspace.",
    underTheHood:
      "Next.js App Router server routes authenticate user sessions, check workspace RBAC permissions against PostgreSQL, and scrub any temporary Git credentials before saving.",
    codeReality: "Next.js App Router + Prisma ORM + RBAC Authorization + Git token scrubber",
    techSpecs: [
      { label: "Framework", value: "Next.js App Router" },
      { label: "Auth / RBAC", value: "Owner, Member, Viewer roles" },
      { label: "Database", value: "PostgreSQL via Prisma" },
    ],
  },
  {
    id: "job-queue",
    step: "03",
    name: "Job Queue & Background Worker",
    shortName: "pg-boss Worker",
    icon: Layers,
    tag: "Job Scheduler",
    beginnerTitle: "Heavy tasks run in the background",
    beginnerSummary:
      "Long tasks like building Docker containers, cloning repositories, or terminating idle workspaces run in a background queue so your web editor stays snappy.",
    underTheHood:
      "worker.js listens to the PostgreSQL pg-boss queue. It handles asynchronous deployments (LocalDockerDeployer), Git clone operations, and the idle container cleanup reaper.",
    codeReality: "pg-boss on PostgreSQL + worker.js (deployment, git-operation, workspace-cleanup)",
    techSpecs: [
      { label: "Queue Engine", value: "pg-boss on PostgreSQL" },
      { label: "Deployment", value: "LocalDockerDeployer" },
      { label: "Idle Reaper", value: "Automatic idle container timeout" },
    ],
  },
  {
    id: "docker-engine",
    step: "04",
    name: "Docker Engine Runtime",
    shortName: "Docker Engine",
    icon: Boxes,
    tag: "Host Runtime",
    beginnerTitle: "Host Docker sets up a private sandbox",
    beginnerSummary:
      "The Docker engine creates a private bridge network and configures strict CPU, memory, and capability rules to prevent projects from interfering with one another.",
    underTheHood:
      "Spawns containers on the cloudlab-net bridge network. Enforces --security-opt no-new-privileges:true, --cap-drop ALL to drop Linux capabilities, and limits PIDs to 100.",
    codeReality: "Docker CLI with --network cloudlab-net --cap-drop ALL --security-opt no-new-privileges:true",
    techSpecs: [
      { label: "Network", value: "cloudlab-net (bridge)" },
      { label: "Capabilities", value: "--cap-drop ALL (unprivileged)" },
      { label: "Escalation", value: "no-new-privileges:true" },
    ],
  },
  {
    id: "project-container",
    step: "05",
    name: "Project Workspace Container",
    shortName: "Project Container",
    icon: Cpu,
    tag: "Container Sandbox",
    beginnerTitle: "Your project executes inside its container",
    beginnerSummary:
      "Your project files, dependencies, and shell commands run inside a dedicated Linux container named cloudlab-workspace-<id>. Memory is capped at 1GB and CPU at 1.0 core.",
    underTheHood:
      "Mounts your workspace files to /workspace:rw. Terminal commands execute inside the container via docker exec. An ephemeral tmpfs is mounted at /tmp for scratch files.",
    codeReality: "Container limits: --cpus 1.0, --memory 1g, --pids-limit 100, mounted /workspace:rw",
    techSpecs: [
      { label: "CPU Limit", value: "1.0 vCPU" },
      { label: "Memory Limit", value: "1 GB RAM" },
      { label: "PID Limit", value: "100 max processes" },
      { label: "Mount", value: "/workspace:rw volume" },
    ],
  },
  {
    id: "preview-proxy",
    step: "06",
    name: "Browser Preview Proxy",
    shortName: "Browser Preview",
    icon: Globe2,
    tag: "Live Endpoint",
    beginnerTitle: "Your live web application preview",
    beginnerSummary:
      "When you run your dev server (e.g. npm run dev on port 3000), CloudLab proxies web traffic directly from the container to an integrated browser preview window.",
    underTheHood:
      "CloudLab reverse proxy routes incoming HTTP requests to the container's bound port on the host bridge network, displaying the live app in an interactive iframe.",
    codeReality: "Dynamic reverse proxy (/api/preview/[id] or subdomains) to container port 3000/5173",
    techSpecs: [
      { label: "Proxy Target", value: "Container bound port" },
      { label: "Routing", value: "Dynamic reverse proxy" },
      { label: "Preview View", value: "Secure in-browser iframe" },
    ],
  },
];

export default function ArchitectureWalkthrough3D() {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<"3d" | "flat">("3d");
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setViewMode("flat");
        setIsPlaying(false);
      }
      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
        if (e.matches) {
          setViewMode("flat");
          setIsPlaying(false);
        }
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Auto-progression timer
  useEffect(() => {
    if (isPlaying && !isReducedMotion) {
      timerRef.current = setInterval(() => {
        setActiveStageIdx((prev) => (prev + 1) % ARCHITECTURE_STAGES.length);
      }, 4200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isReducedMotion]);

  const activeStage = ARCHITECTURE_STAGES[activeStageIdx];

  const handleNext = () => {
    setActiveStageIdx((prev) => (prev + 1) % ARCHITECTURE_STAGES.length);
  };

  const handlePrev = () => {
    setActiveStageIdx((prev) => (prev - 1 + ARCHITECTURE_STAGES.length) % ARCHITECTURE_STAGES.length);
  };

  const handleReset = () => {
    setActiveStageIdx(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full relative">
      {/* Visual Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Architecture Walkthrough</span>
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            (Demo illustration — verified container flow)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex rounded-lg bg-slate-900/80 p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                viewMode === "3d" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400 hover:text-white"
              }`}
              aria-label="3D Isometric perspective view"
            >
              3D View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("flat")}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                viewMode === "flat" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400 hover:text-white"
              }`}
              aria-label="2D Diagram flow view"
            >
              Flow View
            </button>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-1 bg-slate-900/80 rounded-lg p-0.5 border border-white/10">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition"
              aria-label="Previous architecture stage"
              title="Previous stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 text-slate-300 hover:text-emerald-400 rounded hover:bg-white/5 transition"
              aria-label={isPlaying ? "Pause walkthrough animation" : "Play walkthrough animation"}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition"
              aria-label="Next architecture stage"
              title="Next stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/5 transition"
              aria-label="Replay from stage 1"
              title="Replay from start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Architecture Frame */}
      <div className="rounded-2xl border border-white/10 bg-[#090d1a]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Stages Progress Track */}
        <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-white/10 bg-[#050914]/80">
          {ARCHITECTURE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = idx === activeStageIdx;
            const isCompleted = idx < activeStageIdx;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  setActiveStageIdx(idx);
                  setIsPlaying(false);
                }}
                className={`relative px-3 py-3 text-left transition-all duration-200 border-r border-white/5 last:border-r-0 flex flex-col gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isActive
                    ? "bg-emerald-500/10 border-b-2 border-b-emerald-400 text-white"
                    : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                }`}
                aria-selected={isActive}
                role="tab"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-semibold text-emerald-400">
                    {stage.step}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-emerald-400" : isCompleted ? "text-emerald-500/70" : "text-slate-500"
                    }`}
                  />
                </div>
                <span className="text-[12px] font-medium truncate">{stage.shortName}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* Body Split: Architecture Visualizer (Left/Top) & Stage Inspector (Right/Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* Visual Story Container */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0b1022] to-[#070b16]">
            {/* Background Grid Accent */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Stage Path Connector Legend */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-6 z-10 px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Stage {activeStage.step} of 06:</span>
                <strong className="text-white font-semibold">{activeStage.name}</strong>
              </span>
              <span className="text-slate-400">
                {isPlaying ? "Auto-cycling stages" : "Paused"}
              </span>
            </div>

            {/* 3D Isometric Viewport */}
            {viewMode === "3d" ? (
              <div
                className="w-full max-w-[540px] py-6 sm:py-10 flex items-center justify-center relative z-10"
                style={{
                  perspective: "1100px",
                }}
              >
                <div
                  className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3.5 transition-transform duration-500 ease-out"
                  style={{
                    transform: "rotateX(18deg) rotateZ(-4deg) translateY(-8px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {ARCHITECTURE_STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const isActive = idx === activeStageIdx;
                    return (
                      <div
                        key={stage.id}
                        onClick={() => {
                          setActiveStageIdx(idx);
                          setIsPlaying(false);
                        }}
                        className={`cursor-pointer rounded-xl p-4 transition-all duration-300 relative border select-none ${
                          isActive
                            ? "bg-[#0f1d2e] border-emerald-400 shadow-xl shadow-emerald-500/20"
                            : "bg-[#0b1325]/90 border-white/10 hover:border-white/20 hover:bg-[#0f172a]"
                        }`}
                        style={{
                          transform: isActive
                            ? "translateZ(28px) scale(1.04)"
                            : "translateZ(0px)",
                          boxShadow: isActive
                            ? "0 20px 40px -10px rgba(16, 185, 129, 0.35), 0 0 20px rgba(16, 185, 129, 0.2)"
                            : "0 4px 12px rgba(0,0,0,0.4)",
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setActiveStageIdx(idx);
                            setIsPlaying(false);
                          }
                        }}
                        aria-label={`Select stage ${stage.step}: ${stage.name}`}
                      >
                        {/* Active glow tag */}
                        {isActive && (
                          <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-black font-mono shadow">
                            ACTIVE
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono font-bold text-emerald-400">
                            {stage.step}
                          </span>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isActive
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/5 text-slate-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>

                        <h4
                          className={`text-xs font-semibold leading-tight line-clamp-1 ${
                            isActive ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {stage.shortName}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {stage.tag}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Flat 2D Flow Viewport */
              <div className="w-full max-w-[540px] flex flex-col gap-2.5 py-3 relative z-10">
                {ARCHITECTURE_STAGES.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isActive = idx === activeStageIdx;
                  return (
                    <div
                      key={stage.id}
                      onClick={() => {
                        setActiveStageIdx(idx);
                        setIsPlaying(false);
                      }}
                      className={`cursor-pointer rounded-xl p-3 sm:p-3.5 transition-all duration-200 border flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-emerald-500/10 border-emerald-400 text-white shadow-lg shadow-emerald-500/10"
                          : "bg-[#0b1325]/80 border-white/10 hover:border-white/20 text-slate-300 hover:bg-[#0f172a]"
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveStageIdx(idx);
                          setIsPlaying(false);
                        }
                      }}
                      aria-label={`Select stage ${stage.step}: ${stage.name}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-emerald-400 w-6">
                          {stage.step}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{stage.name}</div>
                          <div className="text-[11px] text-slate-400">{stage.tag}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Inspecting
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Real Data Flow Caption */}
            <div className="mt-4 text-center z-10">
              <p className="text-[11px] text-slate-400 font-mono">
                Browser IDE &rarr; API &rarr; pg-boss Worker &rarr; Docker Host &rarr; Workspace Container &rarr; Preview
              </p>
            </div>
          </div>

          {/* Stage Inspector Detail Panel (Right Side) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-[#070b16]">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                  Stage {activeStage.step}: {activeStage.tag}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeStageIdx + 1} / {ARCHITECTURE_STAGES.length}
                </span>
              </div>

              {/* Stage Name */}
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeStage.name}
              </h3>

              {/* Beginner Summary Card */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-white/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Beginner Walkthrough</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">
                  {activeStage.beginnerTitle}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeStage.beginnerSummary}
                </p>
              </div>

              {/* Under The Hood Details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Under the Hood (Engineering Architecture)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed bg-[#040711] p-3 rounded-lg border border-white/5 font-sans">
                  {activeStage.underTheHood}
                </p>
              </div>

              {/* Technical Configuration Specs */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Verified Runtime Specs
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeStage.techSpecs.map((spec) => (
                    <div
                      key={spec.label}
                      className="p-2 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <div className="text-[10px] text-slate-400 font-mono">{spec.label}</div>
                      <div className="text-[11px] font-semibold text-emerald-300 truncate mt-0.5">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Code Reality Pill */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono truncate">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{activeStage.codeReality}</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="shrink-0 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium text-xs ml-2"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
