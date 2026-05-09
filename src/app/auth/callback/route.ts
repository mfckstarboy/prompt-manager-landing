import { NextResponse, type NextRequest } from "next/server";

import {
  buildExtensionSuccessPath,
  getExtensionBridgeState,
} from "@/lib/auth/extension-bridge";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description") ?? searchParams.get("error");

  const bridge = getExtensionBridgeState(searchParams);
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const failureRedirect = (message: string) => {
    const loginUrl = new URL("/login", origin);
    if (bridge.extensionId) {
      loginUrl.searchParams.set("ext_id", bridge.extensionId);
      loginUrl.searchParams.set("source", "extension");
    }
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  };

  if (errorDescription) {
    return failureRedirect(errorDescription);
  }

  if (!code) {
    return failureRedirect("Missing authorization code from Google.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return failureRedirect(error.message);
  }

  const successPath = bridge.isExtensionFlow
    ? buildExtensionSuccessPath(bridge.extensionId, mode)
    : "/app";

  return NextResponse.redirect(new URL(successPath, origin));
}
