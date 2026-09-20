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

  let nodePty = null;
  try {
    nodePty = require('node-pty');
    console.log('[Terminal] Native node-pty loaded successfully');
  } catch (err) {
    console.warn('[Terminal] Native node-pty not available, fallback to child_process enabled:', err.message);
  }

  const activeSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`Client ${socket.user?.id || socket.id} connected to terminal socket`);

    const userId = socket.user?.id || socket.id;
    if (userId) {
      activeSessions.set(userId, { socketId: socket.id, connectedAt: Date.now() });
      io.emit('presence', Array.from(activeSessions.keys()));
    }

    const isWin = os.platform() === 'win32';
    const terminals = {};

    socket.on('terminal.spawn', async ({ id, shellType = 'default', workspaceId, cols = 80, rows = 30 }) => {
      let resolvedWorkspaceId = workspaceId || 'default';

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
        shell = 'powershell.exe';
        args = [
          '-NoExit',
          '-ExecutionPolicy', 'Bypass',
          '-Command',
          `Set-Location '${workspacePath}'; function prompt { return "PS ${workspacePath}> " }`,
        ];
      } else {
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
          HOME: workspacePath,
          PWD: workspacePath,
          USER: 'nextjs',
          LOGNAME: 'nextjs',
          GIT_AUTHOR_NAME: socket.user?.name || 'CloudLab Developer',
          GIT_AUTHOR_EMAIL: socket.user?.email || 'developer@cloudlab.dev',
          GIT_COMMITTER_NAME: socket.user?.name || 'CloudLab Developer',
          GIT_COMMITTER_EMAIL: socket.user?.email || 'developer@cloudlab.dev',
          PS1: '\u001b[1;32mcloudlab@workspace\u001b[0m:\u001b[1;34m\\w\u001b[0m$ ',
        };
        
        const initialCols = Math.max(parseInt(cols, 10) || 80, 20);
        const initialRows = Math.max(parseInt(rows, 10) || 30, 5);

        let ptyProcess = null;

        if (nodePty) {
          try {
            ptyProcess = nodePty.spawn(shell, args, {
              name: 'xterm-256color',
              cols: initialCols,
              rows: initialRows,
              cwd: workspacePath,
              env: ptyEnv,
            });

            ptyProcess.onData((data) => {
              socket.emit('terminal.incData', { id, data });
            });

            ptyProcess.onExit(() => {
              socket.emit('terminal.incData', { id, data: '\r\n\x1b[31m[Process exited]\x1b[0m\r\n' });
              delete terminals[id];
            });
          } catch (ptyErr) {
            console.warn('[Terminal] node-pty spawn failed, falling back to child_process:', ptyErr.message);
            ptyProcess = null;
          }
        }

        // Child process fallback if node-pty is unavailable or failed
        if (!ptyProcess) {
          const child = spawn(shell, args, {
            cwd: workspacePath,
            env: ptyEnv,
            shell: isWin ? true : false,
          });

          child.stdout?.on('data', (d) => {
            socket.emit('terminal.incData', { id, data: d.toString() });
          });

          child.stderr?.on('data', (d) => {
            socket.emit('terminal.incData', { id, data: d.toString() });
          });

          child.on('close', () => {
            socket.emit('terminal.incData', { id, data: '\r\n\x1b[31m[Process exited]\x1b[0m\r\n' });
            delete terminals[id];
          });

          child.on('error', (err) => {
            socket.emit('terminal.incData', { id, data: `\r\n\x1b[31m[Process error: ${err.message}]\x1b[0m\r\n` });
            delete terminals[id];
          });

          ptyProcess = {
            write: (d) => {
              if (child.stdin && !child.stdin.destroyed) {
                child.stdin.write(d);
              }
            },
            resize: () => {},
            kill: () => {
              try {
                child.kill();
              } catch (e) {}
            },
          };
        }

        terminals[id] = ptyProcess;

        const displayShell = isWin ? 'PowerShell' : (shell.includes('bash') ? 'bash' : 'sh');
        socket.emit('terminal.incData', {
          id,
          data: `\r\n\x1b[1;36m====================================================\x1b[0m\r\n\x1b[1;32m  ☁ CloudLab Terminal\x1b[0m  \x1b[90m|  ${displayShell}\x1b[0m\r\n\x1b[90m  📁 Workspace Directory:\x1b[0m \x1b[1;33m${workspacePath}\x1b[0m\r\n\x1b[1;36m====================================================\x1b[0m\r\n\r\n`,
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
          if (typeof terminals[id].resize === 'function') {
            terminals[id].resize(Math.max(cols, 10), Math.max(rows, 5));
          }
        } catch (err) {
          console.warn('[Terminal Resize Error]', err.message);
        }
      }
    });

    socket.on('terminal.toTerm', ({ id, data }) => {
      if (terminals[id] && typeof terminals[id].write === 'function') {
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
