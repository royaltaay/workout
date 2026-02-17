"use client";

import { useEffect, useState } from "react";
import { getSessions, exportSessions, type WorkoutSession } from "@/lib/storage";

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

export default function HistoryView() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);

  useEffect(() => {
    getSessions().then(setSessions);
  }, []);

  return (
    <div className="pb-4 pt-2">
      {/* Loading skeleton */}
      {sessions === null && (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-[#1a1a1a]" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {sessions !== null && sessions.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <svg className="h-12 w-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-zinc-400">No workouts yet</p>
          <p className="mt-1 text-xs text-zinc-600">Complete a session to see it here</p>
        </div>
      )}

      {/* Session list */}
      {sessions !== null && sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}

      {/* Footer — export + credit */}
      <div className="mt-8 space-y-3 border-t border-white/5 pt-4">
        <button
          onClick={async () => {
            const json = await exportSessions();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `dungym-log-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex w-full items-center justify-center gap-1.5 text-sm text-zinc-600 transition-colors active:text-zinc-400"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
          </svg>
          <span>Export workout log</span>
        </button>
        <p className="text-center text-sm text-zinc-500">
          A workout program by{" "}
          <a href="mailto:tprince09@gmail.com" className="text-red-500/60">
            Taylor Prince
          </a>
        </p>
      </div>
    </div>
  );
}
