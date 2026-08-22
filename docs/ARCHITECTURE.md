# CloudLab Architecture

CloudLab is a browser-based cloud development environment designed to provide a cohesive, isolated, and highly responsive coding experience. It brings together Next.js, Monaco Editor, WebSockets, and Docker to create a robust online IDE.

## High-Level Components

1. **Frontend (Next.js / React)**
   - **IDE Interface:** Built around the Monaco Editor for code editing and xterm.js for the terminal interface.
   - **Collaboration:** Yjs handles Conflict-free Replicated Data Types (CRDTs) to sync editor states across multiple clients in real-time.
   - **Admin Console:** A dedicated dashboard for platform observability, user management, and container metrics.

2. **Backend Services**
   - **API Routes (Next.js):** Standard RESTful endpoints managing authentication (NextAuth), project CRUD operations, GitHub integrations, and AI logs.
   - **Database (Neon PostgreSQL + Prisma):** Stores users, projects, audit logs, and AI usage metrics.
   - **Unified WebSocket Server (`server.js`):** We circumvent Next.js's stateless limitations by running a custom Express/HTTP server that handles both Next.js page requests and upgrade requests for WebSockets.
     - Handles real-time file synchronization via `y-websocket`.
     - Handles terminal PTY streams.

3. **Workspace Runtime (Docker)**
   - **Isolation:** Every project runs inside its own isolated Docker container.
   - **Network Model:** Currently utilizes `--network="host"` (Option A) to easily bind ports like `3000` to the host, allowing seamless previewing.
   - **Lifecycle Management:** Controlled by `DockerManager` (`src/lib/docker-manager.js`), ensuring containers are started, stopped, and cleaned up efficiently. Terminal sessions drop the user directly into these persistent containers via `docker exec`.

## Request Flow: Browser Terminal to Docker

1. **Client Action:** The user types a command in the xterm.js browser window.
2. **WebSocket Transport:** The keystroke is sent via Socket.io to the unified `server.js`.
3. **Session Routing:** The server identifies the `workspaceId` and routes the input to the corresponding `node-pty` instance.
4. **Docker Exec:** If the container isn't running, `DockerManager` spawns it. The `node-pty` instance is tied to a `docker exec -it <container_name> /bin/bash` process.
5. **Output Stream:** Docker outputs the result, which is piped through `node-pty`, back over the WebSocket, and rendered by xterm.js.

## Real-time Collaboration (CRDT)

CloudLab uses **Yjs** for multi-user real-time collaboration.
- When multiple users open the same workspace, they connect to the same Yjs room via the WebSocket server.
- The `y-websocket` provider syncs document states without needing a centralized locking mechanism.
- Awareness data (cursors, active users) is also broadcasted across the room.
