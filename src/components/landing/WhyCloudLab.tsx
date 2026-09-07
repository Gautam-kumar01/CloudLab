'use client';

import { Check, X, Sparkles, Shield, Zap, Terminal, Laptop, Cloud } from 'lucide-react';

const comparisonRows = [
  {
    feature: 'Root Linux Docker Sandboxes',
    local: 'Uses local machine RAM & CPU',
    legacy: 'Limited in-browser WebContainer',
    cloudlab: 'Dedicated isolated Docker container with root access',
  },
  {
    feature: 'Terminal & Package Installation',
    local: 'Pollutes local disk & PATH',
    legacy: 'Restricted subset of Node.js only',
    cloudlab: 'Full Linux shell (apt-get, pip, cargo, go, pnpm)',
  },
  {
    feature: 'Real-Time Multiplayer Pair Programming',
    local: 'Requires screen share / Live Share plugins',
    legacy: 'Basic lock-based editing',
    cloudlab: 'Google Docs-tier Yjs CRDT real-time presence',
  },
  {
    feature: 'Integrated Context-Aware AI Copilot',
    local: 'Third-party heavy plugins',
    legacy: 'Generic text chat only',
    cloudlab: 'Multi-LLM agent with safe readFile, writeFile & runCommand',
  },
  {
    feature: 'Zero Local Machine Battery & RAM Drain',
    local: 'Heavy 16GB+ RAM consumption',
    legacy: 'Crashes on heavy projects',
    cloudlab: '100% runs on high-speed cloud infrastructure',
  },
  {
    feature: 'Instant 1-Click Deployment Preview',
    local: 'Requires separate cloud setup',
    legacy: 'Read-only preview iframe',
    cloudlab: 'Builds real container image with live HTTPS URL',
  },
];

export default function WhyCloudLab() {
  return (
    <section id="comparison" className="cl-section relative overflow-hidden bg-grid-pattern">
      <div
        className="ambient-glow-purple"
        style={{ top: '30%', right: '-160px', opacity: 0.2 }}
      />

      <div className="cl-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>The CloudLab Advantage</span>
          </div>
          <h2 className="typo-h1 text-white">
            Why Developers Are Switching to CloudLab
          </h2>
          <p className="typo-body-lg mt-4 text-slate-400">
            Compare the friction of traditional local development with CloudLab's instant cloud workspaces.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/90 text-xs uppercase tracking-wider font-mono">
                  <th className="p-5 text-slate-400 font-semibold w-1/3">Capability</th>
                  <th className="p-5 text-slate-500 font-medium hidden sm:table-cell">Local Setup</th>
                  <th className="p-5 text-slate-500 font-medium hidden md:table-cell">Web Sandboxes</th>
                  <th className="p-5 text-emerald-400 font-bold bg-emerald-500/10">CloudLab Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5 font-medium text-slate-200">
                      {row.feature}
                    </td>
                    <td className="p-5 text-slate-400 text-xs hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <X className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>{row.local}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-400 text-xs hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <X className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>{row.legacy}</span>
                      </div>
                    </td>
                    <td className="p-5 text-xs bg-emerald-500/[0.04]">
                      <div className="flex items-center gap-2 text-emerald-300 font-medium">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{row.cloudlab}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
