"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/subscription-context";
import { getSupabase } from "@/lib/supabase";

export default function AccountView() {
  const { user, isAnonymous, signIn, verifyOtp, signOut } = useAuth();
  const { status, hasAccess } = useSubscription();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const result = await signIn(email.trim());
    setSending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep("code");
      setCode("");
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 8) return;
    setVerifying(true);
    setError(null);
    const result = await verifyOtp(email.trim(), code);
    if (result.error) {
      setVerifying(false);
      setError(result.error);
    } else {
      // Auto-redirect to Stripe checkout after successful sign-in
      try {
        const sb = getSupabase();
        if (!sb) { setVerifying(false); return; }
        const { data: { session } } = await sb.auth.getSession();
        if (!session?.access_token) { setVerifying(false); return; }

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
          return; // keep spinner while redirecting
        }
      } catch (err) {
        console.error("Auto-checkout error:", err);
      }
      setVerifying(false);
      setStep("email");
      setEmail("");
      setCode("");
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  async function handleUpgrade() {
    setUpgradeLoading(true);
    try {
      const sb = getSupabase();
      if (!sb) return;
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleManage() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const sb = getSupabase();
      if (!sb) { setPortalError("Unable to connect"); return; }
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.access_token) { setPortalError("Please sign in again"); return; }

      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await res.json();
      if (body.url) {
        window.location.href = body.url;
        return;
      }
      setPortalError(body.error ?? "Unable to open subscription portal");
    } catch (err) {
      console.error("Portal error:", err);
      setPortalError("Something went wrong. Try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  function handleBack() {
    setStep("email");
    setCode("");
    setError(null);
  }

  const statusLabel: Record<string, string> = {
    active: "Pro — Active",
    trial: "Pro — Trial",
    canceled: hasAccess ? "Pro — Canceling" : "Free plan",
    past_due: "Pro — Past due",
    free: "Free plan",
  };

  return (
    <div className="pb-4 pt-8">
      <div className="mx-auto max-w-sm">
        {isAnonymous ? (
          step === "email" ? (
            <div className="animate-in">
              <h2 className="text-xl font-bold text-white">Track your progress</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Day 1 is free. Subscribe to unlock all 3 days and track your progress.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex gap-3">
                  <span className="mt-0.5 text-sm text-red-500/70">&#9670;</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Log every set</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Track weight, reps, and RPE as you train. Pick up where you left off.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 text-sm text-red-500/70">&#9670;</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Session history</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Review past workouts and see what you lifted last time.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 text-sm text-red-500/70">&#9670;</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Progress charts</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Visualize your volume and strength trends over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-center text-sm font-medium text-white">
                  $5/month &middot; cancel anytime
                </p>
                <form onSubmit={handleSendCode} className="mt-4 space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                  >
                    {sending ? "Sending..." : "Continue"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="animate-in">
              <button
                onClick={handleBack}
                className="mb-6 flex items-center gap-1 text-sm text-zinc-500 active:text-zinc-300"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
              </button>
              <h2 className="text-lg font-semibold text-white">Enter your code</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Sent to {email}
              </p>
              <form onSubmit={handleVerifyCode} className="mt-8 space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="00000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xl font-mono tracking-[0.2em] text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={verifying || code.length < 8}
                  className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                >
                  {verifying ? "Verifying..." : "Verify & subscribe"}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="animate-in">
            <h2 className="text-lg font-semibold text-white">Account</h2>
            <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>

            {/* Subscription status */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm text-zinc-400">Plan</p>
              <p className="mt-0.5 text-sm font-medium text-white">
                {statusLabel[status] ?? "Free plan"}
              </p>
            </div>

            {hasAccess && (
              <>
                <button
                  onClick={handleManage}
                  disabled={portalLoading}
                  className="mt-3 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 transition-colors active:text-white disabled:opacity-40"
                >
                  {portalLoading ? "Loading..." : "Manage subscription"}
                </button>
                {portalError && (
                  <p className="mt-2 text-center text-xs text-red-400">{portalError}</p>
                )}
              </>
            )}

            {!hasAccess && (
              <div className="mt-6 space-y-3">
                <div className="flex gap-3">
                  <span className="mt-0.5 text-sm text-red-500/70">&#9670;</span>
                  <p className="text-sm text-zinc-400">Log every set — weight, reps, and RPE</p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 text-sm text-red-500/70">&#9670;</span>
                  <p className="text-sm text-zinc-400">Review past sessions and pick up where you left off</p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 text-sm text-red-500/70">&#9670;</span>
                  <p className="text-sm text-zinc-400">Visualize your progress with charts</p>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                  className="mt-1 w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                >
                  {upgradeLoading ? "Loading..." : "Subscribe — $5/mo"}
                </button>
                <p className="text-center text-xs text-zinc-600">Cancel anytime</p>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="mt-3 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 transition-colors active:text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
