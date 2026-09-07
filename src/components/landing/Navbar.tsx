'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#why-cloudlab', label: 'Why CloudLab' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header className={`cl-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="cl-container w-full flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="CloudLab — Home"
          >
            <div className="relative">
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
            </div>
            <span
              className="font-semibold text-[17px] tracking-tight text-white"
              style={{ letterSpacing: '-0.01em' }}
            >
              Cloud<span style={{ color: 'var(--accent)' }}>Lab</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="cl-navbar-link"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="cl-btn cl-btn-secondary cl-btn-sm"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="cl-btn cl-btn-primary cl-btn-sm"
            >
              Start Coding
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden w-10 h-10 rounded-[--radius-sm] flex items-center justify-center border border-[--border] text-white hover:bg-[--surface-hover] transition"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-[68px]"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative cl-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-4 rounded-[--radius-lg] border border-[--border] bg-[--surface] p-4 shadow-[--shadow-lg]">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 rounded-[--radius-sm] text-[15px] font-medium text-white hover:bg-[--surface-hover] transition"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="h-px bg-[--border] my-3" />
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="cl-btn cl-btn-secondary"
                  style={{ height: '44px' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="cl-btn cl-btn-primary"
                  style={{ height: '44px' }}
                >
                  Start Coding
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
