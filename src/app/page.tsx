"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import CinematicBackground from "@/components/CinematicBackground";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  Circle,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  Flame,
  Gauge,
  GitBranch,
  Globe2,
  HardDrive,
  Layers,
  Layers3,
  LockKeyhole,
  Menu,
  MousePointer,
  MousePointerClick,
  Network,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Rocket,
  RotateCcw,
  Server,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Users,
  Volume2,
  VolumeX,
  Wand2,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type DemoTab = "editor" | "terminal" | "preview";
type ArchitectureTab = "microvm" | "crdt" | "ai" | "edge";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Architecture", href: "#architecture" },
  { label: "Benchmark", href: "#benchmark" },
  { label: "How it works", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
];

const techStack = [
  { name: "Next.js 15", tag: "Fullstack", color: "#ffffff" },
  { name: "React 19", tag: "UI", color: "#61dafb" },
  { name: "TypeScript", tag: "Language", color: "#3178c6" },
  { name: "Node.js 20", tag: "Runtime", color: "#68a063" },
  { name: "Python 3.12", tag: "AI & ML", color: "#ffd43b" },
  { name: "Rust", tag: "High Perf", color: "#dea584" },
  { name: "Go", tag: "Backend", color: "#00add8" },
  { name: "Docker", tag: "Containers", color: "#2496ed" },
  { name: "PostgreSQL", tag: "Database", color: "#336791" },
  { name: "Redis", tag: "Caching", color: "#dc382d" },
  { name: "Tailwind CSS", tag: "Styling", color: "#38bdf8" },
  { name: "Bun", tag: "Fast Engine", color: "#fbf0df" },
  { name: "Vite", tag: "Bundler", color: "#bd34fe" },
];

const features = [
  {
    icon: Code2,
    eyebrow: "01 / Build",
    title: "A serious IDE, inside your browser.",
    description:
      "Open a workspace and get the editing power you expect: multi-file navigation, smart autocomplete, integrated terminals, and a layout that stays out of your way.",
    accent: "mint",
  },
  {
    icon: Users,
    eyebrow: "02 / Collaborate",
    title: "Ship together, in real time.",
    description:
      "Share a workspace instead of sending screenshots. Follow teammates, edit the same files, and keep decisions close to the code.",
    accent: "violet",
  },
  {
    icon: Rocket,
    eyebrow: "03 / Deploy",
    title: "From first command to live URL.",
    description:
      "Run your stack in an isolated container, preview changes instantly, and move from local idea to a working deployment without setup debt.",
    accent: "orange",
  },
];

const benchmarkComparisons = [
  {
    metric: "Initial Setup Time",
    traditional: "45–60 mins (Node, Docker, dependencies, env configs)",
    cloudlab: "1.4 seconds (instant warm microVM)",
    advantage: "40× faster",
  },
  {
    metric: "Local Resource Overhead",
    traditional: "100% CPU spikes, heavy battery drain, 8GB+ RAM",
    cloudlab: "0% local compute (runs in isolated cloud sandbox)",
    advantage: "Zero machine lag",
  },
  {
    metric: "Team Collaboration",
    traditional: "Screen sharing, git stash conflicts, 'works on my machine'",
    cloudlab: "Real-time multiplayer CRDT sync with live cursors",
    advantage: "Zero conflict pairing",
  },
  {
    metric: "Public Preview & Testing",
    traditional: "Manual port forwarding, ngrok config, broken staging",
    cloudlab: "Instant automatic HTTPS URL on every port",
    advantage: "1-Click shareable link",
  },
];

const architectureTabs: Record<
  ArchitectureTab,
  {
    title: string;
    badge: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    heading: string;
    description: string;
    points: string[];
    code: string;
    terminal: {
      prompt: string;
      command: string;
      outputs: Array<{ text: string; type?: "info" | "success" | "warn" | "url" | "dim" | "accent" }>;
      statBadge: { value: string; label: string; highlight: string };
      actions: Array<{
        label: string;
        command: string;
        outputs: Array<{ text: string; type?: "info" | "success" | "warn" | "url" | "dim" | "accent" }>;
      }>;
    };
  }
> = {
  microvm: {
    title: "MicroVM Sandboxing",
    badge: "CORE RUNTIME",
    icon: Cpu,
    heading: "Isolated rootless Linux containers on NVMe clusters.",
    description:
      "Every CloudLab workspace launches inside a dedicated, securely isolated microVM with sub-second cold start. Dependencies and processes are strictly sandboxed.",
    points: [
      "Hardware-level isolation with Firecracker microVMs",
      "Dedicated 2 vCPU and 2.4GB burstable memory",
      "Fast snapshot restoring & persistent volume caching",
    ],
    code: `// Provisioning Workspace MicroVM
const container = await cloudlab.runtime.spawn({
  image: "ubuntu-noble-node20",
  storage: "nvme-persistent-10gb",
  isolation: "strict-microvm"
});
// Container ready in 140ms`,
    terminal: {
      prompt: "cloudlab:~/microvm-root",
      command: "cloudlab runtime spawn --strict-microvm",
      outputs: [
        { text: "[0.002s] ⚡ Initializing Firecracker microVM instance...", type: "dim" },
        { text: "[0.018s] 🔒 Rootless Linux namespace mounted (uid: 1001, cgroups v2)", type: "accent" },
        { text: "[0.042s] 💾 Attached 10GB NVMe storage volume (ext4)", type: "dim" },
        { text: "[0.086s] 📦 Restored node_modules global cache (48 packages in 44ms)", type: "success" },
        { text: "[0.140s] ✔ MicroVM sandbox ready in 140ms. Dedicated 2 vCPU · 2.4GB RAM.", type: "success" },
      ],
      statBadge: { value: "140ms", label: "Cold Start Latency", highlight: "⚡ Sub-second boot" },
      actions: [
        {
          label: "Bench Cold Start",
          command: "cloudlab bench --cold-start --runs=10",
          outputs: [
            { text: "⚡ Running 10 cold container boot benchmarks...", type: "dim" },
            { text: "  Run 1..10: [138ms, 142ms, 137ms, 140ms, 139ms]", type: "info" },
            { text: "✔ Mean Boot: 139.2ms ± 1.8ms (NVMe cluster cached)", type: "success" },
          ],
        },
        {
          label: "Inspect Cgroups",
          command: "cat /sys/fs/cgroup/memory.max && nproc",
          outputs: [
            { text: "cgroup: 2576980377 (2.4 GB hard limit)", type: "info" },
            { text: "cpu cores: 2 dedicated burstable x86_64 threads", type: "accent" },
            { text: "✔ Zero memory leakage to adjacent tenants", type: "success" },
          ],
        },
      ],
    },
  },
  crdt: {
    title: "Multiplayer CRDT Sync",
    badge: "P2P ENGINE",
    icon: Users,
    heading: "Sub-50ms keystroke replication with zero merge conflicts.",
    description:
      "CloudLab leverages Conflict-free Replicated Data Types (CRDTs) over WebRTC and WebSockets so your entire team can write, debug, and navigate files simultaneously.",
    points: [
      "Real-time remote cursor tracking & presence",
      "Offline-resilient optimistic updates",
      "Integrated audio and live terminal session sharing",
    ],
    code: `// Realtime CRDT Collaborative Session
const peerSession = new CloudLab.Collab({
  room: "workspace-acme-dashboard",
  crdt: "yjs-webrtc-mesh",
  presence: { user: "Maya", role: "Frontend" }
});
peerSession.on("peer-join", (peer) => syncCursors(peer));`,
    terminal: {
      prompt: "cloudlab:~/collaboration",
      command: "cloudlab sync --crdt-webrtc --room=acme-dashboard",
      outputs: [
        { text: "⇄ Initializing Yjs CRDT peer stream over WebSockets...", type: "dim" },
        { text: "● Maya (Frontend) joined • RTT: 7.8ms • cursor on page.tsx:4", type: "accent" },
        { text: "● Leo (Backend) joined • RTT: 11.2ms • editing api/routes.ts", type: "accent" },
        { text: "✔ Mathematical convergence verified • 0 merge conflicts (60fps sync)", type: "success" },
      ],
      statBadge: { value: "8ms", label: "Peer-to-Peer RTT", highlight: "● 3 peers online" },
      actions: [
        {
          label: "Simulate Keystroke",
          command: 'cloudlab crdt inject --peer="Maya" --op="insert" --text="<NavBar />"',
          outputs: [
            { text: "⇄ Delta [op:insert, pos:42, len:11] broadcast to 3 peers", type: "info" },
            { text: "✔ State synchronized in 6.4ms across all connected clients", type: "success" },
          ],
        },
        {
          label: "Test Fork Convergence",
          command: "cloudlab crdt test-fork --peers=4 --concurrent-edits=100",
          outputs: [
            { text: "⚡ Injected 100 concurrent edits across 4 virtual peers...", type: "dim" },
            { text: "✔ Lamport timestamps converged (LWW-Register verified)", type: "success" },
          ],
        },
      ],
    },
  },
  ai: {
    title: "AI Code Accelerator",
    badge: "INTELLIGENCE",
    icon: Wand2,
    heading: "Context-aware code intelligence embedded in the compiler loop.",
    description:
      "AI companion with full awareness of your workspace files, imports, and runtime terminal output to explain bugs, generate boilerplate, and fix errors.",
    points: [
      "Multi-file codebase context indexing",
      "Terminal stderr diagnosis & 1-click auto-fix",
      "Inline intelligent completions and type inference",
    ],
    code: `// CloudLab AI Diagnostic Pipeline
const diagnostics = await cloudlab.ai.diagnose({
  file: "app/api/route.ts",
  terminalError: "TypeError: Cannot read property 'map' of undefined",
  fixConfidence: 0.99
});
await diagnostics.applyPatch();`,
    terminal: {
      prompt: "cloudlab:~/copilot",
      command: "cloudlab ai diagnose --auto-fix --file=app/api/route.ts",
      outputs: [
        { text: "🔍 Indexing workspace AST tree & compiler error stream...", type: "dim" },
        { text: "✦ Found TypeError: Cannot read property 'map' of undefined (line 24)", type: "warn" },
        { text: "💡 Gemini 2.0 suggested fix: Use optional chaining 'items?.map(...)'", type: "accent" },
        { text: "✔ Patch applied to app/api/route.ts in 280ms. Type check passed.", type: "success" },
      ],
      statBadge: { value: "99.4%", label: "Fix Confidence", highlight: "✦ Gemini 2.0 & GPT-4o" },
      actions: [
        {
          label: "Auto-Fix Route",
          command: "cloudlab ai refactor --target=routes.ts --strict-types",
          outputs: [
            { text: "✦ Inferred strict TypeScript interface types for 8 models", type: "info" },
            { text: "✔ Added Zod payload validator schema with 0 runtime warnings", type: "success" },
          ],
        },
        {
          label: "Explain Error",
          command: "cloudlab ai explain --error=500",
          outputs: [
            { text: "💡 Cause: Database connection pool exhausted during burst", type: "dim" },
            { text: "✔ Solution: Configured connection pooling (-pooler) for Neon Postgres", type: "success" },
          ],
        },
      ],
    },
  },
  edge: {
    title: "1-Click Edge Deploy",
    badge: "GLOBAL INFRA",
    icon: Globe2,
    heading: "Turn workspace ports into globally distributed HTTPS endpoints.",
    description:
      "Instantly publish your app to worldwide edge networks with automatic wildcard SSL certificates, DDoS protection, and custom domain mapping.",
    points: [
      "Instant public URLs: https://[app].cloudlab.run",
      "Zero-config SSL/TLS certificate provisioning",
      "Webhooks, environment variables, and branch previews",
    ],
    code: `// Instant Edge Deployment
const deployment = await cloudlab.deploy({
  source: "./workspace",
  routing: "edge-global",
  ssl: "auto-wildcard"
});
console.log("Deployed to:", deployment.url);
// → https://acme-saas.cloudlab.run`,
    terminal: {
      prompt: "cloudlab:~/deploy",
      command: "cloudlab deploy --edge-global --target=production",
      outputs: [
        { text: "⚡ Building optimized standalone bundle with Turbopack...", type: "dim" },
        { text: "🔒 Auto wildcard SSL certificate issued for *.cloudlab.run", type: "accent" },
        { text: "🚀 Live at: https://acme-saas.cloudlab.run", type: "url" },
        { text: "✨ 18ms global edge latency across 42 POPs · 100/100 Lighthouse", type: "success" },
      ],
      statBadge: { value: "18ms", label: "Global Edge Latency", highlight: "🌍 42 Edge POPs" },
      actions: [
        {
          label: "Ping Edge POPs",
          command: "cloudlab ping --regions=ams,sfo,nrt,syd",
          outputs: [
            { text: "AMS: 8ms | SFO: 14ms | NRT: 22ms | SYD: 28ms", type: "info" },
            { text: "✔ Anycast DNS routed to nearest edge node", type: "success" },
          ],
        },
        {
          label: "Verify SSL Cert",
          command: "cloudlab ssl inspect --domain=acme-saas.cloudlab.run",
          outputs: [
            { text: "🔒 TLS v1.3 • Issuer: Let's Encrypt Authority • 2048-bit RSA", type: "success" },
            { text: "✔ HTTP/3 (QUIC) enabled with zero handshake overhead", type: "accent" },
          ],
        },
      ],
    },
  },
};

