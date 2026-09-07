'use client';

import { useState, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  FileCode,
  FolderTree,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  GitBranch,
  ExternalLink,
  Split,
  ChevronRight,
  Code2
} from 'lucide-react';

interface TemplateCode {
  id: string;
  name: string;
  file: string;
  code: string;
  terminalLog: string;
  aiPrompt: string;
  aiReply: string;
}

const templates: TemplateCode[] = [
  {
    id: 'nextjs',
    name: 'Next.js 16 & React 19',
    file: 'src/app/page.tsx',
    code: `import { auth } from '@/auth';
import { db } from '@/lib/db';
import { WorkspaceStudio } from '@/components/ide';

export default async function WorkspacePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const project = await db.project.findUnique({
    where: { id: params.id, ownerId: session?.user?.id },
  });

  return (
    <div className="flex h-screen bg-[#030712] text-slate-100">
      <WorkspaceStudio project={project} user={session?.user} />
    </div>
  );
}`,
    terminalLog: `cloudlab@workspace:~/app$ docker ps
CONTAINER ID   IMAGE                 STATUS          PORTS
7f92b49c01ad   cloudlab/node20-alpine Up 4 minutes    0.0.0.0:3000->3000/tcp
cloudlab@workspace:~/app$ pnpm run dev
  ▲ Next.js 16.3.0 (Turbopack)
  - Local:        http://localhost:3000
  - Network:      http://172.18.0.2:3000
✓ Ready in 640ms`,
    aiPrompt: 'Refactor WorkspaceStudio to support real-time Yjs CRDT presence cursors',
    aiReply: 'Added Yjs Monaco binding with multi-user cursor color assignments and auto-sync hook.',
  },
  {
    id: 'python',
    name: 'Python & FastAPI',
    file: 'main.py',
    code: `from fastapi import FastAPI, WebSocket
import uvicorn

app = FastAPI(title="CloudLab Python Microservice")

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "runtime": "docker-isolated-python3.11"}

@app.websocket("/ws/telemetry")
async def telemetry_socket(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"event": "connected", "cpu_percent": 1.4})`,
    terminalLog: `cloudlab@workspace:~/pyapp$ uvicorn main:app --reload --port 8000
INFO:     Will watch for changes in /workspace/pyapp
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [PID: 412] using StatReload
INFO:     Application startup complete.`,
    aiPrompt: 'Add async background task for data processing with Redis queue',
    aiReply: 'Created Celery worker configuration and integrated FastAPI lifespan handler.',
  },
  {
    id: 'ai-agent',
    name: 'AI Agent & LLM Tools',
    file: 'agent.ts',
    code: `import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function runCodingAgent(prompt: string) {
  return streamText({
    model: google('gemini-2.5-flash'),
    system: 'You are an autonomous cloud coding agent with root container tools.',
    prompt,
    tools: {
      writeFile: tool({ parameters: z.object({ path: z.string(), content: z.string() }) }),
      runCommand: tool({ parameters: z.object({ command: z.string() }) }),
    },
  });
}`,
    terminalLog: `cloudlab@workspace:~/agent$ npx tsx agent.ts
[AI Agent] Initializing Gemini 2.5 Flash model...
[Tool Invoked] writeFile -> path: "src/lib/auth.ts" (Human Approved)
[Tool Invoked] runCommand -> "npm test" (Exit Code 0: 7 passed)
✓ Agent workflow finished with 0 errors.`,
    aiPrompt: 'Inspect failing Jest tests and generate patch for OAuth token refresh',
    aiReply: 'Ran automated test suite, isolated race condition in token refresh, and applied patch.',
  },
];

