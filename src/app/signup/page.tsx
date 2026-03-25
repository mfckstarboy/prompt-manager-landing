"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/login?signup=success");
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
      description="Create an account to save and sync your prompts."
      alternateQuestion="Already have an account?"
      alternateLabel="Log in"
      alternateHref="/login"
      hintText=""
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
