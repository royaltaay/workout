"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AuthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAnonymous, signIn, verifyOtp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setVerifying(false);
    if (result.error) {
      setError(result.error);
    } else {
      setStep("email");
      setEmail("");
      setCode("");
    }
  }

  async function handleSignOut() {
    await signOut();
    onClose();
  }

  function handleBack() {
    setStep("email");
    setCode("");
    setError(null);
  }

  return (
    <>
      {/* Full-screen overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[#0a0a0a] transition-all duration-300 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0 translate-y-4"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Close button */}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 active:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content — positioned in upper third so keyboard doesn't cover it */}
        <div className="mx-auto max-w-sm px-6 pt-12">
          {isAnonymous ? (
            step === "email" ? (
              <div>
                <h2 className="text-lg font-semibold text-white">Sign in to save workouts</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  We&apos;ll send a code to your email.
                </p>
                <form onSubmit={handleSendCode} className="mt-8 space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                  >
                    {sending ? "Sending..." : "Send code"}
                  </button>
                </form>
              </div>
            ) : (
              <div>
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
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={verifying || code.length < 8}
                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                </form>
              </div>
            )
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-white">Account</h2>
              <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="mt-8 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 transition-colors active:text-white"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
