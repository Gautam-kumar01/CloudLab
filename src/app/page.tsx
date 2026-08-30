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
          <img src="/logo.jpg" alt="CloudLab Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, var(--accent-green), var(--accent-neon))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CloudLab</span>
        </div>
        <div className="flex items-center" style={{ gap: '24px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          <a href="#about" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>About</a>
          <a href="#features" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>Features</a>
          <Link href="/dashboard" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>Dashboard</Link>
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
          CloudLab is your complete browser-based cloud development environment. Instantly provision secure Docker containers, write code with an online IDE, and deploy your apps in seconds.
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

      {/* About Section */}
      <section id="about" style={{ padding: '100px 24px', background: 'rgba(5,5,5,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '24px' }}>The Future of Development is in the Cloud.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '24px' }}>
              We built CloudLab to eliminate the "it works on my machine" problem. Local development environments are brittle, hard to set up, and impossible to share. CloudLab changes all of that by moving the entire development lifecycle into a secure, scalable cloud environment.
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>✅ <strong>Zero Setup Time:</strong> Click a button and get a fully configured workspace in seconds.</li>
              <li>✅ <strong>Total Isolation:</strong> Every workspace runs in its own secure Docker container with root access.</li>
              <li>✅ <strong>Accessible Anywhere:</strong> Code from your laptop, tablet, or any device with a modern browser.</li>
            </ul>
          </div>
          <div style={{ flex: '1 1 500px', position: 'relative' }}>
            <img src="/illustration.jpg" alt="3D Cloud Workspace Illustration" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.8), transparent)', borderRadius: '16px', pointerEvents: 'none' }}></div>
          </div>
        </div>
      </section>

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
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Spin up a secure, isolated container for every project. We use robust Docker virtualization to give you full root access to your environment without risking your local machine. Install dependencies, run servers, and execute scripts freely.</p>
          </div>
          <div className="bento-card">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Real-time Collaboration</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Powered by Yjs CRDT technology, you can code together in real-time. See cursors, share terminals, and debug collectively like Google Docs for code.</p>
          </div>
          <div className="bento-card">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Advanced IDE Engine</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Built on top of the Monaco Editor, providing desktop-grade syntax highlighting, intelligent autocomplete, and a robust file tree.</p>
          </div>
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '150px', height: '150px', background: 'rgba(157,0,255,0.1)', filter: 'blur(40px)', borderRadius: '50%' }}></div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Seamless GitHub Integration</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Import any repository with one click using GitHub OAuth. Your workspace is automatically linked, allowing you to commit, push, and manage branches directly from the CloudLab UI terminal.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div className="flex items-center" style={{ gap: '12px', marginBottom: '16px' }}>
              <img src="/logo.jpg" alt="CloudLab Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
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
                <li><a href="#about" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>About</a></li>
                <li><a href="#features" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Features</a></li>
                <li><Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>Dashboard</Link></li>
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
