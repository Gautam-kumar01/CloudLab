# CloudLab - Project Context

## Overview
CloudLab is a browser-based cloud development environment (IDE). It allows users to write, run, and collaborate on code entirely in the browser using isolated Docker containers as backend workspaces.

## Tech Stack
- **Frontend Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 (configured via PostCSS) + Custom CSS variables/animations
- **IDE Core**: Monaco Editor (`@monaco-editor/react`)
- **Real-time Collaboration**: Yjs (CRDTs), `y-monaco`, `y-websocket`, WebSockets (`socket.io`)
- **Backend / Runtime**: Node.js (Custom WebSocket server in `server.js`)
- **Containerization**: Docker (via `node-pty` for terminal sessions)
- **Database / ORM**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Other Key Packages**: `ai`, `zod`, `lucide-react`, `pino` (logging), `xterm.js` (terminal UI)

## Core Features
1. **Instant Workspaces**: Provisions isolated Docker containers for users, providing full root access and persistence.
2. **Browser IDE**: Syntax highlighting, intelligent autocomplete, and multi-file editing powered by Monaco.
3. **Cloud Terminal**: Full-featured terminal powered by `xterm.js` and `node-pty` to run scripts and manage servers as if local.
4. **Multiplayer Collaboration**: Real-time cursor syncing and shared live previews similar to Google Docs, backed by Yjs.
5. **Integrated Workflows**: Built-in AI assistant and seamless GitHub repository import/export functionality.

## Recent Architectural Updates & Fixes
- **Terminal Stability**: Resolved an issue where orphaned `node-pty` processes were causing memory leaks. Implemented logic in `server.js` to correctly kill and clean up lingering terminal processes upon client disconnect.
- **Frontend Aesthetics**: Completely redesigned the public landing page with a premium SaaS look (Vercel/Linear-tier aesthetic).
  - Adopted a pure React State + CSS Transitions approach (no `framer-motion` to keep bundles light and strict).
  - Addressed CSS parsing errors related to Tailwind CSS v4's strict `@import "tailwindcss";` ordering rules in `globals.css`.
  - Converted interactive sections (like Workspace Showcase and FAQ) to Next.js Client Components (`"use client"`).

## Important Constraints & Guidelines
- **Strict Next.js Environment**: The project uses Turbopack and React 19. It is highly strict regarding unused imports, hooks in server components, and dynamic server usage. Ensure `"use client"` is prepended to any file utilizing `useState`, `useEffect`, or `useRef`.
- **CSS Strategy**: Avoid installing external heavy animation libraries unless strictly necessary. Utilize native CSS keyframes and `IntersectionObserver` hooks for scroll-reveal animations.
- **Validation**: While `zod` is available, prioritize server-side validation on API routes over just frontend implementation for security.
- **Pty Management**: Always ensure child processes tied to WebSockets are garbage collected when connections drop to avoid ghost processes and high CPU/RAM usage.
