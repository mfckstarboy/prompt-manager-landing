import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Password Updated | PromptTray",
  description: "Your PromptTray password has been updated successfully.",
};

export default function ResetPasswordSuccessPage() {
  return (
    <AuthShell
      title="Password updated"
      description="You can now log in with your new password."
      hintText=""
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>

        <Button asChild className="landing-ui h-12 w-full">
          <Link href="/sign-in">Go to login</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
