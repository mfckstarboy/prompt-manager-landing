"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { getExtensionBridgeState, withExtensionBridge } from "@/lib/auth/extension-bridge";
import { createClient } from "@/lib/supabase/client";

type HandoffState = {
  message: string;
  status: "error" | "loading" | "success";
};

type ExtensionHandoffWindow = Window & {
  __promptTrayExtensionHandoffPromise?: Promise<void>;
  __promptTrayExtensionHandoffKey?: string;
};

type ChromeRuntimeBridge = {
  runtime?: {
    lastError?: { message?: string };
    sendMessage: (
      extensionId: string,
      message: unknown,
      callback: (response?: { error?: string; ok?: boolean }) => void
    ) => void;
  };
};

function waitForExtensionSession(supabase: ReturnType<typeof createClient>) {
  return new Promise<Session | null>(async (resolve) => {
    console.log("[PromptTray Website] Session fetch started");

    const initialResult = await supabase.auth.getSession();
    const initialSession = initialResult.data.session;

    console.log("[PromptTray Website] Session fetch result", {
      error: initialResult.error?.message || null,
      hasSession: Boolean(initialSession),
      userEmail: initialSession?.user?.email || "",
      userId: initialSession?.user?.id || "",
    });

    if (initialSession?.access_token && initialSession.refresh_token) {
      resolve(initialSession);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      subscription.data.subscription.unsubscribe();
      console.log("[PromptTray Website] No session available for extension handoff");
      resolve(null);
    }, 4000);

    const subscription = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[PromptTray Website] Auth state change observed while waiting for session", {
        event: _event,
        hasSession: Boolean(session),
        userEmail: session?.user?.email || "",
        userId: session?.user?.id || "",
      });

      if (session?.access_token && session.refresh_token) {
        window.clearTimeout(timeoutId);
        subscription.data.subscription.unsubscribe();
        resolve(session);
      }
    });
  });
}

function sendSessionToExtension(extensionId: string, session: Session) {
  return new Promise<void>((resolve, reject) => {
    const runtime = (globalThis as typeof globalThis & { chrome?: ChromeRuntimeBridge }).chrome
      ?.runtime;
    const message = {
      type: "prompttray:auth:handoff",
      session,
    };

    if (!runtime?.sendMessage) {
      reject(new Error("PromptTray extension messaging is not available in this browser."));
      return;
    }

    console.log("[PromptTray Website] Preparing auth message", {
      extensionId,
      messageType: message.type,
      payloadKeys: Object.keys(message),
      sessionKeys: Object.keys(session),
      userKeys: Object.keys(session.user),
    });
    console.log("[PromptTray Website] EXECUTING REAL AUTH HANDOFF", {
      extId: extensionId,
      messageType: message.type,
      sessionKeys: Object.keys(session),
    });
    console.log("[PromptTray Website] Calling chrome.runtime.sendMessage", {
      extensionId,
      messageType: message.type,
    });

    try {
      runtime.sendMessage(extensionId, message, (response) => {
        const lastError = runtime.lastError;

        console.log("[PromptTray Website] Callback fired", {
          callbackFired: true,
          messageType: message.type,
          response,
        });
        console.log("[PromptTray Website] chrome.runtime.lastError", lastError?.message || null);

        if (lastError?.message) {
          reject(new Error(lastError.message));
          return;
        }

        if (!response?.ok) {
          reject(new Error(response?.error || "PromptTray could not accept the login handoff."));
          return;
        }

        resolve();
      });
    } catch (error) {
      console.error("[PromptTray Website] chrome.runtime.sendMessage threw", error);
      reject(error instanceof Error ? error : new Error("PromptTray auth handoff failed."));
    }
  });
}

