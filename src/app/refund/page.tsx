import type { Metadata } from "next";

import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "PromptTray refund policy.",
  alternates: { canonical: "https://www.prompttray.app/refund" },
};

export default function RefundPage() {
  return (
    <LegalShell
      title="Refund Policy"
      lastUpdated="March 23, 2026"
      description="We want you to be happy with PromptTray. If something went wrong with your purchase, here is how we handle refunds."
    >
      <LegalSection title="Eligibility">
        <p>
          You may request a full refund within 7 days of your initial purchase or renewal if you are
          not satisfied with the service. Refund requests made after 7 days will be considered on a
          case-by-case basis but are not guaranteed.
        </p>
      </LegalSection>

      <LegalSection title="How to request a refund">
        <p>
          Email{" "}
          <a
            href="mailto:support@prompttray.app"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            support@prompttray.app
          </a>{" "}
          with the subject line &ldquo;Refund Request&rdquo; and include the email address on your
          account. We aim to respond within 2 business days.
        </p>
      </LegalSection>

      <LegalSection title="Processing">
        <p>
          Approved refunds are returned to the original payment method. Processing time is typically
          5–10 business days depending on your card issuer or payment provider.
        </p>
      </LegalSection>

      <LegalSection title="Subscriptions">
        <p>
          Issuing a refund for a subscription will cancel the subscription immediately. You will
          lose access to paid features at the time of cancellation, not at the end of the billing
          period.
        </p>
      </LegalSection>

      <LegalSection title="Non-refundable situations">
        <p>
          We do not issue refunds for accounts that have been suspended or terminated due to
          violations of our Terms of Service.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about a charge or refund can be sent to{" "}
          <a
            href="mailto:support@prompttray.app"
            className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
          >
            support@prompttray.app
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