export default function ProductDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal'>('editor');
  const [terminalRunning, setTerminalRunning] = useState(true);

  return (
    <section id="ide-demo" className="relative pb-24 sm:pb-32">
      <div
        className="ambient-glow-green"
        style={{ bottom: '-150px', left: '50%', transform: 'translateX(-50%)', opacity: 0.35 }}
      />

      <div className="cl-container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Studio Preview</span>
          </div>
          <h2 className="typo-h1 text-white">
            A Pro IDE That Lives in Your Browser
          </h2>
          <p className="typo-body mt-3 text-slate-400">
            Powered by Monaco, real Linux containers, and context-aware AI. Test drive the interface below:
          </p>
        </div>

        {/* Stack Selector Pills */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        {/* Full IDE Frame */}
        <div className="cl-ide-frame mx-auto max-w-5xl rounded-2xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0d1322] border-b border-white/10">
            {/* Window Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>main • cloudlab-sandbox-{selectedTemplate.id}</span>
              </span>
            </div>

            {/* Status Gauges */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Container Live</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3 h-3 text-purple-400" />
                <span>0.8% CPU</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-slate-400">
                <span>184MB / 2GB</span>
              </div>
            </div>
          </div>

          {/* IDE Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px] text-xs">
            {/* Left Sidebar: File Tree */}
            <div className="hidden md:block md:col-span-3 bg-[#0a0f1d] border-r border-white/10 p-3 font-mono">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Explorer</span>
                <FolderTree className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1.5 rounded font-semibold">
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="truncate">{selectedTemplate.file}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 hover:text-slate-200 cursor-pointer">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dockerfile</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 hover:text-slate-200 cursor-pointer">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>package.json</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 hover:text-slate-200 cursor-pointer">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>README.md</span>
                </div>
              </div>

              {/* AI Agent Status Pill */}
              <div className="mt-8 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>CloudLab Copilot</span>
                </div>
                <p className="text-[10px] text-purple-200/70 line-clamp-2">
                  {selectedTemplate.aiReply}
                </p>
              </div>
            </div>

            {/* Center Area: Editor & Terminal */}
            <div className="md:col-span-9 flex flex-col bg-[#070b14]">
              {/* File Tabs */}
              <div className="flex items-center justify-between bg-[#0b101e] border-b border-white/10 px-3">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#070b14] border-r border-white/10 text-emerald-300 font-mono border-t-2 border-t-emerald-400">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedTemplate.file}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    UTF-8
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    LF
                  </span>
                </div>
              </div>

              {/* Code Surface */}
              <div className="p-4 font-mono text-[12px] sm:text-[13px] leading-relaxed text-slate-300 overflow-x-auto min-h-[220px]">
                <pre className="text-slate-200">
                  <code>
                    {selectedTemplate.code.split('\n').map((line, idx) => (
                      <div key={idx} className="table-row">
                        <span className="table-cell select-none pr-4 text-right text-slate-600 text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="table-cell whitespace-pre">
                          {line
                            .replace(/import/g, '§c#93c5fd§import§r')
                            .replace(/from/g, '§c#93c5fd§from§r')
                            .replace(/export/g, '§c#c4b5fd§export§r')
                            .replace(/default/g, '§c#c4b5fd§default§r')
                            .replace(/async/g, '§c#c4b5fd§async§r')
                            .replace(/function/g, '§c#93c5fd§function§r')
                            .replace(/const/g, '§c#93c5fd§const§r')
                            .replace(/return/g, '§c#f43f5e§return§r')
                            .split('§')
                            .map((chunk, cIdx) => {
                              if (chunk.startsWith('c#')) {
                                const color = chunk.slice(1, 8);
                                const text = chunk.slice(9);
                                return (
                                  <span key={cIdx} style={{ color }}>
                                    {text}
                                  </span>
                                );
                              }
                              return chunk.replace(/^r/, '');
                            })}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>

              {/* Integrated Cloud Terminal Bottom Bar */}
              <div className="mt-auto border-t border-white/10 bg-[#050811] p-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Terminal — bash</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] font-bold">
                      PORT 3000 OPEN
                    </span>
                  </div>
                  <button className="text-slate-500 hover:text-slate-300 transition">
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <pre className="text-[11px] text-slate-300 leading-snug font-mono whitespace-pre-wrap">
                  {selectedTemplate.terminalLog}
                </pre>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-1">
                  <span>cloudlab@workspace:~/app$</span>
                  <span className="animate-cursor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
