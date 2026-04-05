const DEFAULT_SITE_URL = "https://www.prompttray.app";

function normalizeSiteUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL;

  if (siteUrl === "https://prompttray.app") {
    return DEFAULT_SITE_URL;
  }

  return siteUrl;
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}
