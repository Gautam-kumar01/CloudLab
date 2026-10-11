# CloudLab runtime manifest (`cloudlab.yaml`)

CloudLab supports an optional **`cloudlab.yaml`** at the root of a workspace. It is a declarative preset, not a Dockerfile replacement. The Deployment panel validates it and queues a build through the existing deployment worker.

## Example: React + Vite

```yaml
version: 1
runtime: node20
install: npm-install
start: vite-dev
port: 5173
env: []
```

## Example: Next.js

```yaml
version: 1
runtime: node20
install: npm-install
start: next-dev
port: 3000
env:
  - NEXT_PUBLIC_API_URL
```

## Example: Python static preview

```yaml
version: 1
runtime: python3.12
install: none
start: python-http
port: 8000
env: []
```

## Supported values

| Field | Allowed values |
|---|---|
| `version` | `1` |
| `runtime` | `node20`, `python3.12` |
| `install` for `node20` | `none`, `npm-ci`, `npm-install` |
| `start` for `node20` | `npm-start`, `vite-dev`, `next-dev` |
| `install` for `python3.12` | `none`, `pip-requirements` |
| `start` for `python3.12` | `python-http`, `python-main` |
| `port` | One of `3000`, `3001`, `3002`, `5173`, `5174`, `8000`, `8080`, `4200`, `5000`; the Vite, Next.js and Python HTTP presets further restrict their valid ports. |
| `env` | Optional list of up to 32 environment-variable **names** stored in the workspace's CloudLab environment settings. Values do not belong in this file. |

`python-main` runs only the root `main.py` entry point. `python-http` serves the workspace directory using Python's built-in HTTP server. The Node development presets bind the framework server to `0.0.0.0` and use the configured port. `npm-start` expects the project's `start` script to read `PORT` and bind to an externally reachable interface.

## Deployment and security behavior

- The YAML parser rejects duplicate keys, aliases, unsupported keys, unknown runtimes, invalid ports, and invalid environment names. The file is limited to 16 KB.
- Users cannot specify an image name, arbitrary shell command, Docker flags, volume mount, Docker socket, Linux capability, host network, or resource limit. Images and commands come from CloudLab-owned presets.
- Configured builds are queued; environment-variable **values** are fetched and decrypted by the worker after dequeueing. Only the names in `env` are passed to the container. Missing references fail the deployment.
- New environment values are encrypted with AES-256-GCM before database storage. Set the same stable, high-entropy `CLOUDLAB_ENV_ENCRYPTION_KEY` (at least 32 UTF-8 bytes) in the application and worker environments before managing secrets; generate one with `openssl rand -base64 32`. If it is unset, CloudLab derives the key from `AUTH_SECRET` (or `NEXTAUTH_SECRET`), which must also be stable and at least 32 bytes. Values written before encryption was enabled remain readable as legacy plaintext until replaced; re-save them through the owner-only environment settings UI to encrypt them.
- Configured builds use a staged context that omits `.git`, dependency caches, `cloudlab.yaml`, `.env*`, common registry/auth files, private-key files and symlinks. The staging limit is 500 MB / 20,000 files. This is a safety filter, not a promise to identify every possible secret filename.
- Node and Python build steps run as non-root users in the image. The deployed container keeps CloudLab's fixed limits (1 CPU, 1 GB memory, 100 processes), bridge network, dropped Linux capabilities and `no-new-privileges` setting.
- The deployment job contains IDs, not environment-variable values. CloudLab redacts configured secret values from deployer error strings, but application code can still intentionally print its own environment; do not log secrets from your app.
- A malformed or unsupported manifest fails closed rather than being interpreted as a custom Dockerfile. Without `cloudlab.yaml`, the existing legacy deployment behavior is unchanged.

## How to use it

1. Open the workspace and add or edit `cloudlab.yaml` in the project root. React + Vite, Next.js and Python starter templates include a suitable example.
2. Open **Docker Deployment** and review the manifest validation summary.
3. Select **Deploy using cloudlab.yaml**. The existing worker builds asynchronously; the panel shows the deployment status and a preview link when it succeeds.
4. As the workspace owner, use **Workspace environment secrets** in the Deployment panel to add values, then reference only their names in `env`. The UI can show names only; use the same stable encryption key in the web app and worker.

The IDE's ordinary interactive workspace container remains separate from this queued deployment image. This manifest controls the queued deployment path; it does not select arbitrary images for interactive workspaces.
