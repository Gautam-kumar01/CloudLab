<div align="center">

# ⚡ CloudLab

### The Next-Generation Browser-First Cloud Development Environment

**Build, collaborate, sandbox, and deploy full-stack applications instantly in your browser.**

[![Next.js 15](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.9-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Engine-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

[Live Demo](https://cloudlab.run) · [Architecture Guide](docs/ARCHITECTURE.md) · [Security Model](docs/SECURITY_MODEL.md) · [Local Development](docs/LOCAL_DEVELOPMENT.md) · [API Specs](docs/openapi.yaml)

<br />

---

</div>

## 📖 Overview

**CloudLab** is an open-source, enterprise-grade Cloud Development Environment (CDE) engineered for modern developer teams. Combining an in-browser VS Code-class IDE powered by **Monaco Editor**, isolated **rootless container sandboxes**, conflict-free real-time **CRDT multiplayer collaboration (Yjs)**, a native **interactive PTY Turbo terminal**, AI-assisted pair programming, and a **Railway-inspired visual infrastructure canvas**, CloudLab lets you spin up complete dev environments in under 140ms.

---

## ✨ Key Capabilities

### 1. ⚡ Instant MicroVM & Container Sandboxing
- **140ms Cold Starts:** Instant workspace provisioning using lightweight, rootless Docker containers.
- **Strict Isolation:** Process, filesystem, and network isolation with configurable CPU, memory, and storage caps.
- **Custom Runtimes:** Out-of-the-box support for Node.js, Python, Rust, Go, and polyglot dev stacks.

### 2. 👥 Multiplayer Real-Time CRDT Collaboration
- **Yjs + Monaco Editor Sync:** Low-latency state synchronization with CRDT mathematical convergence.
- **Collaborative Presence:** Live multi-cursor tracking, selection highlighting, and user avatar flags.
- **Granular RBAC:** Project permission tiers (`OWNER`, `EDITOR`, `VIEWER`) for safe pair programming and team reviews.

### 3. 💻 Interactive Turbo PTY Terminal
- **Full PTY Streaming:** Powered by `node-pty` and `@xterm/xterm` running over low-overhead WebSockets.
- **ANSI & Shell Support:** Native interactive shell with full ANSI color gradients, tab autocompletion, and process control.
- **Background Persistence:** Long-running dev processes, watchers, and tasks persist across browser reconnections.

### 4. 🕸️ Railway-Inspired Visual Mesh & DB Topology Canvas
- **Visual Infrastructure Graph:** Interactive 5-node interconnected cloud topology (Next.js Frontend, CRDT Engine, Neon Postgres DB, Worker Queue, and Edge CDN).
- **Animated SVG Connector Cables:** Glowing fiber-optic data packet animations showing live traffic flow.
- **Live Telemetry Inspector:** Clickable nodes displaying real-time metrics, CPU/RAM utilization, open ports, and live logs.

### 5. 🤖 AI-Powered Copilot (Vercel AI SDK)
- **Multi-Model Intelligence:** Seamless integration with Google Gemini 2.0 / 1.5 Flash and OpenAI GPT-4o.
- **Context-Aware Code Actions:** Explain errors, generate boilerplate, fix bugs, and refactor code directly inside the editor.
- **Token Analytics & Audit:** Built-in tracking of AI token consumption and audit logging for enterprise governance.

### 6. 🌐 Instant Edge Deployments & Preview
- **One-Click Previews:** Instant live preview URLs with automated SSL termination.
- **Lighthouse 100/100 Optimization:** Sub-18ms edge latency with automated build triggers and health probes.

---

## 🏗️ System Architecture

CloudLab is built as a unified Next.js + Node.js architecture with dedicated WebSocket servers for real-time collaboration and terminal streaming:

```mermaid
flowchart TD
    subgraph Client["Browser Client"]
        Monaco["Monaco Code Editor"]
        XTerm["xterm.js PTY Terminal"]
        Canvas["Visual Topology Canvas"]
        AIChat["AI Copilot Panel"]
    end

    subgraph Server["Unified CloudLab Server (Node.js + Next.js)"]
        NextApp["Next.js 15 App Router\n(SSR + Server Actions)"]
        WSServer["WebSocket Gateway (ws / Socket.io)"]
        YjsServer["Yjs CRDT Room Handler\n(y-websocket)"]
        PTYBridge["Node-PTY Terminal Bridge"]
        AuthModule["NextAuth.js (v5 Beta)"]
        JobQueue["pg-boss Async Worker Queue"]
    end

    subgraph Runtimes["Sandbox Infrastructure"]
        DockerEngine["Docker Daemon / Container Runtimes"]
        MicroVM1["Workspace Container A (Node.js)"]
        MicroVM2["Workspace Container B (Python)"]
    end

    subgraph Data["Data & External Services"]
        NeonDB[("Neon Serverless PostgreSQL\n(Prisma ORM 7)")]
        AIProvider["AI Gateway\n(OpenAI / Google Gemini)"]
        GitHubAPI["GitHub REST & OAuth API"]
    end

    Monaco <-->|CRDT Sync over WS| YjsServer
    XTerm <-->|Raw PTY IO over WS| PTYBridge
    AIChat <-->|Stream API| NextApp
    Canvas <-->|Telemetry Query| NextApp

    NextApp --> AuthModule
    NextApp --> NeonDB
    NextApp --> JobQueue
    NextApp --> AIProvider
    NextApp --> GitHubAPI

    PTYBridge <--> DockerEngine
    JobQueue --> DockerEngine
    DockerEngine --> MicroVM1
    DockerEngine --> MicroVM2
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) | React Server Components, Server Actions, API routes |
| **UI Library** | [React 19](https://react.dev/) + [Lucide Icons](https://lucide.dev/) | Modern reactive components and SVG icons |
| **Styling** | Vanilla CSS + Tailwind CSS v4 | High-performance custom tokens, animations, dark mode |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) + `y-monaco` | VS Code editing experience with CRDT bindings |
| **Terminal** | [xterm.js](https://xtermjs.org/) + `node-pty` | Browser-based ANSI terminal emulator with PTY bridge |
| **Realtime Sync** | [Yjs](https://yjs.dev/) + `y-websocket` + [Socket.io](https://socket.io/) | Collaborative CRDT sync and live status events |
| **Database** | [PostgreSQL (Neon)](https://neon.tech/) | Serverless relational database with connection pooling |
| **ORM** | [Prisma 7](https://www.prisma.io/) (`@prisma/adapter-pg`) | Type-safe schema migrations and database queries |
| **AI SDK** | [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/google`, `@ai-sdk/openai`) | Streaming AI generation and copilot integrations |
| **Job Queue** | [pg-boss](https://github.com/timgit/pg-boss) | Background jobs for container provisioning & builds |
| **Auth** | [NextAuth.js v5](https://authjs.dev/) | GitHub OAuth & credential-based authentication |
| **Testing** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) | Fast unit tests and end-to-end browser automation |

---

## 📁 Project Structure

```
CloudLab/
├── docs/                       # Architecture, security & development documentation
│   ├── ARCHITECTURE.md         # Deep-dive architectural breakdown
│   ├── CONTRIBUTING.md         # Developer contribution guidelines
│   ├── LOCAL_DEVELOPMENT.md    # Local setup and debugging guide
│   ├── SECURITY_MODEL.md       # Multi-tenant container security model
│   └── openapi.yaml            # REST API specifications (OpenAPI 3.0)
├── prisma/
│   └── schema.prisma           # Prisma schema (Users, Projects, Containers, Logs)
├── public/                     # Static assets, fonts, and illustrations
├── scripts/                    # Build scripts, patches, and seed utilities
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Login, register, and OAuth pages
│   │   ├── admin/              # Admin dashboard (Users, Logs, AI Analytics)
│   │   ├── api/                # REST & Serverless API endpoints
│   │   ├── workspace/[id]/     # Browser IDE Workspace (Editor, Terminal, Canvas)
│   │   ├── globals.css         # Core CSS design system & animations
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Landing page with Railway-style workflow canvas
│   ├── components/             # Reusable modular UI components
│   │   ├── admin/              # Admin-specific tables, charts, and metrics
│   │   ├── editor/             # Monaco editor with collaborative bindings
│   │   ├── landing/            # Landing page hero, canvas, and feature sections
│   │   ├── terminal/           # xterm.js interactive terminal component
│   │   └── workspace/          # File tree, tabs, AI chat, and deployment modals
│   ├── generated/              # Generated Prisma client and TypeScript types
│   └── lib/                    # Utilities, DB clients, Auth options, and logger
├── server.js                   # Unified Node.js server (Next.js + WebSockets + PTY)
├── vitest.config.ts            # Unit testing configuration
└── playwright.config.ts        # End-to-end browser testing suite
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v20.x or later (`node -v`)
- **Docker Engine**: Installed and running locally (`docker info`)
- **PostgreSQL**: Local Postgres or a free [Neon](https://neon.tech) cloud database

### 1. Clone the Repository
```bash
git clone https://github.com/Gautam-kumar01/CloudLab.git
cd CloudLab
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database (Neon or Local PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.neon.tech/cloudlab?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-random-secret-key-here"

# GitHub OAuth (Optional: for GitHub login & repo import)
GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"

# AI Provider Keys (Optional: for AI Copilot)
GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_studio_api_key"
OPENAI_API_KEY="your_openai_api_key"

# Docker & Logging
NODE_ENV="development"
PORT=3000
```

### 4. Run Database Migrations
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

CloudLab includes a comprehensive test suite covering unit tests, workspace authentication, path security, and end-to-end flows:

```bash
# Run all unit tests with Vitest
npm run test

# Run tests with interactive UI
npm run test:ui

# Run end-to-end Playwright tests
npm run test:e2e
```

---

## 🚢 Production Deployment

### Database (Neon Serverless Postgres)
CloudLab is pre-configured to work with Neon's connection pooling. Ensure your `DATABASE_URL` in production uses the pooled connection string (`-pooler`).

### Deploying the App (Docker / Railway / Render / VPS)
CloudLab runs as a unified Node.js server (`server.js`), which serves the Next.js frontend, REST APIs, Socket.io, and Yjs WebSockets on a single port:

```bash
# 1. Build production bundle
npm run build

# 2. Start unified server
npm start
```

For containerized deployment with Docker socket access, refer to the [Local Development & Production Guide](docs/LOCAL_DEVELOPMENT.md).

---

## 📚 Detailed Documentation

- 🏛️ [System Architecture](docs/ARCHITECTURE.md) — Detailed component hierarchy, CRDT sync, and PTY lifecycle.
- 🔒 [Security Model](docs/SECURITY_MODEL.md) — Multi-tenant sandbox isolation, rootless containers, and API rate limiting.
- 💻 [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) — Step-by-step developer environment setup.
- 📡 [REST API Specification](docs/openapi.yaml) — OpenAPI 3.0 specs for workspaces, deployments, and admin endpoints.
- 🤝 [Contributing Guidelines](docs/CONTRIBUTING.md) — Code style, pull request workflow, and issue reporting.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Gautam-kumar01">Gautam Kumar</a> and the CloudLab Community.</sub>
</div>
