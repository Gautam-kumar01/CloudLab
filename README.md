# CloudLab

<div align="center">
  <img src="https://via.placeholder.com/800x400?text=CloudLab+Dashboard" alt="CloudLab Dashboard">
  
  **A browser-based cloud development environment combining an online IDE, isolated containers, real-time collaboration, and AI coding assistance.**
</div>

---

## 🚀 Features

- **Browser-Based IDE:** Powered by Monaco Editor, providing a VS Code-like experience with syntax highlighting and file management.
- **Isolated Runtimes:** Every project runs securely inside its own isolated Docker container.
- **Real-Time Collaboration:** Code with your team simultaneously using Yjs CRDTs.
- **AI Coding Assistant:** Integrated AI chat and code actions to boost your productivity.
- **Full Terminal Access:** A fully functional `xterm.js` terminal connected directly to your Docker workspace.
- **GitHub Integration:** Import repositories, commit, and push directly from the browser.
- **Admin Console:** Monitor system health, active workspaces, AI usage, and manage users.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Editor & Terminal:** Monaco Editor, xterm.js
- **Backend:** Node.js, Express (Unified WebSocket Server)
- **Realtime:** Socket.io, Yjs, `y-websocket`
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Runtime:** Docker Engine
- **Auth:** NextAuth.js (GitHub OAuth & Email/Password)

## 📚 Documentation

For a deep dive into CloudLab, refer to our comprehensive documentation:

- [Architecture & Design](docs/ARCHITECTURE.md)
- [Security Model](docs/SECURITY_MODEL.md)
- [Local Development Guide](docs/LOCAL_DEVELOPMENT.md)
- [API Documentation (OpenAPI)](docs/openapi.yaml)
- [Contributing](docs/CONTRIBUTING.md)

## 💻 Quick Start

To run CloudLab locally, you will need Node.js, Docker, and PostgreSQL. 

Please follow the full [Local Development Guide](docs/LOCAL_DEVELOPMENT.md) for detailed instructions on setting up environment variables, building the base Docker image, and running the unified server.

```bash
# Clone the repo
git clone https://github.com/Gautam-kumar01/CloudLab.git
cd CloudLab

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start the unified server (Next.js + WebSockets)
npm run dev
```

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
