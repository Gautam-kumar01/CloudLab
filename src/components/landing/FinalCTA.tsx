import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section id="final-cta" className="cl-section relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-subtle z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full z-0 pointer-events-none" style={{background:'var(--accent-soft)', filter:'blur(100px)'}}></div>
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full z-0 pointer-events-none" style={{background:'var(--accent-purple-soft)', filter:'blur(100px)'}}></div>

      <div className="cl-container text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow mb-6 inline-flex">
            <span className="eyebrow-dot animate-pulse"></span>
            Start Building Today
          </div>
          <h2 className="typo-h1 mb-6 tracking-tight">
            Your next project starts here.
          </h2>
          <p className="typo-body-lg mb-10 max-w-2xl mx-auto text-[var(--text-muted)]">
            No complicated setup. No brittle local environments.<br className="hidden md:block"/>
            Just open CloudLab and start building.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="cl-btn cl-btn-primary">
              Start Coding Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/docs" className="cl-btn cl-btn-secondary">
              Read Documentation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
