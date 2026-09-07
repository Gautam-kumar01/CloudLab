'use client';

import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const faqs = [
  {
    q: 'Do I need to install anything locally?',
    a: 'No. CloudLab runs entirely in your browser. All you need is an internet connection and a modern web browser to start coding. No Node, no Docker, no IDE.',
  },
  {
    q: 'How does the Docker integration work?',
    a: 'When you start a workspace, we provision a dedicated Linux container on our infrastructure. You get full root access and can install any packages, databases, or system tools you need — exactly like a local VM, but managed for you.',
  },
  {
    q: 'Can I use my own GitHub repositories?',
    a: 'Yes. Connect your GitHub account and import any public or private repository in one click. CloudLab automatically clones it, detects the framework, installs dependencies, and boots the dev server.',
  },
  {
    q: 'Is my code secure?',
    a: 'Absolutely. Every workspace is isolated with strict Docker namespaces, cgroups, and network policies. Your code is private to you and anyone you explicitly share with. Environment variables are encrypted at rest.',
  },
  {
    q: 'What about persistence?',
    a: 'Every workspace has persistent storage. Files, databases, and environment state are saved between sessions. Come back tomorrow and everything is exactly how you left it.',
  },
  {
    q: 'How much does it cost?',
    a: 'CloudLab is free for hobby and student use. Paid plans unlock more powerful instances, longer uptime, and team collaboration features. See the pricing page for details.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const hRef = useScrollReveal();
  const listRef = useScrollReveal();

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section id="faq" className="cl-section relative">
      <div className="cl-container relative z-10">
        <div className="text-center reveal-section" ref={hRef}>
          <div className="eyebrow mb-5">FAQ</div>
          <h2 className="typo-h2 text-white">Questions, answered.</h2>
          <p
            className="typo-body-lg mt-5 mx-auto"
            style={{ maxWidth: 560 }}
          >
            Everything you need to know about CloudLab.
          </p>
        </div>

        <div
          ref={listRef}
          className="mt-14 reveal-section max-w-3xl mx-auto border-t border-[--border]"
        >
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`cl-faq-item ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="cl-faq-question"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  id={`faq-q-${i}`}
                >
                  <span
                    className="text-[16px] sm:text-[17px] font-medium"
                    style={{
                      color: isOpen ? 'var(--text)' : 'var(--text)',
                    }}
                  >
                    {f.q}
                  </span>
                  <span className="cl-faq-icon" aria-hidden>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`cl-faq-answer-wrapper ${isOpen ? 'open' : ''}`}
                >
                  <div className="cl-faq-answer">{f.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
