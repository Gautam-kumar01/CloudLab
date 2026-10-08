"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does CloudLab execute my code?",
    answer:
      "CloudLab runs your code inside an isolated Linux container managed by the host Docker Engine. Each workspace is launched on a dedicated bridge network (`cloudlab-net`) with CPU limits (1.0 core), memory limits (1GB), and dropped Linux capabilities (`--cap-drop ALL`). Your files are mounted directly into the container at `/workspace`.",
  },
  {
    question: "Is this a hardware microVM (like Firecracker) or a Docker container?",
    answer:
      "It is a standard Docker container. CloudLab does not use hardware-level hypervisors or Firecracker microVMs. We provide process and network isolation using Linux cgroups and namespaces, configured with defense-in-depth principles. We describe this transparently rather than making exaggerated marketing claims.",
  },
  {
    question: "Can I run arbitrary shell commands and install packages?",
    answer:
      "Yes. The built-in terminal runs inside your container sandbox via WebSocket connections to `docker exec`. You can run standard CLI commands, install packages with `npm`, `pip`, or `cargo`, and start dev servers like Next.js or Vite.",
  },
  {
    question: "How does the live preview work?",
    answer:
      "When your dev server or application starts listening on a port (such as 3000, 5173, or 8080), CloudLab's reverse proxy routes incoming HTTP requests directly to the container's bound port on the host bridge network, displaying the output inside an in-browser preview tab.",
  },
  {
    question: "What happens when I close my browser or leave a workspace idle?",
    answer:
      "Your project files remain safely persisted in the workspace directory on the server. If a workspace remains inactive beyond the configured idle timeout, CloudLab's background worker (`worker.js` via pg-boss) cleanly stops the container to conserve host memory and CPU. Opening the workspace restarts the container automatically.",
  },
  {
    question: "How does team collaboration work?",
    answer:
      "CloudLab integrates Yjs Conflict-free Replicated Data Types (CRDTs) over WebSockets. Multiple developers can edit the same files simultaneously with live cursor tracking, conflict-free document convergence, and role-based permissions (Owner, Member, Viewer).",
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="cl-section relative scroll-mt-24">
      <div className="cl-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="cl-badge mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="typo-h1 text-white tracking-tight">
            Clear answers about <span className="text-emerald-400">CloudLab</span>
          </h2>
          <p className="typo-body-lg mt-4 text-slate-300">
            Honest architectural answers for developers who care about what runs under the hood.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-[#090d1a]/80 backdrop-blur-md overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
