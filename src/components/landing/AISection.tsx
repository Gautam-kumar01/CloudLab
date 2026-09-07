'use client';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function AISection() {
  const ref = useScrollReveal();

  const bullets = [
    'Context-aware autocomplete',
    'One-click bug fixing',
    'Natural language edits',
  ];

  return (
    <section id="ai" className="cl-section overflow-hidden relative">
      <div className="ambient-glow-purple absolute -right-40 top-20"></div>

      <div className="cl-container flex flex-col md:flex-row items-center gap-14 md:gap-20 relative z-10">
        <div className="flex-1 order-2 md:order-2 w-full max-w-lg mx-auto md:max-w-none reveal-section" ref={ref}>
          <div className="cl-card relative overflow-hidden p-6 md:p-7" style={{borderColor:'rgba(124,58,237,0.25)'}}>
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full" style={{background:'var(--accent-purple-soft)', filter:'blur(60px)'}}></div>
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--text)] text-xs font-semibold" style={{background:'var(--surface-elevated)', border:'1px solid var(--border)'}}>
                  U
                </div>
                <div className="p-3 rounded-xl rounded-tl-none text-sm text-[var(--text)]" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
                  Generate a React component for a pricing table with 3 tiers.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border" style={{background:'var(--accent-purple-soft)', borderColor:'rgba(124,58,237,0.4)'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed"><path d="M12 2l1.8 5.4L19.2 9l-4.2 3.1L16.4 18 12 15l-4.4 3 1.4-5.9L4.8 9l5.4-1.6z"/></svg>
                </div>
                <div className="text-sm text-[var(--text-muted)] p-3 rounded-xl rounded-tl-none w-full relative" style={{background:'rgba(124,58,237,0.04)', border:'1px solid rgba(124,58,237,0.12)'}}>
                  Here&apos;s a responsive pricing table using Tailwind CSS:
                  <div className="mt-3 p-3 rounded font-mono text-[11px] leading-[1.7] overflow-hidden" style={{background:'#050505', border:'1px solid var(--border)'}}>
                    <span style={{color:'#c586c0'}}>export default</span> <span style={{color:'#569cd6'}}>function</span> <span style={{color:'#dcdcaa'}}>Pricing</span>() {'{'}<br/>
                    &nbsp;&nbsp;<span style={{color:'#c586c0'}}>return</span> (<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#808080'}}>&lt;</span><span style={{color:'#569cd6'}}>div</span> <span style={{color:'#9cdcfe'}}>className</span>=<span style={{color:'#ce9178'}}>"grid grid-cols-3..."</span><span style={{color:'#808080'}}>&gt;</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#6a9955'}}>{/* tiers */}</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#808080'}}>&lt;/</span><span style={{color:'#569cd6'}}>div</span><span style={{color:'#808080'}}>&gt;</span><br/>
                    &nbsp;&nbsp;);<br/>
                    {'}'}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className="text-[11px] px-3 py-1.5 rounded font-semibold text-white hover:opacity-90 transition-opacity" style={{background:'var(--accent-purple)'}}>Apply to Editor</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 order-1 md:order-1 w-full text-center md:text-left">
          <div className="eyebrow mb-5" style={{color:'var(--accent-purple)'}}>
            <span className="eyebrow-dot" style={{background:'var(--accent-purple)'}}></span>
            Built-in Intelligence
          </div>
          <h2 className="typo-h1 mb-6">Pair program with AI.</h2>
          <p className="typo-body-lg leading-relaxed mb-7 text-[var(--text-muted)] max-w-xl">
            CloudLab AI understands your entire workspace context. Generate code, explain errors, refactor components, and write tests—directly inside your editor.
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
      </div>
    </section>
  );
}
