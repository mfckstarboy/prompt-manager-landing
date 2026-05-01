"use client";

import { useEffect } from "react";

export function PendingPlanRedirect() {
  useEffect(() => {
    const pending = localStorage.getItem("prompttray.pendingPlan");
    if (pending !== "premium") {
      return;
    }

    localStorage.removeItem("prompttray.pendingPlan");

    fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval: "monthly" }),
    })
      .then((res) => res.json())
      .then((data: { url?: string }) => {
        if (data.url) {
          window.location.href = data.url;
        }
      })
      .catch(() => {
        // Intentional: user still lands on dashboard and can upgrade manually.
      });
  }, []);

  return null;
}
