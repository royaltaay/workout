"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getSessions, type WorkoutSession } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { workoutPlan, exerciseIdToName } from "@/lib/workout-data";
import ProgressChart from "./progress-chart";

// ---------------------------------------------------------------------------
// Streak & stat helpers
// ---------------------------------------------------------------------------

/** Normalize an ISO date string to YYYY-MM-DD in local time */
export function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Days between two YYYY-MM-DD keys */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round(Math.abs(da.getTime() - db.getTime()) / 86_400_000);
}

export function computeStreaks(sessions: WorkoutSession[]): {
  current: number;
  longest: number;
  thisWeek: number;
} {
  if (sessions.length === 0) return { current: 0, longest: 0, thisWeek: 0 };

  // Unique workout dates sorted ascending
  const uniqueDates = Array.from(new Set(sessions.map((s) => toDateKey(s.date)))).sort();

  // Current streak: count backwards from most recent date
  // A streak continues if the gap between consecutive workout dates is ≤2 days
  // (accounts for rest days in a Mon/Wed/Fri program)
  const today = toDateKey(new Date().toISOString());
  const lastWorkout = uniqueDates[uniqueDates.length - 1];
  const daysSinceLast = daysBetween(today, lastWorkout);

  let current = 0;
  if (daysSinceLast <= 3) {
    current = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const gap = daysBetween(uniqueDates[i], uniqueDates[i + 1]);
      if (gap <= 3) current++;
      else break;
    }
  }

  // Longest streak (same gap logic)
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const gap = daysBetween(uniqueDates[i - 1], uniqueDates[i]);
    if (gap <= 3) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // This week (Mon–Sun)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const thisWeek = sessions.filter((s) => new Date(s.date) >= monday).length;

  return { current, longest, thisWeek };
}

