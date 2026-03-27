"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useMemo, useState } from "react";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  buildExtensionSuccessPath,
  getExtensionBridgeState,
  withExtensionBridge,
} from "@/lib/auth/extension-bridge";
import { createClient } from "@/lib/supabase/client";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim().length > 0 && password.trim().length > 0;
  const signupSuccess = searchParams.get("signup") === "success";
  const signupNeedsConfirmation = searchParams.get("signup") === "check-email";
  const { extensionId, isExtensionFlow } = getExtensionBridgeState(searchParams);
  const signupHref = withExtensionBridge("/signup", extensionId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(
        isExtensionFlow ? buildExtensionSuccessPath(extensionId, "login") : "/app"
      );
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to log in right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      description={
        isExtensionFlow
          ? "Log in on the website and PromptTray in Chrome will connect automatically."
          : "Log in to access your synced prompts."
      }
      alternateQuestion="Need an account?"
      alternateLabel="Create account"
      alternateHref={signupHref}
      hintText=""
      eyebrow={isExtensionFlow ? "Extension login" : undefined}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="login-email" className={authLabelClassName}>
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={authInputClassName}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="login-password" className={authLabelClassName}>
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className={authInputClassName}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        {signupSuccess ? (
          <p className="landing-small rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            Account created. Log in with your email and password.
          </p>
        ) : signupNeedsConfirmation ? (
          <p className="landing-small rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            Check your email to confirm your account, then return here to log in.
          </p>
        ) : null}

        {error ? (
          <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="landing-ui h-12 w-full" disabled={!isValid || isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </Button>

        <p className="landing-small text-center text-muted-foreground">
          <Link
            href={withExtensionBridge("/forgot-password", extensionId)}
            className="font-medium text-foreground hover:text-primary"
          >
            Forgot password?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
