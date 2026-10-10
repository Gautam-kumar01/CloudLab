# CloudLab Security Model

CloudLab executes arbitrary user code within a browser-based environment. It uses defense-in-depth controls to reduce the risk of abuse, host compromise, and data leakage; standard containers are not a hypervisor boundary.

## 1. Container Isolation
Workspace processes, including terminal commands and user code, run inside standard Docker Linux containers. Containers share the host kernel; they are not hardware microVMs.
- **Base Image:** The workspace launcher uses the configured `cloudlab-base-image`.
- **Privilege Reduction:** The launcher applies `--cap-drop ALL` and `--security-opt no-new-privileges:true`. This is defense in depth, not a guarantee that arbitrary code cannot attack the host.
- **Resource Limits:** The current workspace launcher sets `--cpus=1.0`, `--memory=1g`, and `--pids-limit=100`.

## 2. Networking
The current workspace and deployment launchers attach containers to the Docker bridge network `cloudlab-net`; they do not use Docker's host network mode. Preview routing is handled separately by CloudLab's proxy configuration.
> **Caveat:** A Docker bridge network does not by itself prove that every host service is unreachable. Host firewall rules, daemon configuration, and routing must also be reviewed for the actual deployment environment.

## 3. Authentication & Authorization
- **NextAuth.js:** Secures all sessions. Session tokens are stored in HttpOnly, secure cookies.
- **Fail-Closed Socket.IO Gateway:** Socket.IO connections require a validated user session. Unauthenticated connections are rejected immediately; dev fallback identities are strictly opt-in via environment variables and disabled in production.
- **Database Role Enforcement:** All workspace mutations and terminal events (`terminal.spawn`, `terminal.toTerm`) verify that the user has `OWNER` or `EDITOR` permissions on the project. `VIEWER` roles are strictly restricted from command execution and file edits.
- **No Disk Bypass:** Disk-based authorization fallbacks are completely removed in production. Access to a workspace is strictly governed by authenticated database records.

## 4. Environment & Secret Hygiene
- **Sanitized Terminal Environments:** Spawning interactive terminals scrubs all sensitive host environment variables (including `DATABASE_URL`, `NEXTAUTH_SECRET`, cloud provider credentials, and token patterns).
- **Ephemeral Git Authentication:** Personal Access Tokens (PATs) and GitHub OAuth tokens are never written into `.git/config` on disk. Git operations authenticate via ephemeral CLI headers (`http.extraHeader=AUTHORIZATION: basic ...`), and remote URLs are continuously scrubbed of embedded credentials.
- **Restricted Git Internal Paths:** Raw workspace file APIs explicitly reject reads or writes to `.git` internal configuration files.
- **Symlink Jail (`assertSafeRealPath`):** File and download routes enforce realpath verification against the workspace root to prevent symlink traversal outside authorized directories.

## 5. Deployment Sandboxing
- The current deployment launch paths configure `--cpus=1.0`, `--memory=1g`, `--pids-limit=100`, `--security-opt no-new-privileges:true`, `--cap-drop ALL`, and a restricted tmpfs. Verify the deployed runtime and host policy as well; these flags do not make a Docker container equivalent to a microVM.

## 6. Audit Logging
Administrative actions (e.g., forcefully killing a workspace container) are logged into the `AuditLog` table for accountability.
