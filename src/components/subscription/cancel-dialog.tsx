"use client";

import { formatDate } from "@/lib/subscription";

interface Props {
  open: boolean;
  periodEnd: string | null;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelDialog({ open, periodEnd, isLoading, error, onConfirm, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[28px] border border-border/80 bg-card p-8 shadow-[0_28px_70px_-24px_rgba(15,23,42,0.32)]">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-5 w-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2
          id="cancel-dialog-title"
          className="text-[26px] leading-[30px] tracking-[-0.01em] text-foreground"
          style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
        >
          Cancel subscription?
        </h2>

        <p className="landing-body mt-3 text-muted-foreground">
          {periodEnd
            ? `Your Premium access continues until ${formatDate(periodEnd)}. After that your account switches to the free plan.`
            : "Your Premium access will continue until the end of your current billing period."}
        </p>

        <ul className="mt-4 space-y-1.5">
          {["Unlimited prompts & categories", "Variables in prompts", "Version history"].map(
            (feature) => (
              <li key={feature} className="landing-small flex items-center gap-2 text-muted-foreground">
                <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                {feature} — removed when period ends
              </li>
            )
          )}
        </ul>

        {error && (
          <p className="landing-small mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="landing-ui flex h-12 w-full items-center justify-center rounded-full bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {isLoading ? "Canceling…" : "Yes, cancel subscription"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="landing-ui flex h-12 w-full items-center justify-center rounded-full border border-border bg-transparent text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            Keep my subscription
          </button>
        </div>
      </div>
    </div>
  );
}
