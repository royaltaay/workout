"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function UpgradeModal({ onDismiss }: { onDismiss: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const sb = getSupabase();
      if (!sb) return;

      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const { url, error } = await res.json();
      if (error) {
        console.error("Checkout error:", error);
        setLoading(false);
        return;
      }

      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Sheet */}
      <div
        className="relative z-10 w-full max-w-lg rounded-t-2xl border-t border-white/10 bg-[#1a1a1a] px-6 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto max-w-sm">
          <h2 className="text-xl font-bold text-white">Subscribe to Dungym</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Log your sets, view session history, and track your progress over time.
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            $5/month &middot; cancel anytime
          </p>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
          >
            {loading ? "Loading..." : "Subscribe — $5/mo"}
          </button>

          <button
            onClick={onDismiss}
            className="mt-3 w-full py-3 text-sm text-zinc-500 transition-colors active:text-zinc-300"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
