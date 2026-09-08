"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Cloud,
  Code2,
  Copy,
  ExternalLink,
  GitBranch,
  Globe2,
  LockKeyhole,
  Menu,
  Play,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
  Zap,
} from "lucide-react";

type DemoTab = "editor" | "terminal" | "preview";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
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

const faqs = [
  {
    question: "Do I need to install anything?",
    answer:
      "No. CloudLab runs in the browser. Start a workspace, open the terminal, and begin building without configuring a local environment first.",
  },
  {
    question: "Can I import an existing GitHub repository?",
    answer:
      "Yes. The workspace flow is designed around Git-based projects, so you can bring in an existing repository and continue working with your normal files and commands.",
  },
  {
    question: "Is each workspace isolated?",
    answer:
      "Yes. CloudLab provisions projects in isolated Docker-backed workspaces so your dependencies and processes stay scoped to the project you are working on.",
  },
  {
    question: "Can my team collaborate in the same workspace?",
    answer:
      "Yes. Real-time collaboration keeps editor state and presence synchronized, making it easy to pair, review, and build together from different locations.",
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

function Logo() {
  return (
    <Link href="/" className="brand-mark" aria-label="CloudLab home">
      <span className="brand-mark__icon">
        <Cloud size={18} strokeWidth={2.4} />
      </span>
      <span className="brand-mark__word">cloud<span>lab</span></span>
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

const heroTerminalFrames = [
  { command: "npm install", output: "resolved 142 packages" },
  { command: "git push origin main", output: "objects: 100% • synced" },
  { command: "cloudlab workspace ready", output: "port 3000 • live" },
  { command: "deploy --production", output: "deploying..." },
];

function HeroTerminal() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [typedCommand, setTypedCommand] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    const frame = heroTerminalFrames[frameIndex];
    let characterIndex = 0;
    let rotateTimer: number | undefined;
    const typingTimer = window.setInterval(() => {
      characterIndex += 1;
      setTypedCommand(frame.command.slice(0, characterIndex));
      if (characterIndex >= frame.command.length) {
        window.clearInterval(typingTimer);
        setShowOutput(true);
        rotateTimer = window.setTimeout(() => {
          setShowOutput(false);
          setFrameIndex((current) => (current + 1) % heroTerminalFrames.length);
        }, 1700);
      }
    }, 58);

    return () => {
      window.clearInterval(typingTimer);
      if (rotateTimer) window.clearTimeout(rotateTimer);
    };
  }, [frameIndex]);

  const frame = heroTerminalFrames[frameIndex];

  return (
    <div className="hero-terminal" aria-hidden="true">
      <div className="hero-terminal__glow" />
      <div className="hero-terminal__orbit hero-terminal__orbit--one" />
      <div className="hero-terminal__orbit hero-terminal__orbit--two" />
      <div className="hero-terminal__card">
        <div className="hero-terminal__topbar">
          <span className="hero-terminal__dots"><i /><i /><i /></span>
          <span className="hero-terminal__label">cloudlab / terminal</span>
          <span className="hero-terminal__status"><i /> LIVE</span>
        </div>
        <div className="hero-terminal__body">
          <div className="hero-terminal__prompt"><span>›</span><code>{typedCommand}</code><i className="hero-terminal__cursor" /></div>
          <div className={`hero-terminal__output ${showOutput ? "is-visible" : ""}`}><span>✓</span>{frame.output}</div>
        </div>
      </div>
    </div>
  );
}

function WorkspacePreview() {
  const [activeTab, setActiveTab] = useState<DemoTab>("editor");
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText("npx cloudlab dev");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="workspace-shell" id="workspace">
      <div className="workspace-shell__bar">
        <div className="window-controls" aria-hidden="true">
          <span className="window-controls__dot window-controls__dot--red" />
          <span className="window-controls__dot window-controls__dot--yellow" />
          <span className="window-controls__dot window-controls__dot--green" />
        </div>
        <div className="workspace-shell__path">
          <span className="workspace-shell__path-dot" />
          cloudlab / acme-dashboard
        </div>
        <div className="workspace-shell__live"><span /> Live</div>
      </div>
      <div className="workspace-shell__tabs" role="tablist" aria-label="Workspace preview">
        {([
          ["editor", "Editor", Code2],
          ["terminal", "Terminal", Terminal],
          ["preview", "Preview", Globe2],
        ] as const).map(([tab, label, Icon]) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            key={tab}
            className={`workspace-shell__tab ${activeTab === tab ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
        <div className="workspace-shell__tab-spacer" />
        <span className="workspace-shell__collaborators"><span /> 3 online</span>
      </div>
      <div className="workspace-shell__body">
        {activeTab === "editor" && (
          <div className="editor-view" role="tabpanel">
            <aside className="editor-tree">
              <div className="editor-tree__title">EXPLORER</div>
              <div className="editor-tree__workspace"><ChevronDown size={13} /> ACME-DASHBOARD</div>
              <div className="editor-tree__file is-selected"><Code2 size={13} /> app.tsx</div>
              <div className="editor-tree__file"><Circle size={11} /> package.json</div>
              <div className="editor-tree__file"><Circle size={11} /> styles.css</div>
              <div className="editor-tree__file"><Circle size={11} /> README.md</div>
              <div className="editor-tree__branch"><GitBranch size={12} /> main</div>
            </aside>
            <div className="editor-code">
              <div className="editor-code__topline"><span>app.tsx</span><span>saved 2s ago</span></div>
              <div className="editor-code__content">
                {codeLines.map((line, index) => (
                  <div className="editor-code__line" key={`${index}-${line.join("")}`}>
                    <span className="editor-code__number">{String(index + 1).padStart(2, "0")}</span>
                    <code>
                      {line.map((part, partIndex) => {
                        const colorClass = part.includes("const") || part.includes("await") ? "syntax-keyword" : part.includes("workspace") || part.includes("cloudlab") ? "syntax-name" : part.includes("\"") ? "syntax-string" : "syntax-muted";
                        return <span className={colorClass} key={`${part}-${partIndex}`}>{part}</span>;
                      })}
                    </code>
                  </div>
                ))}
                <div className="editor-code__cursor" />
              </div>
            </div>
            <aside className="editor-inspector">
              <div className="editor-inspector__title">ACTIVITY</div>
              <div className="activity-item"><span className="activity-avatar activity-avatar--pink">M</span><p><strong>Maya</strong> edited <b>app.tsx</b><small>just now</small></p></div>
              <div className="activity-item"><span className="activity-avatar activity-avatar--blue">L</span><p><strong>Leo</strong> joined the workspace<small>2 min ago</small></p></div>
              <div className="activity-item"><span className="activity-avatar activity-avatar--yellow">A</span><p><strong>Amir</strong> pushed to <b>main</b><small>8 min ago</small></p></div>
            </aside>
          </div>
        )}
        {activeTab === "terminal" && (
          <div className="terminal-view" role="tabpanel">
            <div className="terminal-view__header"><span>TERMINAL</span><span>bash — 80×24</span></div>
            <div className="terminal-view__output">
              <p><span className="terminal-muted">~/acme-dashboard</span> <span className="terminal-prompt">$</span> pnpm dev</p>
              <p className="terminal-muted">Starting development server...</p>
              <p><span className="terminal-success">✓ Ready</span> on <span className="terminal-command">http://localhost:3000</span></p>
              <p><span className="terminal-muted">○ Compiling /dashboard ...</span></p>
              <p><span className="terminal-success">✓ Compiled</span> in 1.4s</p>
              <p className="terminal-muted">Watching for file changes</p>
              <p><span className="terminal-prompt">$</span> <span className="terminal-cursor" /></p>
            </div>
            <div className="terminal-view__command"><span>$</span><code>npx cloudlab dev</code><button type="button" onClick={copyCommand} aria-label="Copy CloudLab command">{copied ? <Check size={14} /> : <Copy size={14} />}</button></div>
          </div>
        )}
        {activeTab === "preview" && (
          <div className="preview-view" role="tabpanel">
            <div className="preview-view__browserbar"><span className="preview-view__lock">⌁</span><span>acme-dashboard.cloudlab.run</span><span className="preview-view__reload">↻</span></div>
            <div className="preview-view__canvas">
              <div className="preview-view__nav"><strong>acme<span>+</span></strong><span>Overview</span><span>Projects</span><span>Team</span><span className="preview-view__avatar">M</span></div>
              <div className="preview-view__hero"><span className="preview-view__kicker">MONDAY, SEPTEMBER 07</span><h3>Good morning, Maya.</h3><p>Here&apos;s what&apos;s moving across your projects.</p></div>
              <div className="preview-view__cards"><div><span>Active projects</span><strong>12</strong><small>↑ 18% this week</small></div><div><span>Deployments</span><strong>48</strong><small>↑ 24% this week</small></div><div><span>Team velocity</span><strong>8.4</strong><small>↑ 6% this week</small></div></div>
            </div>
          </div>
        )}
      </div>
      <div className="workspace-shell__status"><span><Check size={13} /> main • synced</span><span>UTF-8 <span className="status-divider">|</span> TypeScript</span></div>
    </div>
  );
}

function FAQItem({ question, answer, open, onClick }: { question: string; answer: string; open: boolean; onClick: () => void }) {
  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <button type="button" className="faq-item__trigger" onClick={onClick} aria-expanded={open}>
        <span>{question}</span>
        <span className="faq-item__icon"><ChevronDown size={17} /></span>
      </button>
      <div className="faq-item__answer"><p>{answer}</p></div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="cloudlab-home">
      <header className="site-header">
        <div className="site-container site-header__inner">
          <Logo />
          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="site-header__actions">
            <ThemeToggle />
            <Link href="/sign-in" className="header-login">Log in</Link>
            <Link href="/sign-up" className="button button--small button--light">Start building <ArrowRight size={15} /></Link>
          </div>
          <button type="button" className="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {mobileOpen && <div className="mobile-menu"><div className="site-container">{navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a>)}<div className="mobile-menu__theme"><span>Appearance</span><ThemeToggle /></div><Link href="/sign-in" onClick={() => setMobileOpen(false)}>Log in</Link><Link href="/sign-up" className="button button--light" onClick={() => setMobileOpen(false)}>Start building <ArrowRight size={15} /></Link></div></div>}
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb--one" /><div className="hero-orb hero-orb--two" />
          <div className="site-container hero-section__inner">
            <div className="hero-copy">
              <div className="eyebrow-pill"><span className="eyebrow-pill__pulse" /> The cloud IDE for teams that ship</div>
              <h1>Build boldly.<br /><span>Ship from anywhere.</span></h1>
              <p className="hero-copy__lead">CloudLab turns your browser into a complete development environment. Code, collaborate, and deploy in isolated workspaces built for momentum.</p>
              <div className="hero-copy__actions"><Link href="/sign-up" className="button button--primary button--large">Get Started <ArrowRight size={17} /></Link><a href="#workspace" className="button button--ghost button--large"><span className="button-play"><Play size={12} fill="currentColor" /></span> See how it works</a></div>
              <div className="hero-proof"><div className="avatar-stack"><span className="avatar avatar--lime">J</span><span className="avatar avatar--violet">A</span><span className="avatar avatar--orange">M</span><span className="avatar avatar--blue">+</span></div><p><strong>1,200+ builders</strong><br />are already shipping in CloudLab</p></div>
            </div>
            <div className="hero-signal" aria-hidden="true"><div className="hero-signal__line" /><div className="hero-signal__card hero-signal__card--top"><span className="hero-signal__icon hero-signal__icon--mint"><Zap size={15} /></span><span><b>Fast feedback loops</b><small>Preview in seconds</small></span></div><div className="hero-signal__card hero-signal__card--bottom"><span className="hero-signal__icon hero-signal__icon--violet"><Users size={15} /></span><span><b>Work in sync</b><small>3 teammates online</small></span></div><HeroTerminal /><div className="hero-signal__node hero-signal__node--one" /><div className="hero-signal__node hero-signal__node--two" /><div className="hero-signal__node hero-signal__node--three" /></div>
          </div>
          <div className="site-container hero-metrics"><div><strong>10×</strong><span>faster to first commit</span></div><div><strong>0</strong><span>local setup required</span></div><div><strong>99.9%</strong><span>workspace uptime</span></div><div><strong>∞</strong><span>ways to build</span></div></div>
        </section>

        <section className="workspace-section site-section" id="product">
          <div className="site-container"><div className="section-intro section-intro--split"><div><SectionLabel>THE WORKSPACE</SectionLabel><h2>Everything you need.<br /><em>Nothing in your way.</em></h2></div><p>One focused place for your editor, terminal, preview, and team. CloudLab makes the path from idea to shipped product feel short.</p></div><WorkspacePreview /></div>
        </section>

        <section className="feature-section site-section">
          <div className="site-container"><div className="section-intro"><SectionLabel>WHY CLOUDLAB</SectionLabel><h2>Less setup. More <em>shipping.</em></h2><p>Good tools disappear into the work. CloudLab gives your team the right foundation, then gets out of the way.</p></div><div className="feature-grid">{features.map((feature) => { const Icon = feature.icon; return <article className={`feature-card feature-card--${feature.accent}`} key={feature.eyebrow}><div className="feature-card__top"><span className="feature-card__icon"><Icon size={20} /></span><span>{feature.eyebrow}</span></div><h3>{feature.title}</h3><p>{feature.description}</p><a href="#workflow" className="text-link">Explore the workflow <ArrowRight size={15} /></a></article>; })}</div></div>
        </section>

        <section className="workflow-section site-section" id="workflow">
          <div className="site-container"><div className="workflow-card"><div className="workflow-card__copy"><SectionLabel>THE FLOW</SectionLabel><h2>Idea to <em>internet</em> in three moves.</h2><p>CloudLab keeps your environment, your people, and your release loop connected from the very first command.</p><div className="workflow-steps"><div className="workflow-step is-active"><span>01</span><div><strong>Spin up</strong><p>Choose a template or bring your own repo.</p></div></div><div className="workflow-step"><span>02</span><div><strong>Build together</strong><p>Share the workspace and make progress live.</p></div></div><div className="workflow-step"><span>03</span><div><strong>Ship it</strong><p>Preview, test, and deploy when it feels right.</p></div></div></div><Link href="/sign-up" className="text-link text-link--bright">Open a workspace <ArrowRight size={15} /></Link></div><div className="workflow-visual"><div className="workflow-visual__glow" /><div className="workflow-visual__window"><div className="workflow-visual__top"><span><i /><i /><i /></span><small>cloudlab.run / preview</small><span><ExternalLink size={13} /></span></div><div className="workflow-visual__content"><div className="workflow-visual__badge"><Sparkles size={14} /> LIVE PREVIEW</div><h3>Build something<br /><span>worth sharing.</span></h3><div className="workflow-visual__bar"><span /><span /><span /></div><div className="workflow-visual__footer"><span>● deployed</span><b>cloudlab.run</b></div></div></div><div className="workflow-visual__float workflow-visual__float--a"><Check size={13} /> changes synced</div><div className="workflow-visual__float workflow-visual__float--b"><Globe2 size={13} /> live preview</div></div></div></div>
        </section>

        <section className="security-section site-section" id="security">
          <div className="site-container"><div className="security-layout"><div className="security-copy"><SectionLabel>BUILT FOR TRUST</SectionLabel><h2>Your code stays<br /><em>in your hands.</em></h2><p>CloudLab gives every project a private, isolated place to run. Move fast without treating security like a later problem.</p><Link href="/sign-up" className="button button--outline">Build securely <ArrowRight size={16} /></Link></div><div className="security-points"><div className="security-point"><span className="security-point__icon"><LockKeyhole size={18} /></span><div><h3>Isolated workspaces</h3><p>Every project runs in its own container with scoped dependencies and processes.</p></div></div><div className="security-point"><span className="security-point__icon"><ShieldCheck size={18} /></span><div><h3>Safe by default</h3><p>Server-side validation, protected routes, and sensible permissions are part of the foundation.</p></div></div><div className="security-point"><span className="security-point__icon"><Server size={18} /></span><div><h3>Made to scale</h3><p>Go from a solo prototype to a team workspace without rebuilding your toolchain.</p></div></div></div></div></div>
        </section>

        <section className="pricing-section site-section" id="pricing">
          <div className="site-container"><div className="section-intro"><SectionLabel>START SMALL, SHIP BIG</SectionLabel><h2>A better place to <em>begin.</em></h2><p>Everything you need to discover the CloudLab workflow is ready to try.</p></div><div className="pricing-card"><div><span className="pricing-card__eyebrow">EARLY ACCESS</span><h3>Build without the busywork.</h3><p>Start for free, invite your team when you are ready, and keep your focus on the product—not the plumbing.</p></div><div className="pricing-card__right"><div className="pricing-price"><strong>$0</strong><span>to start</span></div><ul><li><Check size={15} /> Browser-based workspace</li><li><Check size={15} /> GitHub project import</li><li><Check size={15} /> Real-time collaboration</li></ul><Link href="/sign-up" className="button button--primary">Create your workspace <ArrowRight size={16} /></Link></div></div></div>
        </section>

        <section className="faq-section site-section" id="faq">
          <div className="site-container"><div className="faq-layout"><div className="faq-intro"><SectionLabel>QUESTIONS, ANSWERED</SectionLabel><h2>Good to know.</h2><p>Still curious? We like that. Here are a few details to help you get moving.</p><a href="mailto:hello@cloudlab.dev" className="text-link">Talk to the team <ArrowRight size={15} /></a></div><div className="faq-list">{faqs.map((faq, index) => <FAQItem key={faq.question} {...faq} open={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} />)}</div></div></div>
        </section>

        <section className="cta-section"><div className="cta-section__grid" /><div className="site-container cta-section__inner"><div className="cta-section__mark"><span /><span /><span /></div><SectionLabel>YOUR NEXT PROJECT STARTS HERE</SectionLabel><h2>Make space for<br /><em>better ideas.</em></h2><p>Open a workspace and see how much faster building can feel.</p><div className="hero-copy__actions"><Link href="/sign-up" className="button button--primary button--large">Get Started <ArrowRight size={17} /></Link><a href="https://github.com/Gautam-kumar01/CloudLab" target="_blank" rel="noreferrer" className="button button--ghost button--large">View on GitHub <GitBranch size={16} /></a></div></div></section>
      </main>

      <footer className="site-footer"><div className="site-container"><div className="site-footer__top"><div className="site-footer__brand"><Logo /><p>The browser-based cloud IDE<br />for teams that ship.</p></div><div className="site-footer__links"><div><span>Product</span><a href="#product">Workspace</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a></div><div><span>Company</span><a href="#security">Security</a><a href="mailto:hello@cloudlab.dev">Contact</a><a href="https://github.com/Gautam-kumar01/CloudLab" target="_blank" rel="noreferrer">GitHub <ExternalLink size={12} /></a></div><div><span>Get started</span><Link href="/sign-in">Log in</Link><Link href="/sign-up">Create account</Link><Link href="/dashboard">Open dashboard</Link></div></div></div><div className="site-footer__bottom"><span>© 2026 CloudLab. Built for the next commit.</span><span className="site-footer__status"><i /> All systems operational</span><span className="site-footer__legal"><a href="#faq">Help</a><a href="#security">Privacy</a></span></div></div></footer>
    </div>
  );
}
