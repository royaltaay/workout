"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function AuthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isAnonymous, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError(null);
    const result = await signIn(email.trim());
    setSending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
  }

  async function handleSignOut() {
    await signOut();
    onClose();
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
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-lg rounded-t-2xl border border-white/10 border-b-0 bg-[#1a1a1a] px-6 pb-8 pt-4">
          {/* Handle */}
          <div className="mb-6 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {isAnonymous ? (
            /* Anonymous — sign in form */
            <div>
              <h2 className="text-lg font-semibold text-white">Sign in to save workouts</h2>
              <p className="mt-1 text-sm text-zinc-400">
                We&apos;ll send a magic link to your email. No password needed.
              </p>

              {sent ? (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <svg className="mx-auto h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-white">Check your email</p>
                  <p className="mt-1 text-xs text-zinc-500">Tap the link to sign in</p>
                </div>
              ) : (
                <form onSubmit={handleSignIn} className="mt-6 space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity disabled:opacity-40"
                  >
                    {sending ? "Sending..." : "Send magic link"}
                  </button>
                </form>
              )}
            </div>
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
