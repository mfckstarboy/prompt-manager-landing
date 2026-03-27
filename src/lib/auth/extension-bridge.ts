const EXTENSION_SOURCE = "extension";

export type ExtensionBridgeState = {
  extensionId: string;
  isExtensionFlow: boolean;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

export function getExtensionBridgeState(searchParams: SearchParamsLike): ExtensionBridgeState {
  const extensionId = searchParams.get("ext_id")?.trim() ?? "";
  const source = searchParams.get("source")?.trim() ?? "";

  return {
    extensionId,
    isExtensionFlow: source === EXTENSION_SOURCE && extensionId.length > 0,
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
