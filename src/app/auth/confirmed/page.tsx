"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getExtensionBridgeState, withExtensionBridge } from "@/lib/auth/extension-bridge";

function ConfirmedPageContent() {
  const searchParams = useSearchParams();
  const {
    extensionId,
    hasExtensionSource,
    isExtensionFlow,
    isMissingExtensionId,
  } = getExtensionBridgeState(searchParams);

  const loginHref = withExtensionBridge("/login", extensionId, { signup: "confirmed" });

  return (
    <AuthShell
      title="Your email is confirmed."
      description={
        isExtensionFlow
          ? "Your account is ready. Log in to connect PromptTray in Chrome and finish setup."
          : "Your account is ready. Log in to start using PromptTray."
      }
      eyebrow="Account confirmed"
      hintText="Email confirmed. Account created successfully."
    >
      <div className="space-y-4">
        {hasExtensionSource && !isExtensionFlow ? (
          <p className="landing-small rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {isMissingExtensionId
              ? "PromptTray is missing the extension connection details. Start login again from the extension."
              : "PromptTray could not verify this Chrome extension connection. You can still log in on the website."}
          </p>
        ) : null}

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <p className="landing-small font-medium">Email confirmed</p>
          <p className="landing-small mt-1">
            Account created successfully. The next step is to log in.
          </p>
        </div>

        <Button asChild className="landing-ui h-12 w-full">
          <Link href={loginHref}>Log in</Link>
        </Button>

        <p className="landing-small text-center text-muted-foreground">
          {isExtensionFlow
            ? "After login, PromptTray will guide you back into the extension flow."
            : "After login, you can open PromptTray and continue from ChatGPT."}
        </p>
      </div>
    </AuthShell>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmedPageContent />
    </Suspense>
  );
}
