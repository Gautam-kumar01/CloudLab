'use client';

import {
  Terminal,
  Cpu,
  Sparkles,
  Users,
  GitBranch,
  Rocket,
  Shield,
  Layers,
  Code2,
  Lock,
  Globe,
  Zap
} from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="cl-section relative overflow-hidden bg-grid-pattern">
      <div
        className="ambient-glow-purple"
        style={{ top: '10%', right: '-120px', opacity: 0.25 }}
      />
      <div
        className="ambient-glow-green"
        style={{ bottom: '5%', left: '-120px', opacity: 0.25 }}
      />

      <div className="cl-container relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Developer Superpowers</span>
          </div>
          <h2 className="typo-h1 text-white">
            Everything You Need to Build Fast
          </h2>
          <p className="typo-body-lg mt-4 text-slate-400">
            Engineered from scratch for speed, security, and developer joy. No setup headaches, no compromised web sandboxes.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large 2-column span): Docker Root Isolation */}
          <div className="bento-card md:col-span-2 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Root Access
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Isolated Linux Docker Sandboxes
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Every workspace spins up in a dedicated Linux Docker container with dedicated CPU, memory, and full root access. Install any package via <code className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">apt-get</code>, run background databases, or compile native C/Rust binaries.
            </p>

            {/* Visual Micro UI */}
            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-white/5 mb-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>docker-sandbox • isolation status: active</span>
              </div>
              <div className="space-y-1 text-slate-400">
                <p className="text-emerald-400">$ apt-get update && apt-get install -y postgresql redis</p>
                <p className="text-slate-500">Unpacking postgresql-16 (16.2-1.pgdg120+1) ...</p>
                <p className="text-emerald-300">✓ Service postgresql started on port 5432</p>
              </div>
            </div>
          </div>

          {/* Card 2: Monaco Editor Engine */}
          <div className="bento-card group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                VS Code Engine
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Monaco-Powered Editor
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Full IntelliSense autocomplete, syntax error highlighting, multi-file navigation, and keybindings you already know from VS Code.
            </p>

            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-blue-300">
              <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">TypeScript 5</span>
              <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">Prettier</span>
              <span className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">Emmet</span>
            </div>
          </div>

          {/* Card 3: Multiplayer Real-Time CRDTs */}
          <div className="bento-card group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Yjs CRDT
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Multiplayer Pair Programming
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Share a workspace link and code together in real-time. Live multi-color cursor tracking, shared terminal sessions, and zero merge conflicts.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">G</div>
                <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">A</div>
                <div className="w-7 h-7 rounded-full bg-cyan-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">S</div>
              </div>
              <span className="text-xs text-slate-400 font-mono">3 live coders syncing</span>
            </div>
          </div>

          {/* Card 4 (2-column span): AI Copilot & Autonomous Tools */}
          <div className="bento-card md:col-span-2 group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Multi-Model AI
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Autonomous AI Copilot with Safe Tools
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Connect your favorite models (Gemini 2.5, Claude, GPT-4o, Groq, or OpenRouter). CloudLab AI understands your repository tree, reads context, writes files, and executes commands with safe human approval gates.
            </p>

            {/* Visual Micro UI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-1">
                <span className="text-slate-500">Autonomous Tool</span>
                <span className="text-emerald-400 font-semibold">readFile & writeFile</span>
                <span className="text-slate-400 text-[11px]">Direct AST file editing</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-1">
                <span className="text-slate-500">Terminal Tool</span>
                <span className="text-purple-400 font-semibold">runCommand</span>
                <span className="text-slate-400 text-[11px]">Human approval popup</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-1">
                <span className="text-slate-500">Model Selector</span>
                <span className="text-amber-400 font-semibold">Gemini / GPT / Claude</span>
                <span className="text-slate-400 text-[11px]">Bring your own keys</span>
              </div>
            </div>
          </div>

          {/* Card 5: GitHub Sync & 1-Click Deploy */}
          <div className="bento-card md:col-span-3 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Continuous Delivery
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  1-Click GitHub Import & Docker Deploy
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  Import any public or private GitHub repository instantly. When your code is ready, hit <strong>Deploy</strong> to build your container and expose an instant preview URL.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>deployments/preview-build</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    SUCCESS
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-400">
                  <p>✔ Repository cloned: <span className="text-slate-200">Gautam-kumar01/CloudLab</span></p>
                  <p>✔ Docker build completed in 4.2s</p>
                  <p className="text-emerald-400">🚀 Live URL: https://cloudlab-app.dev/preview/demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
