"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getSessions, type WorkoutSession } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import ProgressChart from "./progress-chart";

// ---------------------------------------------------------------------------
// Streak & stat helpers
// ---------------------------------------------------------------------------

/** Normalize an ISO date string to YYYY-MM-DD in local time */
function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Days between two YYYY-MM-DD keys */
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round(Math.abs(da.getTime() - db.getTime()) / 86_400_000);
}

function computeStreaks(sessions: WorkoutSession[]): {
  current: number;
  longest: number;
  thisWeek: number;
  thisMonth: number;
} {
  if (sessions.length === 0) return { current: 0, longest: 0, thisWeek: 0, thisMonth: 0 };

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
    // Still within an active streak window
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

  // This month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = sessions.filter((s) => new Date(s.date) >= monthStart).length;

  return { current, longest, thisWeek, thisMonth };
}

function computePersonalRecords(sessions: WorkoutSession[]): Array<{
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

// ---------------------------------------------------------------------------
// Stat card component
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heatmap — last 12 weeks
// ---------------------------------------------------------------------------

function WorkoutHeatmap({ sessions }: { sessions: WorkoutSession[] }) {
  const weeks = 12;
  const dateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sessions) {
      const key = toDateKey(s.date);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [sessions]);

  // Build grid: 12 weeks × 7 days, ending today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (weeks * 7 - 1) - dayOfWeek);

  const grid: Array<{ date: string; count: number; future: boolean }> = [];
  const d = new Date(startDate);
  for (let i = 0; i < weeks * 7 + dayOfWeek + 1; i++) {
    const key = toDateKey(d.toISOString());
    grid.push({ date: key, count: dateCounts[key] ?? 0, future: d > today });
    d.setDate(d.getDate() + 1);
  }

  const dayLabels = ["M", "", "W", "", "F", "", ""];

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Activity</h3>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pr-1">
          {dayLabels.map((label, i) => (
            <span key={i} className="flex h-[14px] items-center text-[9px] text-zinc-600">{label}</span>
          ))}
        </div>
        {/* Weeks */}
        <div className="flex gap-[3px] overflow-hidden">
          {Array.from({ length: weeks + 1 }, (_, weekIdx) => {
            const weekStart = weekIdx * 7;
            return (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const cell = grid[weekStart + dayIdx];
                  if (!cell || cell.future) {
                    return <span key={dayIdx} className="h-[14px] w-[14px] rounded-[3px] bg-white/[0.03]" />;
                  }
                  return (
                    <span
                      key={dayIdx}
                      className={`h-[14px] w-[14px] rounded-[3px] ${
                        cell.count >= 2
                          ? "bg-red-500"
                          : cell.count === 1
                            ? "bg-red-500/50"
                            : "bg-white/[0.06]"
                      }`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day distribution chart
// ---------------------------------------------------------------------------

function DayDistribution({ sessions }: { sessions: WorkoutSession[] }) {
  const dist = useMemo(() => {
    const days: Record<string, number> = { Push: 0, Pull: 0, Carry: 0 };
    for (const s of sessions) {
      if (s.day.includes("Push")) days.Push++;
      else if (s.day.includes("Pull")) days.Pull++;
      else if (s.day.includes("Carry")) days.Carry++;
    }
    const max = Math.max(...Object.values(days), 1);
    return Object.entries(days).map(([name, count]) => ({ name, count, pct: count / max }));
  }, [sessions]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">Day Breakdown</h3>
      <div className="space-y-2.5">
        {dist.map((d) => (
          <div key={d.name}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-zinc-300">{d.name}</span>
              <span className="text-xs text-zinc-600">{d.count} sessions</span>
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
              <p className="truncate text-sm text-zinc-300">{pr.exercise}</p>
              <p className="text-xs text-zinc-600">{formatDate(pr.date)}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-white">{pr.weight} lb</span>
              {pr.reps && (
                <span className="ml-1.5 text-xs text-zinc-500">× {pr.reps}</span>
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
    () => (sessions ? computeStreaks(sessions) : { current: 0, longest: 0, thisWeek: 0, thisMonth: 0 }),
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
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M lb`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K lb`;
    return `${Math.round(vol)} lb`;
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
        <div className="space-y-4">
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

          {/* Overview cards */}
          <div className={`grid grid-cols-2 gap-3 ${firstLoad.current ? "animate-in" : ""}`} style={firstLoad.current ? { animationDelay: "50ms" } : undefined}>
            <StatCard label="Total Workouts" value={sessions.length} />
            <StatCard label="Avg Duration" value={avgDuration} />
          </div>

          <div className={`grid grid-cols-2 gap-3 ${firstLoad.current ? "animate-in" : ""}`} style={firstLoad.current ? { animationDelay: "75ms" } : undefined}>
            <StatCard label="This Week" value={streaks.thisWeek} />
            <StatCard label="This Month" value={streaks.thisMonth} />
          </div>

          {/* Total Volume */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "100ms" } : undefined}>
            <StatCard label="Total Volume Lifted" value={totalVolume} />
          </div>

          {/* Activity heatmap */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "125ms" } : undefined}>
            <WorkoutHeatmap sessions={sessions} />
          </div>

          {/* Day distribution */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "150ms" } : undefined}>
            <DayDistribution sessions={sessions} />
          </div>

          {/* Progress chart */}
          {sessions.length >= 2 && (
            <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "175ms" } : undefined}>
              <ProgressChart sessions={sessions} />
            </div>
          )}

          {/* Personal records */}
          <div className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: "200ms" } : undefined}>
            <PersonalRecords sessions={sessions} />
          </div>
        </div>
      )}
    </div>
  );
}
