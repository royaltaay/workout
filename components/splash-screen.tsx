"use client";

export default function SplashScreen({
  onViewProgram,
  onSignIn,
}: {
  onViewProgram: () => void;
  onSignIn: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-0 pl-[calc(1.5rem+env(safe-area-inset-left))] pr-[calc(1.5rem+env(safe-area-inset-right))]">
      {/* Hero */}
      <div className="animate-in flex flex-col items-center text-center">
        <svg
          width="56"
          height="56"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2L14.5 16.5L16 18L17.5 16.5L16 2Z" fill="#d4d4d8" />
          <rect x="10" y="17.5" width="12" height="2" rx="1" fill="#a1a1aa" />
          <rect x="14.75" y="19.5" width="2.5" height="6" rx="0.5" fill="#71717a" />
          <circle cx="16" cy="27.5" r="2" fill="#a1a1aa" />
        </svg>
        <h1 className="mt-3 text-3xl font-bold text-white">Dungym</h1>
        <p className="mt-6 text-base leading-relaxed text-zinc-400">
          A complete strength program built around the kettlebell.
          <br />
          Three days a week. Simple and repeatable.
        </p>
      </div>

      {/* What you get */}
      <div
        className="animate-in mt-10 space-y-4"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex gap-3">
          <span className="mt-0.5 text-sm text-red-500/70">&#9632;</span>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              The Complex
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Swings, cleans, squats, presses, windmills. The foundation of every session.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-0.5 text-sm text-red-500/70">&#9632;</span>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Superset + Finisher
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Push, pull, and carry work that rounds out each day. Mon, Wed, Fri.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-0.5 text-sm text-red-500/70">&#9632;</span>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              Tempo controlled
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              Every rep has a prescribed tempo. Eccentric loading that builds real strength.
            </p>
          </div>
        </div>
      </div>

      {/* Equipment note */}
      <p
        className="animate-in mt-8 text-sm text-zinc-600"
        style={{ animationDelay: "150ms" }}
      >
        All you need is a kettlebell and a pull-up bar.
      </p>

      {/* Spacer to push CTAs down */}
      <div className="flex-1" />

      {/* Sticky CTAs */}
      <div
        className="animate-in sticky bottom-0 bg-[#0a0a0a] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4"
        style={{ animationDelay: "200ms" }}
      >
        <button
          onClick={onViewProgram}
          className="w-full rounded-xl bg-red-500 py-3.5 text-center text-base font-semibold text-white transition-colors active:bg-red-600"
        >
          View the Program
        </button>
        <button
          onClick={onSignIn}
          className="mt-3 w-full py-3 text-center text-sm text-zinc-500 transition-colors active:text-white"
        >
          Sign in for tracking & progress
        </button>
      </div>
    </div>
  );
}
