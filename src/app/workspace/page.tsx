'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('index.ts');
  const [terminalOutput, setTerminalOutput] = useState('> Ready\\n');

  // Command palette state
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Mobile Warning Overlay */}
      <div className="mobile-warning" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-primary)', zIndex: 100, display: 'none', justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-orange)', marginBottom: '8px' }}>Desktop Required</h2>
          <p style={{ color: 'var(--text-secondary)' }}>The CloudLab IDE Shell is optimized for laptop and desktop screens. Please resize your window or switch to a larger device.</p>
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-warning { display: flex !important; }
          .workspace-container { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col h-screen w-full workspace-container" style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* Top Bar */}
      <nav className="flex justify-between items-center" style={{ height: '48px', padding: '0 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <Link href="/dashboard" style={{ fontWeight: 'bold', color: 'var(--accent-green)', marginRight: '8px' }}>CL</Link>
          <div className="flex" style={{ gap: '16px', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">File</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">Edit</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">View</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">Terminal</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-white">Help</span>
          </div>
        </div>
        
        <div className="flex items-center" style={{ gap: '8px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>react-ecommerce</span>
        </div>

        <div className="flex items-center" style={{ gap: '12px' }}>
          <button style={{ padding: '4px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"></path></svg>
            Share
          </button>
          <button style={{ padding: '4px 12px', background: 'var(--accent-green)', color: '#000', borderRadius: '4px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"></path></svg>
            Run
          </button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex" style={{ flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar (File Tree) */}
        <aside style={{ width: '250px', background: 'var(--bg-tertiary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Explorer
          </div>
          <div style={{ padding: '8px', flex: 1, overflowY: 'auto', fontSize: '0.9rem' }}>
            {['src', 'public', 'package.json', 'tsconfig.json'].map(file => (
              <div key={file} style={{ padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }} className="hover:bg-[var(--bg-secondary)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                {file}
              </div>
            ))}
          </div>
        </aside>

        {/* Center Area (Editor + Terminal) */}
        <div className="flex flex-col" style={{ flex: 1, minWidth: 0 }}>
          
          {/* Editor Area */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Editor Tabs */}
            <div className="flex" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
              {['index.ts', 'App.tsx', 'styles.css'].map(tab => (
                <div 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '10px 16px', 
                    fontSize: '0.85rem', 
                    cursor: 'pointer',
                    background: activeTab === tab ? 'var(--bg-primary)' : 'transparent',
                    borderRight: '1px solid var(--border-color)',
                    borderTop: activeTab === tab ? '2px solid var(--accent-green)' : '2px solid transparent',
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
            
            {/* Editor Content */}
            <div style={{ flex: 1, padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', overflowY: 'auto', outline: 'none' }} contentEditable suppressContentEditableWarning>
              <div style={{ color: 'var(--text-secondary)' }}>// Write your code here...</div>
              <div style={{ color: 'var(--accent-purple)', marginTop: '8px' }}>import <span style={{ color: 'var(--text-primary)' }}>React</span> from <span style={{ color: 'var(--accent-orange)' }}>'react'</span>;</div>
              <div style={{ color: 'var(--accent-purple)', marginTop: '8px' }}>export default function <span style={{ color: '#fff' }}>App</span>() {'{'}</div>
              <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                <span style={{ color: 'var(--accent-purple)' }}>return</span> (
              </div>
              <div style={{ paddingLeft: '48px', marginTop: '8px', color: 'var(--text-primary)' }}>
                {'<div>'}
              </div>
              <div style={{ paddingLeft: '72px', marginTop: '8px', color: 'var(--text-primary)' }}>
                Hello CloudLab
              </div>
              <div style={{ paddingLeft: '48px', marginTop: '8px', color: 'var(--text-primary)' }}>
                {'</div>'}
              </div>
              <div style={{ paddingLeft: '24px', marginTop: '8px' }}>
                );
              </div>
              <div style={{ marginTop: '8px' }}>{'}'}</div>
            </div>
          </div>

          {/* Terminal Area */}
          <div style={{ height: '30%', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
            <div className="flex" style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', gap: '16px' }}>
              <span style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--accent-green)', paddingBottom: '4px' }}>TERMINAL</span>
              <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>OUTPUT</span>
              <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>PROBLEMS</span>
            </div>
            <div style={{ flex: 1, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-green)', overflowY: 'auto' }}>
              <pre style={{ margin: 0 }}>{terminalOutput}</pre>
              <div className="flex">
                <span>workspace$ </span>
                <input type="text" style={{ background: 'transparent', border: 'none', color: 'var(--accent-green)', outline: 'none', flex: 1, marginLeft: '8px', fontFamily: 'inherit' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (AI/Chat) */}
        <aside style={{ width: '300px', background: 'var(--bg-tertiary)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>
            AI Assistant
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <strong style={{ color: 'var(--accent-purple)' }}>CloudLab AI:</strong> How can I help you code today?
            </div>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
            <input type="text" placeholder="Ask AI..." style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }} />
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="flex justify-between items-center" style={{ height: '24px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', padding: '0 16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <span>main*</span>
          <span className="flex items-center" style={{ gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></div> Container running</span>
        </div>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>TypeScript React</span>
          <span>Prettier</span>
        </div>
      </footer>

      {/* Command Palette Overlay */}
      {showCommandPalette && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', paddingTop: '100px', zIndex: 50 }}>
          <div style={{ width: '600px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            <input type="text" placeholder="> Type a command..." autoFocus style={{ padding: '16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', width: '100%' }} />
            <div style={{ padding: '8px' }}>
              <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>recently used</div>
              <div style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>Format Document</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Shift+Alt+F</span>
              </div>
              <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>Terminal: Create New Terminal</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ctrl+Shift+`</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
