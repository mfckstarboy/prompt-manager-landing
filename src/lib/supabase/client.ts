import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { anonKey, url };
}

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { anonKey, url } = getSupabaseEnv();

  browserClient = createBrowserClient(url, anonKey);

  return browserClient;
}
