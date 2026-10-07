require('dotenv').config();
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
      const host = req.headers.host || '';
      // Dynamic Subdomain Proxy Check: e.g. <workspaceId>.preview.<domain>
      const subMatch = host.match(/^([a-zA-Z0-9_-]+)\.(preview|run)\./i);
      if (subMatch) {
        const workspaceId = subMatch[1];
        const { DockerManager } = require('./src/lib/docker-manager');
        DockerManager.touchActivity(workspaceId);

        const targetPort = 3000;
        const targetHost = process.env.CONTAINER_HOST || '127.0.0.1';

        const proxyReq = require('http').request(
          {
            host: targetHost,
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: {
              ...req.headers,
              host: `${targetHost}:${targetPort}`,
              'x-forwarded-host': host,
              'x-forwarded-proto': 'http',
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        );

        proxyReq.on('error', (err) => {
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                error: 'Workspace dev server not reachable',
                details: err.message,
              })
            );
          }
        });

        req.pipe(proxyReq, { end: true });
        return;
      }

      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error({ err, url: req.url }, 'Error occurred handling request');
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Automatic periodic idle container termination reaper (every 5 minutes)
  const { DockerManager: IdleReaperManager } = require('./src/lib/docker-manager');
  setInterval(() => {
    IdleReaperManager.terminateIdleContainers(
      parseInt(process.env.CONTAINER_IDLE_TIMEOUT_MINUTES || '30', 10)
    ).catch(() => {});
  }, 5 * 60 * 1000).unref();

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

      if (session && session.user && session.user.id) {
        socket.user = session.user;
        return next();
      }

      // Explicit development fallback only if deliberately opted-in via env
      if (dev && process.env.ALLOW_DEV_ANONYMOUS === 'true') {
        socket.user = { id: 'dev-user', name: 'Developer', role: 'DEVELOPER' };
        return next();
      }

      logger.warn({ ip: socket.handshake.address }, 'Rejected unauthenticated Socket.IO connection');
      return next(new Error('Unauthorized: Authentication required'));
    } catch (err) {
      if (dev && process.env.ALLOW_DEV_ANONYMOUS === 'true') {
        socket.user = { id: 'dev-user', name: 'Developer', role: 'DEVELOPER' };
        return next();
      }
      logger.error({ err }, 'Error during Socket.IO authentication handshake');
      return next(new Error('Unauthorized: Authentication handshake error'));
    }
  });

  function getSanitizedTerminalEnv(workspacePath) {
    const SENSITIVE_KEY_PATTERN = /(secret|token|password|key|auth|db|database|credential|private|prisma)/i;
    const safeEnv = {
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      LANG: 'en_US.UTF-8',
      HOME: workspacePath,
      USERPROFILE: workspacePath,
      PWD: workspacePath,
      USER: 'cloudlab',
      LOGNAME: 'cloudlab',
      NODE_ENV: 'development',
      PROMPT_COMMAND: 'PS1="\\[\\033[1;32m\\]cloudlab@workspace\\[\\033[0m\\]:\\[\\033[1;34m\\]\\w\\[\\033[0m\\]\\$ "',
    };

    const ALLOWED_VARS = [
      'PATH', 'Path', 'PATHEXT', 'SystemRoot', 'COMSPEC', 'TEMP', 'TMP',
      'APPDATA', 'LOCALAPPDATA', 'WINDIR', 'SYSTEMDRIVE', 'ProgramFiles', 'ProgramFiles(x86)',
      'CommonProgramFiles', 'CommonProgramFiles(x86)', 'SHELL', 'TERM_PROGRAM',
    ];

    for (const key of ALLOWED_VARS) {
      if (process.env[key] !== undefined) {
        safeEnv[key] = process.env[key];
      }
    }

    for (const key of Object.keys(process.env)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        delete safeEnv[key];
      }
    }

    return safeEnv;
  }

  async function checkWorkspacePermission(socket, workspaceId) {
    if (!workspaceId || !/^[a-zA-Z0-9_-]+$/.test(workspaceId)) {
      return { allowed: false, reason: 'Invalid workspace identifier' };
    }

    if (dev && process.env.ALLOW_DEV_ANONYMOUS === 'true' && socket.user?.id === 'dev-user') {
      return { allowed: true, role: 'OWNER', projectId: workspaceId };
    }

    try {
      const cookieHeader = socket.request?.headers?.cookie || '';
      const hostHeader =
        socket.request?.headers?.['x-forwarded-host'] ||
        socket.request?.headers?.host ||
        `localhost:${port}`;

      let accessRes;
      try {
        accessRes = await fetch(
          `http://127.0.0.1:${port}/api/workspace/access?workspaceId=${encodeURIComponent(workspaceId)}`,
          {
            headers: {
              cookie: cookieHeader,
              host: hostHeader,
            },
          }
        );
      } catch (e1) {
        accessRes = await fetch(
          `http://localhost:${port}/api/workspace/access?workspaceId=${encodeURIComponent(workspaceId)}`,
          {
            headers: {
              cookie: cookieHeader,
              host: hostHeader,
            },
          }
        );
      }

      if (!accessRes.ok) {
        return { allowed: false, reason: 'Workspace not accessible or forbidden' };
      }

      const json = await accessRes.json();
      if (!json?.data?.success) {
        return { allowed: false, reason: 'Access denied' };
      }

      const role = json.data.role;
      if (role !== 'OWNER' && role !== 'EDITOR') {
        return { allowed: false, reason: 'Insufficient permissions (Viewer role cannot execute in terminal)' };
      }

      return { allowed: true, role, projectId: json.data.projectId || workspaceId };
    } catch (err) {
      logger.error({ err, workspaceId }, 'Error validating workspace access for terminal');
      return { allowed: false, reason: 'Permission validation failed' };
    }
  }

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
      // If this terminal is already active and healthy, don't kill or re-spawn it
      if (terminals[id] && !terminals[id].hasExited) {
        return;
      }

      if (!workspaceId || !/^[a-zA-Z0-9_-]+$/.test(workspaceId)) {
        socket.emit('terminal.incData', {
          id,
          data: '\r\n\x1b[31m[Error: Missing or invalid workspace identifier]\x1b[0m\r\n',
        });
        return;
      }

      const authCheck = await checkWorkspacePermission(socket, workspaceId);
      if (!authCheck.allowed) {
        socket.emit('terminal.incData', {
          id,
          data: `\r\n\x1b[31m[Error: Forbidden - ${authCheck.reason || 'You do not have permission to execute commands in this workspace'}]\x1b[0m\r\n`,
        });
        return;
      }

      const resolvedWorkspaceId = authCheck.projectId || workspaceId;
      const workspacePath = path.resolve(process.cwd(), 'workspaces', resolvedWorkspaceId);
      const workspacesRoot = path.resolve(process.cwd(), 'workspaces');

      if (workspacePath !== workspacesRoot && !workspacePath.startsWith(`${workspacesRoot}${path.sep}`)) {
        socket.emit('terminal.incData', {
          id,
          data: '\r\n\x1b[31m[Error: Invalid workspace directory boundary]\x1b[0m\r\n',
        });
        return;
      }

      try {
        fs.mkdirSync(workspacePath, { recursive: true });
      } catch (e) {}

      // Hosted container enforcement: require Docker in production or when explicitly configured
      const requireContainer = process.env.REQUIRE_CONTAINER_TERMINAL === 'true' ||
        (!dev && process.env.ALLOW_HOST_TERMINAL !== 'true');

      let effectiveShellType = shellType;
      if (requireContainer) {
        effectiveShellType = 'docker';
      }

      let shell = '';
      let args = [];

      // Cross-platform shell resolution
      if (effectiveShellType === 'docker') {
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
      } else if (effectiveShellType === 'node') {
        shell = 'node';
        args = [];
      } else if (effectiveShellType === 'cmd' && isWin) {
        shell = 'cmd.exe';
        args = [];
      } else if (isWin) {
        shell = 'powershell.exe';
        args = [
          '-NoLogo',
          '-NoExit',
          '-ExecutionPolicy', 'Bypass',
          '-Command',
          `Set-Location '${workspacePath.replace(/'/g, "''")}'; function prompt { return "PS $($executionContext.SessionState.Path.CurrentLocation)> " }`,
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
        const ptyEnv = getSanitizedTerminalEnv(workspacePath);
        
        const initialCols = Math.max(parseInt(cols, 10) || 80, 20);
        const initialRows = Math.max(parseInt(rows, 10) || 30, 5);

        let ptyProcess = null;

        // 1. Try native node-pty
        if (nodePty) {
          try {
            ptyProcess = nodePty.spawn(shell, args, {
              name: 'xterm-256color',
              cols: initialCols,
              rows: initialRows,
              cwd: workspacePath,
              env: ptyEnv,
            });

            ptyProcess.hasExited = false;

            ptyProcess.onData((data) => {
              socket.emit('terminal.incData', { id, data });
            });

            ptyProcess.onExit((event) => {
              ptyProcess.hasExited = true;
              if (terminals[id] === ptyProcess) {
                delete terminals[id];
                const code = typeof event === 'object' ? event?.exitCode : event;
                socket.emit('terminal.incData', {
                  id,
                  data: `\r\n\x1b[90m[Process completed with exit code ${code ?? 0}]\x1b[0m\r\n`,
                });
              }
            });
          } catch (ptyErr) {
            console.warn('[Terminal] node-pty spawn failed, falling back to child_process:', ptyErr.message);
            ptyProcess = null;
          }
        }

        // 2. Child process fallback
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

          ptyProcess = {
            hasExited: false,
            write: (d) => {
              if (child.stdin && !child.stdin.destroyed) {
                socket.emit('terminal.incData', { id, data: d });
                child.stdin.write(d);
              }
            },
            resize: () => {},
            kill: () => {
              ptyProcess.hasExited = true;
              try {
                child.kill();
              } catch (e) {}
            },
          };

          child.on('close', (code) => {
            ptyProcess.hasExited = true;
            if (terminals[id] === ptyProcess) {
              delete terminals[id];
              socket.emit('terminal.incData', {
                id,
                data: `\r\n\x1b[90m[Process completed with exit code ${code ?? 0}]\x1b[0m\r\n`,
              });
            }
          });
        }

        ptyProcess.workspaceId = resolvedWorkspaceId;
        ptyProcess.role = authCheck.role;
        terminals[id] = ptyProcess;
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
      const term = terminals[id];
      if (term && typeof term.write === 'function' && !term.hasExited) {
        if (term.role !== 'OWNER' && term.role !== 'EDITOR' && term.role !== 'DEVELOPER') {
          return;
        }
        if (term.workspaceId) {
          const { DockerManager } = require('./src/lib/docker-manager');
          DockerManager.touchActivity(term.workspaceId);
        }
        try {
          term.write(data);
        } catch (err) {
          console.warn('[Terminal Write Error]', err.message);
        }
      }
    });

    socket.on('terminal.kill', ({ id }) => {
      const term = terminals[id];
      if (term) {
        term.hasExited = true;
        try {
          term.kill();
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
          terminals[id].hasExited = true;
          terminals[id].kill();
        } catch (e) {}
        delete terminals[id];
      }
    });
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Custom server ready on http://localhost:${port} and http://127.0.0.1:${port}`);
  });
});
