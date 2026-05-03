"use client";

interface Props {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ReactivateDialog({ open, isLoading, error, onConfirm, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reactivate-dialog-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[28px] border border-border/80 bg-card p-8 shadow-[0_28px_70px_-24px_rgba(15,23,42,0.32)]">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg
            className="h-5 w-5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2
          id="reactivate-dialog-title"
          className="text-[26px] leading-[30px] tracking-[-0.01em] text-foreground"
          style={{ fontFamily: "Instrument Serif, serif", fontWeight: 400 }}
        >
          Reactivate subscription?
        </h2>

        <p className="landing-body mt-3 text-muted-foreground">
          Your subscription resumes at the next billing date. You won&apos;t be charged now — billing continues on your existing cycle.
        </p>

        <ul className="mt-4 space-y-1.5">
          {["Unlimited prompts & categories", "Variables in prompts", "Version history"].map(
            (feature) => (
              <li key={feature} className="landing-small flex items-center gap-2 text-muted-foreground">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {feature} — stays active
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
            className="landing-ui flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60"
          >
            {isLoading ? "Reactivating…" : "Yes, reactivate subscription"}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="landing-ui flex h-12 w-full items-center justify-center rounded-full border border-border bg-transparent text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
