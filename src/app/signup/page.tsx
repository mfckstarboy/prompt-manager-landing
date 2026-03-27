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

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim().length > 0 && password.trim().length > 0;
  const { extensionId, isExtensionFlow } = getExtensionBridgeState(searchParams);
  const loginHref = withExtensionBridge("/login", extensionId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (isExtensionFlow && data.session) {
        router.push(buildExtensionSuccessPath(extensionId, "signup"));
      } else if (data.session) {
        router.push("/login?signup=success");
      } else if (isExtensionFlow) {
        router.push(withExtensionBridge("/login", extensionId, { signup: "check-email" }));
      } else {
        router.push("/login?signup=check-email");
      }
      router.refresh();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to create your account.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description={
        isExtensionFlow
          ? "Create your account on the website and PromptTray in Chrome will connect automatically."
          : "Create an account to save and sync your prompts."
      }
      alternateQuestion="Already have an account?"
      alternateLabel="Log in"
      alternateHref={loginHref}
      hintText=""
      eyebrow={isExtensionFlow ? "Extension sign up" : undefined}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="signup-email" className={authLabelClassName}>
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className={authLabelClassName}>
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className={authInputClassName}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="landing-ui h-12 w-full" disabled={!isValid || isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>

        <p className="landing-small text-center text-muted-foreground">
          By continuing, you agree to the{" "}
          <Link href="/terms" className="font-medium text-foreground hover:text-primary">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-foreground hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}
