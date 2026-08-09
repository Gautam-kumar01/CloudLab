# CloudLab - Product Definition (Phase 0)

## 1. Target Users
CloudLab is designed for:
- **Students & Learners:** Needing a zero-setup environment to start coding immediately.
- **Developers:** Looking for a quick, isolated workspace for prototyping and side projects.
- **Teams:** Requiring standardized, reproducible development environments.
- **Interviewers/Educators:** Hosting live coding sessions with real-time collaboration.

## 2. MVP vs. Advanced Features
**MVP Features (Current Focus):**
- Browser-based IDE (Monaco Editor).
- Isolated container workspaces (Docker).
- Terminal access (xterm.js).
- GitHub integration (import/push/pull).
- Basic AI coding assistance (chat).
- Real-time collaboration.

**Future / Advanced Features:**
- Custom custom container definitions (Custom Dockerfiles).
- Advanced deployment pipelines (CI/CD integration).
- Team organization and role-based access control (RBAC).
- Background workers for heavy AI tasks.

## 3. Free vs. Paid Limits (Proposed)
| Resource | Free Tier | Pro Tier ($15/mo) |
| :--- | :--- | :--- |
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 10 GB | 50 GB |
| **Container Hours**| 50 hours/month | Unlimited |
| **AI Usage** | Limited (Basic Model) | Unlimited (Advanced Models) |

## 4. Core User Journeys
1. **Onboarding:** User lands on homepage -> Clicks "Get Started" -> Authenticates via GitHub (OAuth).
2. **Workspace Creation:** User enters Dashboard -> Clicks "New Workspace" -> Selects a template (e.g., Next.js, Python) or imports a GitHub repository -> Workspace container provisions in < 5 seconds.
3. **Development:** User writes code in the IDE -> Runs commands in the integrated terminal -> Uses AI Assistant for debugging.
4. **Persistence:** User saves files -> Commits and pushes changes directly to GitHub via the terminal or UI.
5. **Preview & Deploy:** User runs the local dev server -> CloudLab exposes a secure preview URL -> User is satisfied and clicks "Deploy" to push to Vercel/production.

## 5. Non-Functional Requirements
- **Security:** Strict container isolation; no host Docker socket access from untrusted user workloads; restricted outbound network access.
- **Isolation:** Each workspace must run in its own namespace with strict CPU/RAM limits to prevent noisy-neighbor issues.
- **Performance:** Workspace startup time < 5 seconds; typing latency < 50ms.
- **Availability:** 99.9% uptime for the core dashboard and API.
- **Observability:** Centralized structured logging, resource usage tracking, and automated alerts for container failures.
