"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, onAuthChange, signInWithEmail, signInWithPassword, verifyOtp as supabaseVerifyOtp, signOut as supabaseSignOut } from "./supabase";

type AuthState = {
  user: User | null;
  isAnonymous: boolean;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  isAnonymous: true,
  loading: true,
  signIn: async () => ({ error: null }),
  verifyOtp: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "";
const OWNER_PASSWORD = process.env.NEXT_PUBLIC_OWNER_PASSWORD ?? "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const sb = getSupabase();
    if (sb) {
      sb.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
        } else if (OWNER_EMAIL && OWNER_PASSWORD) {
          // Auto-sign in owner while email provider is being set up
          const { error } = await signInWithPassword(OWNER_EMAIL, OWNER_PASSWORD);
          if (error) console.warn("Owner auto-sign-in failed:", error);
          // onAuthChange listener will update state
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }

    // Listen for changes
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAnonymous = DEV_BYPASS ? false : !user || user.is_anonymous === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAnonymous,
        loading,
        signIn: signInWithEmail,
        verifyOtp: supabaseVerifyOtp,
        signOut: supabaseSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
