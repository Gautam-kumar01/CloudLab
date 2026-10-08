"use client";

import { useState } from "react";
import {
  Code2,
  Terminal,
  Users,
  Globe2,
  Cpu,
  Sparkles,
  CheckCircle2,
  Laptop,
} from "lucide-react";

const CAPABILITIES = [
  {
    id: "editor",
    icon: Code2,
    title: "Monaco Code Editor",
    badge: "Core IDE",
    headline: "The editing engine behind VS Code, running in your browser",
    description:
      "Full syntax highlighting, code folding, intelligent autocomplete, multi-file tab navigation, and customizable themes. Edit TypeScript, Python, HTML, CSS, JSON, and more without installing local extensions.",
    highlights: [
      "Industry-standard Monaco Editor engine",
      "Multi-tab file switcher and project tree",
      "Automatic syntax highlighting and error detection",
    ],
  },
  {
    id: "terminal",
    icon: Terminal,
    title: "Sandboxed Web Terminal",
    badge: "Container Shell",
    headline: "Low-latency interactive shell connected via WebSocket",
    description:
      "Run real commands inside your dedicated Docker workspace container. Install packages with npm, pip, or yarn, start servers, and run test suites directly through the browser console.",
    highlights: [
      "Real shell session connected via xterm.js over WebSockets",
      "Full execution inside the container with unprivileged user",
      "ANSI color support and standard POSIX shell utilities",
    ],
  },
  {
    id: "collaboration",
    icon: Users,
    title: "Real-time Multiplayer Sync",
    badge: "CRDT Engine",
    headline: "Conflict-free collaborative editing powered by Yjs",
    description:
      "Share your workspace with teammates. Watch real-time cursor movements, edit the same files simultaneously, and avoid merge conflicts with Yjs mathematical convergence.",
    highlights: [
      "Low-latency Yjs CRDT synchronization over WebSockets",
      "Live remote presence and cursor positioning",
      "Role-based workspace access (Owner, Member, Viewer)",
    ],
  },
  {
    id: "preview",
    icon: Globe2,
    title: "In-Browser Live Preview",
    badge: "Reverse Proxy",
    headline: "Instant visual feedback for your web applications",
    description:
      "Whenever your web dev server starts (port 3000, 5173, etc.), CloudLab's reverse proxy forwards HTTP traffic to an interactive in-browser preview tab without manual port forwarding.",
    highlights: [
      "Dynamic reverse proxy routes container ports",
      "Isolated in-browser webview tab with reload controls",
      "Works with Next.js, Vite, React, Vue, Express, and Flask",
    ],
  },
  {
    id: "worker",
    icon: Cpu,
    title: "Background Job Worker",
    badge: "pg-boss Queue",
    headline: "Asynchronous task orchestration that never freezes the UI",
    description:
      "Heavy jobs like building container images with LocalDockerDeployer or running Git clones are offloaded to our PostgreSQL-backed pg-boss worker, keeping the frontend responsive.",
    highlights: [
      "PostgreSQL-backed pg-boss job queue",
      "Automated idle container termination to save memory",
      "Audit logging for deployment attempts and results",
    ],
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "AI Development Assistant",
    badge: "Workspace Copilot",
    headline: "Context-aware coding help built into your workspace",
    description:
      "Ask the integrated AI assistant to explain complex code snippets, suggest bug fixes from terminal errors, or draft boilerplate implementations right inside your project.",
    highlights: [
      "Integrated workspace chat interface",
      "Code explanations and refactoring suggestions",
      "Assistance diagnosing terminal error logs",
    ],
  },
];

export default function WorkspaceCapabilities() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeCapability = CAPABILITIES[selectedIdx];
  const ActiveIcon = activeCapability.icon;

  return (
    <section id="features" className="cl-section relative scroll-mt-24">
      <div className="cl-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span>GENUINE CAPABILITIES</span>
          </div>
          <h2 className="typo-h1 text-white tracking-tight">
            Tools built into every <span className="text-emerald-400">CloudLab Workspace</span>
          </h2>
          <p className="typo-body-lg mt-4 text-slate-300">
            Real features backed by genuine implementation in our codebase.
          </p>
        </div>

        {/* Feature Tabs Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            const isSelected = idx === selectedIdx;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                aria-selected={isSelected}
                role="tab"
              >
                <Icon
                  className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`}
                />
                <span>{cap.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Capability Showcase Box */}
        <div className="glass-card p-6 sm:p-10 border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Info Side */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                <ActiveIcon className="w-3.5 h-3.5" />
                <span>{activeCapability.badge}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {activeCapability.headline}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeCapability.description}
              </p>

              <div className="pt-4 space-y-2.5">
                {activeCapability.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Preview Side */}
            <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#070b16] p-6 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  cloudlab-workspace
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="text-slate-400 text-[11px]">
                  # Feature: {activeCapability.title}
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-emerald-300 text-[11px] leading-relaxed">
                  {activeCapability.id === "editor" && (
                    <>
                      <div>1 &nbsp; import React from &quot;react&quot;;</div>
                      <div>2 &nbsp; export default function App() &#123;</div>
                      <div>3 &nbsp;&nbsp;&nbsp; return &lt;h1&gt;Hello CloudLab&lt;/h1&gt;;</div>
                      <div>4 &nbsp; &#125;</div>
                    </>
                  )}
                  {activeCapability.id === "terminal" && (
                    <>
                      <div className="text-slate-400">cloudlab@workspace:/workspace$ npm run dev</div>
                      <div className="text-emerald-400">&gt; ready - started server on 0.0.0.0:3000</div>
                      <div className="text-teal-300">&gt; local: http://localhost:3000</div>
                    </>
                  )}
                  {activeCapability.id === "collaboration" && (
                    <>
                      <div className="text-slate-400">[Yjs Sync] Connected to room: workspace-main</div>
                      <div className="text-emerald-400">&gt; Peer &quot;Alex&quot; joined (cursor on line 14)</div>
                      <div className="text-teal-300">&gt; Converged state: 0 merge conflicts</div>
                    </>
                  )}
                  {activeCapability.id === "preview" && (
                    <>
                      <div className="text-slate-400">[Preview Proxy] Bound to container: 3000</div>
                      <div className="text-emerald-400">&gt; Proxy status: 200 OK</div>
                      <div className="text-teal-300">&gt; URL: /api/preview/[workspace-id]</div>
                    </>
                  )}
                  {activeCapability.id === "worker" && (
                    <>
                      <div className="text-slate-400">[pg-boss] Listening for jobs: deployment, cleanup</div>
                      <div className="text-emerald-400">&gt; Job deployment started for project</div>
                      <div className="text-teal-300">&gt; Idle reaper: 0 inactive containers terminated</div>
                    </>
                  )}
                  {activeCapability.id === "ai" && (
                    <>
                      <div className="text-slate-400">[AI Assistant] Analyzing workspace context...</div>
                      <div className="text-emerald-400">&gt; Suggestion: Ensure environment variables match .env.example</div>
                      <div className="text-teal-300">&gt; Ready for coding queries</div>
                    </>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Verified in CloudLab codebase
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
