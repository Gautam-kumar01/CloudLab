'use client';

import React from 'react';

interface FileIconProps {
  filename: string;
  isDirectory?: boolean;
  isOpen?: boolean;
  size?: number;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  filename,
  isDirectory = false,
  isOpen = false,
  size = 15,
  className = '',
}) => {
  const name = (filename || '').toLowerCase().trim();
  const basename = name.split('/').pop() || name;

  // Folder Icons
  if (isDirectory) {
    if (basename === 'node_modules') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill="#5b6471"
          />
          <circle cx="12" cy="13" r="2.5" fill="#38bdf8" />
        </svg>
      );
    }
    if (basename === 'src' || basename === 'app' || basename === 'pages' || basename === 'components') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill={isOpen ? '#38bdf8' : '#0284c7'}
          />
          <path d="M8 12l2 2-2 2m8-4l-2 2 2 2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
    if (basename === 'api' || basename === 'server' || basename === 'services') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill={isOpen ? '#10b981' : '#059669'}
          />
          <circle cx="12" cy="13" r="1.5" fill="#ffffff" />
        </svg>
      );
    }
    if (basename === 'public' || basename === 'assets' || basename === 'static' || basename === 'images') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill={isOpen ? '#a855f7' : '#7e22ce'}
          />
        </svg>
      );
    }
    if (basename === 'scripts' || basename === 'patches' || basename === 'research' || basename === 'submission' || basename === 'drizzle' || basename === 'client') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill={isOpen ? '#f59e0b' : '#d97706'}
          />
        </svg>
      );
    }

    // Default Folder
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        {isOpen ? (
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill="#e5c07b"
          />
        ) : (
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            fill="#dcb67a"
          />
        )}
      </svg>
    );
  }

  // Exact Filename Matches

  // 1. Docker files (Dockerfile, Dockerfile.*, docker-compose.*, .dockerignore)
  if (
    basename === 'dockerfile' ||
    basename.startsWith('dockerfile.') ||
    basename.startsWith('docker-compose') ||
    basename.startsWith('compose.') ||
    basename === '.dockerignore'
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M22.5 10.5c-.3-.2-1.3-.3-2.1.2-.2-.8-.7-1.5-1.5-1.9l-.6-.3-.3.5c-.3.7-.3 1.5 0 2.2-.4.2-1.2.3-2.1.2-.4-.1-.7-.2-1.1-.3l.1-.8h-2.1v1.6H11V10H8.8v1.8H6.6V10H4.4v1.8H2.2v1.6H1.1c-.6 0-1.1.5-1.1 1.1 0 3.3 2.1 6.1 5.3 7 3.5.9 7.3.3 10.2-1.5 2.6-1.6 4.3-4.4 4.5-7.4v-.4l-.5-.2z"
          fill="#2496ed"
        />
        <rect x="4.4" y="6.6" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="6.8" y="6.6" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="9.2" y="6.6" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="11.6" y="6.6" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="6.8" y="4.4" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="9.2" y="4.4" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="11.6" y="4.4" width="2" height="1.8" rx="0.3" fill="#2496ed" />
        <rect x="9.2" y="2.2" width="2" height="1.8" rx="0.3" fill="#2496ed" />
      </svg>
    );
  }

  // 2. Git files (.gitignore, .gitattributes, .gitmodules, .gitkeep)
  if (
    basename === '.gitignore' ||
    basename === '.gitattributes' ||
    basename === '.gitmodules' ||
    basename === '.gitkeep'
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M21.6 10.8l-8.4-8.4a2.4 2.4 0 00-3.4 0L7.4 4.8l3.1 3.1a2 2 0 012.3 2.3l2.8 2.8a2 2 0 11-1.2 1.2l-2.7-2.7v4.6a2 2 0 11-1.7 0v-4.9a2 2 0 01-1.1-2.6L5.8 5.5 2.4 8.9a2.4 2.4 0 000 3.4l8.4 8.4a2.4 2.4 0 003.4 0l7.4-7.4a2.4 2.4 0 000-3.5z"
          fill="#f05032"
        />
      </svg>
    );
  }

  // 3. ESLint (.eslintignore, eslint.config.*, .eslintrc*)
  if (
    basename === '.eslintignore' ||
    basename.startsWith('eslint.config.') ||
    basename.startsWith('.eslintrc')
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 2l9 5.2v10.4L12 23l-9-5.4V7.2L12 2z"
          fill="#4b32c3"
        />
        <circle cx="12" cy="12" r="5" stroke="#ffffff" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="2" fill="#ffffff" />
      </svg>
    );
  }

  // 4. Prettier (.prettierrc*, .prettierignore, prettier.config.*)
  if (
    basename.startsWith('.prettierrc') ||
    basename === '.prettierignore' ||
    basename.startsWith('prettier.config.')
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="18" height="3" rx="1.5" fill="#f43f5e" />
        <rect x="3" y="7.5" width="18" height="3" rx="1.5" fill="#f59e0b" />
        <rect x="3" y="12" width="18" height="3" rx="1.5" fill="#10b981" />
        <rect x="3" y="16.5" width="12" height="3" rx="1.5" fill="#06b6d4" />
        <rect x="3" y="21" width="6" height="3" rx="1.5" fill="#3b82f6" />
      </svg>
    );
  }

  // 5. Next.js (next.config.*, next-env.d.ts)
  if (basename.startsWith('next.config.')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="11" fill="#000000" stroke="#ffffff" strokeWidth="1" />
        <path
          d="M7 17V7h2.2l6.8 9.5V7h2v10h-2.2L9 7.5V17H7z"
          fill="#ffffff"
        />
      </svg>
    );
  }
  if (basename === 'next-env.d.ts') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#0284c7" />
        <text x="3" y="17" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif">
          TS
        </text>
        <circle cx="19" cy="5" r="3" fill="#10b981" />
      </svg>
    );
  }

  // 6. Package files (package.json, package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb)
  if (basename === 'package.json') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="3" fill="#cb3837" />
        <path d="M4 6h16v12H12v-6H8v6H4V6z" fill="#ffffff" />
      </svg>
    );
  }
  if (
    basename === 'package-lock.json' ||
    basename === 'yarn.lock' ||
    basename === 'pnpm-lock.yaml' ||
    basename === 'bun.lockb'
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="3" fill="#475569" />
        <path
          d="M8 10V7a4 4 0 018 0v3h1a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1h2zm2 0h4V7a2 2 0 00-4 0v3z"
          fill="#f8fafc"
        />
      </svg>
    );
  }

  // 7. Tailwind CSS (tailwind.config.*)
  if (basename.startsWith('tailwind.config.')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 6c-3.6 0-5.8 1.8-6.6 5.4 1.2-1.5 2.7-2.1 4.5-1.8 1 .2 1.8 1 2.6 1.8 1.4 1.4 3 3 6.5 3 3.6 0 5.8-1.8 6.6-5.4-1.2 1.5-2.7 2.1-4.5 1.8-1-.2-1.8-1-2.6-1.8-1.4-1.4-3-3-6.5-3zm-6.6 6.6C1.8 12.6-.4 14.4-1.2 18c1.2-1.5 2.7-2.1 4.5-1.8 1 .2 1.8 1 2.6 1.8 1.4 1.4 3 3 6.5 3 3.6 0 5.8-1.8 6.6-5.4-1.2 1.5-2.7 2.1-4.5 1.8-1-.2-1.8-1-2.6-1.8-1.4-1.4-3-3-6.5-3z"
          fill="#38bdf8"
          transform="scale(0.8) translate(3, 2)"
        />
      </svg>
    );
  }

  // 8. Prisma (schema.prisma, prisma.config.*)
  if (basename.endsWith('.prisma') || basename.startsWith('prisma.config.')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M4 21L12 2l8 19H4zm3.8-2h8.4L12 7.5 7.8 19z" fill="#5a67d8" />
      </svg>
    );
  }

  // 9. Vite (vite.config.*)
  if (basename.startsWith('vite.config.')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M13 2L3 14h7v8l11-12h-8V2z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    );
  }

  // 10. License (LICENSE, LICENSE.md, LICENCE)
  if (basename.startsWith('license') || basename.startsWith('licence')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2" />
        <path
          d="M14.5 9.5a3.5 3.5 0 100 5"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // 11. Environment files (.env, .env.*)
  if (basename === '.env' || basename.startsWith('.env.')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"
          fill="#eab308"
        />
        <path d="M12 6v6l4 2" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 12. Neon (.neon)
  if (basename === '.neon') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M4 6C4 3.79 7.58 2 12 2s8 1.79 8 4v12c0 2.21-3.58 4-8 4s-8-1.79-8-4V6z"
          fill="#00e599"
        />
        <ellipse cx="12" cy="6" rx="8" ry="3" fill="#34d399" />
      </svg>
    );
  }

  // 13. TypeScript config (tsconfig.json, tsconfig.*.json)
  if (basename.startsWith('tsconfig')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#3178c6" />
        <text x="3" y="17" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif">
          TS
        </text>
      </svg>
    );
  }

  // Extension-based Matches

  // Markdown (.md, .mdx) -> Real VS Code blue M↓ badge
  if (basename.endsWith('.md') || basename.endsWith('.mdx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#0284c7" />
        <path
          d="M4 17V7h3l2.5 3.5L12 7h3v10h-2.5v-5.5L10 15h-1l-2.5-3.5V17H4zm13.5-5.5h2.5V7h2.5v4.5H25L21 17l-4-5.5z"
          fill="#ffffff"
          transform="scale(0.8) translate(1, 2.5)"
        />
      </svg>
    );
  }

  // TypeScript (.ts, .tsx)
  if (basename.endsWith('.tsx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#0284c7" />
        <text x="2" y="17" fill="#67e8f9" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif">
          TSX
        </text>
      </svg>
    );
  }
  if (basename.endsWith('.ts')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#3178c6" />
        <text x="3" y="17" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif">
          TS
        </text>
      </svg>
    );
  }

  // JavaScript (.js, .jsx, .mjs, .cjs)
  if (basename.endsWith('.jsx')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#f7df1e" />
        <text x="2" y="17" fill="#000000" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif">
          JSX
        </text>
      </svg>
    );
  }
  if (basename.endsWith('.js') || basename.endsWith('.mjs') || basename.endsWith('.cjs')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#f7df1e" />
        <text x="4" y="17" fill="#000000" fontSize="13" fontWeight="bold" fontFamily="system-ui, sans-serif">
          JS
        </text>
      </svg>
    );
  }

  // JSON (.json, .jsonc)
  if (basename.endsWith('.json') || basename.endsWith('.jsonc')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#475569" />
        <text x="3" y="17" fill="#facc15" fontSize="14" fontWeight="bold" fontFamily="monospace">
          {'{ }'}
        </text>
      </svg>
    );
  }

  // CSS, SCSS, SASS, LESS
  if (basename.endsWith('.css')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#38bdf8" />
        <text x="4" y="17" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="system-ui, sans-serif">
          #
        </text>
      </svg>
    );
  }
  if (basename.endsWith('.scss') || basename.endsWith('.sass')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#f43f5e" />
        <text x="2" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          SCSS
        </text>
      </svg>
    );
  }

  // HTML (.html, .htm)
  if (basename.endsWith('.html') || basename.endsWith('.htm')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3 2l2 18 7 2 7-2 2-18H3zm14 6h-7.5l.3 3h7l-.6 6-4.2 1.2-4.2-1.2-.3-3.2h2.5l.1 1.4 1.9.5 1.9-.5.2-2.4H6.5L5.8 5h12.5l-.3 3z" fill="#e34f26" />
      </svg>
    );
  }

  // Python (.py)
  if (basename.endsWith('.py')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <path
          d="M11.9 2c-5.2 0-4.9 2.3-4.9 2.3l.1 2.3h5V8H4.6S2 7.7 2 12.9c0 5.2 2.3 5 2.3 5h1.4v-2.5c0-2.8 2.4-2.8 2.4-2.8h7.2c2.3 0 2.3-2.3 2.3-2.3V4.3C17.6 2 11.9 2 11.9 2zm-2.4 1.8c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"
          fill="#38bdf8"
        />
        <path
          d="M12.1 22c5.2 0 4.9-2.3 4.9-2.3l-.1-2.3h-5V16h7.5s2.6.3 2.6-4.9c0-5.2-2.3-5-2.3-5h-1.4v2.5c0 2.8-2.4 2.8-2.4 2.8H8.7c-2.3 0-2.3 2.3-2.3 2.3v5.9c0 2.3 5.7 2.4 5.7 2.4zm2.4-1.8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"
          fill="#facc15"
        />
      </svg>
    );
  }

  // Shell / Bash (.sh, .bash, .zsh)
  if (basename.endsWith('.sh') || basename.endsWith('.bash') || basename.endsWith('.zsh')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
        <path d="M5 8l4 4-4 4m6 0h6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // YAML / YML (.yaml, .yml)
  if (basename.endsWith('.yaml') || basename.endsWith('.yml')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#cb171e" />
        <text x="2" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          YML
        </text>
      </svg>
    );
  }

  // SQL / Database (.sql)
  if (basename.endsWith('.sql')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <ellipse cx="12" cy="6" rx="8" ry="3" fill="#00e599" />
        <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#00e599" strokeWidth="2" />
        <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke="#00e599" strokeWidth="2" />
      </svg>
    );
  }

  // Typst (.typ)
  if (basename.endsWith('.typ')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#239dad" />
        <text x="7" y="17" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="serif">
          T
        </text>
      </svg>
    );
  }

  // PDF (.pdf)
  if (basename.endsWith('.pdf')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#ef4444" />
        <text x="2" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="system-ui, sans-serif">
          PDF
        </text>
      </svg>
    );
  }

  // Images (.svg, .png, .jpg, .jpeg, .gif, .ico, .webp)
  if (
    basename.endsWith('.svg') ||
    basename.endsWith('.png') ||
    basename.endsWith('.jpg') ||
    basename.endsWith('.jpeg') ||
    basename.endsWith('.gif') ||
    basename.endsWith('.ico') ||
    basename.endsWith('.webp')
  ) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
        <rect width="24" height="24" rx="4" fill="#8b5cf6" />
        <circle cx="8.5" cy="8.5" r="2" fill="#ffffff" />
        <path d="M21 16l-5.5-5.5L7 19h14v-3z" fill="#ffffff" opacity="0.9" />
      </svg>
    );
  }

  // Default File
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
        fill="#64748b"
      />
      <path d="M14 2v6h6" fill="#94a3b8" />
    </svg>
  );
};

export default FileIcon;
