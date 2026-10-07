# CloudLab Security Model

CloudLab executes arbitrary user code within a browser-based environment. This necessitates strict security boundaries to prevent abuse, host compromise, and data leakage.

## 1. Container Isolation
All workspace processes, including the terminal and code execution, run inside Docker containers.
- **Base Image Restrictions:** We use a stripped-down `cloudlab-base-image`.
- **Privilege Dropping:** Containers run with `--security-opt="no-new-privileges:true"` to prevent privilege escalation.
- **Resource Quotas:** Containers are constrained by CPU (`--cpus="1.0"`) and Memory limits (`--memory="1g"`) to prevent Denial of Service (DoS) attacks on the host system.

## 2. Networking
CloudLab currently uses Docker's `--network="host"` (Option A) to easily expose application preview ports (like `localhost:3000`) to the host machine. 
> **Warning:** This is acceptable for a local/MVP environment or dedicated single-tenant VMs. For a multi-tenant production environment (Option B), containers should be placed in isolated bridge networks, and a reverse proxy (like Traefik or an Ingress controller) should be used to route external subdomains to internal container IPs.

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
- Deployment containers inherit the same strict isolation constraints as workspace containers: `--cpus=1.0`, `--memory=1g`, `--pids-limit=100`, `--security-opt="no-new-privileges:true"`, `--cap-drop="ALL"`, and restricted tmpfs.

## 6. Audit Logging
Administrative actions (e.g., forcefully killing a workspace container) are logged into the `AuditLog` table for accountability.

