'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const traditional = [
  {
    t: '"It works on my machine"',
    d: 'Inconsistent environments between team members.',
  },
  {
    t: 'Hours of setup',
    d: 'Installing Node, Python, Docker, Postgres manually.',
  },
  {
    t: 'Resource intensive',
    d: 'Heavy IDEs and containers drain laptop battery.',
  },
  {
    t: 'Clunky screen-share pairing',
    d: 'Laggy Zoom calls, no simultaneous edits.',
  },
];

const cloudlab = [
  {
    t: 'Standardized environments',
    d: 'Docker containers guarantee it works everywhere.',
  },
  {
    t: 'Zero setup time',
    d: 'Click a link and start coding instantly.',
  },
  {
    t: 'Cloud compute',
    d: 'Leverage powerful servers; keep your laptop cool.',
  },
  {
    t: 'Multiplayer collaboration',
    d: 'Live cursors and shared terminals built-in.',
  },
];

export default function WhyCloudLab() {
  const hRef = useScrollReveal();
  const leftRef = useScrollReveal({ threshold: 0.1 });
  const rightRef = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="why-cloudlab" className="cl-section relative">
      <div
        className="ambient-glow-orange"
        style={{ top: '10%', left: '-150px' }}
      />
      <div
        className="ambient-glow-green"
        style={{ bottom: '5%', right: '-180px' }}
      />

      <div className="cl-container relative z-10">
        <div className="text-center reveal-section" ref={hRef}>
          <div className="eyebrow mb-5">WHY CLOUDLAB</div>
          <h2 className="typo-h2 text-white">Local development is broken.</h2>
          <p
            className="typo-body-lg mt-5 mx-auto"
            style={{ maxWidth: 640 }}
          >
            Stop wasting hours fixing environment issues. CloudLab standardizes
            development so you can focus on writing code.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {/* Traditional */}
          <div
            ref={leftRef}
            className="cl-card p-7 sm:p-8 reveal-section"
            style={{
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <div className="flex items-center gap-3 mb-7">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  boxShadow: 'inset 0 0 0 1px rgba(239,68,68,0.2)',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--text-subtle)' }}>
                  Traditional
                </div>
                <h3 className="typo-h3 text-white" style={{ fontSize: '18px' }}>
                  Your local machine
                </h3>
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {traditional.map((row) => (
                <li key={row.t} className="flex gap-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold text-white leading-snug">
                      {row.t}
                    </div>
                    <div className="mt-1 typo-body" style={{ fontSize: '14px' }}>
                      {row.d}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CloudLab */}
          <div
            ref={rightRef}
            className="cl-card cl-card-glow p-7 sm:p-8 reveal-section relative"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,150,105,0.05) 0%, rgba(255,255,255,0.02) 60%)',
              boxShadow: '0 0 0 1px rgba(5,150,105,0.15)',
            }}
          >
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'var(--accent-soft)', filter: 'blur(80px)' }}
            />

            <div className="flex items-center gap-3 mb-7 relative">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  boxShadow: 'inset 0 0 0 1px rgba(5,150,105,0.25)',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19a4.5 4.5 0 1 0-1.3-8.81A6 6 0 0 0 5 12.5 4 4 0 0 0 6 20h11.5Z" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--accent)' }}>
                  CloudLab
                </div>
                <h3 className="typo-h3 text-white" style={{ fontSize: '18px' }}>
                  Cloud-native workflow
                </h3>
              </div>
            </div>

            <ul className="flex flex-col gap-4 relative">
              {cloudlab.map((row) => (
                <li key={row.t} className="flex gap-3">
                  <div
                    className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold text-white leading-snug">
                      {row.t}
                    </div>
                    <div className="mt-1 typo-body" style={{ fontSize: '14px' }}>
                      {row.d}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
