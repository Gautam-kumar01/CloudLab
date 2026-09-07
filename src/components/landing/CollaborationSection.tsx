'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CollaborationSection() {
  const ref = useScrollReveal();

  const bullets = [
    'Yjs CRDT Synchronization',
    'Shared live preview',
    'Granular access controls',
  ];

  return (
    <section id="collaboration" className="cl-section overflow-hidden relative">
      <div className="ambient-glow-purple absolute -left-40 top-20"></div>

      <div className="cl-container flex flex-col md:flex-row items-center gap-14 md:gap-20 relative z-10">
        <div className="flex-1 order-1 md:order-2 w-full">
          <div className="eyebrow mb-5" style={{color:'var(--accent-purple)'}}>
            <span className="eyebrow-dot" style={{background:'var(--accent-purple)'}}></span>
            Multiplayer Mode
          </div>
          <h2 className="typo-h1 mb-6">Code together, in real-time.</h2>
          <p className="typo-body-lg leading-relaxed mb-7 text-[var(--text-muted)]">
            Share a secure link to your workspace and collaborate instantly. See multiple cursors, share terminal sessions, and debug issues collectively—like Google Docs for code.
          </p>
          <ul className="flex flex-col gap-3 text-[var(--text-muted)]">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]" style={{background:'var(--accent-purple-soft)', color:'var(--accent-purple)'}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 order-2 md:order-1 w-full reveal-section" ref={ref}>
          <div className="cl-card p-0 overflow-hidden h-80 flex flex-col relative" style={{borderColor:'rgba(124,58,237,0.22)'}}>
            <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full" style={{background:'var(--accent-purple-soft)', filter:'blur(60px)'}}></div>
            <div className="p-3.5 flex justify-between items-center relative z-10" style={{background:'var(--surface)', borderBottom:'1px solid var(--border)'}}>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 z-30 flex items-center justify-center text-[10px] font-bold text-white" style={{borderColor:'var(--surface)', background:'var(--accent-orange)'}}>S</div>
                <div className="w-8 h-8 rounded-full border-2 z-20 flex items-center justify-center text-[10px] font-bold text-white" style={{borderColor:'var(--surface)', background:'var(--accent-purple)'}}>A</div>
                <div className="w-8 h-8 rounded-full border-2 z-10 flex items-center justify-center text-[10px] font-bold text-black" style={{borderColor:'var(--surface)', background:'var(--accent)'}}>R</div>
              </div>
              <button className="text-white text-[11px] font-semibold px-3.5 py-1.5 rounded flex items-center gap-2 hover:opacity-90 transition-opacity" style={{background:'var(--accent-purple)', borderRadius:'var(--radius-md)'}}>
                Share Workspace
              </button>
            </div>

            <div className="flex-1 p-5 font-mono text-[13px] relative leading-[1.7]">
              <div className="text-[var(--text-subtle)] absolute left-2 top-5 text-right pr-2 select-none font-mono text-[12px]">
                1<br/>2<br/>3<br/>4<br/>5<br/>6
              </div>
              <div className="pl-6 text-[var(--text)]">
                <span style={{color:'#569cd6'}}>const</span> handleConnect = (<span style={{color:'#9cdcfe'}}>socket</span>) =&gt; {'{'}<br/>
                &nbsp;&nbsp;console.<span style={{color:'#dcdcaa'}}>log</span>(<span style={{color:'#ce9178'}}>&apos;New user connected&apos;</span>);<br/>
                &nbsp;&nbsp;
                <span className="relative inline-block">
                  <span className="inline-block px-1 rounded-sm" style={{background:'rgba(124,58,237,0.25)'}}>socket.join(workspaceId);</span>
                  <span className="absolute -top-5 -right-10 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-medium whitespace-nowrap" style={{background:'var(--accent-purple)'}}>Alex</span>
                </span>
                <br/>
                &nbsp;&nbsp;
                <span className="relative inline-block">
                  <span className="inline-block px-1 rounded-sm" style={{background:'rgba(217,119,6,0.25)'}}>syncDocumentState(socket);</span>
                  <span className="absolute -top-5 -right-12 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-medium whitespace-nowrap" style={{background:'var(--accent-orange)'}}>Sarah</span>
                </span>
                <br/>
                {'}'};
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
