import Link from "next/link";
import { ArrowRight, Check, GitBranch, Rocket } from "lucide-react";
import { signIn } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";

export default function SignUp() {
  return (
    <AuthShell
      eyebrow="START SHIPPING"
      title="Create your workspace."
      description="Start with a secure CloudLab account and get your first project running."
      footer={<>Already have an account? <Link href="/sign-in">Sign in <ArrowRight size={13} /></Link></>}
    >
      <div className="auth-form">
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="auth-provider-button">
            <GitBranch size={18} />
            Create account with GitHub
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="auth-divider"><span>what you get</span></div>

        <div className="auth-benefit auth-benefit--accent">
          <span className="auth-benefit__icon"><Rocket size={17} /></span>
          <div><strong>Ready when you are</strong><p>Open a browser-based workspace and go from idea to first commit without the setup spiral.</p></div>
        </div>
        <div className="auth-checklist">
          <p><Check size={15} /> Import an existing GitHub repository</p>
          <p><Check size={15} /> Invite teammates when you are ready</p>
          <p><Check size={15} /> Preview and deploy from one workspace</p>
        </div>

        <p className="auth-note">By continuing, you agree to use CloudLab responsibly and keep your project credentials secure.</p>
      </div>
    </AuthShell>
  );
}
