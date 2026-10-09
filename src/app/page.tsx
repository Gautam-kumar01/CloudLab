import Link from "next/link";
import { ArrowRight, CheckCircle2, Code2, Sparkles } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GitHubSignupButton from "@/components/landing/GitHubSignupButton";
import ArchitectureWalkthrough3D from "@/components/landing/ArchitectureWalkthrough3D";
import HowItWorksSteps from "@/components/landing/HowItWorksSteps";
import DockerSecurityDeepDive from "@/components/landing/DockerSecurityDeepDive";
import WorkspaceCapabilities from "@/components/landing/WorkspaceCapabilities";
import FAQSection from "@/components/landing/FAQSection";

export default function LandingPage() {
  return (
    <div className="cloudlab-landing min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* ============================================================
            HERO SECTION
            ============================================================ */}
        <section
          id="overview"
          className="landing-hero"
        >
          <div className="landing-hero__ambient" aria-hidden="true" />

          <div className="cl-container landing-hero__container relative z-10">
            <div className="landing-hero__layout">
              <div className="landing-hero__content">
                <div className="landing-hero__rings" aria-hidden="true" />
                <div className="landing-hero__copy">
                  <div className="landing-hero__eyebrow">
                    <span>START SHIPPING</span>
                    <span className="landing-hero__eyebrow-line" aria-hidden="true" />
                  </div>

                  <h1 className="landing-hero__title">
                    Build in the cloud.
                    <span className="landing-hero__title-accent">Keep your flow.</span>
                  </h1>

                  <p className="landing-hero__description">
                    A browser-based IDE with Docker-powered workspaces, live previews, and
                    collaboration built in—so you can start building without local setup.
                  </p>

                  <nav className="landing-hero__pills" aria-label="CloudLab capabilities">
                    <a className="landing-hero__pill" href="#features">Browser IDE</a>
                    <a className="landing-hero__pill" href="#architecture">Isolated workspaces</a>
                    <a className="landing-hero__pill" href="#features">Real-time collaboration</a>
                  </nav>
                </div>
              </div>

              <aside className="landing-signup-card" aria-labelledby="landing-signup-title">
                <div className="landing-signup-card__brand">
                  <span className="landing-signup-card__icon"><Code2 size={21} /></span>
                  <span className="landing-signup-card__brand-copy">
                    <strong>CloudLab</strong>
                    <small>YOUR NEXT DEV SPACE</small>
                  </span>
                  <span className="landing-signup-card__status"><i /> READY</span>
                </div>

                <p className="landing-signup-card__eyebrow">START WITH ONE CLICK</p>
                <h2 id="landing-signup-title">Create your workspace.</h2>
                <p className="landing-signup-card__intro">
                  Sign in with GitHub and bring your next idea into a ready-to-code workspace.
                </p>

                <div className="landing-signup-card__form">
                  <GitHubSignupButton />
                </div>

                <div className="landing-signup-card__divider"><span>WHAT YOU GET</span></div>

                <div className="landing-signup-card__ready">
                  <span className="landing-signup-card__ready-icon"><Sparkles size={17} /></span>
                  <div>
                    <span className="landing-signup-card__ready-label">ZERO LOCAL SETUP</span>
                    <h3>Ready when you are</h3>
                    <p>Open your browser and get straight to building.</p>
                  </div>
                </div>

                <ul className="landing-signup-card__checklist">
                  <li><CheckCircle2 size={16} /> Browser IDE and interactive terminal</li>
                  <li><CheckCircle2 size={16} /> Isolated Docker workspaces</li>
                  <li><CheckCircle2 size={16} /> Real-time collaboration and previews</li>
                </ul>

                <p className="landing-signup-card__footer">
                  Already have an account? <Link href="/sign-in">Sign in <ArrowRight size={14} /></Link>
                </p>
              </aside>
            </div>

            {/* 3D / Isometric Architecture Story Walkthrough */}
            <div className="landing-hero__architecture w-full">
              <ArchitectureWalkthrough3D />
            </div>
          </div>
        </section>

        {/* ============================================================
            HOW TO USE CLOUDLAB (STEP-BY-STEP)
            ============================================================ */}
        <HowItWorksSteps />

        {/* ============================================================
            DOCKER CONTAINER ARCHITECTURE & HONEST SECURITY
            ============================================================ */}
        <DockerSecurityDeepDive />

        {/* ============================================================
            GENUINE WORKSPACE CAPABILITIES
            ============================================================ */}
        <WorkspaceCapabilities />

        {/* ============================================================
            FREQUENTLY ASKED QUESTIONS
            ============================================================ */}
        <FAQSection />

        {/* ============================================================
            FINAL CALL TO ACTION
            ============================================================ */}
        <section className="cl-section relative overflow-hidden py-20 bg-gradient-to-b from-transparent to-[#050914]">
          <div className="cl-container relative z-10">
            <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-14 border border-emerald-500/25 bg-gradient-to-b from-[#0b162c] to-[#070e1c] text-center shadow-2xl relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.4) 0%, transparent 70%)",
                }}
              />

              <div className="cl-badge mb-5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>START BUILDING TODAY</span>
              </div>

              <h2 className="typo-h1 text-white tracking-tight mb-4">
                Ready to experience <span className="text-emerald-400">CloudLab</span>?
              </h2>

              <p className="typo-body-lg text-slate-300 max-w-xl mx-auto mb-8 font-normal">
                Launch a containerized workspace in seconds. Edit code, run tests, and preview
                applications directly from your browser with zero local machine friction.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="cl-btn cl-btn-primary w-full sm:w-auto px-8 h-12 text-[15px] font-bold shadow-lg shadow-emerald-500/20"
                >
                  <span>Start Coding Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/sign-in"
                  className="cl-btn cl-btn-secondary w-full sm:w-auto px-7 h-12 text-[14px] font-medium"
                >
                  Sign In to Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
