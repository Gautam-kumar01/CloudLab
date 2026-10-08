"use client";

import {
  ShieldAlert,
  Cpu,
  Lock,
  Network,
  Trash2,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Server,
  FileCode2,
} from "lucide-react";

const ARCHITECTURE_FACTS = [
  {
    icon: Lock,
    title: "Linux Capability Dropping",
    summary:
      "Containers launch with --cap-drop ALL and --security-opt no-new-privileges:true, restricting root escalation and limiting system calls.",
    verifiedDetail: "docker run --cap-drop ALL --security-opt no-new-privileges:true",
    badge: "Process Boundary",
  },
  {
    icon: Cpu,
    title: "Explicit Resource Quotas",
    summary:
      "Workspaces are constrained to 1.0 vCPU, 1 GB RAM, and a 100 process limit (pids-limit) to avoid runaway compute or memory exhaustion.",
    verifiedDetail: "--cpus 1.0 --memory 1g --pids-limit 100",
    badge: "Resource Quota",
  },
  {
    icon: Network,
    title: "Isolated Bridge Network",
    summary:
      "All workspace containers attach to a dedicated bridge network (cloudlab-net). Workspaces cannot access internal host ports or administrative services.",
    verifiedDetail: "--network cloudlab-net --tmpfs /tmp",
    badge: "Network Isolation",
  },
  {
    icon: Trash2,
    title: "Automated Idle Container Reaper",
    summary:
      "A background worker powered by pg-boss periodically tracks activity and terminates inactive containers to release memory and host CPU.",
    verifiedDetail: "worker.js -> DockerManager.terminateIdleContainers()",
    badge: "Lifecycle Management",
  },
  {
    icon: KeyRound,
    title: "Ephemeral Git Credential Scrubbing",
    summary:
      "When cloning private or public repositories, authentication tokens are scrubbed from remote URLs immediately to keep disk configs clean.",
    verifiedDetail: "src/lib/git-security.ts -> scrubGitCredentials()",
    badge: "Secret Hygiene",
  },
  {
    icon: Server,
    title: "Reverse Proxy Dynamic Routing",
    summary:
      "Inbound web traffic reaches your container via a reverse proxy that inspects workspace ownership before forwarding requests to the application port.",
    verifiedDetail: "src/lib/proxy-manager.ts -> canAccessWorkspace() check",
    badge: "Access Guarded",
  },
];

export default function DockerSecurityDeepDive() {
  return (
    <section id="architecture" className="cl-section relative scroll-mt-24">
      <div className="cl-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ARCHITECTURE & CONTAINER SECURITY</span>
          </div>
          <h2 className="typo-h1 text-white tracking-tight">
            Docker Sandboxing, <span className="text-emerald-400">Described Honestly</span>
          </h2>
          <p className="typo-body-lg mt-4 text-slate-300">
            Real architectural boundaries from our codebase. No marketing buzzwords, no invented microVM claims.
          </p>
        </div>

        {/* Honest Trust Callout Box */}
        <div className="mb-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-200 mb-1">
                Transparency & Security Reality
              </h4>
              <p className="text-sm text-amber-100/80 leading-relaxed font-sans">
                CloudLab isolates workspaces using <strong>standard Linux containers via Docker Engine</strong>.
                Containers share the host operating system kernel and provide process, network, and filesystem
                boundaries. We do not claim hardware microVMs (such as Firecracker) or hypervisor-level isolation.
                Docker containers are an operational isolation mechanism, not a complete standalone security boundary;
                we implement defense-in-depth across capabilities, networks, and role-based access checks.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARCHITECTURE_FACTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 flex flex-col justify-between border-white/10 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {item.badge}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Confirmed in code:
                  </div>
                  <div className="text-[11px] font-mono text-emerald-300/90 truncate bg-black/40 px-2 py-1.5 rounded border border-white/5">
                    {item.verifiedDetail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
