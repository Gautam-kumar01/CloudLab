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
const hostname = dev ? 'localhost' : (process.env.HOST || '0.0.0.0');
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
        let session = null;
        try {
          const response = await fetch(`http://127.0.0.1:${port}/api/auth/session`, {
            headers: {
              cookie: request.headers.cookie || '',
              host: request.headers.host || `localhost:${port}`,
            },
          });
          session = await response.json();
        } catch (e1) {
          const response = await fetch(`http://localhost:${port}/api/auth/session`, {
            headers: {
              cookie: request.headers.cookie || '',
              host: request.headers.host || `localhost:${port}`,
            },
          });
          session = await response.json();
        }

        if (!session || !session.user) {
          logger.warn('Unauthorized WS connection attempt');
          socket.destroy();
          return;
        }

        let access = null;
        try {
          const accessRes = await fetch(
            `http://127.0.0.1:${port}/api/workspace/access?workspaceId=${encodeURIComponent(workspaceId)}`,
            {
              headers: {
                cookie: request.headers.cookie || '',
                host: request.headers.host || `localhost:${port}`,
              },
            },
          );
          access = await accessRes.json();
        } catch (e2) {
          const accessRes = await fetch(
            `http://localhost:${port}/api/workspace/access?workspaceId=${encodeURIComponent(workspaceId)}`,
            {
              headers: {
                cookie: request.headers.cookie || '',
                host: request.headers.host || `localhost:${port}`,
              },
            },
          );
          access = await accessRes.json();
        }

        if (!access.data || !access.data.success) {
          console.log(`User ${session.user.id} denied access to workspace ${workspaceId}`);
          socket.destroy();
          return;
        }

        const resolvedWorkspaceId = access.data.projectId || workspaceId;
        if (!/^[a-zA-Z0-9_-]+$/.test(resolvedWorkspaceId) || !file || file.includes('..')) {
          socket.destroy();
          return;
        }

        // Room name includes workspace and file
        const docName = `workspace/${workspaceId}/file/${file}`;

        wss.handleUpgrade(request, socket, head, (ws) => {
          setupWSConnection(ws, request, { docName });

          // Persistence Logic
          const doc = docs.get(docName);
          if (doc && !doc.__hasSaveHook) {
            doc.__hasSaveHook = true;

            // Load initial content if it exists
            const workspacePath = path.join(process.cwd(), 'workspaces', resolvedWorkspaceId);
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
      const forwardedProto = socket.request.headers['x-forwarded-proto'] || 'https';
      const hostHeader =
        socket.request.headers['x-forwarded-host'] ||
        socket.request.headers.host ||
        `localhost:${port}`;

      let session = null;
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/auth/session`, {
          headers: {
            cookie: cookieHeader,
            host: hostHeader,
            'x-forwarded-proto': forwardedProto,
            'x-forwarded-host': hostHeader,
          },
        });
        session = await response.json();
      } catch (e1) {
        try {
          const response = await fetch(`http://localhost:${port}/api/auth/session`, {
            headers: {
              cookie: cookieHeader,
              host: hostHeader,
              'x-forwarded-proto': forwardedProto,
              'x-forwarded-host': hostHeader,
            },
          });
          session = await response.json();
        } catch (e2) {}
      }

      if (session && session.user) {
        socket.user = session.user;
      } else {
        socket.user = { id: 'dev-user', name: 'Developer', role: 'OWNER' };
      }
      next();
    } catch (err) {
      socket.user = { id: 'dev-user', name: 'Developer', role: 'OWNER' };
      next();
    }
  });

  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`Client ${socket.user?.id || socket.id} connected to terminal socket`);

    const userId = socket.user?.id || socket.id;
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

    socket.on('terminal.spawn', async ({ id, shellType = 'default', workspaceId, cols = 80, rows = 30 }) => {
      let resolvedWorkspaceId = workspaceId;

      let shell = '';
      let args = [];
      const workspacePath = resolvedWorkspaceId
        ? path.join(process.cwd(), 'workspaces', resolvedWorkspaceId)
        : process.cwd();
      
      try {
        fs.mkdirSync(workspacePath, { recursive: true });
      } catch (e) {}

      // Cross-platform shell resolution
      if (shellType === 'docker') {
        const { DockerManager } = require('./src/lib/docker-manager');
        
        try {
          // Ensure container is running
          const started = await DockerManager.startWorkspace(resolvedWorkspaceId, workspacePath);
          if (!started) {
            throw new Error('Failed to start container');
          }
          
          shell = 'docker';
          args = ['exec', '-it', DockerManager.containerName(resolvedWorkspaceId), '/bin/bash'];
        } catch (error) {
          console.error('Docker Error:', error);
          socket.emit('terminal.incData', {
            id,
            data: '\r\n\x1b[31m[Error: Failed to attach to workspace container]\x1b[0m\r\n',
          });
          return;
        }
      } else if (shellType === 'node') {
        shell = 'node';
        args = [];
      } else if (shellType === 'cmd' && isWin) {
        shell = 'cmd.exe';
        args = [];
      } else if (isWin) {
        // Windows default to PowerShell
        shell = 'powershell.exe';
        args = [
          '-NoExit',
          '-ExecutionPolicy', 'Bypass',
          '-Command',
          `Set-Location '${workspacePath}'; function prompt { return "PS ${workspacePath}> " }`,
        ];
      } else {
        // Linux / macOS default to bash or sh
        if (fs.existsSync('/bin/bash')) {
          shell = '/bin/bash';
          args = ['-i'];
        } else if (fs.existsSync('/bin/sh')) {
          shell = '/bin/sh';
          args = ['-i'];
        } else {
          shell = process.env.SHELL || 'sh';
          args = ['-i'];
        }
      }

      try {
        if (terminals[id]) {
          try {
            terminals[id].kill();
          } catch (e) {}
        }

        const ptyEnv = {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          LANG: 'en_US.UTF-8',
          HOME: process.env.HOME || workspacePath,
          PWD: workspacePath,
          PS1: '\u001b[1;32mcloudlab@workspace\u001b[0m:\u001b[1;34m\\w\u001b[0m$ ',
        };
        
        const initialCols = Math.max(parseInt(cols, 10) || 80, 20);
        const initialRows = Math.max(parseInt(rows, 10) || 30, 5);

        const ptyProcess = pty.spawn(shell, args, {
          name: 'xterm-256color',
          cols: initialCols,
          rows: initialRows,
          cwd: workspacePath,
          env: ptyEnv,
        });

        terminals[id] = ptyProcess;

        ptyProcess.onData((data) => {
          socket.emit('terminal.incData', { id, data });
        });

        ptyProcess.onExit(() => {
          socket.emit('terminal.incData', { id, data: '\r\n\x1b[31m[Process exited]\x1b[0m\r\n' });
          delete terminals[id];
        });

        const displayShell = isWin ? 'PowerShell' : (shell.includes('bash') ? 'bash' : 'sh');
        socket.emit('terminal.incData', {
          id,
          data: `\r\n\x1b[1;32m[CloudLab IDE]\x1b[0m \x1b[90mReady in ${workspacePath} (${displayShell})\x1b[0m\r\n`,
        });
      } catch (e) {
        console.error('[Terminal Spawn Error]', e);
        socket.emit('terminal.incData', {
          id,
          data: `\r\n\x1b[31m[Error spawning terminal: ${e.message}]\x1b[0m\r\n`,
        });
      }
    });

    socket.on('terminal.resize', ({ id, cols, rows }) => {
      if (terminals[id] && cols && rows && cols > 0 && rows > 0) {
        try {
          terminals[id].resize(Math.max(cols, 10), Math.max(rows, 5));
        } catch (err) {
          console.warn('[Terminal Resize Error]', err.message);
        }
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
        try {
          terminals[id].write(data);
        } catch (err) {
          console.warn('[Terminal Write Error]', err.message);
        }
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

  server.listen(port, '0.0.0.0', () => {
    console.log(`> Custom server ready on http://0.0.0.0:${port}`);
  });
});
