"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { getSessions, deleteSession, type WorkoutSession } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { workoutPlan, exerciseIdToName, dayById } from "@/lib/workout-data";
import { getGuestPreviewSessions } from "@/lib/guest-preview-data";

// Build a canonical exercise order from the workout plan, keyed by exercise ID.
const exerciseOrder: Record<string, number> = (() => {
  const order: Record<string, number> = {};
  let idx = 0;
  for (const ex of workoutPlan.complex.exercises) {
    order[ex.id] = idx++;
  }
  for (const day of workoutPlan.days) {
    for (const ss of day.supersets) {
      for (const ex of ss.exercises) {
        if (!(ex.id in order)) order[ex.id] = idx++;
      }
    }
    if (!(day.finisher.id in order)) order[day.finisher.id] = idx++;
  }
  return order;
})();

/** YYYY-MM-DD in local time */
function toDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

/** Compute total volume (weight × reps) for a session */
function sessionVolume(session: WorkoutSession): number {
  let vol = 0;
  for (const sets of Object.values(session.exercises)) {
    for (const set of sets) {
      const w = parseFloat(set.weight) || 0;
      const r = parseInt(set.reps) || 0;
      if (w > 0 && r > 0) vol += w * r;
    }
  }
  return vol;
}

function formatVolume(vol: number): string {
  if (vol === 0) return "";
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K lb`;
  return `${Math.round(vol)} lb`;
}

// "All" or a day ID (e.g. "push", "pull", "carry")
type DayFilter = string;

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function WorkoutCalendar({
  sessions,
  selectedDate,
  onSelectDate,
}: {
  sessions: WorkoutSession[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Set of YYYY-MM-DD keys that have sessions
  const workoutDates = useMemo(() => {
    const dates = new Set<string>();
    for (const s of sessions) dates.add(toDateKey(s.date));
    return dates;
  }, [sessions]);

  const todayKey = toDateKey(new Date().toISOString());

  // Build calendar grid for viewMonth
  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    const cells: Array<{ day: number; key: string; inMonth: boolean }> = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const key = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, key, inMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, key, inMonth: true });
    }

    // Next month padding to fill last row
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      for (let d = 1; d <= remaining; d++) {
        const key = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        cells.push({ day: d, key, inMonth: false });
      }
    }

    return cells;
  }, [viewMonth]);

  const prevMonth = useCallback(() => {
    setViewMonth((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: v.month - 1 };
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: v.month + 1 };
    });
  }, []);

  function handleTap(key: string) {
    if (selectedDate === key) {
      onSelectDate(null);
    } else if (workoutDates.has(key)) {
      onSelectDate(key);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      {/* Month nav */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 active:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm font-medium text-zinc-300">
          {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
        </h3>
        <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 active:text-zinc-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="mb-1 grid grid-cols-7">
        {DAY_LABELS.map((label, i) => (
          <span key={i} className="text-center text-[10px] font-medium text-zinc-600">{label}</span>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7">
        {calendarDays.map((cell) => {
          const hasWorkout = workoutDates.has(cell.key);
          const isSelected = selectedDate === cell.key;
          const isToday = cell.key === todayKey;

          return (
            <button
              key={cell.key}
              onClick={() => handleTap(cell.key)}
              className="flex flex-col items-center py-1"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${
                  isSelected
                    ? "bg-red-500 font-semibold text-white"
                    : isToday
                      ? "font-medium text-white ring-1 ring-white/20"
                      : cell.inMonth
                        ? hasWorkout
                          ? "text-zinc-300"
                          : "text-zinc-500"
                        : "text-zinc-700"
                }`}
              >
                {cell.day}
              </span>
              {/* Workout indicator dot */}
              <span
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  hasWorkout
                    ? isSelected
                      ? "bg-white"
                      : "bg-red-500"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session Card
// ---------------------------------------------------------------------------

