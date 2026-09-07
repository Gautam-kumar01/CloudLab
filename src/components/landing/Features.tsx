'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  wide?: boolean;
};

const iconBase = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const features: Feature[] = [
  {
    title: 'Cloud Workspaces',
    desc:
      'Isolated Docker environments with full root access. Launch in under 10 seconds with pre-configured templates for every stack.',
    wide: true,
    icon: (
      <svg {...iconBase}>
        <path d="M17.5 19a4.5 4.5 0 1 0-1.3-8.81A6 6 0 0 0 5 12.5 4 4 0 0 0 6 20h11.5Z" />
      </svg>
    ),
  },
  {
    title: 'Browser IDE',
    desc:
      'Monaco-powered editor with syntax highlighting, intelligent autocomplete, multi-cursor, and all the shortcuts you know.',
    icon: (
      <svg {...iconBase}>
        <path d="m9 11-5 5 5 5" />
        <path d="M4 16H2" />
        <path d="m15 6 5 5-5 5" />
        <path d="M20 11h2" />
      </svg>
    ),
  },
  {
    title: 'Integrated Terminal',
    desc:
      'A real Linux shell via xterm.js and node-pty. Install packages, run tests, and manage services exactly like local.',
    icon: (
      <svg {...iconBase}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m7 9 3 3-3 3" />
        <path d="M13 15h4" />
      </svg>
    ),
  },
  {
    title: 'GitHub Integration',
    desc:
      'Import any repo in one click. Auto-detects frameworks, installs deps, and starts your dev server. Push changes back seamlessly.',
    icon: (
      <svg {...iconBase} strokeWidth={1.6}>
        <path d="M9 19c-4 1.5-4-2-6-2m12 5v-3.5a3 3 0 0 0-.9-2.3c3-.3 6.2-1.5 6.2-7A5.4 5.4 0 0 0 18.8 4a5 5 0 0 0-.1-3.8s-1.1-.4-3.5 1.3a12 12 0 0 0-6.4 0C6.3-.2 5.2.2 5.2.2A5 5 0 0 0 5 4a5.4 5.4 0 0 0-1.4 4c0 5.5 3.2 6.7 6.2 7A3 3 0 0 0 9 17V20" />
      </svg>
    ),
  },
  {
    title: 'Docker-powered',
    desc:
      'Every workspace runs in its own container. Full OS-level isolation, custom images, and reproducible environments.',
    icon: (
      <svg {...iconBase}>
        <path d="M22 11H2" />
        <path d="M5 7h3v4H5zM9 7h3v4H9zM13 7h3v4h-3zM17 7h3v4h-3zM9 3h3v4H9zM13 3h3v4h-3z" />
        <path d="M21 13H3l.9 5a3 3 0 0 0 3 2.5h10.2a3 3 0 0 0 3-2.5L21 13Z" />
      </svg>
    ),
  },
  {
    title: 'AI Coding Assistant',
    desc:
      'Context-aware AI understands your entire workspace. Generate code, fix bugs, refactor, and explain with one click.',
    icon: (
      <svg {...iconBase}>
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="m5 5 1.5 1.5" />
        <path d="m17.5 17.5 1.5 1.5" />
        <path d="M3 12h2" />
        <path d="M19 12h2" />
        <path d="m5 19 1.5-1.5" />
        <path d="m17.5 6.5 1.5-1.5" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    title: 'Live Collaboration',
    desc:
      'Multiplayer cursors, shared terminals, and synced previews. Yjs CRDTs guarantee every keystroke merges perfectly.',
    icon: (
      <svg {...iconBase}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </svg>
    ),
  },
  {
    title: 'Live Preview',
    desc:
      'See changes instantly in the built-in browser preview. Forward any port and share a public URL with teammates.',
    icon: (
      <svg {...iconBase}>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
        <path d="M15 20v-2" />
      </svg>
    ),
  },
  {
    title: 'One-Click Deploy',
    desc:
      'Build, containerize, and ship to a global edge network. Automatic SSL, custom domains, and instant rollbacks.',
    wide: true,
    icon: (
      <svg {...iconBase}>
        <path d="M4.5 16.5 3 18l3 3 1.5-1.5" />
        <path d="M14 4l3 3-10 10H4v-3Z" />
        <path d="M17 4h3v3" />
      </svg>
    ),
  },
];

function Card({ f, delay }: { f: Feature; delay: number }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`cl-card cl-card-glow p-7 reveal-section ${f.wide ? 'md:col-span-2' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          boxShadow: 'inset 0 0 0 1px rgba(5,150,105,0.2)',
        }}
      >
        {f.icon}
      </div>
      <h3 className="typo-h3 text-white mb-2.5">{f.title}</h3>
      <p className="typo-body">{f.desc}</p>
    </div>
  );
}

export default function Features() {
  const hRef = useScrollReveal();

  return (
    <section id="features" className="cl-section relative">
      <div
        className="ambient-glow-green"
        style={{ top: '10%', left: '-200px' }}
      />
      <div
        className="ambient-glow-purple"
        style={{ bottom: '5%', right: '-160px' }}
      />

      <div className="cl-container relative z-10">
        <div className="text-center reveal-section" ref={hRef}>
          <div className="eyebrow mb-5">FEATURES</div>
          <h2 className="typo-h2 text-white">Everything you need to build.</h2>
          <p
            className="typo-body-lg mt-5 mx-auto"
            style={{ maxWidth: 600 }}
          >
            A complete development environment directly in your browser.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Card key={f.title} f={f} delay={i * 60} />
          ))}
        </div>
      </div>
    </section>
  );
}
