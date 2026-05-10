"use client";

import { useState } from "react";

import { CancelDialog } from "@/components/subscription/cancel-dialog";
import { ReactivateDialog } from "@/components/subscription/reactivate-dialog";
import { formatDate, isPremiumActive, isPremiumCanceled, type PlanInfo } from "@/lib/subscription";

interface Props {
  planInfo: PlanInfo;
}

export function SubscriptionActions({ planInfo }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isReactivateLoading, setIsReactivateLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reactivateError, setReactivateError] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);

  const active = isPremiumActive(planInfo);
  const canceled = isPremiumCanceled(planInfo);
  const pastDue = planInfo.status === "past_due";

  async function handleCancel() {
    setCancelError(null);
    setIsCancelLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Cancellation failed.");
      }
      window.location.reload();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Something went wrong.");
      setIsCancelLoading(false);
    }
  }

  async function handleReactivate() {
    setReactivateError(null);
    setIsReactivateLoading(true);
    try {
      const res = await fetch("/api/subscription/reactivate", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Reactivation failed.");
      }
      window.location.reload();
    } catch (err) {
      setReactivateError(err instanceof Error ? err.message : "Something went wrong.");
      setIsReactivateLoading(false);
    }
  }

  async function openPaddlePortal(intent: "manage" | "update-payment-method") {
    setPortalError(null);
    setIsPortalLoading(true);
    try {
      const res = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Unable to open billing portal.");
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("Paddle did not return a billing portal link.");
      window.location.href = data.url;
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : "Something went wrong.");
      setIsPortalLoading(false);
    }
  }

  if (!active && !canceled) return null;

  return (
    <>
      <div className="mt-4 flex flex-col gap-2">
        {pastDue && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[12px] font-semibold text-amber-800">Payment needs attention</p>
            <p className="mt-1 text-[12px] leading-5 text-amber-700">
              Premium stays active while Paddle retries. Update your payment method to avoid
              cancellation.
            </p>
          </div>
        )}

        {planInfo.periodEnd && (
          <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
            {pastDue
              ? "Payment recovery in progress"
              : active
                ? `Renews ${formatDate(planInfo.periodEnd)}`
                : `Premium access until ${formatDate(planInfo.periodEnd)}`}
          </p>
        )}

        <button
          onClick={() => void openPaddlePortal(pastDue ? "update-payment-method" : "manage")}
          disabled={isPortalLoading}
          className="flex h-9 w-full items-center justify-center rounded-full bg-[#333333] text-[13px] font-medium text-white transition-colors hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPortalLoading
            ? "Opening Paddle…"
            : pastDue
              ? "Update payment method"
              : "Manage billing"}
        </button>

        {portalError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {portalError}
          </p>
        )}

        {active && (
          <button
            onClick={() => setCancelOpen(true)}
            className="flex h-9 w-full items-center justify-center rounded-full border border-[#e6e7eb] bg-transparent text-[13px] font-medium text-[#86868b] transition-colors hover:border-red-200 hover:text-red-600"
          >
            Cancel plan
          </button>
        )}

        {canceled && (
          <button
            onClick={() => setReactivateOpen(true)}
            className="flex h-9 w-full items-center justify-center rounded-full bg-[#3b82f6] text-[13px] font-medium text-white transition-colors hover:bg-blue-600"
          >
            Reactivate subscription
          </button>
        )}
      </div>

      <CancelDialog
        open={cancelOpen}
        periodEnd={planInfo.periodEnd}
        isLoading={isCancelLoading}
        error={cancelError}
        onConfirm={handleCancel}
        onClose={() => { setCancelOpen(false); setCancelError(null); }}
      />

      <ReactivateDialog
        open={reactivateOpen}
        isLoading={isReactivateLoading}
        error={reactivateError}
        onConfirm={handleReactivate}
        onClose={() => { setReactivateOpen(false); setReactivateError(null); }}
      />
    </>
  );
}
