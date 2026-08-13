const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const os = require('os');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to terminal socket');
    const pty = require('node-pty');
    const isWin = os.platform() === 'win32';
    
    const terminals = {};

    socket.on('terminal.spawn', ({ id, shellType, workspaceId }) => {
      let shell = '';
      let args = [];
      const workspacePath = workspaceId ? require('path').join(process.cwd(), 'workspaces', workspaceId) : process.cwd();
      require('fs').mkdirSync(workspacePath, { recursive: true });

      if (shellType === 'docker') {
        const dockerCmd = `docker run -it --rm -v "${workspacePath}:/workspace" --cpus="1.0" --memory="1g" --pids-limit=100 --security-opt="no-new-privileges:true" --label cloudlab.workspace=true cloudlab-base-image /bin/bash`;
        shell = isWin ? 'powershell.exe' : 'bash';
        args = isWin ? ['-Command', dockerCmd] : ['-c', dockerCmd];
      } else if (shellType === 'powershell') {
        shell = 'powershell.exe';
        args = ['-NoExit', '-Command', `function prompt { return 'cloudlab@${workspaceId || "local"}:~/workspace$ ' }`];
      } else if (shellType === 'cmd') {
        shell = 'cmd.exe';
      } else if (shellType === 'node') {
        shell = 'node';
      } else {
        shell = isWin ? 'powershell.exe' : 'bash';
      }

      try {
        const ptyProcess = pty.spawn(shell, args, {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: workspacePath,
          env: process.env
        });

        terminals[id] = ptyProcess;

        ptyProcess.onData((data) => {
          socket.emit('terminal.incData', { id, data });
        });

        ptyProcess.onExit(() => {
          socket.emit('terminal.incData', { id, data: '\r\n\x1b[31m[Process exited]\x1b[0m\r\n' });
          delete terminals[id];
        });
        
        socket.emit('terminal.incData', { id, data: `\x1b[34m[CloudLab] Started ${shellType}...\x1b[0m\r\n\r\n` });
      } catch (e) {
        socket.emit('terminal.incData', { id, data: `\r\n\x1b[31m[Error spawning terminal: ${e.message}]\x1b[0m\r\n` });
      }
    });

    socket.on('terminal.toTerm', ({ id, data }) => {
      if (terminals[id]) {
        terminals[id].write(data);
      }
    });
    
    socket.on('terminal.kill', ({ id }) => {
      if (terminals[id]) {
        try { terminals[id].kill(); } catch (e) {}
        delete terminals[id];
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from terminal socket');
      for (const id in terminals) {
        try { terminals[id].kill(); } catch (e) {}
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
