"use client";

import { useEffect, useState, useRef } from "react";
import { getSessions, type WorkoutSession } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function SessionCard({ session }: { session: WorkoutSession }) {
  const [expanded, setExpanded] = useState(false);
  const exerciseNames = Object.keys(session.exercises);

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="shrink-0 rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
          {session.day}
        </span>
        <span className="flex-1 text-sm text-zinc-300">{formatDate(session.date)}</span>
        <span className="text-xs text-zinc-500">{formatDuration(session.duration)}</span>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ease-out ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-white/5 px-4 pb-4 pt-3">
            {exerciseNames.map((name) => {
              const sets = session.exercises[name];
              if (!sets?.length) return null;
              const filledSets = sets.filter((s) => s.weight || s.reps);
              if (!filledSets.length) return null;
              return (
                <div key={name}>
                  <p className="text-sm font-medium text-white">{name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    {filledSets.map((s, i) => (
                      <span key={i} className="text-xs text-zinc-500">
                        {s.weight && s.reps
                          ? `${s.weight} × ${s.reps}`
                          : s.weight
                            ? `${s.weight} lb`
                            : `${s.reps} reps`}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryView({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { isAnonymous } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    getSessions().then((s) => {
      setSessions(s);
      // Clear flag after animation has time to play
      setTimeout(() => { firstLoad.current = false; }, 600);
    });
  }, []);

  return (
    <div className="pb-4 pt-2">
      {/* Loading spinner */}
      {sessions === null && (
        <div className="flex justify-center py-20">
          <svg className="h-6 w-6 animate-spin text-red-500/60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
            <path d="M12 2a10 10 0 019.75 7.75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Empty state */}
      {sessions !== null && sessions.length === 0 && (
        <div className={`flex flex-col items-center py-16 text-center ${firstLoad.current ? "animate-in" : ""}`}>
          <svg className="h-12 w-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-zinc-400">No workouts yet</p>
          <p className="mt-1 text-xs text-zinc-600">Complete a session to see it here</p>
          {isAnonymous && (
            <button
              onClick={onOpenAuth}
              className="mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-300 transition-colors active:bg-white/10"
            >
              Sign in to save across devices
            </button>
          )}
        </div>
      )}

      {/* Session list */}
      {sessions !== null && sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s, i) => (
            <div key={s.id} className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: `${i * 50}ms` } : undefined}>
              <SessionCard session={s} />
            </div>
          ))}
        </div>
      )}

      {/* Credit */}
      <p className={`mt-8 border-t border-white/5 pt-4 text-center text-sm text-zinc-500 ${firstLoad.current ? "animate-in" : ""}`} style={firstLoad.current ? { animationDelay: "200ms" } : undefined}>
        A workout program by{" "}
        <a href="mailto:tprince09@gmail.com" className="text-red-500/60">
          Taylor Prince
        </a>
      </p>
    </div>
  );
}
