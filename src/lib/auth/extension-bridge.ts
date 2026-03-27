const EXTENSION_SOURCE = "extension";

export type ExtensionBridgeState = {
  extensionId: string;
  hasExtensionSource: boolean;
  isInvalidExtensionId: boolean;
  isExtensionFlow: boolean;
  isMissingExtensionId: boolean;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

function getAllowedExtensionIds() {
  return [
    process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID,
    process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID_DEV,
  ]
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
  const extensionId = searchParams.get("ext_id")?.trim() ?? "";
  const source = searchParams.get("source")?.trim() ?? "";
  const hasExtensionSource = source === EXTENSION_SOURCE;
  const extensionIdAllowed = isAllowedExtensionId(extensionId);
  const isMissingExtensionId = hasExtensionSource && extensionId.length === 0;
  const isInvalidExtensionId = hasExtensionSource && extensionId.length > 0 && !extensionIdAllowed;

  return {
    extensionId: extensionIdAllowed ? extensionId : "",
    hasExtensionSource,
    isInvalidExtensionId,
    isExtensionFlow: hasExtensionSource && extensionIdAllowed,
    isMissingExtensionId,
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
