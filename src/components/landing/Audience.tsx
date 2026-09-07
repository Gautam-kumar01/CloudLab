'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Audience() {
  const ref = useScrollReveal();

  const cards = [
    {
      title: 'Startups & Founders',
      desc: 'Move fast without managing infrastructure. Onboard new engineers in seconds, not days.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h14M12 3v14M7 7l5-4 5 4M3 21h18"/></svg>
      ),
    },
    {
      title: 'Freelancers',
      desc: 'Keep client projects perfectly isolated. Never worry about conflicting dependencies again.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
      ),
    },
    {
      title: 'Students & Educators',
      desc: 'Standardize learning environments. Share a workspace link — it runs for every student.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      ),
    },
  ];

  return (
    <section id="audience" className="cl-section">
      <div className="cl-container">
        <div className="text-center mb-14 reveal-section" ref={ref}>
          <div className="eyebrow mb-5">
            <span className="eyebrow-dot"></span>
            Built For Everyone
          </div>
          <h2 className="typo-h1">From indie hackers to enterprise teams.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((c, i) => (
            <div key={i} className="cl-card p-7 hover:-translate-y-1 transition-transform duration-300 reveal-section" style={{animationDelay:`${i * 80}ms`}}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-[var(--accent)]" style={{background:'var(--accent-soft)'}}>
                {c.icon}
              </div>
              <h3 className="typo-h3 mb-3">{c.title}</h3>
              <p className="typo-body text-[var(--text-muted)] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
