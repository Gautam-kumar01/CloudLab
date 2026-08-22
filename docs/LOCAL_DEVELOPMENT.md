# Local Development Guide

This guide will walk you through setting up CloudLab on your local machine for development and testing.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Docker Desktop** (or a local Docker Engine)
- **PostgreSQL** (or a Neon database URL)
- **Git**

## 1. Clone the Repository

```bash
git clone https://github.com/Gautam-kumar01/CloudLab.git
cd CloudLab
```

## 2. Environment Variables

Copy the example environment file and fill in your credentials.

```bash
cp .env.example .env
```

**Key Variables:**
- `DATABASE_URL`: Your PostgreSQL connection string.
- `NEXTAUTH_SECRET`: A random string for session encryption (generate via `openssl rand -base64 32`).
- `NEXTAUTH_URL`: Should be `http://localhost:3000` for local dev.
- **AI Keys** (Optional): `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `GROQ_API_KEY`.

## 3. Database Setup

Initialize the database schema using Prisma:

```bash
npm install
npx prisma generate
npx prisma db push
```

## 4. Docker Base Image

CloudLab requires a base Docker image to spawn workspace containers. We provide a platform Dockerfile.

Build the base image:
```bash
docker build -t cloudlab-base-image -f Dockerfile.platform .
```

## 5. Run the Server

To support both Next.js and WebSockets on the same port, CloudLab uses a custom unified server.

**Do NOT use standard `next dev`.** Instead, use the unified script:

```bash
npm run dev
```

This runs `node server.js`, which wraps Next.js and attaches the WebSocket upgrade handlers.

## 6. Accessing the App

Open [http://localhost:3000](http://localhost:3000) in your browser.
- Sign up for a new account.
- To access the Admin Console at `/admin`, you must manually upgrade your user role in the database:
  - Run `npx prisma studio`
  - Find your user record
  - Change the `role` field from `USER` to `ADMIN`
