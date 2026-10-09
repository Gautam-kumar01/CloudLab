"use client";

import { signIn } from "next-auth/react";
import { ArrowRight, GitBranch } from "lucide-react";

export default function GitHubSignupButton() {
  return (
    <button
      type="button"
      className="landing-signup-card__github"
      onClick={() => signIn("github", { redirectTo: "/dashboard" })}
    >
      <GitBranch size={18} aria-hidden="true" />
      <span>Create account with GitHub</span>
      <ArrowRight size={17} aria-hidden="true" />
    </button>
  );
}
