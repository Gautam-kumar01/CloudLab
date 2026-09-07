import Link from "next/link";
import { ArrowRight, Check, GitBranch } from "lucide-react";
import { signIn } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";

export default function SignIn() {
  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Continue building."
      description="Sign in to return to your CloudLab workspaces."
      footer={<>New to CloudLab? <Link href="/sign-up">Create your account <ArrowRight size={13} /></Link></>}
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
            Continue with GitHub
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="auth-divider"><span>secure access</span></div>

        <div className="auth-checklist">
          <p><Check size={15} /> Your workspaces stay connected</p>
          <p><Check size={15} /> Pick up exactly where you left off</p>
          <p><Check size={15} /> No local setup required</p>
        </div>

        <p className="auth-note">CloudLab uses GitHub to authenticate your account. You can manage access from your GitHub settings at any time.</p>
      </div>
    </AuthShell>
  );
}
