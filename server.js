const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const os = require('os');
const ws = require('ws');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, ignore: 'pid,hostname', translateTime: 'SYS:standard' },
        }
      : undefined,
});
const httpLogger = pinoHttp({ logger });

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    httpLogger(req, res);
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error({ err, url: req.url }, 'Error occurred handling request');
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: { origin: '*' },
  });

  const wss = new ws.Server({ noServer: true });

  server.on('upgrade', async (request, socket, head) => {
    const parsedUrl = parse(request.url, true);

    if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/collaboration')) {
      const workspaceId = parsedUrl.query.workspaceId;
      const file = parsedUrl.query.file;

      if (!workspaceId || !file) {
        socket.destroy();
        return;
      }

      // Authentication check via internal proxy
      try {
        const response = await fetch(`http://localhost:${port}/api/auth/session`, {
          headers: {
            cookie: request.headers.cookie || '',
            host: request.headers.host || `localhost:${port}`,
          },
        });
        const session = await response.json();
        if (!session || !session.user) {
          logger.warn('Unauthorized WS connection attempt');
          socket.destroy();
          return;
        }

        const accessRes = await fetch(
          `http://localhost:${port}/api/workspace/access?workspaceId=${workspaceId}`,
          {
            headers: {
              cookie: request.headers.cookie || '',
              host: request.headers.host || `localhost:${port}`,
            },
          },
        );
        const access = await accessRes.json();

        if (!access.data || !access.data.success) {
          console.log(`User ${session.user.id} denied access to workspace ${workspaceId}`);
          socket.destroy();
          return;
        }

        const resolvedWorkspaceName = access.data.projectName || workspaceId;

        // Room name includes workspace and file
        const docName = `workspace/${workspaceId}/file/${file}`;

        wss.handleUpgrade(request, socket, head, (ws) => {
          setupWSConnection(ws, request, { docName });

          // Persistence Logic
          const doc = docs.get(docName);
          if (doc && !doc.__hasSaveHook) {
            doc.__hasSaveHook = true;

            // Load initial content if it exists
            const workspacePath = path.join(process.cwd(), 'workspaces', resolvedWorkspaceName);
            const filePath = path.join(workspacePath, file);

            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8');
              const ytext = doc.getText('monaco');
              if (ytext.length === 0) {
                ytext.insert(0, content);
              }
            }

            // Save on change
            let saveTimeout = null;
            doc.on('update', () => {
              if (saveTimeout) clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => {
                const ytext = doc.getText('monaco');
                const content = ytext.toString();

                // Ensure directory exists
                const dirPath = path.dirname(filePath);
                fs.mkdirSync(dirPath, { recursive: true });
                fs.writeFileSync(filePath, content, 'utf-8');
              }, 2000); // 2 second debounce
            });
          }
        });
      } catch (err) {
        console.error('WS auth error:', err);
        socket.destroy();
      }
    } else {
      // Let Next.js or Socket.io handle other upgrades (Socket.io handles its own)
    }
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie || '';
      const response = await fetch(`http://localhost:${port}/api/auth/session`, {
        headers: {
          cookie: cookieHeader,
          host: socket.request.headers.host || `localhost:${port}`,
        },
      });
      const session = await response.json();
      if (!session || !session.user) {
        return next(new Error('Unauthorized'));
      }
      socket.user = session.user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`Client ${socket.user?.id} connected to terminal socket`);

    const userId = socket.user?.id;
    if (userId) {
      activeSessions.set(userId, { socketId: socket.id, connectedAt: Date.now() });
      io.emit('presence', Array.from(activeSessions.keys()));
    }

    const pty = require('node-pty');
    const isWin = os.platform() === 'win32';

    const terminals = {};

    // Rate limiter state per socket
    const RATE_LIMIT_WINDOW = 1000; // 1 second
    const MAX_MESSAGES_PER_WINDOW = 50;
    let messageCount = 0;
    let windowStart = Date.now();

    socket.on('terminal.spawn', async ({ id, shellType, workspaceId }) => {
      let resolvedWorkspaceName = workspaceId;

      // Auth check for workspace
      if (workspaceId) {
        try {
          const cookieHeader = socket.request.headers.cookie || '';
          const accessRes = await fetch(
            `http://localhost:${port}/api/workspace/access?workspaceId=${workspaceId}`,
            {
              headers: {
                cookie: cookieHeader,
                host: socket.request.headers.host || `localhost:${port}`,
              },
            },
          );
          const access = await accessRes.json();
          if (!access.data || !access.data.success) {
            socket.emit('terminal.incData', {
              id,
              data: '\r\n\x1b[31m[Error: Access Denied to Workspace]\x1b[0m\r\n',
            });
            return;
          }
          resolvedWorkspaceName = access.data.projectName || workspaceId; // Resolve to project name
        } catch (err) {
          socket.emit('terminal.incData', {
            id,
            data: '\r\n\x1b[31m[Error: Failed to verify workspace access]\x1b[0m\r\n',
          });
          return;
        }
      }

      let shell = '';
      let args = [];
      const workspacePath = resolvedWorkspaceName
        ? require('path').join(process.cwd(), 'workspaces', resolvedWorkspaceName)
        : process.cwd();
      require('fs').mkdirSync(workspacePath, { recursive: true });

      if (shellType === 'docker') {
        const { DockerManager } = require('./src/lib/docker-manager');
        
        try {
          // Ensure container is running
          const started = await DockerManager.startWorkspace(resolvedWorkspaceName, workspacePath);
          if (!started) {
            throw new Error('Failed to start container');
          }
          
          const dockerCmd = `docker exec -it cloudlab-workspace-${resolvedWorkspaceName} /bin/bash`;
          shell = isWin ? 'powershell.exe' : 'bash';
          args = isWin ? ['-Command', dockerCmd] : ['-c', dockerCmd];
        } catch (error) {
          console.error('Docker Error:', error);
          socket.emit('terminal.incData', {
            id,
            data: '\r\n\x1b[31m[Error: Failed to attach to workspace container]\x1b[0m\r\n',
          });
          return;
        }
      } else if (shellType === 'powershell') {
        shell = 'powershell.exe';
        args = [
          '-NoExit',
          '-Command',
          `function prompt { return 'cloudlab@workspace:~/workspace$ ' }`,
        ];
      } else if (shellType === 'cmd') {
        shell = 'cmd.exe';
      } else if (shellType === 'node') {
        shell = 'node';
      } else {
        shell = isWin ? 'powershell.exe' : 'bash';
      }

      try {
        if (terminals[id]) {
          try {
            terminals[id].kill();
          } catch (e) {}
        }
        
        const ptyProcess = pty.spawn(shell, args, {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: workspacePath,
          env: process.env,
        });

        terminals[id] = ptyProcess;

        ptyProcess.onData((data) => {
          socket.emit('terminal.incData', { id, data });
        });

        ptyProcess.onExit(() => {
          socket.emit('terminal.incData', { id, data: '\r\n\x1b[31m[Process exited]\x1b[0m\r\n' });
          delete terminals[id];
        });

        socket.emit('terminal.incData', {
          id,
          data: `\x1b[34m[CloudLab] Started ${shellType}...\x1b[0m\r\n\r\n`,
        });
      } catch (e) {
        socket.emit('terminal.incData', {
          id,
          data: `\r\n\x1b[31m[Error spawning terminal: ${e.message}]\x1b[0m\r\n`,
        });
      }
    });

    socket.on('terminal.toTerm', ({ id, data }) => {
      const now = Date.now();
      if (now - windowStart > RATE_LIMIT_WINDOW) {
        windowStart = now;
        messageCount = 0;
      }

      messageCount++;
      if (messageCount > MAX_MESSAGES_PER_WINDOW) {
        // Drop messages if flooding
        return;
      }

      if (terminals[id]) {
        terminals[id].write(data);
      }
    });

    socket.on('terminal.kill', ({ id }) => {
      if (terminals[id]) {
        try {
          terminals[id].kill();
        } catch (e) {}
        delete terminals[id];
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from terminal socket');
      if (userId) {
        activeSessions.delete(userId);
        io.emit('presence', Array.from(activeSessions.keys()));
      }
      for (const id in terminals) {
        try {
          terminals[id].kill();
        } catch (e) {}
      }
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Custom server ready on http://${hostname}:${port}`);
  });
});
