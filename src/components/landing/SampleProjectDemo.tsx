"use client";

import { useState, type KeyboardEvent } from "react";
import { ArrowRight, Code2, ExternalLink, Terminal } from "lucide-react";
import { builtInTemplates } from "@/lib/templates";

type DemoTemplate = {
  id: string;
  label: string;
  language: string;
  filePath: string;
  command: string;
  expectedOutput?: string;
  preview?: { title: string; description: string };
};

const DEMOS: DemoTemplate[] = [
  {
    id: "react-vite",
    label: "React + Vite",
    language: "tsx",
    filePath: "src/App.tsx",
    command: "npm run dev",
    preview: {
      title: "Hello React + Vite 🚀",
      description: "Start editing src/App.tsx to see changes!",
    },
  },
  {
    id: "nodejs",
    label: "Node.js",
    language: "javascript",
    filePath: "index.js",
    command: "node index.js",
    expectedOutput: "Hello from Node.js!",
  },
  {
    id: "python",
    label: "Python",
    language: "python",
    filePath: "main.py",
    command: "python main.py",
    expectedOutput: "Hello from Python!",
  },
];

export default function SampleProjectDemo() {
  const [selectedId, setSelectedId] = useState(DEMOS[0]!.id);
  const activeDemo = DEMOS.find((demo) => demo.id === selectedId) ?? DEMOS[0]!;
  const activeTemplate = builtInTemplates.find((template) => template.id === activeDemo.id);
  const source = activeTemplate?.files[activeDemo.filePath] ?? "";

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % DEMOS.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + DEMOS.length) % DEMOS.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = DEMOS.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextDemo = DEMOS[nextIndex]!;
    setSelectedId(nextDemo.id);
    document.getElementById(`sample-demo-tab-${nextDemo.id}`)?.focus();
  };

  return (
    <section className="sample-demo-section" id="try-demo" aria-labelledby="sample-demo-title">
      <div className="cl-container">
        <div className="sample-demo__heading">
          <span className="sample-demo__eyebrow"><Code2 size={14} /> TAKE A LOOK INSIDE</span>
          <h2 id="sample-demo-title">A real starter. A clear first step.</h2>
          <p>Switch templates to see the files CloudLab creates—then open your own browser workspace.</p>
        </div>

        <div className="sample-demo__frame">
          <div className="sample-demo__editor">
            <div className="sample-demo__window-bar">
              <div className="sample-demo__window-dots" aria-hidden="true"><i /><i /><i /></div>
              <span className="sample-demo__path">workspace / {activeDemo.filePath}</span>
              <span className="sample-demo__mode">STATIC DEMO</span>
            </div>

            <div className="sample-demo__tabs" role="tablist" aria-label="Starter project examples">
              {DEMOS.map((demo, index) => (
                <button
                  key={demo.id}
                  type="button"
                  id={`sample-demo-tab-${demo.id}`}
                  className="sample-demo__tab"
                  role="tab"
                  tabIndex={selectedId === demo.id ? 0 : -1}
                  aria-selected={selectedId === demo.id}
                  aria-controls="sample-demo-panel"
                  onClick={() => setSelectedId(demo.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {demo.label}
                </button>
              ))}
            </div>

            <div
              className="sample-demo__code-panel"
              id="sample-demo-panel"
              role="tabpanel"
              aria-labelledby={`sample-demo-tab-${activeDemo.id}`}
              aria-describedby="sample-demo-note"
              tabIndex={0}
            >
              <div className="sample-demo__file-label"><Code2 size={13} /> {activeDemo.filePath}<span>{activeDemo.language}</span></div>
              <pre><code>{source}</code></pre>
            </div>
          </div>

          <div className="sample-demo__result" aria-live="polite">
            <div className="sample-demo__result-header">
              <span><Terminal size={14} /> WHAT HAPPENS NEXT</span>
              <span className="sample-demo__result-badge">ILLUSTRATIVE</span>
            </div>
            <div className="sample-demo__command"><span>$</span> {activeDemo.command}</div>

            {activeDemo.preview ? (
              <div className="sample-demo__browser-preview">
                <div className="sample-demo__browser-bar"><i /><i /><i /><span>workspace preview</span><ExternalLink size={12} /></div>
                <div className="sample-demo__preview-content">
                  <span className="sample-demo__react-mark" aria-hidden="true">R</span>
                  <h3>{activeDemo.preview.title}</h3>
                  <p>{activeDemo.preview.description}</p>
                </div>
              </div>
            ) : (
              <div className="sample-demo__terminal-output">
                <span className="sample-demo__terminal-prompt">›</span> {activeDemo.expectedOutput}
              </div>
            )}

            <p className="sample-demo__note" id="sample-demo-note">
              This page shows a static example; it does not execute code in your browser.
            </p>
            <a className="sample-demo__cta" href="/sign-up">
              Create your workspace <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
