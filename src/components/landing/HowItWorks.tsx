'use client';

import { useState } from 'react';
import { GitPullRequest, Terminal, Rocket, Check, ArrowRight, Sparkles, FolderGit2, Code2, Users } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Choose a Stack or Import Repo',
    badge: 'Instant Setup',
    description:
      'Launch from pre-configured templates (Next.js, Python, Go, Rust) or clone any public/private GitHub repository with a single click.',
    command: 'git clone https://github.com/your-org/awesome-app',
    highlight: 'Auto-detects framework, installs dependencies, and provisions container.',
  },
  {
    step: '02',
    title: 'Code with Full Cloud Superpowers',
    badge: 'Zero Latency',
    description:
      'Write code inside Monaco Editor with LSP intelligence, run commands in your root Linux Docker terminal, and get AI assistance.',
    command: 'cloudlab@workspace:~$ docker compose up -d && pnpm dev',
    highlight: 'Full root access with dedicated memory and storage quotas.',
  },
  {
    step: '03',
    title: 'Collaborate Live & Deploy in 1-Click',
    badge: 'Production Ready',
    description:
      'Invite teammates to your workspace for real-time cursor syncing and pair programming. When ready, click Deploy to generate a live URL.',
    command: 'Deploying cloudlab-preview-prod... [SUCCESS: https://app.cloudlab.dev]',
    highlight: 'Instant preview URLs, port forwarding, and seamless GitHub PR sync.',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="cl-section relative overflow-hidden bg-[#050914]">
      <div
        className="ambient-glow-green"
        style={{ top: '20%', left: '-140px', opacity: 0.2 }}
      />

      <div className="cl-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="typo-h1 text-white">
            From Zero to Running App in Seconds
          </h2>
          <p className="typo-body-lg mt-4 text-slate-400">
            No bloated local node_modules, no broken dependencies, and no machine slowdowns.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-2xl p-7 transition-all duration-300 border ${
                  isSelected
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-xl shadow-emerald-500/10 -translate-y-1'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`text-2xl font-black font-mono ${
                      isSelected ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  >
                    {s.step}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {s.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {s.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {s.description}
                </p>

                {/* Code Snippet Box */}
                <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-1.5 text-[11px]">
                    <Terminal className="w-3 h-3" />
                    <span>terminal preview</span>
                  </div>
                  <p className="text-slate-400 truncate">{s.command}</p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[12px] text-emerald-400/90">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{s.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
