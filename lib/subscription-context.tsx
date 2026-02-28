"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import { getSupabase } from "./supabase";

type SubscriptionStatus = "free" | "trial" | "active" | "canceled" | "past_due";

type SubscriptionState = {
  status: SubscriptionStatus;
  hasAccess: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionState>({
  status: "free",
  hasAccess: false,
  loading: true,
  refresh: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAnonymous, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>("free");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user || isAnonymous) {
      setStatus("free");
      setCurrentPeriodEnd(null);
      setLoading(false);
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    const { data } = await sb
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setStatus(data.status as SubscriptionStatus);
      setCurrentPeriodEnd(data.current_period_end);
    } else {
      setStatus("free");
      setCurrentPeriodEnd(null);
    }
    setLoading(false);
  }, [user, isAnonymous]);

  useEffect(() => {
    if (authLoading) return;
    fetchSubscription();
  }, [authLoading, fetchSubscription]);

  // For canceled subscriptions, check if still within the paid period
  const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
  const hasAccess =
    DEV_BYPASS ||
    status === "trial" ||
    status === "active" ||
    (status === "canceled" &&
      currentPeriodEnd !== null &&
      new Date(currentPeriodEnd) > new Date());

  return (
    <SubscriptionContext.Provider
      value={{ status, hasAccess, loading, refresh: fetchSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
