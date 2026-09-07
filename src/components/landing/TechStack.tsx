'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function TechStack() {
  const ref = useScrollReveal();

  const techStack = [
    { name: 'Docker', desc: 'Containerization', icon: 'M22 11.1c0-.6-.5-1.1-1-1.1h-2V8.2c0-.5-.5-1-1-1h-2V5.2c0-.5-.5-1-1-1H7c-.5 0-1 .5-1 1v2H4c-.5 0-1 .4-1 1v1.8H1c-.5 0-1 .5-1 1v2.7c0 .5.5 1 1 1h22c.5 0 1-.5 1-1v-2.6z' },
    { name: 'Next.js 16', desc: 'Frontend Framework', icon: 'M12 2L2 22h6V12h8v10h6L12 2z' },
    { name: 'Node.js', desc: 'Runtime', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z' },
    { name: 'WebSockets', desc: 'Real-time sync', icon: 'M4 12a8 8 0 0 1 16 0M8 12a4 4 0 0 1 8 0M12 13v-3' },
    { name: 'Monaco', desc: 'IDE Core', icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8 17l-5-5 5-5M16 7l5 5-5 5' },
    { name: 'Yjs CRDT', desc: 'Collaboration', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm2 15h-4v-2h4zm0-4h-4V7h4z' },
    { name: 'PostgreSQL', desc: 'Database', icon: 'M12 2C6.5 2 2 4.5 2 8v8c0 3.5 4.5 6 10 6s10-2.5 10-6V8c0-3.5-4.5-6-10-6zM12 4c5 0 8 2.2 8 4s-3 4-8 4-8-2.2-8-4 3-4 8-4z' },
    { name: 'GitHub API', desc: 'VCS Integration', icon: 'M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.3-3.4-1.3-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.8-1.3 2.7-1 2.7-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 22 12c0-5.5-4.5-10-10-10z' },
  ];

  return (
    <section id="tech-stack" className="cl-section text-center">
      <div className="cl-container reveal-section" ref={ref}>
        <div className="eyebrow mb-10">
          <span className="eyebrow-dot"></span>
          Powered by Industry Standards
        </div>

        <div className="relative overflow-hidden w-full">
          <div className="absolute top-0 left-0 w-24 h-full z-10 pointer-events-none" style={{background:'linear-gradient(to right, var(--bg), transparent)'}}></div>
          <div className="absolute top-0 right-0 w-24 h-full z-10 pointer-events-none" style={{background:'linear-gradient(to left, var(--bg), transparent)'}}></div>

          <div className="flex w-max animate-scroll gap-5">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex gap-5">
                {techStack.map((tech, i) => (
                  <div key={`${dup}-${i}`} className="flex-shrink-0 cl-card p-5 w-60 text-left hover:-translate-y-1 cursor-default transition-transform duration-300">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-[var(--accent)]" style={{background:'var(--accent-soft)'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={tech.icon}/></svg>
                    </div>
                    <h3 className="text-[var(--text)] font-semibold text-[15px] mb-1">{tech.name}</h3>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono tracking-[0.12em] uppercase">{tech.desc}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
