"use client";

import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Globe2,
  CheckCircle2,
  Sparkles,
  Code2,
  ShieldCheck,
  PlaySquare,
  Lock,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ArchitectureWalkthrough3D from "@/components/landing/ArchitectureWalkthrough3D";
import HowItWorksSteps from "@/components/landing/HowItWorksSteps";
import DockerSecurityDeepDive from "@/components/landing/DockerSecurityDeepDive";
import WorkspaceCapabilities from "@/components/landing/WorkspaceCapabilities";
import FAQSection from "@/components/landing/FAQSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Navigation Bar */}
      <Navbar />

      <main className="flex-1">
        {/* ============================================================
            HERO SECTION
            ============================================================ */}
        <section
          id="overview"
          className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden"
        >
          {/* Subtle Ambient Radial Gradients (Calm, not overpowering) */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none opacity-20 blur-3xl rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 80%)",
            }}
          />

          <div className="cl-container relative z-10">
            {/* Hero Header Content */}
            <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
              {/* Honest Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Docker-Powered Developer Workspaces</span>
                <span className="text-emerald-700 hidden sm:inline">&bull;</span>
                <span className="text-slate-400 font-normal hidden sm:inline">In-Browser Cloud IDE</span>
              </div>

              {/* Main Headline */}
              <h1 className="typo-hero text-white tracking-tight mb-6">
                Full-stack cloud IDE powered by real Docker containers.{" "}
                <span className="block mt-2 text-emerald-400 font-extrabold">
                  CloudLab.
                </span>
              </h1>

              {/* Plain-English Explanation */}
              <p className="typo-body-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                Write code in Monaco, run shell commands in an interactive container terminal,
                and preview live web applications directly in your browser—without installing
                runtimes or toolchains locally.
              </p>

              {/* Main Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
                <Link
                  href="/sign-up"
                  className="cl-btn cl-btn-primary w-full sm:w-auto px-7 h-12 text-[15px] font-bold shadow-lg shadow-emerald-500/20"
                >
                  <span>Start Coding Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#architecture"
                  className="cl-btn cl-btn-secondary w-full sm:w-auto px-6 h-12 text-[14px] font-medium"
                >
                  Explore Architecture
                </a>
              </div>

              {/* Quick Feature Checklist */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Monaco Code Editor
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Dedicated Linux Container
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Live WebSocket Terminal
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Dynamic Reverse Proxy
                </span>
              </div>
            </div>

            {/* 3D / Isometric Architecture Story Walkthrough */}
            <div className="w-full">
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
