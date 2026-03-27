"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function prepareRecovery() {
      const { data } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (data.session?.access_token) {
        setIsRecoveryReady(true);
        setIsCheckingRecovery(false);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        if (!isActive) {
          return;
        }

        setIsCheckingRecovery(false);
        setError("This reset link is invalid or expired. Request a new one and try again.");
        subscription.data.subscription.unsubscribe();
      }, 4000);

      const subscription = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          if (!isActive) {
            return;
          }

          if (event === "PASSWORD_RECOVERY" || session?.access_token) {
            window.clearTimeout(timeoutId);
            setIsRecoveryReady(true);
            setError(null);
            setIsCheckingRecovery(false);
            subscription.data.subscription.unsubscribe();
          }
        }
      );
    }

    prepareRecovery();

    return () => {
      isActive = false;
    };
  }, [supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isRecoveryReady) {
      setError("This reset link is invalid or expired. Request a new one and try again.");
      return;
    }

    if (password.trim().length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push("/reset-password/success");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reset your password right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create a new password"
      description="Choose a new password to secure your account."
      alternateQuestion="Want to return?"
      alternateLabel="Back to login"
      alternateHref="/login"
      hintText=""
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isCheckingRecovery || !isRecoveryReady || isLoading}
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
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isCheckingRecovery || !isRecoveryReady || isLoading}
            />
          </div>
        </div>

        {error ? (
          <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="landing-ui h-12 w-full"
          disabled={isCheckingRecovery || !isRecoveryReady || isLoading}
        >
          {isCheckingRecovery ? "Checking link..." : isLoading ? "Resetting..." : "Reset password"}
        </Button>

        {!isRecoveryReady && !isCheckingRecovery ? (
          <p className="landing-small text-center text-muted-foreground">
            <Link href="/forgot-password" className="font-medium text-foreground hover:text-primary">
              Request a new reset link
            </Link>
          </p>
        ) : null}
      </form>
    </AuthShell>
  );
}
