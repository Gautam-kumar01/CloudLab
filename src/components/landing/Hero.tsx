'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Terminal, Check, Copy, Zap, Shield, Users, Layers } from 'lucide-react';

export default function Hero() {
  const [copied, setCopied] = useState(false);
  const commandText = 'npx cloudlab launch';

  const handleCopy = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-16 sm:pt-36 sm:pb-20 overflow-hidden bg-grid-pattern">
      {/* Dynamic Ambient Mesh Glows */}
      <div
        className="ambient-glow-green"
        style={{ top: '-180px', left: '50%', transform: 'translateX(-50%)', opacity: 0.6 }}
      />
      <div
        className="ambient-glow-purple"
        style={{ top: '-80px', right: '-100px', opacity: 0.4 }}
      />

      <div className="cl-container relative z-10 flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-lg shadow-emerald-500/5 backdrop-blur-md mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>CloudLab 2.0 is Live</span>
          <span className="text-emerald-600 font-normal">|</span>
          <span className="text-slate-300 font-normal">Isolated Docker Sandboxes & AI Copilot</span>
        </div>

        {/* Hero Title */}
        <h1 className="typo-hero max-w-4xl text-white tracking-tight">
          Your Entire Dev Environment.{' '}
          <span className="gradient-text-emerald">In The Cloud.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="typo-body-lg mt-6 max-w-2xl text-slate-400 font-normal">
          Code, run, debug, and collaborate in the browser with isolated root Docker containers,
          Monaco Editor, real-time multiplayer CRDT sync, and context-aware AI pairing.
        </p>

        {/* Action CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/sign-up"
            className="cl-btn cl-btn-primary w-full sm:w-auto px-7 h-12 text-[15px] font-bold shadow-lg shadow-emerald-500/20"
          >
            <span>Start Coding Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#ide-demo"
            className="cl-btn cl-btn-secondary w-full sm:w-auto px-6 h-12 text-[15px]"
          >
            <span>Live Interactive Demo</span>
          </a>
        </div>

        {/* Terminal Quick Command Copy */}
        <div className="mt-8 flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-500">$</span>
          <span>{commandText}</span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Copy command"
            aria-label="Copy command"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Trust Badges / Key Specs */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl pt-8 border-t border-white/5">
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
              <Zap className="w-4 h-4" />
              <span>&lt; 1.8s</span>
            </div>
            <span className="text-[12px] text-slate-400 mt-0.5">Container Cold Boot</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-purple-400 text-sm font-bold">
              <Shield className="w-4 h-4" />
              <span>100% Root</span>
            </div>
            <span className="text-[12px] text-slate-400 mt-0.5">Docker Isolation</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-bold">
              <Users className="w-4 h-4" />
              <span>CRDT Sync</span>
            </div>
            <span className="text-[12px] text-slate-400 mt-0.5">Live Multiplayer</span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Multi-LLM</span>
            </div>
            <span className="text-[12px] text-slate-400 mt-0.5">AI Copilot Agent</span>
          </div>
        </div>
      </div>
    </section>
  );
}
