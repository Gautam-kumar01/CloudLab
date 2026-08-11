'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { 
  Folder, FileCode, FileJson, FileType2, Terminal as TerminalIcon, 
  Play, Share, Settings, Code2, MessageSquare, AlertCircle
} from 'lucide-react';

const initialFiles: Record<string, { name: string, language: string, content: string }> = {
  'index.ts': {
    name: 'index.ts',
    language: 'typescript',
    content: "console.log('Hello from CloudLab!');\n\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(add(5, 7));"
  },
  'App.tsx': {
    name: 'App.tsx',
    language: 'typescript',
    content: "import React from 'react';\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello CloudLab 🚀</h1>\n    </div>\n  );\n}"
  },
  'styles.css': {
    name: 'styles.css',
    language: 'css',
    content: "body {\n  margin: 0;\n  padding: 0;\n  background: #0d1117;\n  color: #c9d1d9;\n  font-family: sans-serif;\n}"
  },
  'package.json': {
    name: 'package.json',
    language: 'json',
    content: "{\n  \"name\": \"cloudlab-demo\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^18.2.0\"\n  }\n}"
  }
};

export default function Workspace() {
  const [files, setFiles] = useState(initialFiles);
  const [activeFile, setActiveFile] = useState('index.ts');
  const [terminalOutput, setTerminalOutput] = useState('> Ready\n> npm start\n> Starting development server...\n');
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

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles(prev => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], content: value }
      }));
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileCode size={14} color="#61dafb" />;
    if (filename.endsWith('.json')) return <FileJson size={14} color="#f1e05a" />;
    if (filename.endsWith('.css')) return <FileType2 size={14} color="#563d7c" />;
    return <FileCode size={14} color="#888" />;
  };

  return (
    <>
      {/* Mobile Warning Overlay */}
      <div className="mobile-warning" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-primary)', zIndex: 100, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-orange)', marginBottom: '8px', fontWeight: 'bold' }}>Desktop Required</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The CloudLab IDE Shell is optimized for laptop and desktop screens. Please resize your window or switch to a larger device.</p>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-warning { display: flex !important; }
          .workspace-container { display: none !important; }
        }
        .resize-handle {
          background-color: var(--border-color);
          transition: background-color 0.2s ease;
        }
        .resize-handle:hover, .resize-handle:active {
          background-color: var(--accent-green);
        }
      `}</style>

      <div className="workspace-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
        {/* Top Bar */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '48px', padding: '0 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/dashboard" style={{ fontWeight: 'bold', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} /> CL
            </Link>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>File</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Edit</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>View</span>
              <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Terminal</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            react-ecommerce
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--border-color)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}>
              <Share size={14} /> Share
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', border: 'none', fontWeight: 600, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.9'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              <Play size={14} fill="currentColor" /> Run
            </button>
          </div>
        </nav>

        {/* Main Layout using Resizable Panels */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PanelGroup direction="horizontal">
            
            {/* Sidebar (File Tree) */}
            <Panel defaultSize={15} minSize={10} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}>
              <div style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <Folder size={14} /> Explorer
              </div>
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto', fontSize: '0.85rem' }}>
                {Object.keys(files).map(filename => (
                  <div 
                    key={filename} 
                    onClick={() => setActiveFile(filename)}
                    style={{
                      padding: '6px 8px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      background: activeFile === filename ? 'var(--bg-secondary)' : 'transparent',
                      color: activeFile === filename ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseOver={e => { if (activeFile !== filename) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    onMouseOut={e => { if (activeFile !== filename) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                  >
                    {getFileIcon(filename)}
                    {filename}
                  </div>
                ))}
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle" style={{ width: '1px', cursor: 'col-resize' }} />

            {/* Center Area (Editor + Terminal) */}
            <Panel defaultSize={65} minSize={30} style={{ display: 'flex', flexDirection: 'column' }}>
              <PanelGroup direction="vertical">
                
                {/* Editor Panel */}
                <Panel defaultSize={70} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                  {/* Editor Tabs */}
                  <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
                    {Object.keys(files).map(filename => (
                      <div 
                        key={filename}
                        onClick={() => setActiveFile(filename)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRight: '1px solid var(--border-color)',
                          background: activeFile === filename ? 'var(--bg-primary)' : 'transparent',
                          color: activeFile === filename ? 'var(--text-primary)' : 'var(--text-secondary)',
                          borderTop: activeFile === filename ? '2px solid var(--accent-green)' : '2px solid transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => { if (activeFile !== filename) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                        onMouseOut={e => { if (activeFile !== filename) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {getFileIcon(filename)}
                        {filename}
                      </div>
                    ))}
                  </div>
                  
                  {/* Monaco Editor */}
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Editor
                      height="100%"
                      language={files[activeFile].language}
                      theme="vs-dark"
                      value={files[activeFile].content}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'var(--font-mono)',
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        formatOnPaste: true,
                      }}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="resize-handle" style={{ height: '1px', cursor: 'row-resize' }} />

                {/* Terminal Panel */}
                <Panel defaultSize={30} minSize={10} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', gap: '16px' }}>
                    <span style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--accent-green)', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TerminalIcon size={12} /> TERMINAL
                    </span>
                    <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>OUTPUT</span>
                    <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                      <AlertCircle size={12} /> PROBLEMS
                    </span>
                  </div>
                  <div style={{ flex: 1, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-green)', overflowY: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{terminalOutput}</pre>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ color: '#61dafb' }}>workspace$</span>
                      <input type="text" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', flex: 1, marginLeft: '8px', fontFamily: 'inherit' }} spellCheck="false" />
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="resize-handle" style={{ width: '1px', cursor: 'col-resize' }} />

            {/* Right Panel (AI/Chat) */}
            <Panel defaultSize={20} minSize={15} style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-tertiary)' }}>
              <div style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="var(--accent-purple)" />
                AI Assistant
              </div>
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '4px' }}>CloudLab AI</strong>
                  How can I help you code today?
                </div>
              </div>
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                <input 
                  type="text" 
                  placeholder="Ask AI..." 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-purple)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </Panel>

          </PanelGroup>
        </div>

        {/* Status Bar */}
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '24px', padding: '0 16px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>main*</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }}></div> 
              Container running
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Ln 1, Col 1</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>UTF-8</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>{files[activeFile].language === 'typescript' ? 'TypeScript' : 'JSON'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <Settings size={12} /> Prettier
            </span>
          </div>
        </footer>

        {/* Command Palette Overlay */}
        {showCommandPalette && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', paddingTop: '96px', zIndex: 50 }}>
            <div style={{ width: '600px', height: '300px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <input type="text" placeholder="> Type a command..." autoFocus style={{ padding: '16px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', width: '100%' }} />
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>recently used</div>
                <div style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                  <span style={{ fontSize: '0.85rem' }}>Format Document</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Shift+Alt+F</span>
                </div>
                <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', color: 'var(--text-secondary)' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <span style={{ fontSize: '0.85rem' }}>Terminal: Create New Terminal</span>
                  <span style={{ fontSize: '0.75rem' }}>Ctrl+Shift+`</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
