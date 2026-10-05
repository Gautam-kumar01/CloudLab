#!/usr/bin/env python3
"""
CloudLab Linux PTY Bridge
Provides a 100% genuine Linux pseudo-terminal for interactive bash/sh sessions
when node-pty native binary is unavailable.
"""
import os
import sys
import pty
import select
import termios
import struct
import fcntl
import signal

def set_winsize(fd, rows, cols):
    try:
        winsize = struct.pack('HHHH', rows, cols, 0, 0)
        fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)
    except Exception:
        pass

def main():
    if len(sys.argv) < 4:
        cols = 80
        rows = 30
        cwd = os.getcwd()
        cmd = ['/bin/bash', '-i']
    else:
        try:
            cols = int(sys.argv[1])
        except ValueError:
            cols = 80
        try:
            rows = int(sys.argv[2])
        except ValueError:
            rows = 30
        cwd = sys.argv[3] if os.path.exists(sys.argv[3]) else os.getcwd()
        cmd = sys.argv[4:] if len(sys.argv) > 4 else ['/bin/bash', '-i']

    master_fd, slave_fd = pty.openpty()
    set_winsize(master_fd, rows, cols)

    pid = os.fork()
    if pid == 0:
        # Child process
        os.close(master_fd)
        os.setsid()
        try:
            fcntl.ioctl(slave_fd, termios.TIOCSCTTY, 0)
        except Exception:
            pass

        try:
            os.chdir(cwd)
        except Exception:
            pass

        os.dup2(slave_fd, 0)
        os.dup2(slave_fd, 1)
        os.dup2(slave_fd, 2)
        if slave_fd > 2:
            os.close(slave_fd)

        try:
            os.execvpe(cmd[0], cmd, os.environ)
        except Exception as e:
            sys.stderr.write(f"Failed to exec {cmd}: {e}\n")
            sys.exit(127)

    # Parent process
    os.close(slave_fd)

    stdin_fd = sys.stdin.fileno()
    stdout_fd = sys.stdout.fileno()

    def cleanup(signum=None, frame=None):
        try:
            os.kill(pid, signal.SIGTERM)
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    try:
        while True:
            rlist, _, _ = select.select([stdin_fd, master_fd], [], [])
            if stdin_fd in rlist:
                try:
                    data = os.read(stdin_fd, 4096)
                    if not data:
                        break
                    os.write(master_fd, data)
                except (OSError, IOError):
                    break

            if master_fd in rlist:
                try:
                    data = os.read(master_fd, 4096)
                    if not data:
                        break
                    os.write(stdout_fd, data)
                except (OSError, IOError):
                    break
    except Exception:
        pass
    finally:
        try:
            os.close(master_fd)
        except Exception:
            pass
        try:
            _, status = os.waitpid(pid, os.WNOHANG)
        except Exception:
            pass

if __name__ == '__main__':
    main()
