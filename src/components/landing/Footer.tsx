'use client';
import Link from 'next/link';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'AI Assistant', href: '#features' },
      { label: 'Collaboration', href: '#features' },
      { label: 'Deployments', href: '#features' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'GitHub', href: '#' },
      { label: 'Templates', href: '/dashboard' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];

function Social({ path, label }: { path: React.ReactNode; label: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
      style={{
        background: 'rgba(255,255,255,0.03)',
        color: 'var(--text-muted)',
        boxShadow: 'inset 0 0 0 1px var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.background = 'var(--surface-hover)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.boxShadow = 'inset 0 0 0 1px var(--border)';
      }}
    >
      {path}
    </a>
  );
}

export default function Footer() {
  return (
    <footer
      className="relative"
      style={{
        borderTop: '1px solid var(--border)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, var(--bg) 100%)',
      }}
    >
      <div
        className="ambient-glow-green"
        style={{ top: '-200px', left: '10%', width: '400px', height: '400px', opacity: 0.6 }}
      />

      <div className="cl-container relative z-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(5,150,105,0.2), rgba(124,58,237,0.15))',
                  boxShadow: 'inset 0 0 0 1px rgba(5,150,105,0.35)',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--accent)' }}
                >
                  <path d="M17.5 19a4.5 4.5 0 1 0-1.3-8.81A6 6 0 0 0 5 12.5 4 4 0 0 0 6 20h11.5Z" />
                </svg>
              </div>
              <span
                className="font-semibold text-[17px] tracking-tight text-white"
                style={{ letterSpacing: '-0.01em' }}
              >
                Cloud<span style={{ color: 'var(--accent)' }}>Lab</span>
              </span>
            </Link>
            <p
              className="mt-5 typo-body max-w-sm"
              style={{ fontSize: '15px' }}
            >
              Your entire development environment, in the cloud.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Social
                label="X"
                path={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.3 10.8 22 3h-2l-7.5 6.4L6 3H2l8.8 8.4L2 21h2l8-6.8 6.4 6.8h4L13.3 10.8Z" />
                  </svg>
                }
              />
              <Social
                label="GitHub"
                path={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85 0 1.7.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z" />
                  </svg>
                }
              />
              <Social
                label="LinkedIn"
                path={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75ZM9.5 9.75h3.8v1.55h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.8c0-1.14-.02-2.61-1.59-2.61-1.6 0-1.85 1.24-1.85 2.53V21h-4V9.75Z" />
                  </svg>
                }
              />
              <Social
                label="Discord"
                path={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.4a17 17 0 0 0-4.5 0l-.2-.4a19.8 19.8 0 0 0-4.9 1.4C2.2 9.1 1.4 13.6 2 18a20 20 0 0 0 6 3l.5-.7a13 13 0 0 1-2-1l.5-.4a13.7 13.7 0 0 0 11 0l.5.4a13 13 0 0 1-2 1l.5.7a20 20 0 0 0 6-3c.7-5.1-.8-9.6-4.7-13.6ZM9 15c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-7 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-4"
                  style={{ color: 'var(--text-subtle)' }}
                >
                  {c.title}
                </div>
                <ul className="flex flex-col gap-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[14px] transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-[13px]" style={{ color: 'var(--text-subtle)' }}>
            © 2026 CloudLab
          </span>
          <span className="text-[13px] flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 8px rgba(5,150,105,0.6)',
              }}
            />
            Built for developers.
          </span>
        </div>
      </div>
    </footer>
  );
}
