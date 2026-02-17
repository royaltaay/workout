"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, onAuthChange, signInWithEmail, signOut as supabaseSignOut } from "./supabase";

type AuthState = {
  user: User | null;
  isAnonymous: boolean;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  isAnonymous: true,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const sb = getSupabase();
    if (sb) {
      sb.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
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

  const isAnonymous = !user || user.is_anonymous === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAnonymous,
        loading,
        signIn: signInWithEmail,
        signOut: supabaseSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