const faqs = [
  {
    question: "Do I need to install anything on my local machine?",
    answer:
      "No. CloudLab runs 100% inside your browser with a remote Linux microVM container. Start a workspace, open the terminal, and begin building without configuring Node, Python, or Docker locally.",
  },
  {
    question: "Can I import an existing GitHub repository?",
    answer:
      "Yes. The workspace flow is designed around Git-based projects. Authenticate with GitHub to clone private and public repositories, branch, commit, and open Pull Requests directly.",
  },
  {
    question: "Is each workspace isolated and secure?",
    answer:
      "Yes. CloudLab provisions each project in isolated microVM containers with scoped memory, CPU, and network boundaries so your dependencies and secrets remain completely private.",
  },
  {
    question: "How does real-time team collaboration work?",
    answer:
      "CloudLab synchronizes editor state, file trees, and terminal sessions using high-performance CRDT algorithms (Yjs), providing Google Docs-style collaboration for code with sub-50ms latency.",
  },
  {
    question: "Can I run full-stack databases like Postgres or Redis?",
    answer:
      "Yes. Workspaces include full rootless Docker and package managers, allowing you to run Postgres, Redis, MongoDB, or background services directly inside your terminal.",
  },
];

const codeLines = [
  ["const", " workspace", " =", " await", " cloudlab", ".create({"],
  ["  template", ":", " \"next-app\"", ","],
  ["  region", ":", " \"ams-01\"", ","],
  ["  collaborators", ":", " [\"maya\", \"leo\"]"],
  ["});"],
  [""],
  ["await", " workspace", ".deploy({"],
  ["  branch", ":", " \"main\""],
  ["});"],
];

interface TerminalStep {
  prompt: string;
  command: string;
  outputs: Array<{
    text: string;
    type?: "info" | "success" | "warn" | "url" | "dim" | "accent";
  }>;
}

const terminalSteps: TerminalStep[] = [
  {
    prompt: "cloudlab:~/saas-app",
    command: "cloudlab init --template nextjs-fullstack",
    outputs: [
      { text: "⚡ Provisioning isolated Docker microVM container...", type: "dim" },
      { text: "✔ Linux v6.8 kernel mounted with NVMe storage", type: "success" },
      { text: "✔ Sandbox provisioned in 140ms (Node.js v20.12, pnpm)", type: "accent" },
    ],
  },
  {
    prompt: "cloudlab:~/saas-app",
    command: "pnpm install && pnpm run dev --turbo",
    outputs: [
      { text: "✔ 48 dependencies linked from global cache (0.4s)", type: "dim" },
      { text: "▲ Next.js 15.1 (Turbo) ready on http://localhost:3000", type: "success" },
      { text: "  Hot reload active • WebSocket sync latency: 8ms", type: "info" },
    ],
  },
  {
    prompt: "cloudlab:~/saas-app",
    command: "cloudlab sync --collaborate",
    outputs: [
      { text: "⇄ Real-time CRDT peer stream established via Yjs", type: "dim" },
      { text: "● Maya (Frontend) joined workspace · cursor on page.tsx", type: "accent" },
      { text: "● Leo (Backend) joined workspace · editing api/routes.ts", type: "accent" },
    ],
  },
  {
    prompt: "cloudlab:~/saas-app",
    command: "cloudlab deploy --production",
    outputs: [
      { text: "⚡ Optimizing edge bundle & issuing wildcard SSL...", type: "dim" },
      { text: "🚀 Live Preview: https://saas-demo.cloudlab.run", type: "url" },
      { text: "✨ 0 errors · 100% Lighthouse Performance Score", type: "success" },
    ],
  },
];

function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="CloudLab home">
      <span className="brand-mark__icon">
        <Cloud size={18} strokeWidth={2.4} />
      </span>
      <span className="brand-mark__word">
        cloud<span>lab</span>
      </span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-label__line" />
      <span>{children}</span>
    </div>
  );
}

