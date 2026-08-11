'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [terminalText, setTerminalText] = useState<string>('');
  const fullText = `> Initializing CloudLab Workspace...
> Connecting to secure container... [OK]
> Authenticating... [SUCCESS]
> Mounting file system... [OK]
> Starting development server on port 3000...

cloudlab@workspace:~/project$ npm run dev

> next dev
> Ready in 125ms

[info] GET / 200 in 45ms
[info] Wait... compiling /_error
... ready in 250 ms`;

  useEffect(() => {
    let currentText = '';
    let i = 0;
    
    const interval = setInterval(() => {
      currentText += fullText.charAt(i);
      setTerminalText(currentText);
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <nav className="flex justify-between items-center" style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff' }}>CL</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, var(--accent-orange), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CloudLab</span>
        </div>
        <div className="flex items-center" style={{ gap: '24px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          <a href="#" style={{ transition: 'color 0.2s' }}>Features</a>
          <a href="#" style={{ transition: 'color 0.2s' }}>Pricing</a>
          <Link href="/sign-in" style={{ padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 600 }}>Sign In</Link>
          <Link href="/sign-up" style={{ padding: '8px 16px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', fontWeight: 600, border: 'none', display: 'inline-block' }}>Get Started</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-col justify-center items-center" style={{ display: 'flex', flex: 1, padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
          Code Anywhere. <br />
          <span style={{ color: 'var(--accent-green)' }}>Collaborate Everywhere.</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '48px', lineHeight: 1.6 }}>
          A browser-based cloud development environment combining an online IDE, isolated containers, and AI coding assistance.
        </p>

        {/* Hacker Terminal Preview Window */}
        <div style={{ width: '100%', maxWidth: '900px', background: '#0a0a0a', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)', textAlign: 'left' }}>
          {/* Terminal Header */}
          <div className="flex items-center" style={{ padding: '12px 16px', background: '#141414', borderBottom: '1px solid var(--border-color)', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
            <div style={{ flex: 1, textAlign: 'center', color: '#666', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>cloudlab-workspace ~ bash</div>
          </div>
          
          {/* Terminal Body */}
          <div style={{ padding: '24px', minHeight: '300px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', position: 'relative' }}>
            {/* Glow Effect */}
            <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '100%', background: 'radial-gradient(ellipse at top, rgba(0, 255, 65, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
            
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--accent-green)', textShadow: '0 0 5px rgba(0,255,65,0.3)' }}>
              {terminalText}
              <span className="cursor" style={{ display: 'inline-block', width: '8px', height: '18px', background: 'var(--accent-green)', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }}></span>
            </pre>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
