import { getSiteUrl } from "@/lib/site-url";

function normalizeHttpsUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getUpgradeCheckoutUrl() {
  return (
    normalizeHttpsUrl(process.env.NEXT_PUBLIC_UPGRADE_CHECKOUT_URL) ??
    `${getSiteUrl()}/support`
  );
}
