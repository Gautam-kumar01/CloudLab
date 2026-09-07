'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Security() {
  const ref = useScrollReveal();

  const features = [
    {
      title: 'Container Isolation',
      desc: 'Strict Docker namespaces and cgroups prevent cross-workspace access.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      ),
    },
    {
      title: 'Encrypted Secrets',
      desc: 'Environment variables are encrypted at rest and securely injected.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      ),
    },
  ];

  return (
    <section id="security" className="cl-section">
      <div className="cl-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-14 reveal-section" ref={ref}>
          <div className="flex-1 w-full">
            <div className="eyebrow mb-5">
              <span className="eyebrow-dot"></span>
              Security First
            </div>
            <h2 className="typo-h1 mb-6">Enterprise-grade security, by default.</h2>
            <p className="typo-body leading-relaxed mb-8 text-[var(--text-muted)] max-w-xl">
              Every workspace runs in an isolated container with strict resource limits and network policies, ensuring your code and secrets are safe.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={i}>
                  <h4 className="text-[var(--text)] font-semibold mb-2 flex items-center gap-2.5" style={{fontSize:'15px'}}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:'var(--accent-soft)', color:'var(--accent)'}}>
                      {f.icon}
                    </span>
                    {f.title}
                  </h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed pl-[42px]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-md cl-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{background:'var(--accent-soft)', filter:'blur(50px)'}}></div>
            <div className="flex items-center justify-between mb-5 pb-4 relative z-10" style={{borderBottom:'1px solid var(--border)'}}>
              <span className="text-[var(--text)] font-semibold text-[15px]">Environment Variables</span>
              <button className="text-xs text-[var(--text)] px-3 py-1.5 rounded hover:opacity-80 transition-opacity" style={{background:'rgba(255,255,255,0.06)', borderRadius:'var(--radius-sm)'}}>Add Secret</button>
            </div>
            <div className="space-y-2.5 relative z-10">
              {['DATABASE_URL', 'STRIPE_SECRET', 'OPENAI_API_KEY'].map((name) => (
                <div key={name} className="flex items-center justify-between p-3 rounded-lg" style={{background:'#050505', border:'1px solid var(--border)'}}>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{name}</span>
                  <span className="font-mono text-xs text-[var(--text-subtle)]">••••••••••••••••</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
