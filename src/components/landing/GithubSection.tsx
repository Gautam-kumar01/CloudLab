'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Link from 'next/link';

export default function GithubSection() {
  const ref = useScrollReveal();

  const repos = [
    { name: 'acme-corp/nextjs-commerce', updated: 'Updated 2 hours ago' },
    { name: 'acme-corp/api-server', updated: 'Updated 5 hours ago' },
  ];

  return (
    <section id="github" className="cl-section">
      <div className="cl-container flex flex-col md:flex-row items-center gap-14 md:gap-20">
        <div className="flex-1 text-left w-full">
          <div className="eyebrow mb-5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
            GitHub Integration
          </div>
          <h2 className="typo-h1 mb-6">From repo to running in one click.</h2>
          <p className="typo-body-lg leading-relaxed mb-8 max-w-xl text-[var(--text-muted)]">
            Import any GitHub repository instantly. CloudLab reads your codebase, detects the framework, installs dependencies, and starts the dev server automatically.
          </p>
          <Link href="/dashboard" className="cl-btn cl-btn-primary">
            Import a Repository
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="flex-1 w-full max-w-lg reveal-section" ref={ref}>
          <div className="cl-card p-5 md:p-6">
             <div className="text-center mb-5">
                <div className="text-[15px] font-semibold text-[var(--text)] mb-1">Import Git Repository</div>
                <div className="text-xs text-[var(--text-muted)]">Select a repository to import into CloudLab</div>
             </div>

             <div className="p-2.5 mb-4 flex items-center gap-2 text-sm text-[var(--text-subtle)]" style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)'}}>
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Search repositories...
             </div>

             <div className="flex flex-col gap-2.5">
                {repos.map((repo, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between transition-colors cursor-pointer group" style={{background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)'}} onMouseEnter={(e) => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.background='var(--surface-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)'; }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <svg className="w-5 h-5 text-[var(--text)] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--text)] truncate">{repo.name}</div>
                        <div className="text-[10px] text-[var(--text-subtle)]">{repo.updated}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded text-[11px] font-bold transition-colors whitespace-nowrap" style={{background:'rgba(255,255,255,0.06)', color:'var(--text)'}}>Import</button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
