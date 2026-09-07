'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'How does CloudLab isolate my workspace and terminal?',
    a: 'Each CloudLab workspace runs in a dedicated, isolated Docker container with capped RAM, CPU limits, and its own filesystem. You get full root privileges inside your container without risking security or cross-tenant leaks.',
  },
  {
    q: 'Can I install system packages, databases, and custom binaries?',
    a: 'Yes! Because you have full root access in your Linux container, you can run apt-get, pip, npm, pnpm, cargo, go, or start background services like PostgreSQL, Redis, and SQLite directly.',
  },
  {
    q: 'How does real-time multiplayer collaboration work?',
    a: 'CloudLab uses Yjs CRDTs (Conflict-free Replicated Data Types) connected over low-latency WebSockets. Multiple users can edit the same files concurrently, view each other’s colored cursor movements, and share terminal output without race conditions or overwriting work.',
  },
  {
    q: 'What AI models are supported in the AI Copilot?',
    a: 'CloudLab AI supports Google Gemini 2.5 Flash, OpenAI GPT-4o, Anthropic Claude, Groq Qwen/Llama, and OpenRouter models. You can use our built-in provider or bring your own API keys for unlimited usage.',
  },
  {
    q: 'Can I import and export my GitHub repositories?',
    a: 'Yes. You can import any public or private GitHub repository using OAuth. CloudLab automatically detects your tech stack, prepares dependencies, and lets you commit and push changes back directly.',
  },
  {
    q: 'Is CloudLab free to use?',
    a: 'Yes! CloudLab provides a generous free tier with instant workspaces, Monaco editing, GitHub imports, and AI assistant access to build and test your projects.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="cl-section relative overflow-hidden bg-[#030712]">
      <div
        className="ambient-glow-green"
        style={{ top: '15%', left: '-120px', opacity: 0.15 }}
      />

      <div className="cl-container relative z-10 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="cl-badge mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="typo-h1 text-white">
            Frequently Asked Questions
          </h2>
          <p className="typo-body-lg mt-4 text-slate-400">
            Everything you need to know about CloudLab workspaces, security, and features.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className={`glass-card rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-emerald-500/30 bg-slate-900/80 shadow-lg shadow-emerald-500/5' : 'border-white/5 bg-slate-900/40'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-emerald-300 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 bg-emerald-500/20 text-emerald-300' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
