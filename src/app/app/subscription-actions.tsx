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
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reactivateError, setReactivateError] = useState<string | null>(null);

  const active = isPremiumActive(planInfo);
  const canceled = isPremiumCanceled(planInfo);

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

  if (!active && !canceled) return null;

  return (
    <>
      <div className="mt-4 flex flex-col gap-2">
        {planInfo.periodEnd && (
          <p className="text-[12px] font-medium tracking-[-0.076px] text-[#86868b]">
            {active
              ? `Renews ${formatDate(planInfo.periodEnd)}`
              : `Premium access until ${formatDate(planInfo.periodEnd)}`}
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
