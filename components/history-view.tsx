"use client";

import { useEffect, useState, useRef } from "react";
import { getSessions, deleteSession, type WorkoutSession } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { workoutPlan } from "@/lib/workout-data";
import ProgressChart from "./progress-chart";

// Build a canonical exercise order from the workout plan so history cards
// always display exercises in the same order as the workout structure.
const exerciseOrder: Record<string, number> = (() => {
  const order: Record<string, number> = {};
  let idx = 0;
  // Complex exercises first
  for (const ex of workoutPlan.complex.exercises) {
    order[ex.name] = idx++;
  }
  // Per-day supersets then finisher
  for (const day of workoutPlan.days) {
    for (const ss of day.supersets) {
      for (const ex of ss.exercises) {
        if (!(ex.name in order)) order[ex.name] = idx++;
      }
    }
    if (!(day.finisher.name in order)) order[day.finisher.name] = idx++;
  }
  return order;
})();

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

function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exerciseNames = Object.keys(session.exercises).sort(
    (a, b) => (exerciseOrder[a] ?? 999) - (exerciseOrder[b] ?? 999)
  );

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      deleteTimerRef.current = setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }
    clearTimeout(deleteTimerRef.current);
    deleteSession(session.id);
    onDelete(session.id);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-300">{session.day.split(" — ")[1] ?? session.day}</p>
          <p className="mt-0.5 text-xs text-zinc-600">{formatDate(session.date)}</p>
        </div>
        <span className="text-xs text-zinc-500">{formatDuration(session.duration)}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${expanded ? "rotate-180" : ""}`}
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
                        {s.note && (
                          <span className="ml-1 text-zinc-600">— {s.note}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                deleteConfirm
                  ? "text-red-500"
                  : "text-zinc-600 active:text-zinc-400"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              {deleteConfirm ? "Tap again to delete" : "Delete session"}
            </button>
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
      setTimeout(() => { firstLoad.current = false; }, 600);
    });
  }, []);

  function handleDelete(id: string) {
    setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null);
  }

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

      {/* Progress chart + session list */}
      {sessions !== null && sessions.length > 0 && (
        <div className="space-y-4">
          {/* Progress chart — show when 2+ sessions */}
          {sessions.length >= 2 && (
            <div className={firstLoad.current ? "animate-in" : ""}>
              <ProgressChart sessions={sessions} />
            </div>
          )}

          {/* Session list */}
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <div key={s.id} className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: `${i * 50}ms` } : undefined}>
                <SessionCard session={s} onDelete={handleDelete} />
              </div>
            ))}
          </div>
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
