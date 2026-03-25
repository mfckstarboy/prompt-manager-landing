import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reset Password | PromptTray",
  description: "Create a new password for your PromptTray account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create a new password"
      description="Choose a new password to secure your account."
      alternateQuestion="Want to return?"
      alternateLabel="Back to login"
      alternateHref="/sign-in"
      hintText=""
    >
      <form className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="password" className={authLabelClassName}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a new password"
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
          <Link href="/reset-password/success">Reset password</Link>
        </Button>
      </form>
    </AuthShell>
  );
}
