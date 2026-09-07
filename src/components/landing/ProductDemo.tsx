'use client';

import { useEffect, useState } from 'react';

export default function ProductDemo() {
  const [typed, setTyped] = useState('');
  const command = 'npm run dev';

  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setTyped(command.slice(0, i));
        i += 1;
        if (i > command.length) clearInterval(iv);
      }, 75);
      return () => clearInterval(iv);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const running = typed === command;

  return (
    <section className="relative pb-16 sm:pb-20">
      <div
        className="ambient-glow-green"
        style={{ bottom: '-200px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px' }}
      />
      <div
        className="ambient-glow-purple"
        style={{ bottom: '-100px', left: '-160px' }}
      />

      <div className="cl-container relative z-10">
        <div
          className="cl-ide-frame mx-auto cl-float"
          style={{ animationDelay: '460ms' }}
        >
          <div className="flex items-center justify-between px-4 sm:px-5 h-12 border-b border-[--border] bg-[--surface-elevated]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[12px] text-[--text-muted] font-mono hidden sm:inline"
              >
                cloudlab.app / workspace
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  boxShadow: 'inset 0 0 0 1px rgba(5,150,105,0.25)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'var(--accent)' }}
                />
                Running
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, var(--accent-purple), var(--accent))',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)',
                }}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[460px] sm:min-h-[520px]">
            {/* Explorer */}
            <aside
              className="hidden md:flex flex-col w-52 flex-shrink-0 border-r border-[--border] bg-[--surface]"
            >
              <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-wider font-semibold text-[--text-subtle]">
                Explorer
              </div>
              <div className="px-2 pb-4 text-[13px] font-mono space-y-0.5">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-white bg-white/5">
                  <span style={{ color: 'var(--accent-orange)' }}>▾</span>
                  <span className="text-[11px]">src</span>
                </div>
                <div className="flex items-center gap-1.5 pl-5 px-2 py-1 rounded text-[--text-muted] hover:text-white hover:bg-white/5 cursor-pointer">
                  <span style={{ color: '#e34c26' }}>JSX</span>
                  <span className="text-[12px]">App.jsx</span>
                </div>
                <div className="flex items-center gap-1.5 pl-5 px-2 py-1 rounded text-[--text-muted] hover:text-white hover:bg-white/5 cursor-pointer">
                  <span style={{ color: '#264de4' }}>CSS</span>
                  <span className="text-[12px]">index.css</span>
                </div>
                <div className="flex items-center gap-1.5 pl-5 px-2 py-1 rounded text-[--text-muted] hover:text-white hover:bg-white/5 cursor-pointer">
                  <span style={{ color: 'var(--accent-orange)' }}>▸</span>
                  <span className="text-[11px]">api</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[--text-muted] hover:text-white hover:bg-white/5 cursor-pointer mt-1">
                  <span style={{ color: 'var(--accent)' }}>{ }</span>
                  <span className="text-[12px]">package.json</span>
                </div>
              </div>
            </aside>

            {/* Main column */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center border-b border-[--border] bg-[--surface] text-[12px] font-mono overflow-x-auto hide-scrollbar">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border-r border-[--border] text-white whitespace-nowrap"
                  style={{
                    background: 'var(--bg)',
                    boxShadow: 'inset 0 2px 0 var(--accent)',
                  }}
                >
                  <span style={{ color: '#e34c26', fontSize: '10px' }}>JSX</span>
                  App.jsx
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 border-r border-[--border] text-[--text-muted] whitespace-nowrap">
                  package.json
                </div>
              </div>

              {/* Code area */}
              <div
                className="flex-1 flex overflow-hidden"
                style={{ background: 'var(--bg)' }}
              >
                <div className="w-10 sm:w-12 flex-shrink-0 py-4 text-right pr-2 text-[11px] font-mono text-[--text-subtle] select-none border-r border-black/30 leading-[22px]">
                  1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10
                </div>
                <div className="flex-1 p-4 font-mono text-[13px] sm:text-[13.5px] leading-[22px] overflow-hidden">
                  <div><span style={{ color: '#c586c0' }}>import</span> React <span style={{ color: '#c586c0' }}>from</span> <span style={{ color: '#ce9178' }}>'react'</span>;</div>
                  <div><span style={{ color: '#c586c0' }}>import</span> <span style={{ color: '#ce9178' }}>'./index.css'</span>;</div>
                  <div>&nbsp;</div>
                  <div><span style={{ color: '#569cd6' }}>export default function</span> <span style={{ color: '#dcdcaa' }}>App</span>() {'{'}</div>
                  <div>&nbsp;&nbsp;<span style={{ color: '#c586c0' }}>return</span> (</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style={{ color: '#569cd6' }}>div</span> className=<span style={{ color: '#ce9178' }}>'container'</span>&gt;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style={{ color: '#569cd6' }}>h1</span>&gt;Hello CloudLab!&lt;/<span style={{ color: '#569cd6' }}>h1</span>&gt;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style={{ color: '#569cd6' }}>p</span>&gt;Built in the cloud.&lt;/<span style={{ color: '#569cd6' }}>p</span>&gt;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span style={{ color: '#569cd6' }}>div</span>&gt;</div>
                  <div>&nbsp;&nbsp;);</div>
                  <div>{'}'}</div>
                </div>
              </div>

              {/* Terminal */}
              <div
                className="h-44 flex flex-col border-t border-[--border]"
                style={{ background: '#080808' }}
              >
                <div
                  className="flex items-center px-4 h-8 border-b border-black/40 text-[11px] font-mono gap-5"
                  style={{ background: 'var(--surface)' }}
                >
                  <span
                    className="text-white pb-0"
                    style={{ boxShadow: 'inset 0 -2px 0 var(--accent)' }}
                  >
                    TERMINAL
                  </span>
                  <span className="text-[--text-subtle] hover:text-white cursor-pointer">
                    OUTPUT
                  </span>
                  <span className="text-[--text-subtle] hover:text-white cursor-pointer">
                    PORTS
                  </span>
                </div>
                <div className="flex-1 p-3 sm:p-3.5 font-mono text-[12.5px] overflow-hidden text-[--text]">
                  <div>
                    <span style={{ color: 'var(--accent)' }}>cloudlab@workspace</span>
                    <span style={{ color: 'var(--text-subtle)' }}>:</span>
                    <span style={{ color: 'var(--accent-purple)' }}>~/app</span>
                    <span style={{ color: 'var(--text-subtle)' }}>$ </span>
                    {typed}
                    <span
                      className={`inline-block w-2 h-3.5 align-middle ml-0.5 ${running ? 'animate-pulse' : ''}`}
                      style={{ background: 'var(--text-muted)' }}
                    />
                  </div>
                  {running && (
                    <div
                      className="mt-1 opacity-0"
                      style={{
                        animation: 'clFadeUp 0.35s 0.15s ease forwards',
                      }}
                    >
                      <div className="text-[--text-subtle]">{'>'} app@0.1.0 dev</div>
                      <div className="text-[--text-subtle]">{'>'} vite</div>
                      <div className="mt-2" style={{ color: 'var(--accent)' }}>
                        {'  '}VITE v5.4.0  ready in 152 ms
                      </div>
                      <div className="mt-2">
                        {'  '}➜{'  '}<span className="font-semibold">Local</span>:{'   '}
                        <a style={{ color: 'var(--accent-purple)' }} href="#">http://localhost:5173/</a>
                      </div>
                      <div>
                        {'  '}➜{'  '}<span className="font-semibold">Network</span>: use --host to expose
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <aside
              className="hidden xl:flex flex-col w-80 flex-shrink-0 border-l border-[--border]"
              style={{ background: '#fafafa' }}
            >
              <div className="h-10 flex items-center px-3 gap-2 border-b border-gray-200" style={{ background: '#f0f0f0' }}>
                <div
                  className="flex-1 bg-white rounded text-[11px] px-3 py-1.5 text-gray-500 flex items-center gap-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  localhost:5173
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer">
                  ↻
                </div>
              </div>
              <div className="flex-1 p-8 text-black flex flex-col items-center justify-center bg-[linear-gradient(180deg,#fafafa,#f4f4f5)]">
                {running ? (
                  <div
                    className="flex flex-col items-center text-center"
                    style={{
                      animation: 'clFadeUp 0.4s ease forwards',
                      opacity: 0,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl mb-5 shadow-lg"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--accent) 0%, var(--accent-purple) 100%)',
                        boxShadow:
                          '0 10px 30px -10px rgba(5,150,105,0.5)',
                      }}
                    />
                    <h2 className="text-2xl font-bold mb-1.5">Hello CloudLab!</h2>
                    <p className="text-sm text-gray-500">Built in the cloud.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <div className="w-7 h-7 border-[3px] border-gray-200 border-t-gray-400 rounded-full animate-spin mb-3" />
                    <p className="text-xs">Connecting to preview…</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
