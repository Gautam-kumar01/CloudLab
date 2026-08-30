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
    <div className="flex flex-col w-full bg-grid" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Background Glowing Orbs */}
      <div className="glow-orb" style={{ top: '-100px', left: '-100px', background: 'rgba(157, 0, 255, 0.4)' }}></div>
      <div className="glow-orb" style={{ top: '40%', right: '-50px', background: 'rgba(0, 255, 65, 0.2)' }}></div>

      {/* Sticky Glassmorphism Navbar */}
      <nav className="glass sticky top-0 z-50 flex justify-between items-center" style={{ padding: '16px 32px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff' }}>CL</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, var(--accent-orange), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CloudLab</span>
        </div>
        <div className="flex items-center" style={{ gap: '24px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          <a href="#features" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>Features</a>
          <a href="#pricing" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>Pricing</a>
          <Link href="/sign-in" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontWeight: 600, transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Sign In</Link>
          <Link href="/sign-up" style={{ padding: '8px 16px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', fontWeight: 600, border: 'none', display: 'inline-block', boxShadow: '0 0 15px rgba(0,255,65,0.4)', transition: 'box-shadow 0.2s, transform 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 0 25px rgba(0,255,65,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,65,0.4)'; e.currentTarget.style.transform = 'translateY(0)'}}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center" style={{ padding: '80px 24px', textAlign: 'center', minHeight: '90vh', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.05em', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          Code Anywhere. <br />
          <span style={{ background: 'linear-gradient(to right, var(--accent-green), var(--accent-neon))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Collaborate Everywhere.</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '64px', lineHeight: 1.6 }}>
          A browser-based cloud development environment combining an online IDE, isolated containers, and AI coding assistance.
        </p>

        {/* 3D Hacker Terminal Preview Window */}
        <div className="perspective-container" style={{ width: '100%', maxWidth: '900px' }}>
          <div className="terminal-3d" style={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(20px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', textAlign: 'left' }}>
            {/* Terminal Header */}
            <div className="flex items-center" style={{ padding: '12px 16px', background: 'rgba(20, 20, 20, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }}></div>
              <div style={{ flex: 1, textAlign: 'center', color: '#888', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>cloudlab-workspace ~ bash</div>
            </div>
            
            {/* Terminal Body */}
            <div style={{ padding: '24px', minHeight: '300px', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)', position: 'relative' }}>
              {/* Ambient Glow inside terminal */}
              <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '100%', background: 'radial-gradient(ellipse at top, rgba(0, 255, 65, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: 'var(--accent-green)', textShadow: '0 0 8px rgba(0,255,65,0.4)' }}>
                {terminalText}
                <span className="cursor" style={{ display: 'inline-block', width: '8px', height: '18px', background: 'var(--accent-green)', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }}></span>
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Features Bento Grid Section */}
      <section id="features" style={{ padding: '100px 24px', background: 'linear-gradient(to bottom, transparent, rgba(17,17,17,0.8))' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Supercharge your workflow.</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Everything you need to build software, directly in your browser.</p>
        </div>

        <div className="bento-grid">
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(0,255,65,0.1)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Isolated Docker Workspaces</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Spin up a secure, isolated container for every project. Get full root access to your environment without risking your local machine.</p>
          </div>
          <div className="bento-card">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Real-time Collaboration</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Code together in real-time. See cursors, share terminals, and debug collectively like Google Docs for code.</p>
          </div>
          <div className="bento-card">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>AI Coding Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Built-in AI that understands your codebase. Ask questions, generate code, and fix errors instantly.</p>
          </div>
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'rgba(157,0,255,0.1)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Seamless GitHub Integration</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Import any repository with one click. Commit, push, and manage branches directly from the CloudLab UI.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div className="flex items-center" style={{ gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff', fontSize: '0.7rem' }}>CL</div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>CloudLab</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              The modern cloud development environment. Code, collaborate, and deploy from anywhere.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Features</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Pricing</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Privacy Policy</a></li>
                <li><a href="#" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '48px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} CloudLab. All rights reserved.
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
