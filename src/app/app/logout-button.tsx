"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Logging out..." : "Log out"}
    </Button>
  );
}
