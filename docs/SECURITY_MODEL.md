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
- **Database Role Enforcement:** The `/admin` routes and APIs are strictly protected by server-side Prisma queries verifying that `user.role === 'ADMIN'`. Middleware alone is not relied upon for sensitive data extraction.
- **Workspace Access:** WebSocket and API routes (`/api/workspace/*`) verify that the requesting user is either the owner or an authorized collaborator of the project before permitting file reads/writes or terminal spawns.

## 4. API & Rate Limiting
All Next.js API routes validate request payloads using standard Next.js conventions. The platform is designed to incorporate rate-limiting on authentication and AI execution endpoints to prevent abuse.

## 5. Audit Logging
Administrative actions (e.g., forcefully killing a workspace container) are logged into the `AuditLog` table for accountability.
