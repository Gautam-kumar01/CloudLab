"use client";

import Link from "next/link";
import {
  UserCheck,
  FolderGit2,
  Code2,
  PlaySquare,
  ArrowRight,
  ExternalLink,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";

interface StepItem {
  number: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  primaryCta: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    badge: "Step 1",
    title: "Sign up or sign in",
    subtitle: "Quick access without configuring a local dev stack",
    description:
      "Create your free CloudLab account with email or connect via GitHub OAuth. You don't need to install Node.js, Python, or Docker on your computer.",
    details: [
      "Instant personal dashboard setup",
      "GitHub OAuth integration",
      "No credit card or local downloads required",
    ],
    primaryCta: {
      label: "Start Coding Free",
      href: "/sign-up",
    },
    secondaryCta: {
      label: "Sign In",
      href: "/sign-in",
    },
    icon: UserCheck,
  },
  {
    number: "02",
    badge: "Step 2",
    title: "Create a workspace or import a repo",
    subtitle: "Pick a starter template or clone your project",
    description:
      "Start fresh from starter templates (Next.js, Node.js, Python, Vite) or paste any public Git repository URL. CloudLab provisions your workspace files in seconds.",
    details: [
      "Pre-configured runtime templates",
      "Safe Git clone with token scrubbing",
      "Dedicated workspace folder on disk",
    ],
    primaryCta: {
      label: "Open Dashboard",
      href: "/dashboard",
    },
    icon: FolderGit2,
  },
  {
    number: "03",
    badge: "Step 3",
    title: "Edit code and use the workspace tools",
    subtitle: "Write code, run shell commands, and pair with AI",
    description:
      "Write code inside Monaco Editor with syntax autocomplete. Use the built-in terminal connected via WebSocket to your Docker sandbox, or ask the AI assistant for advice.",
    details: [
      "Monaco Editor with multi-tab support",
      "Sandboxed terminal connected via WebSocket",
      "Real-time multiplayer CRDT sync via Yjs",
    ],
    primaryCta: {
      label: "Explore Architecture",
      href: "#architecture",
    },
    icon: Code2,
  },
  {
    number: "04",
    badge: "Step 4",
    title: "Run, deploy & preview your project",
    subtitle: "Live web application preview right in your browser",
    description:
      "Run your dev server (e.g. npm run dev) or trigger an asynchronous deployment build. CloudLab's reverse proxy routes the container port to a live in-browser preview tab.",
    details: [
      "Dynamic reverse proxy port routing",
      "In-browser interactive webview iframe",
      "pg-boss background build queue worker",
    ],
    primaryCta: {
      label: "Get Started Now",
      href: "/sign-up",
    },
    secondaryCta: {
      label: "View Workspaces",
      href: "/dashboard",
    },
    icon: PlaySquare,
  },
];

export default function HowItWorksSteps() {
  return (
    <section id="workflow" className="cl-section relative scroll-mt-24">
      <div className="cl-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>HOW TO USE CLOUDLAB</span>
          </div>
          <h2 className="typo-h1 text-white tracking-tight">
            How to start coding in <span className="text-[#ccff00]">CloudLab</span>
          </h2>
          <p className="typo-body-lg mt-4 text-zinc-300">
            From zero local setup to an active containerized workspace in four practical steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bento-card flex flex-col justify-between group hover:border-[#ccff00]/35 transition-all duration-300"
              >
                <div>
                  {/* Step Top Bar */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-[#ccff00]/15 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold flex items-center justify-center">
                        {step.number}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        {step.badge}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#ccff00] group-hover:bg-[#ccff00]/10 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Step Title & Subtitle */}
                  <h3 className="text-xl font-bold text-white tracking-tight mb-2 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#ccff00] mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                    {step.description}
                  </p>

                  {/* Bullet Points */}
                  <div className="space-y-2 mb-8 pt-4 border-t border-white/5">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-zinc-200">
                        <Check className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                  <Link
                    href={step.primaryCta.href}
                    className="cl-btn cl-btn-primary cl-btn-sm text-xs font-bold"
                  >
                    <span>{step.primaryCta.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {step.secondaryCta && (
                    <Link
                      href={step.secondaryCta.href}
                      className="cl-btn cl-btn-secondary cl-btn-sm text-xs font-medium"
                    >
                      <span>{step.secondaryCta.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
