"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Terminal, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const navLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#workflow", label: "How It Works" },
  { href: "#architecture", label: "Architecture" },
  { href: "#features", label: "Capabilities" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`cloudlab-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "cloudlab-nav--scrolled" : ""
        }`}
      >
        <div className="cl-container w-full h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="CloudLab Home">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
            </div>
            <span className="font-bold text-[18px] tracking-tight text-white flex items-center gap-1">
              Cloud<span className="text-emerald-400">Lab</span>
              <span className="cloudlab-nav__brand-tag text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ml-1">
                Docker IDE
              </span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[14px] font-medium text-slate-300 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            <a
              href="https://github.com/Gautam-kumar01/CloudLab"
              target="_blank"
              rel="noopener noreferrer"
              className="cloudlab-nav__github flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition"
              aria-label="GitHub Repository"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <Link
              href="/sign-in"
              className="cl-btn cl-btn-secondary cl-btn-sm text-[13px]"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="cl-btn cl-btn-primary cl-btn-sm text-[13px] flex items-center gap-1.5"
            >
              <span>Start Coding Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 text-white hover:bg-white/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 pt-16"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
          <div className="relative cl-container py-4" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/95 p-5 shadow-2xl backdrop-blur-xl">
              <nav className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-[15px] font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex flex-col gap-3">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="cl-btn cl-btn-secondary w-full justify-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="cl-btn cl-btn-primary w-full justify-center"
                >
                  Start Coding Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
