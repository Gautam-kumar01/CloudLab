'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section id="final-cta" className="relative py-32 sm:py-40 overflow-hidden bg-grid-pattern scroll-mt-28">
      {/* Center Radiant Glow */}
      <div
        className="ambient-glow-green"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', opacity: 0.25 }}
      />
      <div
        className="ambient-glow-purple"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', opacity: 0.2 }}
      />

      <div className="cl-container relative z-10 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Your Cloud Studio</span>
        </div>

        <h2 className="typo-hero text-white tracking-tight">
          Ready to Code <span className="gradient-text-emerald">Without Limits?</span>
        </h2>

        <p className="typo-body-lg mt-6 max-w-2xl mx-auto text-slate-300">
          Spin up an isolated Linux container, edit with Monaco, pair program in real-time, and ship your next idea in seconds.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="cl-btn cl-btn-primary px-8 h-12 text-[15px] font-bold shadow-xl shadow-emerald-500/25 w-full sm:w-auto"
          >
            <span>Start Coding Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/sign-in"
            className="cl-btn cl-btn-secondary px-7 h-12 text-[15px] w-full sm:w-auto"
          >
            <span>Sign In to Dashboard</span>
          </Link>
        </div>

        {/* Benefits Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant Docker Sandboxes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Full Root Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-Model AI Included</span>
          </div>
        </div>
      </div>
    </section>
  );
}
