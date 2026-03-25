import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Forgot Password | PromptTray",
  description: "Request a password reset email for your PromptTray account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we&apos;ll send you a reset link."
      alternateQuestion="Remembered your password?"
      alternateLabel="Back to login"
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
        </div>

        <Button asChild className="landing-ui h-12 w-full">
          <Link href="/reset-password">Send reset link</Link>
        </Button>
      </form>
    </AuthShell>
  );
}
