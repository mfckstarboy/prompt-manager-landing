"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { authInputClassName, authLabelClassName } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AccountSettingsFormProps = {
  initialEmail: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function AccountSettingsForm({ initialEmail }: AccountSettingsFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState(initialEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    if (normalizedEmail === initialEmail.toLowerCase()) {
      setEmailSuccess("Your email is already up to date.");
      setIsEditingEmail(false);
      return;
    }

    setIsSavingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: normalizedEmail,
      });

      if (error) {
        setEmailError(error.message);
        return;
      }

      setEmailSuccess("Check your inbox to confirm the new email address.");
      setIsEditingEmail(false);
      router.refresh();
    } catch (caughtError) {
      setEmailError(
        caughtError instanceof Error ? caughtError.message : "Unable to update your email."
      );
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.trim().length < 8) {
      setPasswordError("Use at least 8 characters for your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
        return;
      }

      setPasswordSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (caughtError) {
      setPasswordError(
        caughtError instanceof Error ? caughtError.message : "Unable to update your password."
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="mt-8 grid gap-4">
      <section className="rounded-2xl border border-border bg-background px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="landing-label text-muted-foreground">Email</p>
            <p className="landing-small mt-2 text-muted-foreground">
              This is the address connected to PromptTray sync and account access.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="landing-ui h-9 px-4"
            onClick={() => {
              setIsEditingEmail((current) => !current);
              setEmailError(null);
              setEmailSuccess(null);
              setEmail(initialEmail);
            }}
          >
            {isEditingEmail ? "Cancel" : "Edit"}
          </Button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleEmailSubmit}>
          {isEditingEmail ? (
            <div className="grid gap-2">
              <label htmlFor="account-email" className={authLabelClassName}>
                New email
              </label>
              <input
                id="account-email"
                name="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={authInputClassName}
                disabled={isSavingEmail}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card px-4 py-3">
              <p className="landing-h4 text-base text-foreground">{initialEmail}</p>
            </div>
          )}

          {emailError ? (
            <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {emailError}
            </p>
          ) : null}

          {emailSuccess ? (
            <p className="landing-small rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              {emailSuccess}
            </p>
          ) : null}

          {isEditingEmail ? (
            <Button
              type="submit"
              className="landing-ui h-11 px-5"
              disabled={isSavingEmail}
            >
              {isSavingEmail ? "Saving..." : "Save email"}
            </Button>
          ) : null}
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-background px-5 py-5">
        <div>
          <p className="landing-label text-muted-foreground">Password</p>
          <p className="landing-small mt-2 text-muted-foreground">
            Choose a new password for your PromptTray account.
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="new-password" className={authLabelClassName}>
                New password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Use at least 8 characters"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={authInputClassName}
                disabled={isSavingPassword}
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
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={authInputClassName}
                disabled={isSavingPassword}
              />
            </div>
          </div>

          {passwordError ? (
            <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {passwordError}
            </p>
          ) : null}

          {passwordSuccess ? (
            <p className="landing-small rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
              {passwordSuccess}
            </p>
          ) : null}

          <Button
            type="submit"
            className="landing-ui h-11 px-5"
            disabled={isSavingPassword}
          >
            {isSavingPassword ? "Updating..." : "Change password"}
          </Button>
        </form>
      </section>
    </div>
  );
}
