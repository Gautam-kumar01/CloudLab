'use client';

import Link from 'next/link';
import { Terminal, Heart } from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#030712] text-slate-400 text-xs py-14">
      <div className="cl-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Status Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">
                Cloud<span className="text-emerald-400">Lab</span>
              </span>
            </Link>
            <p className="max-w-sm text-slate-400 text-sm leading-relaxed">
              The modern browser-based cloud development environment. Write code, collaborate live, run terminals, and ship software with isolated Docker containers.
            </p>
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#ide-demo" className="hover:text-white transition">Live IDE Studio</a></li>
              <li><a href="#features" className="hover:text-white transition">Docker Sandboxes</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">Multiplayer CRDT</a></li>
              <li><a href="#comparison" className="hover:text-white transition">AI Copilot Tools</a></li>
            </ul>
          </div>

          {/* Account & Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm">Developer</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/sign-in" className="hover:text-white transition">Sign In</Link></li>
              <li><Link href="/sign-up" className="hover:text-white transition">Create Account</Link></li>
              <li><a href="https://github.com/Gautam-kumar01/CloudLab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub Repository</a></li>
              <li><a href="#faq" className="hover:text-white transition">Documentation FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[12px]">
            © {new Date().getFullYear()} CloudLab IDE. Open source cloud development environment.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/Gautam-kumar01/CloudLab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition text-[12px]"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Gautam-kumar01/CloudLab</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
