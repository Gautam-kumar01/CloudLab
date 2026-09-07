'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function DeploymentSection() {
  const ref = useScrollReveal();

  const steps = [
    {
      title: 'Commit',
      subtitle: 'Push to GitHub',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
      ),
      color: 'text',
    },
    {
      title: 'Build',
      subtitle: 'CloudLab Engine',
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M17.5 19a4.5 4.5 0 1 0-1.3-8.81A6 6 0 0 0 5 12.5 4 4 0 0 0 6 20h11.5Z"/></svg>
      ),
      color: 'accent',
      glow: 'rgba(5,150,105,0.15)',
      border: 'rgba(5,150,105,0.35)',
    },
    {
      title: 'Production',
      subtitle: 'Global Edge Network',
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      ),
      color: 'purple',
      glow: 'rgba(124,58,237,0.15)',
      border: 'rgba(124,58,237,0.35)',
    },
  ];

  return (
    <section id="deployment" className="cl-section">
      <div className="cl-container text-center">
        <div className="eyebrow mb-5">
          <span className="eyebrow-dot"></span>
          One-Click Deployments
        </div>
        <h2 className="typo-h1 mb-6">Ship it before lunch.</h2>
        <p className="typo-body-lg leading-relaxed mb-16 max-w-2xl mx-auto text-[var(--text-muted)]">
          When you&apos;re ready, deploy to production with a single click. We handle Docker builds, routing, and SSL certificates automatically.
        </p>

        <div className="relative max-w-4xl mx-auto reveal-section" ref={ref}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-0 relative">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center w-full md:w-auto relative z-10">
                {i > 0 && (
                  <>
                    <div className="hidden md:block absolute -left-[calc(50%+48px)] top-[40px] w-[calc(100%-112px)] h-0.5"
                      style={{
                        background: i === 1
                          ? 'linear-gradient(to right, rgba(255,255,255,0.1), var(--accent))'
                          : 'linear-gradient(to right, var(--accent), var(--accent-purple))',
                      }}
                    ></div>
                    <div className="md:hidden w-0.5 h-12 -mt-5 mb-5"
                      style={{
                        background: i === 1
                          ? 'linear-gradient(to bottom, rgba(255,255,255,0.1), var(--accent))'
                          : 'linear-gradient(to bottom, var(--accent), var(--accent-purple))',
                      }}
                    ></div>
                  </>
                )}
                <div
                  className={`w-[72px] h-[72px] ${i === 1 ? 'md:w-20 md:h-20' : ''} rounded-2xl flex items-center justify-center mb-4 relative transition-transform hover:-translate-y-1`}
                  style={{
                    background: s.glow ? s.glow : 'var(--surface)',
                    border: `1px solid ${s.border || 'var(--border)'}`,
                    boxShadow: s.glow ? `0 0 40px ${s.glow}` : 'none',
                    color:
                      s.color === 'accent' ? 'var(--accent)' :
                      s.color === 'purple' ? 'var(--accent-purple)' : 'var(--text)',
                  }}
                >
                  {s.icon}
                </div>
                <div
                  className="font-semibold text-[15px]"
                  style={{
                    color:
                      s.color === 'accent' ? 'var(--accent)' :
                      s.color === 'purple' ? 'var(--accent-purple)' : 'var(--text)',
                  }}
                >{s.title}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{s.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
