'use client';
import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function WorkspaceShowcase() {
  const [activeTab, setActiveTab] = useState('editor');
  const ref = useScrollReveal();

  const renderContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div key="editor" className="panel-content w-full h-full flex text-sm">
            <div className="w-48 border-r border-[var(--border)] p-4 font-mono text-xs text-[var(--text-subtle)] hidden sm:block">
              <div className="uppercase tracking-[0.12em] text-[10px] font-semibold mb-4 text-[var(--text-muted)]">Explorer</div>
              <div className="mt-4 ml-2 space-y-2">
                <div className="text-[var(--text)] font-medium flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  index.tsx
                </div>
                <div className="text-[var(--text-muted)] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  globals.css
                </div>
                <div className="text-[var(--text-muted)] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  package.json
                </div>
                <div className="text-[var(--text-muted)] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  api
                </div>
              </div>
            </div>
            <div className="flex-1 p-5 font-mono text-[13px] leading-[1.7] overflow-hidden">
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>1</span><span className="text-[var(--text)]"><span style={{color:'#569cd6'}}>export default function</span> <span style={{color:'#dcdcaa'}}>App</span>() {'{'}</span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>2</span><span>&nbsp;&nbsp;<span style={{color:'#c586c0'}}>return</span> (</span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>3</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#808080'}}>&lt;</span><span style={{color:'#569cd6'}}>div</span> <span style={{color:'#9cdcfe'}}>className</span>=<span style={{color:'#ce9178'}}>"flex flex-col gap-4"</span><span style={{color:'#808080'}}>&gt;</span></span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>4</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#808080'}}>&lt;</span><span style={{color:'#569cd6'}}>h1</span> <span style={{color:'#9cdcfe'}}>className</span>=<span style={{color:'#ce9178'}}>"text-2xl font-bold"</span><span style={{color:'#808080'}}>&gt;</span>CloudLab<span style={{color:'#808080'}}>&lt;/</span><span style={{color:'#569cd6'}}>h1</span><span style={{color:'#808080'}}>&gt;</span></span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>5</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#808080'}}>&lt;</span><span style={{color:'#569cd6'}}>p</span><span style={{color:'#808080'}}>&gt;</span>Ship faster in the cloud.<span style={{color:'#808080'}}>&lt;/</span><span style={{color:'#569cd6'}}>p</span><span style={{color:'#808080'}}>&gt;</span></span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>6</span><span>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{color:'#808080'}}>&lt;/</span><span style={{color:'#569cd6'}}>div</span><span style={{color:'#808080'}}>&gt;</span></span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>7</span><span>&nbsp;&nbsp;);</span>
              </div>
              <div className="flex gap-5 text-[var(--text-subtle)] select-none">
                <span>8</span><span>{'}'}</span>
              </div>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div key="terminal" className="panel-content w-full h-full p-5 font-mono text-[13px] leading-[1.7]">
            <div className="text-[var(--text)]"><span className="text-[var(--accent)]">❯</span> docker ps</div>
            <div className="text-[var(--text-muted)] mt-1 font-mono text-[12px]">CONTAINER ID   IMAGE          COMMAND     CREATED      STATUS</div>
            <div className="text-[var(--text-muted)] font-mono text-[12px]">a1b2c3d4e5f6   node:20-slim   "/bin/sh"   2 mins ago   Up 2 mins</div>
            <div className="text-[var(--text)] mt-4"><span className="text-[var(--accent)]">❯</span> npm install</div>
            <div className="mt-1" style={{color:'#059669'}}>added 154 packages in 2.1s</div>
            <div className="text-[var(--text)] mt-4"><span className="text-[var(--accent)]">❯</span> <span className="inline-block w-2 h-4 bg-[var(--text)] animate-pulse align-[-2px]"></span></div>
          </div>
        );
      case 'preview':
        return (
          <div key="preview" className="panel-content w-full h-full flex flex-col bg-white">
            <div className="h-11 border-b border-gray-200 bg-gray-50 flex items-center px-4 gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              </div>
              <div className="ml-3 bg-white rounded px-3 py-1 text-[11px] text-gray-500 shadow-sm w-60 text-center font-mono border border-gray-200">localhost:3000</div>
            </div>
            <div className="flex-1 flex items-center justify-center text-black flex-col">
               <div className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center" style={{background:'linear-gradient(135deg, #059669 0%, #7c3aed 100%)'}}>
                 <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M17.5 19a4.5 4.5 0 1 0-1.3-8.81A6 6 0 0 0 5 12.5 4 4 0 0 0 6 20h11.5Z"/></svg>
               </div>
               <h1 className="text-3xl font-bold tracking-tight">It works.</h1>
               <p className="text-gray-500 mt-2 text-sm">Live browser preview</p>
            </div>
          </div>
        );
      case 'git':
        return (
          <div key="git" className="panel-content w-full h-full flex text-sm">
            <div className="w-64 border-r border-[var(--border)] p-4 text-[var(--text-muted)]">
              <div className="font-bold text-[10px] tracking-widest text-[var(--text-subtle)] mb-4 uppercase">Source Control</div>
              <div className="flex justify-between items-center p-2.5 rounded-lg mb-4" style={{background:'var(--surface)'}}>
                <span className="text-[13px] text-[var(--text)]">Changes</span>
                <span className="text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold" style={{background:'var(--accent-orange)'}}>2</span>
              </div>
              <div className="flex items-center gap-2 mb-2 text-[13px]" style={{color:'#dcdcaa'}}><span style={{color:'#c586c0'}} className="font-bold">M</span> src/App.tsx</div>
              <div className="flex items-center gap-2 text-[13px]" style={{color:'#059669'}}><span style={{color:'#059669'}} className="font-bold">A</span> src/styles.css</div>
              <div className="mt-8 border border-[var(--border)] rounded-lg p-2.5 text-center text-xs hover:border-[var(--border-hover)] cursor-pointer transition-colors text-[var(--text)]">Commit &amp; Push</div>
            </div>
            <div className="flex-1 p-5 flex flex-col justify-center items-center text-[var(--text-subtle)]">
              <svg className="w-14 h-14 mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Select a file to view diff
            </div>
          </div>
        );
      case 'ai':
        return (
          <div key="ai" className="panel-content w-full h-full flex flex-col text-sm">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2 font-semibold" style={{color:'var(--accent-purple)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.4L19.2 9l-4.2 3.1L16.4 18 12 15l-4.4 3 1.4-5.9L4.8 9l5.4-1.6z"/></svg>
              CloudLab AI
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              <div className="p-3 rounded-lg rounded-tl-none self-start max-w-[80%] text-[13px] text-[var(--text)]" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
                How can I help you build today?
              </div>
              <div className="p-3 rounded-lg rounded-tr-none self-end max-w-[80%] text-[13px] text-[var(--text)]" style={{background:'var(--accent-purple-soft)', border:'1px solid rgba(124,58,237,0.25)'}}>
                Refactor this component to use Tailwind CSS.
              </div>
              <div className="p-3 rounded-lg rounded-tl-none self-start max-w-[80%] text-[13px] text-[var(--text)]" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
                Sure. Review the diff below:
                <div className="mt-2.5 p-2.5 rounded font-mono text-[11px]" style={{background:'#050505', border:'1px solid var(--border)'}}>
                  <div style={{color:'#ef4444'}}>- &lt;div style="display:flex;"&gt;</div>
                  <div style={{color:'#059669'}}>+ &lt;div className="flex"&gt;</div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-black px-3 py-1 rounded text-xs font-semibold hover:opacity-90 transition-opacity" style={{background:'var(--accent)'}}>Apply</button>
                  <button className="px-3 py-1 rounded text-xs" style={{border:'1px solid var(--border)', color:'var(--text-muted)'}}>Reject</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'editor', label: 'Editor' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'preview', label: 'Preview' },
    { id: 'git', label: 'Git' },
    { id: 'ai', label: 'AI', icon: true },
  ];

  return (
    <section id="workspace-showcase" className="cl-section">
      <div className="cl-container">
        <div className="text-center mb-14 reveal-section" ref={ref}>
          <div className="eyebrow mb-5">
            <span className="eyebrow-dot"></span>
            Unified Workspace
          </div>
          <h2 className="typo-h1 mb-5">Your browser. Your workspace. Your stack.</h2>
          <p className="typo-body-lg max-w-2xl mx-auto text-[var(--text-muted)]">
            A fully featured IDE, running entirely in the cloud.
          </p>
        </div>

        <div className="max-w-5xl mx-auto cl-card overflow-hidden p-0 reveal-section" style={{borderRadius:'var(--radius-xl)'}}>
          <div className="flex overflow-x-auto hide-scrollbar" style={{background:'var(--surface)', borderBottom:'1px solid var(--border)'}}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`ui-tab ${activeTab === t.id ? 'active' : ''} ${t.id === 'ai' && activeTab === t.id ? '!text-[var(--accent-purple)]' : ''}`}
              >
                {t.icon && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1.5 opacity-80"><path d="M12 2l1.8 5.4L19.2 9l-4.2 3.1L16.4 18 12 15l-4.4 3 1.4-5.9L4.8 9l5.4-1.6z"/></svg>
                )}
                {t.label}
              </button>
            ))}
          </div>
          <div className="h-[460px] sm:h-[500px] relative" style={{background:'#0a0a0a'}}>
            {renderContent()}
          </div>
        </div>
      </div>
    </section>
  );
}
