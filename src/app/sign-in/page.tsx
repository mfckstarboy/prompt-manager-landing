import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sign In | PromptTray",
  description: "Sign in to PromptTray and keep your best prompts ready inside every AI tool.",
};

export default function SignInPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to continue where you left off."
      alternateQuestion="New to PromptTray?"
      alternateLabel="Create account"
      alternateHref="/sign-up"
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
              autoComplete="current-password"
              placeholder="Enter your password"
              className={authInputClassName}
            />
          </div>
        </div>

        <Button type="submit" className="landing-ui h-12 w-full">
          Log in
        </Button>

        <Link
          href="/forgot-password"
          className="landing-small block text-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          Forgot password?
        </Link>
      </form>
    </AuthShell>
  );
}
