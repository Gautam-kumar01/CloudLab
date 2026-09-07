'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    n: '01',
    label: 'Create Workspace',
    title: 'Choose your stack',
    body:
      'Select a template or import any GitHub repository. CloudLab automatically provisions a secure Docker workspace pre-configured with all your dependencies.',
    accent: 'accent',
  },
  {
    n: '02',
    label: 'Code & Run',
    title: 'Build in the browser',
    body:
      'Use the desktop-grade Monaco IDE, full root terminal, and instant live preview. Sub-millisecond response times powered by WebSockets feel just like local.',
    accent: 'purple',
  },
  {
    n: '03',
    label: 'Collaborate',
    title: 'Work with teammates',
    body:
      'Share a secure link to your workspace. Code together in real-time with multiplayer cursors, shared terminals, and synced live previews.',
    accent: 'orange',
  },
  {
    n: '04',
    label: 'Deploy',
    title: 'Ship to production',
    body:
      'One click to build, containerize, and deploy to a global edge network. Automatic SSL, custom domains, and instant rollbacks built in.',
    accent: 'accent',
  },
];

const visuals: Record<number, React.ReactNode> = {
  0: (
    <div className="w-full h-full flex flex-col gap-3 p-2">
      <div className="h-7 rounded" style={{ background: 'var(--surface-elevated)' }}>
        <div
          className="h-full w-1/3 rounded-l"
          style={{ background: 'var(--accent-soft)', boxShadow: 'inset 0 0 0 1px rgba(5,150,105,0.2)' }}
        />
      </div>
      {[
        { t: 'Next.js 16 Starter', active: true },
        { t: 'Node + Express API', active: false },
        { t: 'Python FastAPI', active: false },
      ].map((row) => (
        <div
          key={row.t}
          className="flex items-center justify-between rounded-md px-3 py-2.5"
          style={{
            background: row.active ? 'var(--accent-soft)' : 'var(--surface-elevated)',
            boxShadow: row.active ? 'inset 0 0 0 1px rgba(5,150,105,0.25)' : 'none',
          }}
        >
          <span
            style={{
              color: row.active ? 'var(--accent)' : 'var(--text)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {row.t}
          </span>
          <span
            className="rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide"
            style={{
              background: row.active ? 'var(--accent)' : 'var(--border)',
              color: row.active ? '#000' : 'var(--text-subtle)',
            }}
          >
            {row.active ? 'SELECTED' : 'TEMPLATE'}
          </span>
        </div>
      ))}
      <div
        className="mt-auto h-9 rounded-md flex items-center justify-center text-[13px] font-semibold"
        style={{
          background: 'var(--accent)',
          color: '#000',
          boxShadow: '0 6px 20px rgba(5,150,105,0.25)',
        }}
      >
        Launch Workspace
      </div>
    </div>
  ),
  1: (
    <div className="w-full h-full flex flex-col gap-1 p-2" style={{ fontFamily: 'var(--font-mono)' }}>
      <div className="flex items-center gap-2 h-6 px-2 rounded" style={{ background: 'var(--surface-elevated)' }}>
        <span style={{ fontSize: 10, color: 'var(--accent-purple)', opacity: 0.9 }}>●</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>index.ts</span>
      </div>
      <div className="flex-1 rounded p-3 text-[11px] leading-[18px]" style={{ background: 'var(--bg)' }}>
        <div>
          <span style={{ color: '#c586c0' }}>const</span>{' '}
          <span style={{ color: '#9cdcfe' }}>server</span> ={' '}
          <span style={{ color: '#ce9178' }}>'0.0.0.0:3000'</span>;
        </div>
        <div>
          <span style={{ color: '#569cd6' }}>await</span>{' '}
          <span style={{ color: '#dcdcaa' }}>start</span>(server);
        </div>
        <div>&nbsp;</div>
        <div style={{ color: 'var(--accent-purple)' }}>{'✓ Listening on :3000'}</div>
        <div style={{ color: 'var(--text-muted)' }}>{'  Ready in 280ms'}</div>
      </div>
    </div>
  ),
  2: (
    <div className="w-full h-full flex flex-col gap-3 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            <div
              className="w-7 h-7 rounded-full border-2"
              style={{ background: 'var(--accent-orange)', borderColor: 'var(--surface)' }}
            />
            <div
              className="w-7 h-7 rounded-full border-2"
              style={{ background: 'var(--accent-purple)', borderColor: 'var(--surface)' }}
            />
            <div
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
              style={{
                background: 'var(--accent)',
                borderColor: 'var(--surface)',
                color: '#000',
              }}
            >
              +3
            </div>
          </div>
          <span className="ml-2" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            5 online
          </span>
        </div>
        <span
          className="rounded px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: 'var(--accent-orange-soft)', color: 'var(--accent-orange)' }}
        >
          LIVE
        </span>
      </div>
      <div className="relative flex-1 rounded p-2" style={{ background: 'var(--bg)' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#d4d4d4',
            lineHeight: '18px',
          }}
        >
          <div>
            <span style={{ color: '#569cd6' }}>function</span>{' '}
            <span style={{ color: '#dcdcaa' }}>deploy</span>() {'{'}
          </div>
          <div>
            &nbsp;&nbsp;
            <span style={{ background: 'rgba(217,119,6,0.25)' }}>
              console.log(<span style={{ color: '#ce9178' }}>'Shipping!'</span>);
            </span>
          </div>
          <div>
            &nbsp;&nbsp;
            <span style={{ background: 'rgba(124,58,237,0.25)' }}>return pipeline.run();</span>
          </div>
          <div>{'}'}</div>
        </div>
        <span
          className="absolute text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ left: 72, top: 26, background: 'var(--accent-orange)', color: '#fff' }}
        >
          Sarah
        </span>
        <span
          className="absolute text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ left: 88, top: 44, background: 'var(--accent-purple)', color: '#fff' }}
        >
          Alex
        </span>
      </div>
    </div>
  ),
  3: (
    <div className="w-full h-full flex flex-col gap-2.5 p-2">
      {[
        { k: 'Build', d: 'Docker image · 182MB', t: 0.6 },
        { k: 'Tests', d: '142 passed', t: 1.2 },
        { k: 'Deploy', d: 'Edge · 3 regions', t: 1.8 },
      ].map((row, i) => (
        <div
          key={row.k}
          className="flex items-center justify-between rounded-md px-2.5 py-2"
          style={{ background: 'var(--surface-elevated)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{row.k}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-subtle)' }}>{row.d}</div>
            </div>
          </div>
          <div className="text-[10px] font-mono" style={{ color: 'var(--text-subtle)' }}>
            +{row.t}s
          </div>
        </div>
      ))}
      <div
        className="mt-auto rounded-md px-3 py-2.5 flex items-center justify-between"
        style={{
          background:
            'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(124,58,237,0.08))',
          boxShadow: 'inset 0 0 0 1px rgba(5,150,105,0.2)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
            Production Ready
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}
          >
            yourapp.cloudlab.dev
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </div>
    </div>
  ),
};

export default function HowItWorks() {
  const hRef = useScrollReveal();
  const s1 = useScrollReveal({ threshold: 0.15 });
  const s2 = useScrollReveal({ threshold: 0.15 });
  const s3 = useScrollReveal({ threshold: 0.15 });
  const s4 = useScrollReveal({ threshold: 0.15 });
  const stepRefs = [s1, s2, s3, s4];

  return (
    <section id="how-it-works" className="cl-section">
      <div
        className="ambient-glow-purple"
        style={{ top: '10%', left: '-180px' }}
      />
      <div
        className="ambient-glow-green"
        style={{ bottom: '5%', right: '-180px' }}
      />

      <div className="cl-container relative z-10">
        <div className="text-center reveal-section" ref={hRef}>
          <div className="eyebrow mb-5">HOW IT WORKS</div>
          <h2 className="typo-h2 text-white">From idea to deployed app in minutes.</h2>
          <p
            className="typo-body-lg mt-5 mx-auto"
            style={{ maxWidth: 620 }}
          >
            A complete development workflow — powered by the cloud. No local
            configuration required.
          </p>
        </div>

        <div className="relative mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {steps.map((step, i) => {
            const isAccent = step.accent === 'accent';
            const isPurple = step.accent === 'purple';
            const accentColor = isPurple
              ? 'var(--accent-purple)'
              : step.accent === 'orange'
                ? 'var(--accent-orange)'
                : 'var(--accent)';
            const accentSoft = isPurple
              ? 'var(--accent-purple-soft)'
              : step.accent === 'orange'
                ? 'var(--accent-orange-soft)'
                : 'var(--accent-soft)';
            const insetShadow = isAccent
              ? 'rgba(5,150,105,0.25)'
              : isPurple
                ? 'rgba(124,58,237,0.25)'
                : 'rgba(217,119,6,0.25)';

            return (
              <div
                key={step.n}
                ref={stepRefs[i]}
                className="cl-card p-6 sm:p-7 reveal-section"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex-1 min-w-0">
                    <div
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold tracking-wider"
                      style={{
                        background: accentSoft,
                        color: accentColor,
                        boxShadow: `inset 0 0 0 1px ${insetShadow}`,
                      }}
                    >
                      <span>{step.n}</span>
                      <span style={{ opacity: 0.6 }}>—</span>
                      <span>{step.label.toUpperCase()}</span>
                    </div>
                    <h3 className="typo-h3 mt-4 text-white">{step.title}</h3>
                    <p className="typo-body mt-3 max-w-md">{step.body}</p>
                  </div>
                  <div
                    className="w-full sm:w-52 h-52 flex-shrink-0 rounded-xl p-2.5 relative"
                    style={{
                      background: 'var(--surface)',
                      boxShadow:
                        'inset 0 0 0 1px var(--border), var(--shadow-sm)',
                    }}
                  >
                    {visuals[i]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
