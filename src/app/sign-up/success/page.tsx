import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Account Created | PromptTray",
  description: "Your PromptTray account has been created successfully.",
};

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Account created"
      description="Your PromptTray account is ready. You can now open your dashboard and connect the extension."
      hintText=""
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>

        <Button asChild className="landing-ui h-12 w-full">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
