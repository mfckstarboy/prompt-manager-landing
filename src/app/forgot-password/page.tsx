"use client";

import { Suspense, type FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell, authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getExtensionBridgeState, withExtensionBridge } from "@/lib/auth/extension-bridge";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { extensionId } = getExtensionBridgeState(searchParams);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${getSiteUrl()}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSuccess(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to send the reset link right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we&apos;ll send you a reset link."
      alternateQuestion="Remembered your password?"
      alternateLabel="Back to login"
      alternateHref={withExtensionBridge("/login", extensionId)}
      hintText=""
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        {isSuccess ? (
          <p className="landing-small rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            If that email exists, we sent a password reset link.
          </p>
        ) : null}

        {error ? (
          <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="landing-ui h-12 w-full"
          disabled={email.trim().length === 0 || isLoading}
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