function ExtensionSuccessContent() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<HandoffState>({
    message: "Connecting your website session to PromptTray in Chrome...",
    status: "loading",
  });
  const { extensionId, isExtensionFlow } = getExtensionBridgeState(searchParams);
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  useEffect(() => {
    async function connectExtension() {
      console.log("[PromptTray Website] Extension success page mounted");

      if (!isExtensionFlow) {
        console.log("[PromptTray Website] Missing ext_id for extension handoff");
        setState({
          message: "Missing extension connection details. Please start again from PromptTray.",
          status: "error",
        });
        return;
      }

      console.log("[PromptTray Website] ext_id found", { extensionId, mode });

      const session = await waitForExtensionSession(supabase);

      if (!session?.access_token || !session.refresh_token) {
        console.log("[PromptTray Website] Handoff stopped because no usable session was available", {
          hasAccessToken: Boolean(session?.access_token),
          hasRefreshToken: Boolean(session?.refresh_token),
          hasSession: Boolean(session),
        });
        setState({
          message: "Your website session is not ready yet. Log in again and retry the extension connection.",
          status: "error",
        });
        return;
      }

      try {
        console.log("[PromptTray Website] Actual session object shape", {
          sessionType: typeof session,
          sessionKeys: Object.keys(session || {}),
          userKeys: Object.keys(session.user || {}),
        });
        console.log("[PromptTray Website] Preparing auth session for extension handoff", {
          extensionId,
          hasAccessToken: Boolean(session.access_token),
          hasRefreshToken: Boolean(session.refresh_token),
          mode,
          userEmail: session.user.email ?? "",
          userId: session.user.id,
        });

        const handoffWindow = window as ExtensionHandoffWindow;
        const handoffKey = `${extensionId}:${session.access_token}`;

        if (
          handoffWindow.__promptTrayExtensionHandoffKey === handoffKey &&
          handoffWindow.__promptTrayExtensionHandoffPromise
        ) {
          await handoffWindow.__promptTrayExtensionHandoffPromise;
        } else {
          const handoffPromise = sendSessionToExtension(extensionId, session);
          handoffWindow.__promptTrayExtensionHandoffKey = handoffKey;
          handoffWindow.__promptTrayExtensionHandoffPromise = handoffPromise;
          await handoffPromise;
        }

        setState({
          message: `PromptTray in Chrome is now connected${session.user.email ? ` as ${session.user.email}` : ""}.`,
          status: "success",
        });
      } catch (caughtError) {
        console.error("[PromptTray Website] Extension handoff failed", caughtError);
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "PromptTray could not complete the extension handoff.";

        setState({
          message,
          status: "error",
        });
      }
    }

    connectExtension();
  }, [extensionId, isExtensionFlow, mode, supabase]);

  return (
    <AuthShell
      title={state.status === "success" ? "Extension connected" : "Finish in PromptTray"}
      description={
        state.status === "success"
          ? "Your website login is now connected to the Chrome extension."
          : mode === "signup"
            ? "We are finishing your new account connection with the extension."
            : "We are finishing your login connection with the extension."
      }
      hintText=""
      eyebrow="Extension handoff"
    >
      <div className="space-y-4">
        <div
          className={`landing-small rounded-2xl px-4 py-3 ${
            state.status === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : state.status === "error"
                ? "border border-red-200 bg-red-50 text-red-600"
                : "border border-border bg-background text-muted-foreground"
          }`}
        >
          {state.message}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="landing-ui h-12 flex-1 gap-2">
            <a href="https://chatgpt.com/" target="_blank" rel="noreferrer">
              Open ChatGPT
            </a>
          </Button>
          <Button asChild variant="outline" className="landing-ui h-12 flex-1">
            <Link href="/app">Open dashboard</Link>
          </Button>
        </div>

        {state.status === "error" ? (
          <p className="landing-small text-center text-muted-foreground">
            <Link
              href={withExtensionBridge("/login", extensionId)}
              className="font-medium text-foreground hover:text-primary"
            >
              Return to login
            </Link>
          </p>
        ) : null}
      </div>
    </AuthShell>
  );
}

export default function ExtensionSuccessPage() {
  return (
    <Suspense fallback={null}>
      <ExtensionSuccessContent />
    </Suspense>
  );
}
