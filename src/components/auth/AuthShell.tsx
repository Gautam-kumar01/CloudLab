import Link from "next/link";
import { ArrowLeft, Cloud, Code2, LockKeyhole, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="auth-page">
      <div className="auth-page__noise" />
      <header className="auth-header">
        <Link href="/" className="brand-mark" aria-label="CloudLab home">
          <span className="brand-mark__icon"><Cloud size={18} strokeWidth={2.4} /></span>
          <span className="brand-mark__word">cloud<span>lab</span></span>
        </Link>
        <div className="auth-header__actions">
          <ThemeToggle />
          <Link href="/" className="auth-back"><ArrowLeft size={14} /> Back home</Link>
        </div>
      </header>

      <div className="auth-page__layout">
        <section className="auth-story" aria-label="CloudLab benefits">
          <div className="auth-story__eyebrow"><span /> {eyebrow}</div>
          <h1>Build in the cloud.<br /><em>Keep your flow.</em></h1>
          <p>One focused workspace for your code, your team, and the next thing you want to ship.</p>
          <div className="auth-story__chips">
            <span><Code2 size={14} /> Browser IDE</span>
            <span><LockKeyhole size={14} /> Isolated workspaces</span>
            <span><Sparkles size={14} /> Real-time collaboration</span>
          </div>
          <div className="auth-story__orb auth-story__orb--one" />
          <div className="auth-story__orb auth-story__orb--two" />
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card__intro">
            <div className="auth-card__mark"><Cloud size={19} /></div>
            <div>
              <p className="auth-card__eyebrow">CLOUDLAB ACCOUNT</p>
              <h2 id="auth-title">{title}</h2>
              <p>{description}</p>
            </div>
          </div>
          {children}
          <div className="auth-card__footer">{footer}</div>
        </section>
      </div>

      <footer className="auth-page__footer"><span>© 2026 CloudLab</span><span>Secure by default. Built to ship.</span></footer>
    </main>
  );
}