export function computePersonalRecords(sessions: WorkoutSession[]): Array<{
  exercise: string;
  weight: number;
  reps: string;
  date: string;
}> {
  const prs: Record<string, { weight: number; reps: string; date: string }> = {};

  for (const s of sessions) {
    for (const [name, sets] of Object.entries(s.exercises)) {
      for (const set of sets) {
        const w = parseFloat(set.weight) || 0;
        if (w > 0 && (!prs[name] || w > prs[name].weight)) {
          prs[name] = { weight: w, reps: set.reps, date: s.date };
        }
      }
    }
  }

  return Object.entries(prs)
    .map(([exercise, data]) => ({ exercise, ...data }))
    .sort((a, b) => b.weight - a.weight);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${Math.round(vol / 1_000).toLocaleString()} lb`;
  return `${vol.toLocaleString()} lb`;
}

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-xl font-semibold text-white">{value}</span>
        {sub && <span className="text-xs text-zinc-600">{sub}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity — weekly workout bars (last 12 weeks)
// ---------------------------------------------------------------------------

function WeeklyActivity({ sessions }: { sessions: WorkoutSession[] }) {
  const maxPerWeek = 5; // max cells per row
  const numWeeks = 4;

  const weeks = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Start of this week (Monday)
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    thisMonday.setHours(0, 0, 0, 0);

    const result: Array<{ label: string; count: number; isCurrent: boolean }> = [];
    for (let w = 0; w < numWeeks; w++) {
      const weekStart = new Date(thisMonday);
      weekStart.setDate(thisMonday.getDate() - w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = sessions.filter((s) => {
        const d = new Date(s.date);
        return d >= weekStart && d < weekEnd;
      }).length;

      const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      result.push({ label, count, isCurrent: w === 0 });
    }
    return result;
  }, [sessions]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Activity</h3>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="w-12 shrink-0 text-right text-[9px] text-zinc-600">Week</span>
        <span className="flex-1 text-[9px] text-zinc-600">Workouts</span>
        <span className="w-4 text-right text-[9px] text-zinc-600">#</span>
      </div>
      <div className="space-y-1.5">
        {weeks.map((week, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-12 shrink-0 text-right text-[10px] ${week.isCurrent ? "text-zinc-400" : "text-zinc-600"}`}>
              {week.label}
            </span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: maxPerWeek }, (_, j) => (
                <div
                  key={j}
                  className={`h-3 flex-1 rounded-sm ${
                    j < week.count
                      ? week.count >= 3
                        ? "bg-red-500"
                        : "bg-red-500/50"
                      : "bg-white/[0.06]"
                  }`}
                />
              ))}
            </div>
            <span className={`w-4 text-right text-[10px] ${week.count > 0 ? "text-zinc-400" : "text-zinc-700"}`}>
              {week.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day distribution chart
// ---------------------------------------------------------------------------

function DayDistribution({ sessions }: { sessions: WorkoutSession[] }) {
  const dist = useMemo(() => {
    // Count sessions per day ID — derived from workout plan, not hardcoded
    const counts: Record<string, number> = {};
    for (const day of workoutPlan.days) counts[day.id] = 0;
    for (const s of sessions) {
      if (counts[s.day] !== undefined) counts[s.day]++;
    }
    const max = Math.max(...Object.values(counts), 1);
    return workoutPlan.days.map((day) => {
      const focusLabel = day.title.split("—")[1]?.split("/")[0]?.trim() ?? day.label;
      return {
        name: focusLabel,
        count: counts[day.id] ?? 0,
        pct: (counts[day.id] ?? 0) / max,
      };
    });
  }, [sessions]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Workout Balance</h3>
      <div className="space-y-2.5">
        {dist.map((d) => (
          <div key={d.name}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-zinc-300">{d.name}</span>
              <span className="text-xs text-zinc-600">{d.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-red-500/70 transition-all duration-500 ease-out"
                style={{ width: `${d.pct * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Personal Records
// ---------------------------------------------------------------------------

function PersonalRecords({ sessions }: { sessions: WorkoutSession[] }) {
  const prs = useMemo(() => computePersonalRecords(sessions), [sessions]);
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? prs : prs.slice(0, 5);

  if (prs.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Personal Records</h3>
      <div className="space-y-2">
        {displayed.map((pr) => (
          <div key={pr.exercise} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-300">{exerciseIdToName[pr.exercise] ?? pr.exercise}</p>
              <p className="text-xs text-zinc-600">{formatDate(pr.date)}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-white">{pr.weight} lb</span>
              {pr.reps && (
                <span className="ml-1.5 text-xs text-zinc-500">x {pr.reps}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {prs.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-zinc-500 active:text-zinc-300"
        >
          {showAll ? "Show less" : `Show all ${prs.length}`}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Stats View
// ---------------------------------------------------------------------------

export default function StatsView({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { isAnonymous } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    getSessions().then((s) => {
      setSessions(s);
      setTimeout(() => { firstLoad.current = false; }, 600);
    });
  }, []);

  const streaks = useMemo(
    () => (sessions ? computeStreaks(sessions) : { current: 0, longest: 0, thisWeek: 0 }),
    [sessions]
  );

  const avgDuration = useMemo(() => {
    if (!sessions?.length) return "—";
    const avg = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    return formatDuration(avg);
  }, [sessions]);

  const totalVolume = useMemo(() => {
    if (!sessions?.length) return "—";
    let vol = 0;
    for (const s of sessions) {
      for (const sets of Object.values(s.exercises)) {
        for (const set of sets) {
          const w = parseFloat(set.weight) || 0;
          const r = parseInt(set.reps) || 0;
          if (w > 0 && r > 0) vol += w * r;
        }
      }
    }
    return formatVolume(vol);
  }, [sessions]);

  return (
    <div className="pb-4 pt-2">
      {/* Loading */}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-zinc-400">No stats yet</p>
          <p className="mt-1 text-xs text-zinc-600">Complete workouts to see your progression</p>
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

      {/* Stats content */}
      {sessions !== null && sessions.length > 0 && (
        <div className="space-y-3">
          {/* Streak cards */}
          <div className={`grid grid-cols-2 gap-3 ${firstLoad.current ? "animate-in" : ""}`}>
            <StatCard
              label="Active Streak"
              value={streaks.current}
              sub={streaks.current === 1 ? "workout" : "workouts"}
            />
            <StatCard
              label="Longest Streak"
              value={streaks.longest}
              sub={streaks.longest === 1 ? "workout" : "workouts"}
            />
          </div>

          {/* Overview cards — 2x3 grid */}
          <div className={`grid grid-cols-2 gap-3 ${firstLoad.current ? "animate-in" : ""}`} style={firstLoad.current ? { animationDelay: "50ms" } : undefined}>
            <StatCard label="Total Workouts" value={sessions.length} />
            <StatCard label="Avg Duration" value={avgDuration} />
            <StatCard label="This Week" value={streaks.thisWeek} />
            <StatCard label="All-Time Volume" value={totalVolume} />
          </div>

          {/* Day distribution */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "100ms" } : undefined}>
            <DayDistribution sessions={sessions} />
          </div>

          {/* Progress chart */}
          {sessions.length >= 2 && (
            <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "125ms" } : undefined}>
              <ProgressChart sessions={sessions} />
            </div>
          )}

          {/* Personal records */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "150ms" } : undefined}>
            <PersonalRecords sessions={sessions} />
          </div>

          {/* Weekly activity */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "175ms" } : undefined}>
            <WeeklyActivity sessions={sessions} />
          </div>
        </div>
      )}
    </div>
  );
}
