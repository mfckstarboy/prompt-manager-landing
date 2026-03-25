import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign Up | PromptTray",
  description: "Create a PromptTray account and start building a reusable prompt library.",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Set up your account and start saving prompts in minutes."
      alternateQuestion="Already have an account?"
      alternateLabel="Log in"
      alternateHref="/sign-in"
      hintText=""
    >
      <form className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className={authLabelClassName}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={authInputClassName}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className={authLabelClassName}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a secure password"
              className={authInputClassName}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="confirm-password" className={authLabelClassName}>
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              className={authInputClassName}
            />
          </div>
        </div>

        <Button asChild className="landing-ui h-12 w-full">
          <Link href="/sign-up/success">Sign up</Link>
        </Button>
      </form>
    </AuthShell>
  );
}