function HeroTerminal() {
  const [stepIndex, setStepIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [visibleOutputsCount, setVisibleOutputsCount] = useState(0);
  const [history, setHistory] = useState<
    Array<{
      prompt: string;
      command: string;
      outputs: TerminalStep["outputs"];
    }>
  >([]);
  const [copied, setCopied] = useState(false);

  const currentStep = terminalSteps[stepIndex];

  useEffect(() => {
    // 1. Typing command animation
    if (typedChars < currentStep.command.length) {
      const timer = setTimeout(() => {
        setTypedChars((prev) => prev + 1);
      }, 32);
      return () => clearTimeout(timer);
    }

    // 2. Command finished typing -> reveal outputs progressively
    if (visibleOutputsCount < currentStep.outputs.length) {
      const timer = setTimeout(() => {
        setVisibleOutputsCount((prev) => prev + 1);
      }, 190);
      return () => clearTimeout(timer);
    }

    // 3. All outputs revealed -> pause, add to history, then proceed to next step
    const nextStepTimer = setTimeout(() => {
      setHistory((prev) => {
        const updated = [
          ...prev,
          {
            prompt: currentStep.prompt,
            command: currentStep.command,
            outputs: currentStep.outputs,
          },
        ];
        return updated.slice(-2); // Keep last 2 commands in history for smooth multi-line display
      });

      if (stepIndex < terminalSteps.length - 1) {
        setStepIndex((prev) => prev + 1);
        setTypedChars(0);
        setVisibleOutputsCount(0);
      } else {
        // Loop finished -> hold on final live screen then loop
        const loopResetTimer = setTimeout(() => {
          setHistory([]);
          setStepIndex(0);
          setTypedChars(0);
          setVisibleOutputsCount(0);
        }, 3200);
        return () => clearTimeout(loopResetTimer);
      }
    }, 1300);

    return () => clearTimeout(nextStepTimer);
  }, [typedChars, visibleOutputsCount, stepIndex, currentStep]);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx cloudlab init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestart = () => {
    setHistory([]);
    setStepIndex(0);
    setTypedChars(0);
    setVisibleOutputsCount(0);
  };

  return (
    <div className="hero-3d-terminal-wrapper" aria-label="Interactive CloudLab Terminal Simulation">
      <div className="hero-3d-terminal__glow" />
      <div className="hero-3d-terminal__orbit hero-3d-terminal__orbit--one" />
      <div className="hero-3d-terminal__orbit hero-3d-terminal__orbit--two" />

      {/* Floating 3D Context Badges */}
      <div className="hero-floating-badge hero-floating-badge--top">
        <span className="hero-floating-badge__icon hero-floating-badge__icon--mint">
          <Zap size={14} />
        </span>
        <div>
          <b>140ms Hot Reload</b>
          <small>Instant feedback loops</small>
        </div>
      </div>

      <div className="hero-floating-badge hero-floating-badge--bottom">
        <span className="hero-floating-badge__icon hero-floating-badge__icon--violet">
          <Users size={14} />
        </span>
        <div>
          <b>Realtime CRDT Sync</b>
          <small>3 teammates online</small>
        </div>
      </div>

      {/* Main 3D Terminal Shell */}
      <div className="hero-3d-terminal">
        {/* Terminal Header */}
        <div className="hero-3d-terminal__header">
          <div className="hero-3d-terminal__traffic-lights">
            <span className="hero-dot hero-dot--red" />
            <span className="hero-dot hero-dot--yellow" />
            <span className="hero-dot hero-dot--green" />
          </div>
          <div className="hero-3d-terminal__title">
            <Terminal size={12} className="hero-3d-terminal__title-icon" />
            <span>cloudlab-node — bash — 80×24</span>
          </div>
          <div className="hero-3d-terminal__actions">
            <button
              type="button"
              onClick={handleRestart}
              className="hero-3d-terminal__action-btn"
              title="Restart session animation"
              aria-label="Restart terminal simulation"
            >
              <RefreshCw size={11} />
            </button>
            <span className="hero-3d-terminal__status-pill">
              <span className="hero-3d-terminal__live-pulse" />
              LIVE
            </span>
          </div>
        </div>

        {/* Terminal Window Body */}
        <div className="hero-3d-terminal__window">
          {/* Historical lines */}
          {history.map((item, idx) => (
            <div key={`hist-${idx}`} className="terminal-log-group">
              <div className="terminal-line terminal-line--command">
                <span className="terminal-prompt-user">{item.prompt}</span>
                <span className="terminal-prompt-symbol">$</span>
                <span className="terminal-command-text">{item.command}</span>
              </div>
              {item.outputs.map((out, outIdx) => (
                <div
                  key={`hist-out-${idx}-${outIdx}`}
                  className={`terminal-output-line terminal-output--${out.type || "dim"}`}
                >
                  {out.text}
                </div>
              ))}
            </div>
          ))}

          {/* Current typing command */}
          <div className="terminal-log-group">
            <div className="terminal-line terminal-line--command">
              <span className="terminal-prompt-user">{currentStep.prompt}</span>
              <span className="terminal-prompt-symbol">$</span>
              <span className="terminal-command-text">
                {currentStep.command.slice(0, typedChars)}
              </span>
              <span className="terminal-cursor" />
            </div>

            {/* Currently revealing outputs */}
            {currentStep.outputs.slice(0, visibleOutputsCount).map((out, outIdx) => (
              <div
                key={`curr-out-${outIdx}`}
                className={`terminal-output-line terminal-output--${out.type || "dim"}`}
              >
                {out.text}
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Bottom Toolbar */}
        <div className="hero-3d-terminal__footer">
          <div className="hero-3d-terminal__footer-meta">
            <span className="hero-tag">
              <GitBranch size={11} /> main
            </span>
            <span className="hero-tag hero-tag--docker">
              <Server size={11} /> MicroVM (2 vCPU · 2.4GB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="hero-3d-terminal__copy-chip"
            aria-label="Copy CloudLab command"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            <span>{copied ? "Copied npx command!" : "npx cloudlab init"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function TechStackMarquee() {
  return (
    <div className="tech-stack-strip">
      <div className="site-container tech-stack-strip__inner">
        <span className="tech-stack-strip__label">SUPPORTED RUNTIMES & FRAMEWORKS</span>
        <div className="tech-stack-marquee">
          <div className="tech-stack-marquee__track">
            {[...techStack, ...techStack].map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="tech-badge">
                <span className="tech-badge__dot" style={{ background: item.color }} />
                <span className="tech-badge__name">{item.name}</span>
                <span className="tech-badge__tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BenchmarkSection() {
  return (
    <section className="benchmark-section site-section" id="benchmark">
      <div className="site-container">
        <div className="section-intro section-intro--centered">
          <SectionLabel>ENGINEERED FOR VELOCITY</SectionLabel>
          <h2>
            Local friction vs. <em>CloudLab speed.</em>
          </h2>
          <p>
            Traditional development environments waste developer hours on configuration and machine
            overload. Here is how CloudLab rewrites the equation.
          </p>
        </div>

        <div className="benchmark-grid">
          {benchmarkComparisons.map((item) => (
            <div className="benchmark-card" key={item.metric}>
              <div className="benchmark-card__header">
                <h3>{item.metric}</h3>
                <span className="benchmark-card__badge">{item.advantage}</span>
              </div>
              <div className="benchmark-card__rows">
                <div className="benchmark-row benchmark-row--traditional">
                  <span className="benchmark-row__label">Traditional Local</span>
                  <p>{item.traditional}</p>
                </div>
                <div className="benchmark-row benchmark-row--cloudlab">
                  <span className="benchmark-row__label">
                    <Zap size={13} /> CloudLab
                  </span>
                  <p>{item.cloudlab}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureTerminal3D({
  tabKey,
  data,
}: {
  tabKey: ArchitectureTab;
  data: (typeof architectureTabs)[ArchitectureTab];
}) {
  const [viewMode, setViewMode] = useState<"terminal" | "code">("terminal");
  const [activeActionIdx, setActiveActionIdx] = useState<number | null>(null);
  const [typedChars, setTypedChars] = useState(0);
  const [visibleOutputsCount, setVisibleOutputsCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const activeCommand =
    activeActionIdx !== null
      ? data.terminal.actions[activeActionIdx].command
      : data.terminal.command;
  const activeOutputs =
    activeActionIdx !== null
      ? data.terminal.actions[activeActionIdx].outputs
      : data.terminal.outputs;

  // Reset typewriter when tab or action changes
  useEffect(() => {
    setTypedChars(0);
    setVisibleOutputsCount(0);
  }, [tabKey, activeActionIdx]);

  useEffect(() => {
    if (typedChars < activeCommand.length) {
      const timer = setTimeout(() => setTypedChars((prev) => prev + 1), 20);
      return () => clearTimeout(timer);
    }
    if (visibleOutputsCount < activeOutputs.length) {
      const timer = setTimeout(() => setVisibleOutputsCount((prev) => prev + 1), 130);
      return () => clearTimeout(timer);
    }
  }, [typedChars, visibleOutputsCount, activeCommand, activeOutputs]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 9;
    const rotateY = ((x - centerX) / centerX) * 11;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setTilt({ rotateX, rotateY, glareX, glareY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const handleCopy = async () => {
    try {
      const textToCopy = viewMode === "code" ? data.code : activeCommand;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="arch-3d-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className={`arch-3d-card ${tilt.isHovered ? "is-tilted" : ""}`}
        style={{
          transform: tilt.isHovered
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          ["--glare-x" as string]: `${tilt.glareX}%`,
          ["--glare-y" as string]: `${tilt.glareY}%`,
        }}
      >
        <div className="arch-3d-glare" />
        <div className="arch-3d-scanlines" />

        {/* 3D Floating Telemetry Stat Badge */}
        <div className="arch-3d-floating-stat" aria-hidden="true">
          <strong>{data.terminal.statBadge.value}</strong>
          <span>{data.terminal.statBadge.label}</span>
          <span className="arch-3d-stat-chip">{data.terminal.statBadge.highlight}</span>
        </div>

        {/* 3D Topbar with Traffic Lights & View Mode Switches */}
        <div className="arch-3d-topbar">
          <div className="arch-3d-traffic" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>

          <div className="arch-3d-modes">
            <button
              type="button"
              className={`arch-3d-mode-btn ${viewMode === "terminal" ? "is-active" : ""}`}
              onClick={() => setViewMode("terminal")}
            >
              <Terminal size={11} /> LIVE RUNTIME
            </button>
            <button
              type="button"
              className={`arch-3d-mode-btn ${viewMode === "code" ? "is-active" : ""}`}
              onClick={() => setViewMode("code")}
            >
              <Code2 size={11} /> CONFIG SPEC
            </button>
          </div>

          <button
            type="button"
            className="arch-3d-copy-btn"
            onClick={handleCopy}
            title={copied ? "Copied to clipboard!" : "Copy code / command"}
            aria-label="Copy code or command"
          >
            {copied ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
          </button>
        </div>

        {/* Body Area: Terminal Stream or Config Code */}
        <div className="arch-3d-body">
          {viewMode === "terminal" ? (
            <div className="arch-3d-output">
              <p className="arch-3d-prompt-line">
                <span className="terminal-muted">{data.terminal.prompt}</span>{" "}
                <span className="terminal-prompt">$</span>{" "}
                <span className="terminal-command-text">
                  {activeCommand.slice(0, typedChars)}
                </span>
                <span className="terminal-cursor" />
              </p>
              {activeOutputs.slice(0, visibleOutputsCount).map((out, idx) => (
                <p
                  key={`arch-out-${idx}`}
                  className={`terminal-output-line terminal-output--${out.type || "dim"}`}
                >
                  {out.text}
                </p>
              ))}
            </div>
          ) : (
            <pre className="arch-3d-code-view">
              <code>{data.code}</code>
            </pre>
          )}

          {/* Interactive Workable Action Chips for This Architecture Component */}
          <div className="arch-3d-actions">
            <span className="hero-tag">
              <Zap size={10} /> Test Live:
            </span>
            {data.terminal.actions.map((act, idx) => (
              <button
                type="button"
                key={`act-${idx}`}
                className={`arch-3d-action-chip ${activeActionIdx === idx ? "is-active" : ""}`}
                onClick={() => {
                  setViewMode("terminal");
                  setActiveActionIdx(idx);
                }}
              >
                <Play size={9} /> {act.label}
              </button>
            ))}
            {activeActionIdx !== null && (
              <button
                type="button"
                className="arch-3d-action-chip"
                onClick={() => setActiveActionIdx(null)}
                title="Reset to default stream"
              >
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState<ArchitectureTab>("microvm");
  const tabData = architectureTabs[activeTab];
  const Icon = tabData.icon;

  return (
    <section className="architecture-section site-section" id="architecture">
      <div className="site-container">
        <div className="section-intro">
          <SectionLabel>UNDER THE HOOD</SectionLabel>
          <h2>
            Modern cloud architecture.<br />
            <em>Built for instant feedback.</em>
          </h2>
          <p>
            Behind the clean browser UI sits a high-performance distributed infrastructure designed
            specifically for developers.
          </p>
        </div>

        <div className="architecture-showcase">
          <div className="architecture-tabs" role="tablist" aria-label="Architecture components">
            {(Object.keys(architectureTabs) as ArchitectureTab[]).map((tabKey) => {
              const item = architectureTabs[tabKey];
              const TabIcon = item.icon;
              return (
                <button
                  type="button"
                  key={tabKey}
                  role="tab"
                  aria-selected={activeTab === tabKey}
                  className={`architecture-tab ${activeTab === tabKey ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  <span className="architecture-tab__icon">
                    <TabIcon size={16} />
                  </span>
                  <div className="architecture-tab__text">
                    <strong>{item.title}</strong>
                    <small>{item.badge}</small>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="architecture-panel">
            <div className="architecture-panel__copy">
              <div className="architecture-panel__badge">
                <Icon size={14} /> {tabData.badge}
              </div>
              <h3>{tabData.heading}</h3>
              <p>{tabData.description}</p>
              <ul className="architecture-panel__points">
                {tabData.points.map((pt, i) => (
                  <li key={i}>
                    <Check size={14} /> {pt}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" className="button button--primary button--small">
                Try this in workspace <ArrowRight size={14} />
              </Link>
            </div>

            <ArchitectureTerminal3D tabKey={activeTab} data={tabData} />
          </div>
        </div>
      </div>
    </section>
  );
}

const workspaceTerminalFrames: TerminalStep[] = [
  {
    prompt: "~/acme-dashboard",
    command: "pnpm install",
    outputs: [
      { text: "✔ Resolving dependencies from global cache...", type: "dim" },
      { text: "✔ Linked 48 packages in 0.35s (0 vulnerabilities)", type: "success" },
    ],
  },
  {
    prompt: "~/acme-dashboard",
    command: "pnpm dev --turbo",
    outputs: [
      { text: "▲ Next.js 15.1.0 (Turbopack Engine enabled)", type: "accent" },
      { text: "✓ Ready in 240ms on http://localhost:3000", type: "success" },
      { text: "○ Compiling /dashboard ...", type: "dim" },
      { text: "✓ Compiled /dashboard in 38ms (214 modules)", type: "info" },
    ],
  },
  {
    prompt: "~/acme-dashboard",
    command: 'git commit -am "feat: realtime dashboard sync"',
    outputs: [
      { text: "[main 8a192fc] feat: realtime dashboard sync", type: "dim" },
      { text: "3 files changed, 42 insertions(+)", type: "accent" },
      { text: "→ Changes automatically propagated to team peers", type: "success" },
    ],
  },
  {
    prompt: "~/acme-dashboard",
    command: "cloudlab deploy --production",
    outputs: [
      { text: "⚡ Deploying to Edge MicroVM cluster...", type: "dim" },
      { text: "🚀 Live at: https://acme-dashboard.cloudlab.run", type: "url" },
      { text: "✨ 100% test coverage · Zero configuration needed", type: "success" },
    ],
  },
];

function WorkspaceTerminal() {
  const [stepIndex, setStepIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [visibleOutputsCount, setVisibleOutputsCount] = useState(0);
  const [history, setHistory] = useState<
    Array<{
      prompt: string;
      command: string;
      outputs: TerminalStep["outputs"];
    }>
  >([]);
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [liveAnimationEnabled, setLiveAnimationEnabled] = useState(true);
  const [autoCursorEnabled, setAutoCursorEnabled] = useState(true);
  const [isUserHovering, setIsUserHovering] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [commandDraft, setCommandDraft] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const [virtualCursor, setVirtualCursor] = useState<{
    x: number;
    y: number;
    visible: boolean;
    isClicking: boolean;
    label: string;
    activeChip: string | null;
  }>({
    x: 160,
    y: 80,
    visible: true,
    isClicking: false,
    label: "Auto Pilot",
    activeChip: null,
  });
  const [clickRipples, setClickRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const pnpmChipRef = useRef<HTMLButtonElement | null>(null);
  const commitChipRef = useRef<HTMLButtonElement | null>(null);
  const deployChipRef = useRef<HTMLButtonElement | null>(null);
  const restartChipRef = useRef<HTMLButtonElement | null>(null);
  const copyBtnRef = useRef<HTMLButtonElement | null>(null);
  const userHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = workspaceTerminalFrames[stepIndex];

  const playTerminalTone = (kind: "keypress" | "output" | "complete" | "click") => {
    if (!soundEnabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = audioContextRef.current || new AudioContextClass();
    audioContextRef.current = audioContext;
    if (audioContext.state === "suspended") void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequencies = { keypress: 520, output: 680, complete: 880, click: 740 };
    const duration = kind === "complete" ? 0.16 : kind === "click" ? 0.07 : 0.055;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequencies[kind], audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(kind === "complete" ? 0.045 : 0.024, audioContext.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration + 0.01);
  };

  const getRelativeCoords = (el: HTMLElement | null) => {
    if (!el || !terminalRef.current) return null;
    const termRect = terminalRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: Math.round(elRect.left - termRect.left + elRect.width / 2),
      y: Math.round(elRect.top - termRect.top + elRect.height / 2),
    };
  };

  const triggerVirtualClickOnElement = (
    el: HTMLElement | null,
    chipKey: string,
    onAction?: () => void
  ) => {
    const coords = getRelativeCoords(el);
    if (!coords) {
      if (onAction) onAction();
      return;
    }

    // 1. Move cursor smoothly to target button
    setVirtualCursor((prev) => ({
      ...prev,
      x: coords.x,
      y: coords.y,
      visible: true,
      activeChip: chipKey,
    }));

    // 2. Trigger click ripple & press effect
    setTimeout(() => {
      setVirtualCursor((prev) => ({ ...prev, isClicking: true }));
      setClickRipples((prev) => [
        ...prev.slice(-4),
        { id: Date.now() + Math.random(), x: coords.x, y: coords.y },
      ]);
      playTerminalTone("click");
      if (onAction) onAction();

      // 3. Release button click press
      setTimeout(() => {
        setVirtualCursor((prev) => ({ ...prev, isClicking: false, activeChip: null }));
      }, 220);
    }, 460);
  };

  const enterInteractiveMode = () => {
    if (!isInteractive) {
      setIsInteractive(true);
      setLiveAnimationEnabled(false);
      setCommandDraft("");
      setCursorPosition(0);
      setCommandHistoryIndex(-1);
    }
  };

  const executeInteractiveCommand = () => {
    const command = commandDraft.trim();
    if (!command) return;
    const matchingIdx = workspaceTerminalFrames.findIndex(
      (frame) => frame.command === command || frame.command.includes(command)
    );
    if (matchingIdx !== -1) {
      setStepIndex(matchingIdx);
      setTypedChars(0);
      setVisibleOutputsCount(0);
      setIsInteractive(false);
      setLiveAnimationEnabled(true);
      playTerminalTone("complete");
    } else {
      setHistory((previous) =>
        [
          ...previous,
          {
            prompt: "~/acme-dashboard",
            command,
            outputs: [{ text: `bash: ${command}: command not found`, type: "dim" as const }],
          },
        ].slice(-2)
      );
      setCommandDraft("");
      setCursorPosition(0);
      playTerminalTone("output");
    }
  };

  const handleTerminalKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (["INPUT", "TEXTAREA", "BUTTON"].includes((event.target as HTMLElement).tagName)) return;
    event.preventDefault();
    enterInteractiveMode();
    if (event.key === "ArrowUp") {
      const nextIndex = Math.min(commandHistoryIndex + 1, workspaceTerminalFrames.length - 1);
      const nextCommand =
        workspaceTerminalFrames[workspaceTerminalFrames.length - 1 - nextIndex]?.command || "";
      setCommandHistoryIndex(nextIndex);
      setCommandDraft(nextCommand);
      setCursorPosition(nextCommand.length);
      playTerminalTone("keypress");
    } else if (event.key === "ArrowDown") {
      const nextIndex = Math.max(commandHistoryIndex - 1, -1);
      const nextCommand =
        nextIndex === -1
          ? ""
          : workspaceTerminalFrames[workspaceTerminalFrames.length - 1 - nextIndex]?.command || "";
      setCommandHistoryIndex(nextIndex);
      setCommandDraft(nextCommand);
      setCursorPosition(nextCommand.length);
      playTerminalTone("keypress");
    } else if (event.key === "ArrowLeft") {
      setCursorPosition((position) => Math.max(0, position - 1));
    } else if (event.key === "ArrowRight") {
      setCursorPosition((position) => Math.min(commandDraft.length, position + 1));
    } else if (event.key === "Home") {
      setCursorPosition(0);
    } else if (event.key === "End") {
      setCursorPosition(commandDraft.length);
    } else if (event.key === "Backspace") {
      if (cursorPosition > 0) {
        setCommandDraft((draft) => draft.slice(0, cursorPosition - 1) + draft.slice(cursorPosition));
        setCursorPosition((position) => position - 1);
        playTerminalTone("keypress");
      }
    } else if (event.key === "Delete") {
      setCommandDraft((draft) => draft.slice(0, cursorPosition) + draft.slice(cursorPosition + 1));
      playTerminalTone("keypress");
    } else if (event.key === "Enter") {
      executeInteractiveCommand();
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      setCommandDraft(
        (draft) => draft.slice(0, cursorPosition) + event.key + draft.slice(cursorPosition)
      );
      setCursorPosition((position) => position + 1);
      playTerminalTone("keypress");
    }
  };

  useEffect(() => {
    if (!liveAnimationEnabled || isInteractive) return;
    if (typedChars < currentStep.command.length) {
      const timer = setTimeout(() => {
        setTypedChars((prev) => prev + 1);
        if (typedChars % 3 === 0) playTerminalTone("keypress");
      }, 32);
      return () => clearTimeout(timer);
    }

    if (visibleOutputsCount < currentStep.outputs.length) {
      const timer = setTimeout(() => {
        setVisibleOutputsCount((prev) => prev + 1);
        playTerminalTone("output");
      }, 200);
      return () => clearTimeout(timer);
    }

    const nextTimer = setTimeout(() => {
      setHistory((prev) => {
        const next = [
          ...prev,
          {
            prompt: currentStep.prompt,
            command: currentStep.command,
            outputs: currentStep.outputs,
          },
        ];
        return next.slice(-2);
      });

      if (stepIndex < workspaceTerminalFrames.length - 1) {
        const nextStepIdx = stepIndex + 1;
        const targetRef = nextStepIdx === 1 ? commitChipRef.current : deployChipRef.current;
        const chipName = nextStepIdx === 1 ? "git commit" : "cloudlab deploy";

        if (autoCursorEnabled && !isUserHovering && targetRef) {
          triggerVirtualClickOnElement(targetRef, chipName, () => {
            setStepIndex(nextStepIdx);
            setTypedChars(0);
            setVisibleOutputsCount(0);
          });
        } else {
          setStepIndex(nextStepIdx);
          setTypedChars(0);
          setVisibleOutputsCount(0);
        }
      } else {
        // Finished all 3 frames!
        // Virtual cursor clicks the copy button
        if (autoCursorEnabled && !isUserHovering && copyBtnRef.current) {
          triggerVirtualClickOnElement(copyBtnRef.current, "copy", async () => {
            try {
              await navigator.clipboard.writeText("npx cloudlab dev");
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              // Ignore clipboard permissions
            }
          });
        }

        const resetTimer = setTimeout(() => {
          const restartRef = restartChipRef.current || pnpmChipRef.current;
          if (autoCursorEnabled && !isUserHovering && restartRef) {
            triggerVirtualClickOnElement(restartRef, "restart", () => {
              setHistory([]);
              setStepIndex(0);
              setTypedChars(0);
              setVisibleOutputsCount(0);
              playTerminalTone("complete");
            });
          } else {
            setHistory([]);
            setStepIndex(0);
            setTypedChars(0);
            setVisibleOutputsCount(0);
            playTerminalTone("complete");
          }
        }, 3400);
        return () => clearTimeout(resetTimer);
      }
    }, 1500);

    return () => clearTimeout(nextTimer);
  }, [
    typedChars,
    visibleOutputsCount,
    stepIndex,
    currentStep,
    liveAnimationEnabled,
    autoCursorEnabled,
    isUserHovering,
    isInteractive,
  ]);

  const runCustomCommand = (cmd: string) => {
    setIsInteractive(false);
    setLiveAnimationEnabled(true);
    const matchingIdx = workspaceTerminalFrames.findIndex((s) => s.command.includes(cmd));
    if (matchingIdx !== -1) {
      setStepIndex(matchingIdx);
      setTypedChars(0);
      setVisibleOutputsCount(0);
    }
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText("npx cloudlab dev");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((enabled) => {
      const nextEnabled = !enabled;
      if (nextEnabled) playTerminalTone("output");
      return nextEnabled;
    });
  };

  return (
    <div
      ref={terminalRef}
      className={`terminal-view ${isInteractive ? "is-interactive" : ""}`}
      role="tabpanel"
      tabIndex={0}
      onKeyDown={handleTerminalKeyDown}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button")) enterInteractiveMode();
      }}
      onMouseEnter={() => {
        setIsUserHovering(true);
        if (userHoverTimeoutRef.current) clearTimeout(userHoverTimeoutRef.current);
      }}
      onMouseLeave={() => {
        if (userHoverTimeoutRef.current) clearTimeout(userHoverTimeoutRef.current);
        userHoverTimeoutRef.current = setTimeout(() => {
          setIsUserHovering(false);
        }, 2200);
      }}
    >
      {/* Animated Virtual Mouse Cursor Layer (Railway-Style Auto-Pilot) */}
      {autoCursorEnabled && !isInteractive && (
        <div className="terminal-virtual-cursor-layer" aria-hidden="true">
          {clickRipples.map((ripple) => (
            <div
              key={ripple.id}
              className="terminal-virtual-cursor__ripple"
              style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
            />
          ))}
          <div
            className={`terminal-virtual-cursor ${isUserHovering ? "is-hidden" : ""} ${
              virtualCursor.isClicking ? "is-clicking" : ""
            }`}
            style={{
              transform: `translate3d(${virtualCursor.x}px, ${virtualCursor.y}px, 0)`,
            }}
          >
            <svg
              className="terminal-virtual-cursor__svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.85 2.85a.5.5 0 0 0-.35.36z"
                fill="#0b1210"
                stroke="#c8ff55"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <div className="terminal-virtual-cursor__badge">
              <span className="terminal-virtual-cursor__badge-dot" />
              <span>{virtualCursor.label}</span>
            </div>
          </div>
        </div>
      )}

      <div className="terminal-view__header">
        <div className="terminal-view__titlebar">
          <span className="terminal-view__traffic" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="terminal-view__tab">
            <Terminal size={12} /> cloudlab / acme-dashboard
          </span>
        </div>
        <div className="terminal-view__meta">
          <span className="terminal-view__live">
            <i /> LIVE
          </span>
          <span>bash · NVMe Node.js v20</span>
        </div>
      </div>
      <div className="terminal-view__toolbar">
        <span className="terminal-view__path">
          <span>~/</span>acme-dashboard
        </span>
        <div className="terminal-view__toolbar-actions">
          <button
            type="button"
            className="terminal-control-button"
            onClick={() => setAutoCursorEnabled((enabled) => !enabled)}
            aria-pressed={autoCursorEnabled}
            title={autoCursorEnabled ? "Disable auto cursor demo" : "Enable auto cursor demo"}
          >
            {autoCursorEnabled ? <MousePointer size={11} /> : <MousePointerClick size={11} />}
            {autoCursorEnabled ? "AUTO CURSOR" : "MANUAL"}
          </button>
          <button
            type="button"
            className="terminal-control-button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            title={soundEnabled ? "Mute terminal sounds" : "Enable terminal sounds"}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            {soundEnabled ? "SOUND ON" : "SOUND OFF"}
          </button>
          <button
            type="button"
            className="terminal-control-button"
            onClick={() => setLiveAnimationEnabled((enabled) => !enabled)}
            aria-pressed={liveAnimationEnabled}
            title={liveAnimationEnabled ? "Pause live animation" : "Resume live animation"}
          >
            {liveAnimationEnabled ? <Pause size={11} /> : <Play size={11} />}
            {liveAnimationEnabled ? "LIVE" : "PAUSED"}
          </button>
          <span className="terminal-view__connection">
            <Radio size={11} /> P2P SYNC <b>8ms</b>
          </span>
        </div>
      </div>
      <div className="terminal-view__output">
        {history.map((item, idx) => (
          <div key={`ws-hist-${idx}`} className="terminal-log-group">
            <p>
              <span className="terminal-muted">{item.prompt}</span>{" "}
              <span className="terminal-prompt">$</span>{" "}
              <span className="terminal-command-text">{item.command}</span>
            </p>
            {item.outputs.map((out, outIdx) => (
              <p
                key={`ws-hist-out-${idx}-${outIdx}`}
                className={`terminal-output-line terminal-output--${out.type || "dim"}`}
              >
                {out.text}
              </p>
            ))}
          </div>
        ))}

        <div className="terminal-log-group">
          <p>
            <span className="terminal-muted">{currentStep.prompt}</span>{" "}
            <span className="terminal-prompt">$</span>{" "}
            {isInteractive ? (
              <span className="terminal-command-text terminal-command-input">
                {commandDraft.slice(0, cursorPosition)}
                <span className="terminal-cursor" />
                {commandDraft.slice(cursorPosition)}
              </span>
            ) : (
              <>
                <span className="terminal-command-text">
                  {currentStep.command.slice(0, typedChars)}
                </span>
                <span className="terminal-cursor" />
              </>
            )}
          </p>
          {!isInteractive &&
            currentStep.outputs.slice(0, visibleOutputsCount).map((out, outIdx) => (
              <p
                key={`ws-curr-out-${outIdx}`}
                className={`terminal-output-line terminal-output--${out.type || "dim"}`}
              >
                {out.text}
              </p>
            ))}
        </div>
      </div>

      <div className="terminal-view__quick-actions">
        <span className="hero-tag">
          <Zap size={11} /> Quick Run:
        </span>
        <button
          ref={pnpmChipRef}
          type="button"
          className={`terminal-quick-chip ${
            virtualCursor.activeChip === "pnpm dev"
              ? virtualCursor.isClicking
                ? "is-virtual-pressed"
                : "is-virtual-hovered"
              : ""
          }`}
          onClick={() => runCustomCommand("pnpm dev")}
        >
          pnpm dev
        </button>
        <button
          ref={commitChipRef}
          type="button"
          className={`terminal-quick-chip ${
            virtualCursor.activeChip === "git commit"
              ? virtualCursor.isClicking
                ? "is-virtual-pressed"
                : "is-virtual-hovered"
              : ""
          }`}
          onClick={() => runCustomCommand("git commit")}
        >
          git commit
        </button>
        <button
          ref={deployChipRef}
          type="button"
          className={`terminal-quick-chip ${
            virtualCursor.activeChip === "cloudlab deploy"
              ? virtualCursor.isClicking
                ? "is-virtual-pressed"
                : "is-virtual-hovered"
              : ""
          }`}
          onClick={() => runCustomCommand("cloudlab deploy")}
        >
          cloudlab deploy
        </button>
        <button
          ref={restartChipRef}
          type="button"
          className={`terminal-quick-chip ${
            virtualCursor.activeChip === "restart"
              ? virtualCursor.isClicking
                ? "is-virtual-pressed"
                : "is-virtual-hovered"
              : ""
          }`}
          onClick={() => {
            setIsInteractive(false);
            setLiveAnimationEnabled(true);
            setCommandDraft("");
            setCursorPosition(0);
            setCommandHistoryIndex(-1);
            setHistory([]);
            setStepIndex(0);
            setTypedChars(0);
            setVisibleOutputsCount(0);
          }}
        >
          ↺ Restart loop
        </button>
        <span className="terminal-key-hint">
          <kbd>↑</kbd>
          <kbd>↓</kbd> history <kbd>←</kbd>
          <kbd>→</kbd> cursor <kbd>Enter</kbd> run
        </span>
      </div>

      <div className="terminal-view__command">
        <span className="terminal-view__command-prompt">$</span>
        <code>npx cloudlab dev</code>
        <span className="terminal-view__command-state">
          <i /> ready
        </span>
        <button
          ref={copyBtnRef}
          type="button"
          className={virtualCursor.activeChip === "copy" ? "is-virtual-pressed" : ""}
          onClick={copyCommand}
          aria-label="Copy CloudLab command"
        >
          {copied ? <Check size={14} className="text-mint" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

type WorkflowStageId = "microvm" | "editor" | "terminal" | "mesh" | "preview";

interface WorkflowStage {
  id: WorkflowStageId;
  stepNumber: string;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const workflowStages: WorkflowStage[] = [
  {
    id: "microvm",
    stepNumber: "01",
    title: "MicroVM Sandboxing",
    subtitle: "Isolated rootless Linux container with 140ms cold start",
    tagline: "2 vCPU · 2.4GB RAM · NVMe",
    badge: "CORE RUNTIME",
    icon: Cpu,
  },
  {
    id: "editor",
    stepNumber: "02",
    title: "Multiplayer CRDT Editor",
    subtitle: "Sub-50ms peer replication with live multi-cursors & presence",
    tagline: "Zero Merge Conflicts",
    badge: "P2P SYNC",
    icon: Code2,
  },
  {
    id: "terminal",
    stepNumber: "03",
    title: "Live Turbo Terminal",
    subtitle: "PTY bash multiplexing with hot reload output stream",
    tagline: "Instant Dev Feedback",
    badge: "BASH & TURBO",
    icon: Terminal,
  },
  {
    id: "mesh",
    stepNumber: "04",
    title: "Visual Mesh & DB Canvas",
    subtitle: "Interconnected microservices with real-time telemetry",
    tagline: "Live Infrastructure Graph",
    badge: "CANVAS MESH",
    icon: Network,
  },
  {
    id: "preview",
    stepNumber: "05",
    title: "Global Edge Deployment",
    subtitle: "Instant public HTTPS URL with automatic wildcard SSL",
    tagline: "1-Click Production URL",
    badge: "EDGE CLOUD",
    icon: Globe2,
  },
];

interface CanvasNode {
  id: string;
  name: string;
  role: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  status: "active" | "synced" | "connected";
  port?: string;
  metrics: {
    cpu: string;
    ram: string;
    latency: string;
    throughput: string;
  };
  details: string;
}

const canvasNodes: Record<string, CanvasNode> = {
  frontend: {
    id: "frontend",
    name: "Next.js 15 Web Service",
    role: "Fullstack App & UI Engine",
    icon: Cloud,
    status: "active",
    port: "Port 3000",
    metrics: { cpu: "8.4%", ram: "340MB", latency: "14ms", throughput: "48 req/s" },
    details: "Server components, streaming SSR, and Turbopack compiler running in rootless container.",
  },
  crdt: {
    id: "crdt",
    name: "Yjs CRDT Collab Engine",
    role: "P2P Realtime Replication",
    icon: Users,
    status: "synced",
    port: "WebSocket /collaboration",
    metrics: { cpu: "3.2%", ram: "128MB", latency: "8ms", throughput: "3 online peers" },
    details: "Sub-50ms keystroke replication with Google Docs-style multi-cursor sync.",
  },
  postgres: {
    id: "postgres",
    name: "Neon Serverless Postgres",
    role: "Prisma Managed Database",
    icon: Database,
    status: "connected",
    port: "Port 5432 (SSL Pooled)",
    metrics: { cpu: "4.1%", ram: "512MB", latency: "18ms", throughput: "12 active pool conn" },
    details: "Instant autoscaling PostgreSQL instance with branch-based preview schemas.",
  },
  worker: {
    id: "worker",
    name: "Async Background Worker",
    role: "BullMQ & Redis Task Queue",
    icon: Cpu,
    status: "active",
    port: "Queue: default",
    metrics: { cpu: "2.8%", ram: "180MB", latency: "5ms", throughput: "0 backlog" },
    details: "Handles heavy async jobs, automated build artifacts, and scheduled webhook triggers.",
  },
  edge: {
    id: "edge",
    name: "Global Edge CDN Proxy",
    role: "Wildcard SSL & Anycast DNS",
    icon: Globe2,
    status: "active",
    port: "https://*.cloudlab.run",
    metrics: { cpu: "1.2%", ram: "96MB", latency: "22ms global", throughput: "100% Cache Hit" },
    details: "Automatic SSL/TLS provisioning with instant global edge routing.",
  },
};

function WorkspacePreview() {
  const [activeStage, setActiveStage] = useState<WorkflowStageId>("microvm");
  const [isPlaying, setIsPlaying] = useState(true);
  const [stageProgress, setStageProgress] = useState(0);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>("frontend");
  const [meshTilt, setMeshTilt] = useState({ x: 0, y: 0 });

  const stageDurationMs = 6500;
  const tickIntervalMs = 65;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) {
          // Advance to next stage smoothly
          setActiveStage((current) => {
            const currentIndex = workflowStages.findIndex((s) => s.id === current);
            const nextIndex = (currentIndex + 1) % workflowStages.length;
            return workflowStages[nextIndex].id;
          });
          return 0;
        }
        return prev + (tickIntervalMs / stageDurationMs) * 100;
      });
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStageSelect = (stageId: WorkflowStageId) => {
    setActiveStage(stageId);
    setStageProgress(0);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setActiveStage("microvm");
    setStageProgress(0);
    setIsPlaying(true);
  };

  const handleMeshPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setMeshTilt({ x: Number((y * -5).toFixed(2)), y: Number((x * 5).toFixed(2)) });
  };

  const resetMeshTilt = () => setMeshTilt({ x: 0, y: 0 });

  const selectNodeWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>, nodeKey: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedNodeKey(nodeKey);
    }
  };

  const selectedNode = canvasNodes[selectedNodeKey] || canvasNodes.frontend;
  const currentStageObj = workflowStages.find((s) => s.id === activeStage) || workflowStages[0];

  return (
    <div id="workspace" className="railway-workflow-canvas">
      {/* Video-Like Scrubber Timeline Header */}
      <div className="workflow-player-header">
        <div className="workflow-player-controls">
          <button
            type="button"
            className={`workflow-play-btn ${isPlaying ? "is-playing" : ""}`}
            onClick={handleTogglePlay}
            title={isPlaying ? "Pause automated tour" : "Play automated tour"}
            aria-label={isPlaying ? "Pause automated tour" : "Play automated tour"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="play-icon-offset" />}
            <span>{isPlaying ? "PAUSE TOUR" : "PLAY TOUR"}</span>
          </button>
          <button
            type="button"
            className="workflow-restart-btn"
            onClick={handleRestart}
            title="Restart tour from Step 01"
            aria-label="Restart tour"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* 5 Step Pills with Progress Bar */}
        <div className="workflow-timeline-pills" role="tablist" aria-label="Interactive workflow stages">
          {workflowStages.map((stage) => {
            const isActive = activeStage === stage.id;
            const StageIcon = stage.icon;

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                key={stage.id}
                className={`workflow-timeline-pill ${isActive ? "is-active" : ""}`}
                onClick={() => handleStageSelect(stage.id)}
              >
                {isActive && (
                  <div
                    className="workflow-timeline-pill__progress"
                    style={{ width: `${stageProgress}%` }}
                  />
                )}
                <span className="workflow-timeline-pill__icon">
                  <StageIcon size={14} />
                </span>
                <div className="workflow-timeline-pill__meta">
                  <span className="workflow-timeline-pill__num">{stage.stepNumber}</span>
                  <strong className="workflow-timeline-pill__title">{stage.title}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Canvas Container */}
      <div className="workspace-shell railway-shell">
        <div className="workspace-shell__bar">
          <div className="window-controls" aria-hidden="true">
            <span className="window-controls__dot window-controls__dot--red" />
            <span className="window-controls__dot window-controls__dot--yellow" />
            <span className="window-controls__dot window-controls__dot--green" />
          </div>
          <div className="workspace-shell__path">
            <span className="workspace-shell__path-dot" />
            cloudlab / {currentStageObj.title.toLowerCase().replace(/\s+/g, "-")}
          </div>
          <div className="workspace-shell__live">
            <span /> {currentStageObj.badge}
          </div>
        </div>

        {/* Stage Sub-Navigation Tabs */}
        <div className="workspace-shell__tabs" role="tablist" aria-label="Workspace view modes">
          {workflowStages.map((stage) => {
            const StageIcon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                key={`tab-${stage.id}`}
                className={`workspace-shell__tab ${isActive ? "is-active" : ""}`}
                onClick={() => handleStageSelect(stage.id)}
              >
                <StageIcon size={13} />
                <span>{stage.title}</span>
              </button>
            );
          })}
          <div className="workspace-shell__tab-spacer" />
          <span className="workspace-shell__collaborators">
            <span /> 3 teammates connected
          </span>
        </div>

        {/* Stage Body Views */}
        <div className="workspace-shell__body">
          {/* ===================================================
              STAGE 01: MICROVM SANDBOXING
             =================================================== */}
          {activeStage === "microvm" && (
            <div className="microvm-view" role="tabpanel">
              <div className="microvm-grid">
                <div className="microvm-specs">
                  <div className="microvm-badge">
                    <Cpu size={14} /> DEDICATED ROOTLESS MICROVM
                  </div>
                  <h3>Isolated Firecracker Linux Sandbox</h3>
                  <p>
                    Every CloudLab project launches in a dedicated, hardware-isolated microVM container.
                    Dependencies, memory heaps, and system sockets never leak between tenants.
                  </p>

                  <div className="microvm-metrics-cards">
                    <div className="microvm-metric-card">
                      <span className="microvm-metric-card__label">BOOT LATENCY</span>
                      <strong>140ms</strong>
                      <small className="text-mint">⚡ Sub-second start</small>
                    </div>
                    <div className="microvm-metric-card">
                      <span className="microvm-metric-card__label">COMPUTE CORES</span>
                      <strong>2 vCPU</strong>
                      <small>Burstable x86_64</small>
                    </div>
                    <div className="microvm-metric-card">
                      <span className="microvm-metric-card__label">MEMORY ALLOCATION</span>
                      <strong>2.4 GB</strong>
                      <small>Isolated RAM</small>
                    </div>
                    <div className="microvm-metric-card">
                      <span className="microvm-metric-card__label">NVME STORAGE</span>
                      <strong>10 GB</strong>
                      <small>Persistent Cache</small>
                    </div>
                  </div>

                  <div className="microvm-security-tags">
                    <span className="hero-tag"><ShieldCheck size={12} /> Rootless Sandbox</span>
                    <span className="hero-tag"><LockKeyhole size={12} /> AES-256 Volume</span>
                    <span className="hero-tag"><Zap size={12} /> Fast Snapshotting</span>
                  </div>
                </div>

                <div className="microvm-boot-terminal">
                  <div className="microvm-boot-terminal__header">
                    <span>CONTAINER BOOT STREAM (INIT)</span>
                    <span className="text-mint">● READY</span>
                  </div>
                  <pre className="microvm-boot-terminal__code">
                    <code>{`[0.002s] ⚡ Initializing isolated Firecracker microVM instance...
[0.018s] 🔒 Mounting rootless unprivileged container namespace (uid: 1001)
[0.042s] 💾 Attached 10GB NVMe storage volume (ext4 filesystem)
[0.086s] 📦 Restored node_modules global cache (48 packages in 44ms)
[0.120s] 🌐 Socket tunnel established on virtual tap0 (10.0.0.2/24)
[0.140s] ✔ MicroVM sandbox ready in 140ms. Spawning bash session.`}</code>
                  </pre>
                  <div className="microvm-boot-terminal__action">
                    <button
                      type="button"
                      className="button button--primary button--small"
                      onClick={() => handleStageSelect("editor")}
                    >
                      Next: Open CRDT Editor <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              STAGE 02: MULTIPLAYER CRDT EDITOR
             =================================================== */}
          {activeStage === "editor" && (
            <div className="editor-view" role="tabpanel">
              <aside className="editor-tree">
                <div className="editor-tree__title">EXPLORER</div>
                <div className="editor-tree__workspace">
                  <ChevronDown size={13} /> ACME-DASHBOARD
                </div>
                <div className="editor-tree__file is-selected">
                  <Code2 size={13} /> app.tsx
                </div>
                <div className="editor-tree__file">
                  <Circle size={11} /> package.json
                </div>
                <div className="editor-tree__file">
                  <Circle size={11} /> styles.css
                </div>
                <div className="editor-tree__file">
                  <Circle size={11} /> README.md
                </div>
                <div className="editor-tree__branch">
                  <GitBranch size={12} /> main (up to date)
                </div>
              </aside>

              <div className="editor-code">
                <div className="editor-code__topline">
                  <div className="editor-code__file-badge">
                    <span>app.tsx</span>
                    <span className="editor-code__diff-pill">+42 -0</span>
                  </div>
                  <span className="text-mint">CRDT sync active · 8ms latency</span>
                </div>
                <div className="editor-code__content">
                  {codeLines.map((line, index) => (
                    <div className="editor-code__line" key={`${index}-${line.join("")}`}>
                      <span className="editor-code__number">{String(index + 1).padStart(2, "0")}</span>
                      <code>
                        {line.map((part, partIndex) => {
                          const colorClass =
                            part.includes("const") || part.includes("await")
                              ? "syntax-keyword"
                              : part.includes("workspace") || part.includes("cloudlab")
                              ? "syntax-name"
                              : part.includes('"')
                              ? "syntax-string"
                              : "syntax-muted";
                          return (
                            <span className={colorClass} key={`${part}-${partIndex}`}>
                              {part}
                            </span>
                          );
                        })}
                      </code>
                    </div>
                  ))}
                  <div className="editor-code__cursor" />

                  {/* Collaborative Remote Cursors Floating Flags */}
                  <div className="editor-collaborator-cursor editor-collaborator-cursor--maya">
                    <span className="editor-collaborator-cursor__flag">Maya (editing app.tsx)</span>
                  </div>
                  <div className="editor-collaborator-cursor editor-collaborator-cursor--leo">
                    <span className="editor-collaborator-cursor__flag">Leo (routes.ts)</span>
                  </div>
                </div>
              </div>

              <aside className="editor-inspector">
                <div className="editor-inspector__title">PEER PRESENCE</div>
                <div className="activity-item">
                  <span className="activity-avatar activity-avatar--pink">M</span>
                  <p>
                    <strong>Maya</strong> edited <b>app.tsx</b>
                    <small>Real-time cursor on line 4</small>
                  </p>
                </div>
                <div className="activity-item">
                  <span className="activity-avatar activity-avatar--blue">L</span>
                  <p>
                    <strong>Leo</strong> editing <b>api/routes.ts</b>
                    <small>Sub-50ms Yjs sync</small>
                  </p>
                </div>
                <div className="activity-item">
                  <span className="activity-avatar activity-avatar--yellow">A</span>
                  <p>
                    <strong>Amir</strong> review approved
                    <small>Ready to deploy</small>
                  </p>
                </div>

                <div className="editor-inspector__quick-jump">
                  <button
                    type="button"
                    className="button button--ghost button--small w-full"
                    onClick={() => handleStageSelect("terminal")}
                  >
                    Run in Terminal <Terminal size={12} />
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ===================================================
              STAGE 03: LIVE TURBO TERMINAL
             =================================================== */}
          {activeStage === "terminal" && <WorkspaceTerminal />}

          {/* ===================================================
              STAGE 04: VISUAL MESH & DATABASE CANVAS (RAILWAY STYLE)
             =================================================== */}
          {activeStage === "mesh" && (
            <div
              className="mesh-canvas-view"
              role="tabpanel"
              onPointerMove={handleMeshPointerMove}
              onPointerLeave={resetMeshTilt}
              style={{ "--mesh-rotate-x": `${meshTilt.x}deg`, "--mesh-rotate-y": `${meshTilt.y}deg` } as React.CSSProperties}
            >
              <div className="mesh-canvas-layout">
                {/* SVG Visual Interconnected Canvas */}
                <div className="mesh-canvas-area" aria-label="Visual Infrastructure Canvas">
                  <div className="mesh-canvas-bg-grid" />

                  {/* SVG Animated Connector Pipes */}
                  <svg className="mesh-canvas-svg" viewBox="0 0 680 400" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#c8ff55" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#9e8cff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                      </linearGradient>
                      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Cables Connecting Nodes with animated stroke flow */}
                    <path
                      d="M 170 100 C 250 100, 270 70, 360 70"
                      className="mesh-cable mesh-cable--animated"
                      filter="url(#glowEffect)"
                    />
                    <path
                      d="M 170 110 C 250 110, 270 290, 360 290"
                      className="mesh-cable mesh-cable--animated"
                      filter="url(#glowEffect)"
                    />
                    <path
                      d="M 170 120 C 170 200, 150 250, 170 310"
                      className="mesh-cable mesh-cable--animated"
                    />
                    <path
                      d="M 480 70 C 530 70, 530 170, 560 170"
                      className="mesh-cable mesh-cable--animated"
                      filter="url(#glowEffect)"
                    />
                    <path
                      d="M 480 290 C 530 290, 530 190, 560 190"
                      className="mesh-cable mesh-cable--animated"
                    />
                    <circle className="mesh-packet mesh-packet--mint" r="3">
                      <animateMotion dur="2.8s" repeatCount="indefinite" path="M 170 100 C 250 100, 270 70, 360 70" />
                    </circle>
                    <circle className="mesh-packet mesh-packet--violet" r="3">
                      <animateMotion dur="3.6s" begin="-.8s" repeatCount="indefinite" path="M 170 110 C 250 110, 270 290, 360 290" />
                    </circle>
                    <circle className="mesh-packet mesh-packet--sky" r="3">
                      <animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite" path="M 480 70 C 530 70, 530 170, 560 170" />
                    </circle>
                  </svg>

                  {/* Interactive Nodes Placed in Canvas */}
                  <div
                    className={`canvas-node-card canvas-node-card--frontend ${
                      selectedNodeKey === "frontend" ? "is-selected" : ""
                    }`}
                    style={{ left: "20px", top: "60px" }}
                    onClick={() => setSelectedNodeKey("frontend")}
                    onKeyDown={(event) => selectNodeWithKeyboard(event, "frontend")}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedNodeKey === "frontend"}
                  >
                    <div className="canvas-node-card__top">
                      <Cloud size={16} className="text-mint" />
                      <span className="canvas-node-card__tag">Next.js 15</span>
                      <span className="canvas-node-card__dot" />
                    </div>
                    <strong>Frontend & API</strong>
                    <small>Port 3000 · 48 req/s</small>
                  </div>

                  <div
                    className={`canvas-node-card canvas-node-card--crdt ${
                      selectedNodeKey === "crdt" ? "is-selected" : ""
                    }`}
                    style={{ left: "330px", top: "30px" }}
                    onClick={() => setSelectedNodeKey("crdt")}
                    onKeyDown={(event) => selectNodeWithKeyboard(event, "crdt")}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedNodeKey === "crdt"}
                  >
                    <div className="canvas-node-card__top">
                      <Users size={16} className="text-violet" />
                      <span className="canvas-node-card__tag">CRDT Yjs</span>
                      <span className="canvas-node-card__dot canvas-node-card__dot--violet" />
                    </div>
                    <strong>Collab Engine</strong>
                    <small>3 peers · 8ms sync</small>
                  </div>

                  <div
                    className={`canvas-node-card canvas-node-card--postgres ${
                      selectedNodeKey === "postgres" ? "is-selected" : ""
                    }`}
                    style={{ left: "330px", top: "250px" }}
                    onClick={() => setSelectedNodeKey("postgres")}
                    onKeyDown={(event) => selectNodeWithKeyboard(event, "postgres")}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedNodeKey === "postgres"}
                  >
                    <div className="canvas-node-card__top">
                      <Database size={16} className="text-sky" />
                      <span className="canvas-node-card__tag">Neon DB</span>
                      <span className="canvas-node-card__dot canvas-node-card__dot--sky" />
                    </div>
                    <strong>PostgreSQL Serverless</strong>
                    <small>Port 5432 · Pooled SSL</small>
                  </div>

                  <div
                    className={`canvas-node-card canvas-node-card--worker ${
                      selectedNodeKey === "worker" ? "is-selected" : ""
                    }`}
                    style={{ left: "30px", top: "270px" }}
                    onClick={() => setSelectedNodeKey("worker")}
                    onKeyDown={(event) => selectNodeWithKeyboard(event, "worker")}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedNodeKey === "worker"}
                  >
                    <div className="canvas-node-card__top">
                      <Cpu size={16} className="text-orange" />
                      <span className="canvas-node-card__tag">Worker</span>
                      <span className="canvas-node-card__dot canvas-node-card__dot--orange" />
                    </div>
                    <strong>Async Task Queue</strong>
                    <small>BullMQ · 0 backlog</small>
                  </div>

                  <div
                    className={`canvas-node-card canvas-node-card--edge ${
                      selectedNodeKey === "edge" ? "is-selected" : ""
                    }`}
                    style={{ left: "520px", top: "135px" }}
                    onClick={() => setSelectedNodeKey("edge")}
                    onKeyDown={(event) => selectNodeWithKeyboard(event, "edge")}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedNodeKey === "edge"}
                  >
                    <div className="canvas-node-card__top">
                      <Globe2 size={16} className="text-mint" />
                      <span className="canvas-node-card__tag">Edge SSL</span>
                      <span className="canvas-node-card__dot" />
                    </div>
                    <strong>Global CDN</strong>
                    <small>Wildcard *.cloudlab.run</small>
                  </div>
                </div>

                {/* Node Telemetry Inspector Sidebar */}
                <aside className="mesh-inspector-panel">
                  <div className="mesh-inspector-header">
                    <span className="mesh-inspector-badge">
                      <Activity size={12} /> LIVE NODE TELEMETRY
                    </span>
                    <h3>{selectedNode.name}</h3>
                    <p>{selectedNode.details}</p>
                  </div>

                  <div className="mesh-inspector-stats">
                    <div className="mesh-stat-row">
                      <span>Service Status</span>
                      <strong className="text-mint">● {selectedNode.status.toUpperCase()}</strong>
                    </div>
                    <div className="mesh-stat-row">
                      <span>Port / Endpoint</span>
                      <code>{selectedNode.port}</code>
                    </div>
                    <div className="mesh-stat-row">
                      <span>CPU Utilization</span>
                      <strong>{selectedNode.metrics.cpu}</strong>
                    </div>
                    <div className="mesh-stat-row">
                      <span>RAM Allocation</span>
                      <strong>{selectedNode.metrics.ram}</strong>
                    </div>
                    <div className="mesh-stat-row">
                      <span>P99 Latency</span>
                      <strong className="text-mint">{selectedNode.metrics.latency}</strong>
                    </div>
                    <div className="mesh-stat-row">
                      <span>Throughput</span>
                      <strong>{selectedNode.metrics.throughput}</strong>
                    </div>
                  </div>

                  <div className="mesh-inspector-footer">
                    <button
                      type="button"
                      className="button button--primary button--small w-full"
                      onClick={() => handleStageSelect("preview")}
                    >
                      Next: View Live Production URL <ArrowRight size={13} />
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* ===================================================
              STAGE 05: GLOBAL EDGE DEPLOYMENT & LIVE PREVIEW
             =================================================== */}
          {activeStage === "preview" && (
            <div className="preview-view" role="tabpanel">
              <div className="preview-view__browserbar">
                <span className="preview-view__lock" title="SSL Certificate Valid">
                  <LockKeyhole size={12} />
                </span>
                <span className="preview-view__url">https://acme-dashboard.cloudlab.run</span>
                <a
                  href="https://acme-dashboard.cloudlab.run"
                  target="_blank"
                  rel="noreferrer"
                  className="preview-view__reload"
                  title="Open live preview in new tab"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
              <div className="preview-view__canvas">
                <div className="preview-view__nav">
                  <strong>
                    acme<span>+</span>
                  </strong>
                  <span>Overview</span>
                  <span>Projects</span>
                  <span>Team</span>
                  <span className="preview-view__avatar">M</span>
                </div>
                <div className="preview-view__hero">
                  <span className="preview-view__kicker">LIVE PRODUCTION DEPLOYMENT</span>
                  <h3>Good morning, Maya.</h3>
                  <p>All microservices synced & operating with 100% health score.</p>
                </div>
                <div className="preview-view__cards">
                  <div>
                    <span>Active users</span>
                    <strong>1,240</strong>
                    <small>↑ 28% today</small>
                  </div>
                  <div>
                    <span>Deployments</span>
                    <strong>48 / 48</strong>
                    <small className="text-mint">100% successful</small>
                  </div>
                  <div>
                    <span>Global Latency</span>
                    <strong>18ms</strong>
                    <small className="text-mint">Sub-50ms worldwide</small>
                  </div>
                </div>

                <div className="preview-view__lighthouse-strip">
                  <div className="lighthouse-chip">
                    <span className="lighthouse-score">100</span> Performance
                  </div>
                  <div className="lighthouse-chip">
                    <span className="lighthouse-score">100</span> Accessibility
                  </div>
                  <div className="lighthouse-chip">
                    <span className="lighthouse-score">100</span> Best Practices
                  </div>
                  <div className="lighthouse-chip">
                    <span className="lighthouse-score">100</span> SEO
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Shell Bottom Status Bar */}
        <div className="workspace-shell__status">
          <span>
            <Check size={13} /> Stage: {currentStageObj.title} ({currentStageObj.stepNumber}/05)
          </span>
          <span>
            MicroVM 2 vCPU · 2.4GB RAM <span className="status-divider">|</span> Neon PostgreSQL 15 <span className="status-divider">|</span> Wildcard SSL Live
          </span>
        </div>
      </div>
    </div>
  );
}


function FAQItem({
  question,
  answer,
  open,
  onClick,
}: {
  question: string;
  answer: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="faq-item__trigger"
        onClick={onClick}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="faq-item__icon">
          <ChevronDown size={17} />
        </span>
      </button>
      <div className="faq-item__answer">
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="cloudlab-home">
      {/* 3D Cinematic Particle Canvas & Atmospheric Nebula Grid */}
      <CinematicBackground />

      <header className="site-header">
        <div className="site-container site-header__inner">
          <Logo />
          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="site-header__actions">
            <ThemeToggle />
            <Link href="/sign-in" className="header-login">
              Log in
            </Link>
            <Link href="/sign-up" className="button button--small button--light">
              Start building <ArrowRight size={15} />
            </Link>
          </div>
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="mobile-menu">
            <div className="site-container">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </a>
              ))}
              <div className="mobile-menu__theme">
                <span>Appearance</span>
                <ThemeToggle />
              </div>
              <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="button button--light"
                onClick={() => setMobileOpen(false)}
              >
                Start building <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb--one" />
          <div className="hero-orb hero-orb--two" />
          <div className="site-container hero-section__inner">
            <div className="hero-copy">
              <div className="eyebrow-pill">
                <span className="eyebrow-pill__pulse" /> The cloud IDE for teams that ship
              </div>
              <h1>
                Build boldly.<br />
                <span>Ship from anywhere.</span>
              </h1>
              <p className="hero-copy__lead">
                CloudLab turns your browser into a complete development environment. Code,
                collaborate, and deploy in isolated workspaces built for momentum.
              </p>
              <div className="hero-copy__actions">
                <Link href="/sign-up" className="button button--primary button--large">
                  Get Started <ArrowRight size={17} />
                </Link>
                <a href="#workspace" className="button button--ghost button--large">
                  <span className="button-play">
                    <Play size={12} fill="currentColor" />
                  </span>{" "}
                  See how it works
                </a>
              </div>
              <div className="hero-proof">
                <div className="avatar-stack">
                  <span className="avatar avatar--lime">J</span>
                  <span className="avatar avatar--violet">A</span>
                  <span className="avatar avatar--orange">M</span>
                  <span className="avatar avatar--blue">+</span>
                </div>
                <p>
                  <strong>1,200+ builders</strong>
                  <br />
                  are already shipping in CloudLab
                </p>
              </div>
            </div>

            {/* UPGRADED 3D HERO TERMINAL */}
            <div className="hero-terminal-area">
              <HeroTerminal />
            </div>
          </div>

          <div className="site-container hero-metrics">
            <div>
              <strong>10×</strong>
              <span>faster to first commit</span>
            </div>
            <div>
              <strong>1.4s</strong>
              <span>instant microVM start</span>
            </div>
            <div>
              <strong>99.99%</strong>
              <span>workspace uptime SLA</span>
            </div>
            <div>
              <strong>0%</strong>
              <span>local battery & CPU drain</span>
            </div>
          </div>
        </section>

        {/* TECH STACK MARQUEE STRIP */}
        <TechStackMarquee />

        {/* WORKSPACE PREVIEW SECTION */}
        <section className="workspace-section site-section" id="product">
          <div className="site-container">
            <div className="section-intro section-intro--split">
              <div>
                <SectionLabel>THE WORKSPACE</SectionLabel>
                <h2>
                  Everything you need.<br />
                  <em>Nothing in your way.</em>
                </h2>
              </div>
              <p>
                One focused place for your editor, terminal, preview, and team. CloudLab makes the
                path from idea to shipped product feel short.
              </p>
            </div>
            <WorkspacePreview />
          </div>
        </section>

        {/* ARCHITECTURE DEEP-DIVE SECTION */}
        <ArchitectureSection />

        {/* BENCHMARK COMPARISON SECTION */}
        <BenchmarkSection />

        {/* FEATURE HIGHLIGHTS */}
        <section className="feature-section site-section">
          <div className="site-container">
            <div className="section-intro">
              <SectionLabel>WHY CLOUDLAB</SectionLabel>
              <h2>
                Less setup. More <em>shipping.</em>
              </h2>
              <p>
                Good tools disappear into the work. CloudLab gives your team the right foundation,
                then gets out of the way.
              </p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    className={`feature-card feature-card--${feature.accent}`}
                    key={feature.eyebrow}
                  >
                    <div className="feature-card__top">
                      <span className="feature-card__icon">
                        <Icon size={20} />
                      </span>
                      <span>{feature.eyebrow}</span>
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <a href="#workflow" className="text-link">
                      Explore the workflow <ArrowRight size={15} />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="workflow-section site-section" id="workflow">
          <div className="site-container">
            <div className="workflow-card">
              <div className="workflow-card__copy">
                <SectionLabel>THE FLOW</SectionLabel>
                <h2>
                  Idea to <em>internet</em> in three moves.
                </h2>
                <p>
                  CloudLab keeps your environment, your people, and your release loop connected from
                  the very first command.
                </p>
                <div className="workflow-steps">
                  <div className="workflow-step is-active">
                    <span>01</span>
                    <div>
                      <strong>Spin up</strong>
                      <p>Choose a template or bring your own GitHub repo.</p>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <span>02</span>
                    <div>
                      <strong>Build together</strong>
                      <p>Share the workspace and make progress live with CRDT sync.</p>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <span>03</span>
                    <div>
                      <strong>Ship it</strong>
                      <p>Preview, test, and deploy with 1-click wildcard SSL endpoints.</p>
                    </div>
                  </div>
                </div>
                <Link href="/sign-up" className="text-link text-link--bright">
                  Open a workspace <ArrowRight size={15} />
                </Link>
              </div>
              <div className="workflow-visual">
                <div className="workflow-visual__glow" />
                <div className="workflow-visual__window">
                  <div className="workflow-visual__top">
                    <span>
                      <i />
                      <i />
                      <i />
                    </span>
                    <small>cloudlab.run / preview</small>
                    <span>
                      <ExternalLink size={13} />
                    </span>
                  </div>
                  <div className="workflow-visual__content">
                    <div className="workflow-visual__badge">
                      <Sparkles size={14} /> LIVE PREVIEW
                    </div>
                    <h3>
                      Build something<br />
                      <span>worth sharing.</span>
                    </h3>
                    <div className="workflow-visual__bar">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="workflow-visual__footer">
                      <span>● deployed</span>
                      <b>cloudlab.run</b>
                    </div>
                  </div>
                </div>
                <div className="workflow-visual__float workflow-visual__float--a">
                  <Check size={13} /> changes synced
                </div>
                <div className="workflow-visual__float workflow-visual__float--b">
                  <Globe2 size={13} /> live preview
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY & ISOLATION SECTION */}
        <section className="security-section site-section" id="security">
          <div className="site-container">
            <div className="security-layout">
              <div className="security-copy">
                <SectionLabel>BUILT FOR TRUST</SectionLabel>
                <h2>
                  Your code stays<br />
                  <em>in your hands.</em>
                </h2>
                <p>
                  CloudLab gives every project a private, isolated place to run. Move fast without
                  treating security like a later problem.
                </p>
                <Link href="/sign-up" className="button button--outline">
                  Build securely <ArrowRight size={16} />
                </Link>
              </div>
              <div className="security-points">
                <div className="security-point">
                  <span className="security-point__icon">
                    <LockKeyhole size={18} />
                  </span>
                  <div>
                    <h3>Isolated microVMs</h3>
                    <p>
                      Every project runs in its own hardware-isolated container with scoped
                      dependencies and encrypted storage.
                    </p>
                  </div>
                </div>
                <div className="security-point">
                  <span className="security-point__icon">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h3>Safe by default</h3>
                    <p>
                      Server-side validation, protected routes, and sensible permissions are part
                      of the foundation.
                    </p>
                  </div>
                </div>
                <div className="security-point">
                  <span className="security-point__icon">
                    <Server size={18} />
                  </span>
                  <div>
                    <h3>Made to scale</h3>
                    <p>
                      Go from a solo prototype to a team workspace without rebuilding your
                      toolchain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="pricing-section site-section" id="pricing">
          <div className="site-container">
            <div className="section-intro">
              <SectionLabel>START SMALL, SHIP BIG</SectionLabel>
              <h2>
                A better place to <em>begin.</em>
              </h2>
              <p>Everything you need to discover the CloudLab workflow is ready to try.</p>
            </div>
            <div className="pricing-card">
              <div>
                <span className="pricing-card__eyebrow">EARLY ACCESS</span>
                <h3>Build without the busywork.</h3>
                <p>
                  Start for free, invite your team when you are ready, and keep your focus on the
                  product—not the plumbing.
                </p>
              </div>
              <div className="pricing-card__right">
                <div className="pricing-price">
                  <strong>$0</strong>
                  <span>to start</span>
                </div>
                <ul>
                  <li>
                    <Check size={15} /> Browser-based workspace
                  </li>
                  <li>
                    <Check size={15} /> GitHub project import
                  </li>
                  <li>
                    <Check size={15} /> Real-time collaboration
                  </li>
                  <li>
                    <Check size={15} /> Instant edge previews
                  </li>
                </ul>
                <Link href="/sign-up" className="button button--primary">
                  Create your workspace <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq-section site-section" id="faq">
          <div className="site-container">
            <div className="faq-layout">
              <div className="faq-intro">
                <SectionLabel>QUESTIONS, ANSWERED</SectionLabel>
                <h2>Good to know.</h2>
                <p>Still curious? We like that. Here are a few details to help you get moving.</p>
                <a href="mailto:hello@cloudlab.dev" className="text-link">
                  Talk to the team <ArrowRight size={15} />
                </a>
              </div>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={faq.question}
                    {...faq}
                    open={openFaq === index}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="cta-section">
          <div className="cta-section__grid" />
          <div className="site-container cta-section__inner">
            <div className="cta-section__mark">
              <span />
              <span />
              <span />
            </div>
            <SectionLabel>YOUR NEXT PROJECT STARTS HERE</SectionLabel>
            <h2>
              Make space for<br />
              <em>better ideas.</em>
            </h2>
            <p>Open a workspace and see how much faster building can feel.</p>
            <div className="hero-copy__actions">
              <Link href="/sign-up" className="button button--primary button--large">
                Get Started <ArrowRight size={17} />
              </Link>
              <a
                href="https://github.com/Gautam-kumar01/CloudLab"
                target="_blank"
                rel="noreferrer"
                className="button button--ghost button--large"
              >
                View on GitHub <GitBranch size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="site-container">
          <div className="site-footer__top">
            <div className="site-footer__brand">
              <Logo />
              <p>
                The browser-based cloud IDE
                <br />
                for teams that ship.
              </p>
            </div>
            <div className="site-footer__links">
              <div>
                <span>Product</span>
                <a href="#product">Workspace</a>
                <a href="#architecture">Architecture</a>
                <a href="#benchmark">Benchmark</a>
                <a href="#workflow">How it works</a>
                <a href="#pricing">Pricing</a>
              </div>
              <div>
                <span>Company</span>
                <a href="#security">Security</a>
                <a href="mailto:hello@cloudlab.dev">Contact</a>
                <a
                  href="https://github.com/Gautam-kumar01/CloudLab"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub <ExternalLink size={12} />
                </a>
              </div>
              <div>
                <span>Get started</span>
                <Link href="/sign-in">Log in</Link>
                <Link href="/sign-up">Create account</Link>
                <Link href="/dashboard">Open dashboard</Link>
              </div>
            </div>
          </div>
          <div className="site-footer__bottom">
            <span>© 2026 CloudLab. Built for the next commit.</span>
            <span className="site-footer__status">
              <i /> All systems operational
            </span>
            <span className="site-footer__legal">
              <a href="#faq">Help</a>
              <a href="#security">Privacy</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
