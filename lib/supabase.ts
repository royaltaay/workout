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

export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: "Supabase not configured" };

  const { error } = await sb.auth.signInWithOtp({ email });
  return { error: error?.message ?? null };
}

export async function verifyOtp(email: string, token: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: "Supabase not configured" };

  const { error } = await sb.auth.verifyOtp({ email, token, type: "email" });
  return { error: error?.message ?? null };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: "Supabase not configured" };

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (!error) authReady = true;
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  authReady = false;
}

export function onAuthChange(callback: (user: import("@supabase/supabase-js").User | null) => void) {
  const sb = getSupabase();
  if (!sb) return () => {};

  const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}
