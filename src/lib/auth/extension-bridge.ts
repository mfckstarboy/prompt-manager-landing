const EXTENSION_SOURCE = "extension";

export type ExtensionBridgeState = {
  extensionId: string;
  hasExtensionSource: boolean;
  isInvalidExtensionId: boolean;
  isExtensionFlow: boolean;
  isMissingExtensionId: boolean;
  rawExtensionId: string;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

function getRawAllowedExtensionIds() {
  return {
    dev: process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID_DEV,
    prod: process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID,
  };
}

function getAllowedExtensionIds() {
  const rawIds = getRawAllowedExtensionIds();

  return [rawIds.prod, rawIds.dev]
    .map((value) => value?.trim() ?? "")
    .filter(Boolean);
}

export function isAllowedExtensionId(extensionId: string) {
  if (!extensionId) {
    return false;
  }

  return getAllowedExtensionIds().includes(extensionId);
}

export function getExtensionBridgeState(searchParams: SearchParamsLike): ExtensionBridgeState {
  const rawReceivedExtensionId = searchParams.get("ext_id");
  const rawExtensionId = rawReceivedExtensionId?.trim() ?? "";
  const source = searchParams.get("source")?.trim() ?? "";
  const hasExtensionSource = source === EXTENSION_SOURCE;
  const normalizedAllowlist = getAllowedExtensionIds();
  const extensionIdAllowed = normalizedAllowlist.includes(rawExtensionId);
  const isMissingExtensionId = hasExtensionSource && rawExtensionId.length === 0;
  const isInvalidExtensionId = hasExtensionSource && rawExtensionId.length > 0 && !extensionIdAllowed;

  return {
    extensionId: extensionIdAllowed ? rawExtensionId : "",
    hasExtensionSource,
    isInvalidExtensionId,
    isExtensionFlow: hasExtensionSource && extensionIdAllowed,
    isMissingExtensionId,
    rawExtensionId,
  };
}

export function withExtensionBridge(
  pathname: string,
  extensionId: string,
  extraParams?: Record<string, string>
) {
  if (!extensionId) {
    return pathname;
  }

  const params = new URLSearchParams({
    ext_id: extensionId,
    source: EXTENSION_SOURCE,
  });

  Object.entries(extraParams ?? {}).forEach(([key, value]) => {
    params.set(key, value);
  });

  return `${pathname}?${params.toString()}`;
}

export function buildExtensionSuccessPath(extensionId: string, mode: "login" | "signup") {
  return withExtensionBridge("/auth/extension-success", extensionId, { mode });
}
