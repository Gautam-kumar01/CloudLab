import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid-hero pointer-events-none" />
      <div
        className="ambient-glow-green"
        style={{ top: '-220px', left: '50%', transform: 'translateX(-50%)' }}
      />
      <div
        className="ambient-glow-purple"
        style={{ top: '-120px', right: '-120px' }}
      />

      <div className="cl-container relative z-10 flex flex-col items-center text-center">
        <div
          className="cl-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          <div className="eyebrow">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}
            />
            CloudLab v2.0 is now live
          </div>
        </div>

        <h1
          className="typo-hero cl-fade-up mt-8 text-white"
          style={{ animationDelay: '140ms', maxWidth: '1000px' }}
        >
          Your Entire Dev
          <br className="hidden sm:block" />{' '}
          Environment.{' '}
          <br className="sm:hidden" />
          <span
            style={{
              color: 'var(--accent)',
              textShadow: '0 0 40px rgba(5,150,105,0.22)',
            }}
          >
            In the Cloud.
          </span>
        </h1>

        <p
          className="typo-body-lg cl-fade-up mt-8"
          style={{ animationDelay: '220ms', maxWidth: '720px' }}
        >
          Code, run, debug, collaborate and deploy from your browser with isolated
          cloud workspaces, an integrated terminal, GitHub integration and AI
          assistance.
        </p>

        <div
          className="cl-fade-up mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
          style={{ animationDelay: '300ms' }}
        >
          <Link href="/sign-up" className="cl-btn cl-btn-primary w-full sm:w-auto">
            Start Coding Free
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="#how-it-works"
            className="cl-btn cl-btn-secondary w-full sm:w-auto"
          >
            Explore CloudLab
          </Link>
        </div>

        <div
          className="cl-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          style={{ animationDelay: '380ms' }}
        >
          {[
            'No local setup',
            'Docker-powered',
            'GitHub ready',
            'AI assisted',
          ].map((item) => (
            <div key={item} className="cl-trust-item">
              <span className="cl-trust-check">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
