"use client";

import { useState } from "react";

export default function SplashScreen({
  onViewProgram,
  onSignIn,
}: {
  onViewProgram: () => void;
  onSignIn: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-12 pl-[calc(1.5rem+env(safe-area-inset-left))] pr-[calc(1.5rem+env(safe-area-inset-right))]">
      {/* Hero */}
      <div className="animate-in flex flex-col items-center text-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2L14.5 16.5L16 18L17.5 16.5L16 2Z" fill="#d4d4d8" />
          <rect x="10" y="17.5" width="12" height="2" rx="1" fill="#a1a1aa" />
          <rect x="14.75" y="19.5" width="2.5" height="6" rx="0.5" fill="#71717a" />
          <circle cx="16" cy="27.5" r="2" fill="#a1a1aa" />
        </svg>
        <h1 className="mt-4 text-4xl font-bold text-white">Dungym</h1>
        <p className="mt-2 text-lg text-zinc-400">Strength. Simplified.</p>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
          A kettlebell-driven strength program. Three days a week. No complexity.
          Just results.
        </p>
      </div>

      {/* Program overview */}
      <div className="animate-in mt-12 space-y-3" style={{ animationDelay: "100ms" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          The Program
        </h2>

        {/* The Complex */}
        <button
          onClick={() => setExpanded(expanded === "complex" ? null : "complex")}
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4 text-left transition-colors active:bg-[#222]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">The Complex</h3>
              <p className="mt-0.5 text-sm text-zinc-500">
                Your foundation — every session starts here
              </p>
            </div>
            <svg
              className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200 ${expanded === "complex" ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: expanded === "complex" ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-zinc-300">Single-Arm Swings</span>
                  <span className="text-xs text-zinc-600">10/arm · Heavy</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-zinc-300">Clean → Squat → Press</span>
                  <span className="text-xs text-zinc-600">5/arm · Heavy</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-zinc-300">Windmill</span>
                  <span className="text-xs text-zinc-600">5–8/side · Light</span>
                </div>
                <p className="pt-1 text-xs text-zinc-600">3 rounds · 90–120 sec rest</p>
              </div>
            </div>
          </div>
        </button>

        {/* 3-Day Split */}
        <button
          onClick={() => setExpanded(expanded === "split" ? null : "split")}
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4 text-left transition-colors active:bg-[#222]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">3-Day Split</h3>
              <p className="mt-0.5 text-sm text-zinc-500">
                Push, Pull, Carry — targeted work after the complex
              </p>
            </div>
            <svg
              className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-200 ${expanded === "split" ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: expanded === "split" ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="mt-3 space-y-2.5 border-t border-white/5 pt-3">
                <div>
                  <span className="text-sm font-medium text-zinc-300">Mon</span>
                  <span className="ml-2 text-sm text-zinc-500">Push / Anti-Extension</span>
                  <p className="text-xs text-zinc-600">Bench Press · KB Row · Hanging Leg Raises</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-300">Wed</span>
                  <span className="ml-2 text-sm text-zinc-500">Pull / Anti-Rotation</span>
                  <p className="text-xs text-zinc-600">Pull-Ups · Pallof Press · Cossack Squat</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-zinc-300">Fri</span>
                  <span className="ml-2 text-sm text-zinc-500">Carry / Total Body</span>
                  <p className="text-xs text-zinc-600">Barbell RDL · Dead Bug · Farmer&apos;s Carry</p>
                </div>
              </div>
            </div>
          </div>
        </button>

        {/* Tempo Controlled */}
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] px-5 py-4">
          <h3 className="font-medium text-white">Tempo Controlled</h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            Every rep has purpose. Eccentric loading builds real strength.
          </p>
        </div>
      </div>

      {/* Equipment */}
      <div className="animate-in mt-10" style={{ animationDelay: "200ms" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          What You Need
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Kettlebell (heavy + light)", "Barbell + bench", "Pull-up bar"].map(
            (item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-400"
              >
                {item}
              </span>
            )
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="animate-in mt-auto flex flex-col gap-3 pt-12" style={{ animationDelay: "300ms" }}>
        <button
          onClick={onViewProgram}
          className="w-full rounded-xl bg-red-500 py-3.5 text-center text-base font-semibold text-white transition-colors active:bg-red-600"
        >
          View the Program
        </button>
        <button
          onClick={onSignIn}
          className="w-full rounded-xl border border-white/10 py-3.5 text-center text-base font-medium text-zinc-400 transition-colors active:bg-white/5 active:text-white"
        >
          Sign in for Tracking & Progress
        </button>
      </div>
    </div>
  );
}
