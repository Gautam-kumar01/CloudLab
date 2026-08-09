# CloudLab

CloudLab is a browser-based cloud development environment combining an online IDE, isolated containers, terminal, GitHub, AI coding assistance, collaboration, and deployment.

## Architecture

CloudLab is built using a monorepo approach with a Next.js (App Router) full-stack architecture.

### Tech Stack
- **Frontend:** Next.js, React, TypeScript, Vanilla CSS (Design Tokens)
- **Editor:** Monaco Editor
- **Terminal:** xterm.js + WebSockets
- **Backend:** Next.js Route Handlers (API)
- **Database:** PostgreSQL + Prisma (Future)
- **Realtime:** WebSockets (Future)
- **Runtime Environment:** Isolated Docker Containers (Future)

### Service Boundaries
To maintain a modular architecture as we scale, the services are logically bounded:
1. **Web App (Next.js Frontend):** UI presentation, routing, state management (IDE shell, Dashboard, Auth screens).
2. **API (Next.js Backend):** User authentication, workspace metadata, billing, settings.
3. **Realtime Gateway (Future):** WebSocket servers handling live collaboration (Yjs/CRDT) and terminal PTY streams.
4. **Workspace Manager (Future):** Docker orchestration, starting/stopping isolated containers, monitoring CPU/RAM usage.
5. **Worker (Future):** Background jobs processing via Redis (Git clones, container cleanup, long-running AI tasks).

### API Versioning Strategy
All backend API routes follow a strict versioning pattern located at `/api/v1/...` to ensure backward compatibility as the platform evolves.

Example endpoints:
- \`/api/v1/auth/*\`
- \`/api/v1/workspaces/*\`
- \`/api/v1/users/*\`

## Environment Setup
Copy the \`.env.example\` file to \`.env.development\` to set up your local configuration.

```bash
cp .env.example .env.development
npm run dev
```
