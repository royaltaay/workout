"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AuthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAnonymous, signIn, verifyOtp, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Swipe-to-dismiss
  const dragRef = useRef({ startY: 0, dragging: false });
  const [dragOffset, setDragOffset] = useState(0);

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current = { startY: e.clientY, dragging: true };
    setDragOffset(0);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current.dragging) return;
    setDragOffset(Math.max(0, e.clientY - dragRef.current.startY));
  }

  function handlePointerUp() {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    if (dragOffset > 80) {
      onClose();
    }
    setDragOffset(0);
  }

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
    if (code.length < 6) return;
    setVerifying(true);
    setError(null);
    const result = await verifyOtp(email.trim(), code);
    setVerifying(false);
    if (result.error) {
      setError(result.error);
    } else {
      // Success — auth state change will update the UI
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 ${
          open && dragOffset === 0 ? "transition-transform duration-300 ease-out" : ""
        } ${
          open ? "" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          transform: open ? `translateY(${dragOffset}px)` : "translateY(100%)",
        }}
      >
        <div className="mx-auto max-w-lg rounded-t-2xl border border-white/10 border-b-0 bg-[#1a1a1a] px-6 pb-8 pt-2">
          {/* Handle — drag zone */}
          <div
            className="flex justify-center pb-4 pt-2 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {isAnonymous ? (
            step === "email" ? (
              /* Step 1: Enter email */
              <div>
                <h2 className="text-lg font-semibold text-white">Sign in to save workouts</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  We&apos;ll send a 6-digit code to your email.
                </p>
                <form onSubmit={handleSendCode} className="mt-6 space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
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
              /* Step 2: Enter code */
              <div>
                <button
                  onClick={handleBack}
                  className="mb-4 flex items-center gap-1 text-sm text-zinc-500 active:text-zinc-300"
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
                <form onSubmit={handleVerifyCode} className="mt-6 space-y-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={verifying || code.length < 6}
                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                  >
                    {verifying ? "Verifying..." : "Verify"}
                  </button>
                </form>
              </div>
            )
          ) : (
            /* Signed in */
            <div>
              <h2 className="text-lg font-semibold text-white">Account</h2>
              <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="mt-6 w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 transition-colors active:text-white"
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
