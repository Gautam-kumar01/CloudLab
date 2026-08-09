import Link from 'next/link';

export default function SignUp() {
  return (
    <div className="flex flex-col h-screen w-full justify-center items-center" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
        
        <div className="flex flex-col items-center" style={{ marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-purple))', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1.5rem', marginBottom: '16px' }}>CL</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create an account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Start coding in the cloud</p>
        </div>

        <form className="flex flex-col" style={{ gap: '20px' }}>
          <div className="flex flex-col" style={{ gap: '8px' }}>
            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email address</label>
            <input type="email" id="email" placeholder="hacker@cloudlab.dev" style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-mono)' }} />
          </div>

          <div className="flex flex-col" style={{ gap: '8px' }}>
            <label htmlFor="password" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" id="password" placeholder="••••••••" style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-mono)' }} />
          </div>

          <Link href="/dashboard" style={{ marginTop: '8px', padding: '12px', background: 'var(--accent-green)', color: '#000', borderRadius: '6px', fontWeight: 600, textAlign: 'center', transition: 'opacity 0.2s' }}>
            Sign Up
          </Link>
          
          <button type="button" className="flex items-center justify-center" style={{ gap: '12px', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: 500, transition: 'background 0.2s' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"></path>
            </svg>
            Continue with GitHub
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/sign-in" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
