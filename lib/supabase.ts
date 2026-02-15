import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key);
  }
  return client;
}

let authReady = false;

export async function ensureAuth(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  if (authReady) return true;

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) {
    const { error } = await sb.auth.signInAnonymously();
    if (error) return false;
  }
  authReady = true;
  return true;
}