function SessionCard({
  session,
  onDelete,
  readOnly,
}: {
  session: WorkoutSession;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const exerciseNames = Object.keys(session.exercises).sort(
    (a, b) => (exerciseOrder[a] ?? 999) - (exerciseOrder[b] ?? 999)
  );

  const vol = useMemo(() => sessionVolume(session), [session]);

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

  const dayData = dayById[session.day];
  const dayLabel = dayData
    ? dayData.title.split(" — ")[1] ?? dayData.label
    : session.day;

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-300">{dayLabel}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-zinc-600">{formatDate(session.date)}</span>
            {vol > 0 && (
              <span className="text-xs text-zinc-600">· {formatVolume(vol)}</span>
            )}
          </div>
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
            {exerciseNames.map((id) => {
              const sets = session.exercises[id];
              if (!sets?.length) return null;
              const filledSets = sets.filter((s) => s.weight || s.reps);
              if (!filledSets.length) return null;
              return (
                <div key={id}>
                  <p className="text-sm font-medium text-white">{exerciseIdToName[id] ?? id}</p>
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
            {!readOnly && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// History View
// ---------------------------------------------------------------------------

export default function HistoryView({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { isAnonymous } = useAuth();
  const isPreview = isAnonymous;
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null);
  const [filter, setFilter] = useState<DayFilter>("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (isPreview) {
      setSessions(getGuestPreviewSessions());
      setTimeout(() => { firstLoad.current = false; }, 600);
      return;
    }
    getSessions().then((s) => {
      setSessions(s);
      setTimeout(() => { firstLoad.current = false; }, 600);
    });
  }, [isPreview]);

  // Apply day-type filter — sessions are normalized so s.day is a stable ID
  const typeFiltered = useMemo(() => {
    if (!sessions) return [];
    if (filter === "All") return sessions;
    return sessions.filter((s) => s.day === filter);
  }, [sessions, filter]);

  // Apply date selection on top of type filter
  const filtered = useMemo(() => {
    if (!selectedDate) return typeFiltered;
    return typeFiltered.filter((s) => toDateKey(s.date) === selectedDate);
  }, [typeFiltered, selectedDate]);

  // Label for selected date
  const selectedLabel = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  }, [selectedDate]);

  function handleDelete(id: string) {
    setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null);
  }

  // Derive filter options from workout plan — no hardcoded day names
  const filters: Array<{ id: DayFilter; label: string }> = [
    { id: "All", label: "All" },
    ...workoutPlan.days.map((d) => ({
      id: d.id,
      label: d.title.split("—")[1]?.split("/")[0]?.trim() ?? d.label,
    })),
  ];

  return (
    <div className="pb-4 pt-2">
      {/* Guest preview banner */}
      {isPreview && sessions && sessions.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm font-medium text-zinc-300">Sample data</p>
          <p className="mt-0.5 text-xs text-zinc-500">This is what your history looks like as you train.</p>
          <button
            onClick={onOpenAuth}
            className="mt-2.5 rounded-lg bg-red-500 px-4 py-1.5 text-xs font-medium text-white transition-colors active:bg-red-600"
          >
            Sign up to track yours
          </button>
        </div>
      )}

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

      {/* Calendar + session list */}
      {sessions !== null && sessions.length > 0 && (
        <div className="space-y-4">
          {/* Calendar */}
          <div className={firstLoad.current ? "animate-in" : ""}>
            <WorkoutCalendar
              sessions={typeFiltered}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Filter pills */}
          <div className={`flex gap-1.5 ${firstLoad.current ? "animate-in" : ""}`} style={firstLoad.current ? { animationDelay: "50ms" } : undefined}>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setSelectedDate(null); }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.id
                    ? "border-red-500/40 bg-[#1a1a1a] text-white"
                    : "border-white/10 text-zinc-500 active:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Selected date header */}
          {selectedDate && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400">{selectedLabel}</p>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-zinc-600 active:text-zinc-400"
              >
                Show all
              </button>
            </div>
          )}

          {/* Session list */}
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-zinc-600">
              {selectedDate ? "No workouts on this date" : `No ${dayById[filter]?.title.split("—")[1]?.split("/")[0]?.trim() ?? filter} sessions yet`}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((s, i) => (
                <div key={s.id} className={firstLoad.current ? "animate-in" : ""} style={firstLoad.current ? { animationDelay: `${(i + 2) * 50}ms` } : undefined}>
                  <SessionCard session={s} onDelete={handleDelete} readOnly={isPreview} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Credit */}
      <p className={`mt-8 border-t border-white/5 pt-4 text-center text-sm text-zinc-500 ${firstLoad.current ? "animate-in" : ""}`} style={firstLoad.current ? { animationDelay: "200ms" } : undefined}>
        A workout program by{" "}
        <a href="mailto:hello@taylormakeit.com" className="text-red-500/60">
          Taylor Prince
        </a>
      </p>
    </div>
  );
}
