"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  workoutPlan,
  exerciseDetails,
  type ComplexExercise,
  type Exercise,
  type Day,
} from "@/lib/workout-data";
import {
  type SetEntry,
  getDraft,
  saveDraft,
  clearDraft,
  saveSession,
  getLastSession,
  exportSessions,
} from "@/lib/storage";

function parseRest(rest: string): { lower: number; upper: number } {
  const m = rest.match(/(\d+)[–-](\d+)/);
  if (m) return { lower: parseInt(m[1]), upper: parseInt(m[2]) };
  const s = rest.match(/(\d+)/);
  if (s) {
    const v = parseInt(s[1]);
    return { lower: v, upper: v };
  }
  return { lower: 60, upper: 60 };
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

async function playBeep(ctx: AudioContext) {
  try {
    if (ctx.state !== "running") await ctx.resume();
    if (ctx.state !== "running") return;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      const t = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  } catch {
    // Audio scheduling failed
  }
}

function getTodayTab(): number {
  const day = new Date().getDay();
  if (day === 1 || day === 2) return 0;
  if (day === 3 || day === 4) return 1;
  return 2;
}

function RoundDots({
  total,
  completed,
  onTap,
  label,
}: {
  total: number;
  completed: number;
  onTap: () => void;
  label: string;
}) {
  return (
    <button onClick={onTap} className="flex items-center gap-1.5">
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => {
          const allDone = completed >= total;
          const isCurrent = i === completed - 1 && completed > 0;
          const isDone = i < completed;
          return (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                allDone
                  ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                  : isCurrent
                    ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                    : isDone
                      ? "bg-red-500/60"
                      : "bg-white/10"
              }`}
            />
          );
        })}
      </div>
      <span className="text-sm text-zinc-400">{label}</span>
    </button>
  );
}

const warmUpItems = [
  { name: "Row", time: "5 min" },
  { name: "Hip 90/90s", time: "1 min" },
  { name: "Arm bar", time: "2 min" },
  { name: "Bodyweight windmill", time: "1 min" },
  { name: "Goblet squat hold", time: "30 sec" },
];

function Collapsible({
  title,
  children,
  className,
  style,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border border-white/10 bg-[#1a1a1a] ${className ?? ""}`} style={style}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
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
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function TempoBadge({ tempo }: { tempo: string }) {
  return (
    <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
      {tempo}
    </span>
  );
}

function ExerciseDetail({
  name,
  sets,
  entries,
  onChange,
  previous,
  expanded,
  onToggle,
}: {
  name: string;
  sets: number;
  entries: SetEntry[];
  onChange: (name: string, entries: SetEntry[]) => void;
  previous: SetEntry[] | undefined;
  expanded: boolean;
  onToggle: () => void;
}) {
  const detail = exerciseDetails[name];
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="flex items-center gap-1.5 text-left"
      >
        <p className="font-medium text-white">{name}</p>
        <svg
          className={`h-3 w-3 shrink-0 text-zinc-600 transition-transform duration-200 ease-out ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 space-y-3">
            {/* Set inputs */}
            <div className="space-y-1">
              {Array.from({ length: sets }, (_, i) => {
                const entry = entries[i] ?? { weight: "", reps: "" };
                const prev = previous?.[i];
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-4 text-center text-xs tabular-nums text-zinc-600">
                      {i + 1}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder={prev?.weight || "—"}
                      value={entry.weight}
                      onChange={(e) => {
                        const updated = [...entries];
                        while (updated.length <= i) updated.push({ weight: "", reps: "" });
                        updated[i] = { ...updated[i], weight: e.target.value };
                        onChange(name, updated);
                      }}
                      className="w-16 rounded bg-white/5 px-2 py-1.5 text-center text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                    <span className="text-xs text-zinc-600">lb</span>
                    <span className="text-xs text-zinc-600">&times;</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={prev?.reps || "—"}
                      value={entry.reps}
                      onChange={(e) => {
                        const updated = [...entries];
                        while (updated.length <= i) updated.push({ weight: "", reps: "" });
                        updated[i] = { ...updated[i], reps: e.target.value };
                        onChange(name, updated);
                      }}
                      className="w-14 rounded bg-white/5 px-2 py-1.5 text-center text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                    <span className="text-xs text-zinc-600">reps</span>
                  </div>
                );
              })}
            </div>

            {/* Form guide */}
            {detail && (
              <div className="space-y-2">
                <a
                  href={detail.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-[#111] border border-white/5"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/90 shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-transform group-active:scale-95">
                      <svg className="ml-0.5 h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">Watch form guide</span>
                  </div>
                </a>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {detail.instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function RestButton({
  rest,
  label,
  onStart,
}: {
  rest: string;
  label?: string;
  onStart: (rest: string) => void;
}) {
  return (
    <button
      onClick={() => onStart(rest)}
      className="mt-4 flex items-center gap-1.5 border-t border-white/5 pt-4 text-sm text-zinc-500 transition-colors active:text-zinc-300"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 7v5l3 2" />
      </svg>
      <span>{label ? `${label}: ${rest}` : `Rest: ${rest}`}</span>
    </button>
  );
}

function TimerBubble({
  seconds,
  total,
  lower,
  finished,
  onCancel,
}: {
  seconds: number;
  total: number;
  lower: number;
  finished: boolean;
  onCancel: () => void;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? seconds / total : 0;
  const offset = circumference * (1 - progress);
  const isReady = !finished && seconds <= total - lower && total > lower;

  return (
    <div
      className="fixed z-50"
      style={{
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        right: "calc(1.5rem + env(safe-area-inset-right))",
      }}
    >
      <button
        onClick={onCancel}
        className={`relative flex h-20 w-20 items-center justify-center rounded-full border bg-[#1a1a1a] transition-all ${
          finished
            ? "border-red-500/60 shadow-[0_0_24px_rgba(239,68,68,0.4)] animate-pulse"
            : isReady
              ? "border-red-500/30 shadow-[0_0_16px_rgba(239,68,68,0.2)]"
              : "border-white/10"
        }`}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={finished || isReady ? "#ef4444" : "rgba(239,68,68,0.5)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span
          className={`relative font-mono text-base font-semibold ${
            finished ? "text-red-400" : "text-white"
          }`}
        >
          {finished ? "GO" : formatTime(seconds)}
        </span>
      </button>
    </div>
  );
}

function ComplexCard({
  completed,
  onTap,
  onStartTimer,
  openExercise,
  setOpenExercise,
  logs,
  onLogChange,
  previousLogs,
}: {
  completed: number;
  onTap: () => void;
  onStartTimer: (rest: string) => void;
  openExercise: string | null;
  setOpenExercise: (name: string | null) => void;
  logs: Record<string, SetEntry[]>;
  onLogChange: (name: string, entries: SetEntry[]) => void;
  previousLogs: Record<string, SetEntry[]> | undefined;
}) {
  const { complex } = workoutPlan;
  const allDone = completed >= complex.rounds;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">The Complex</h2>
        <RoundDots total={complex.rounds} completed={completed} onTap={onTap} label="Rounds" />
      </div>
      <div className={`space-y-5 transition-opacity ${allDone ? "opacity-40" : ""}`}>
        {complex.exercises.map((ex: ComplexExercise) => (
          <div key={ex.name}>
            <ExerciseDetail
              name={ex.name}
              sets={complex.rounds}
              entries={logs[ex.name] ?? []}
              onChange={onLogChange}
              previous={previousLogs?.[ex.name]}
              expanded={openExercise === ex.name}
              onToggle={() => setOpenExercise(openExercise === ex.name ? null : ex.name)}
            />
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span className="capitalize">{ex.bell}</span>
              <span>·</span>
              <span>{ex.reps}</span>
              <span>·</span>
              <TempoBadge tempo={ex.tempo} />
              <span>·</span>
              <span>RPE {ex.rpe}</span>
            </p>
          </div>
        ))}
      </div>
      <RestButton rest={complex.rest} label="Rest between rounds" onStart={onStartTimer} />
    </div>
  );
}

function SupersetCard({
  superset,
  completed,
  onTap,
  onStartTimer,
  openExercise,
  setOpenExercise,
  logs,
  onLogChange,
  previousLogs,
}: {
  superset: Day["supersets"][number];
  completed: number;
  onTap: () => void;
  onStartTimer: (rest: string) => void;
  openExercise: string | null;
  setOpenExercise: (name: string | null) => void;
  logs: Record<string, SetEntry[]>;
  onLogChange: (name: string, entries: SetEntry[]) => void;
  previousLogs: Record<string, SetEntry[]> | undefined;
}) {
  const allDone = completed >= superset.rounds;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{superset.name}</h3>
        <RoundDots total={superset.rounds} completed={completed} onTap={onTap} label="Rounds" />
      </div>
      <div className={`space-y-5 transition-opacity ${allDone ? "opacity-40" : ""}`}>
        {superset.exercises.map((ex: Exercise) => (
          <div key={ex.name}>
            <ExerciseDetail
              name={ex.name}
              sets={superset.rounds}
              entries={logs[ex.name] ?? []}
              onChange={onLogChange}
              previous={previousLogs?.[ex.name]}
              expanded={openExercise === ex.name}
              onToggle={() => setOpenExercise(openExercise === ex.name ? null : ex.name)}
            />
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{ex.reps}</span>
              <span>·</span>
              <TempoBadge tempo={ex.tempo} />
              <span>·</span>
              <span>RPE {ex.rpe}</span>
            </p>
          </div>
        ))}
      </div>
      <RestButton rest={superset.rest} onStart={onStartTimer} />
    </div>
  );
}

function FinisherCard({
  finisher,
  completed,
  onTap,
  onStartTimer,
  openExercise,
  setOpenExercise,
  logs,
  onLogChange,
  previousLogs,
}: {
  finisher: Day["finisher"];
  completed: number;
  onTap: () => void;
  onStartTimer: (rest: string) => void;
  openExercise: string | null;
  setOpenExercise: (name: string | null) => void;
  logs: Record<string, SetEntry[]>;
  onLogChange: (name: string, entries: SetEntry[]) => void;
  previousLogs: Record<string, SetEntry[]> | undefined;
}) {
  const allDone = completed >= finisher.sets;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Finisher</h3>
        <RoundDots total={finisher.sets} completed={completed} onTap={onTap} label="Sets" />
      </div>
      <div className={`transition-opacity ${allDone ? "opacity-40" : ""}`}>
        <ExerciseDetail
          name={finisher.name}
          sets={finisher.sets}
          entries={logs[finisher.name] ?? []}
          onChange={onLogChange}
          previous={previousLogs?.[finisher.name]}
          expanded={openExercise === finisher.name}
          onToggle={() => setOpenExercise(openExercise === finisher.name ? null : finisher.name)}
        />
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <span>{finisher.reps}</span>
          {finisher.tempo && (
            <>
              <span>·</span>
              <TempoBadge tempo={finisher.tempo} />
            </>
          )}
          <span>·</span>
          <span>RPE {finisher.rpe}</span>
        </p>
      </div>
      <RestButton rest={finisher.rest} onStart={onStartTimer} />
    </div>
  );
}

function DayContent({
  day,
  counts,
  onTap,
  onStartTimer,
  openExercise,
  setOpenExercise,
  logs,
  onLogChange,
  previousLogs,
}: {
  day: Day;
  counts: Record<string, number>;
  onTap: (key: string, max: number) => void;
  onStartTimer: (rest: string, countKey: string, countMax: number) => void;
  openExercise: string | null;
  setOpenExercise: (name: string | null) => void;
  logs: Record<string, SetEntry[]>;
  onLogChange: (name: string, entries: SetEntry[]) => void;
  previousLogs: Record<string, SetEntry[]> | undefined;
}) {
  return (
    <div className="min-w-full px-1">
      <h2 className="mb-4 mt-8 text-xl font-semibold text-white">
        {day.title}
      </h2>
      <div className="space-y-4">
        {day.supersets.map((s) => (
          <SupersetCard
            key={s.name}
            superset={s}
            completed={counts[`superset-${day.label}-${s.name}`] ?? 0}
            onTap={() => onTap(`superset-${day.label}-${s.name}`, s.rounds)}
            onStartTimer={(rest) => onStartTimer(rest, `superset-${day.label}-${s.name}`, s.rounds)}
            openExercise={openExercise}
            setOpenExercise={setOpenExercise}
            logs={logs}
            onLogChange={onLogChange}
            previousLogs={previousLogs}
          />
        ))}
      </div>
      <div className="mt-4">
        <FinisherCard
          finisher={day.finisher}
          completed={counts[`finisher-${day.label}`] ?? 0}
          onTap={() => onTap(`finisher-${day.label}`, day.finisher.sets)}
          onStartTimer={(rest) => onStartTimer(rest, `finisher-${day.label}`, day.finisher.sets)}
          openExercise={openExercise}
          setOpenExercise={setOpenExercise}
          logs={logs}
          onLogChange={onLogChange}
          previousLogs={previousLogs}
        />
      </div>
    </div>
  );
}

export default function WorkoutViewer() {
  const [activeDay, setActiveDay] = useState(getTodayTab);
  const activeDayRef = useRef(activeDay);
  activeDayRef.current = activeDay;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [openExercise, setOpenExercise] = useState<string | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetEntry[]>>({});
  const [previousSession, setPreviousSession] = useState<Record<string, SetEntry[]> | undefined>(undefined);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, direction: null as "h" | "v" | null });
  const offsetRef = useRef(0);

  const [timer, setTimer] = useState<{
    seconds: number;
    lower: number;
    total: number;
    finished: boolean;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const dismissRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const timerContextRef = useRef<{ countKey: string; countMax: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);


  // Session timer — supports pause/resume via banked time
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionBank, setSessionBank] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const sessionRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const sessionActive = sessionStart !== null;
  const sessionStarted = sessionActive || sessionBank > 0;

  // Completion check
  const activeDayData = workoutPlan.days[activeDay];
  const allComplete = sessionStarted &&
    (counts["complex"] ?? 0) >= workoutPlan.complex.rounds &&
    activeDayData.supersets.every(s =>
      (counts[`superset-${activeDayData.label}-${s.name}`] ?? 0) >= s.rounds
    ) &&
    (counts[`finisher-${activeDayData.label}`] ?? 0) >= activeDayData.finisher.sets;

  // Load draft and previous session from localStorage on mount
  useEffect(() => {
    setExerciseLogs(getDraft());
  }, []);

  useEffect(() => {
    const prev = getLastSession(workoutPlan.days[activeDay].label);
    setPreviousSession(prev?.exercises);
  }, [activeDay]);

  function updateLog(name: string, entries: SetEntry[]) {
    setExerciseLogs((prev) => {
      const updated = { ...prev, [name]: entries };
      saveDraft(updated);
      return updated;
    });
  }

  function sessionPause() {
    if (!sessionStart) return;
    setSessionBank(sessionElapsed);
    setSessionStart(null);
  }

  function sessionResume() {
    setSessionStart(Date.now());
  }

  const [resetConfirm, setResetConfirm] = useState(false);
  const resetConfirmRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function sessionReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      resetConfirmRef.current = setTimeout(() => setResetConfirm(false), 1000);
      return;
    }
    clearTimeout(resetConfirmRef.current);
    setResetConfirm(false);
    // Save session if there's logged data
    const hasData = Object.values(exerciseLogs).some((sets) =>
      sets.some((s) => s.weight || s.reps)
    );
    if (hasData && sessionStarted) {
      saveSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        day: activeDayData.label,
        duration: sessionElapsed,
        exercises: exerciseLogs,
      });
      setPreviousSession(exerciseLogs);
    }
    clearDraft();
    setExerciseLogs({});
    if (sessionRef.current) clearInterval(sessionRef.current);
    setSessionStart(null);
    setSessionBank(0);
    setSessionElapsed(0);
    setCounts({});
  }

  function tap(key: string, max: number) {
    if (!sessionStarted) { setSessionStart(Date.now()); }
    else if (!sessionActive) { sessionResume(); }
    try { navigator.vibrate?.(10); } catch {}
    setCounts((prev) => {
      const current = prev[key] ?? 0;
      return { ...prev, [key]: current >= max ? 0 : current + 1 };
    });
  }

  function acquireWakeLock() {
    navigator.wakeLock?.request("screen").then(s => { wakeLockRef.current = s; }).catch(() => {});
  }

  function releaseWakeLock() {
    wakeLockRef.current?.release().catch(() => {});
    wakeLockRef.current = null;
  }

  const startTimer = useCallback((rest: string, countKey: string, countMax: number) => {
    const { lower, upper } = parseRest(rest);
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (dismissRef.current) clearTimeout(dismissRef.current);
    timerContextRef.current = { countKey, countMax };
    acquireWakeLock();

    setTimer({ seconds: upper, lower, total: upper, finished: false });

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (!prev || prev.finished) {
          clearInterval(timerRef.current);
          return prev;
        }
        const next = prev.seconds - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          releaseWakeLock();
          try {
            if (audioCtxRef.current) playBeep(audioCtxRef.current);
          } catch {
            // Audio playback failed
          }
          try {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          } catch {
            // Vibration unavailable
          }
          // Increment round/set count
          if (timerContextRef.current) {
            const ctx = timerContextRef.current;
            timerContextRef.current = null;
            setCounts((c) => {
              const cur = c[ctx.countKey] ?? 0;
              return cur < ctx.countMax ? { ...c, [ctx.countKey]: cur + 1 } : c;
            });
          }
          // Auto-dismiss after 10 seconds
          dismissRef.current = setTimeout(() => {
            setTimer((t) => (t?.finished ? null : t));
          }, 10000);
          return { ...prev, seconds: 0, finished: true };
        }
        return { ...prev, seconds: next };
      });
    }, 1000);
  }, []);

  const cancelTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (dismissRef.current) clearTimeout(dismissRef.current);
    timerContextRef.current = null;
    releaseWakeLock();
    setTimer(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Session elapsed timer
  useEffect(() => {
    if (!sessionStart || allComplete) return;
    sessionRef.current = setInterval(() => {
      setSessionElapsed(sessionBank + Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => clearInterval(sessionRef.current);
  }, [sessionStart, sessionBank, allComplete]);


  function selectDay(index: number) {
    setActiveDay(index);
    offsetRef.current = 0;
    setOffsetX(0);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, direction: null };
    setIsSwiping(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;

    if (touchRef.current.direction === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      touchRef.current.direction = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      if (touchRef.current.direction === "v") { setIsSwiping(false); return; }
    }
    if (touchRef.current.direction !== "h") return;

    const day = activeDayRef.current;
    const atEdge = (day === 0 && dx > 0) || (day === workoutPlan.days.length - 1 && dx < 0);
    offsetRef.current = atEdge ? dx * 0.2 : dx;
    setOffsetX(offsetRef.current);
  }

  function handleTouchEnd() {
    const ox = offsetRef.current;
    const day = activeDayRef.current;
    if (ox < -60 && day < workoutPlan.days.length - 1) {
      selectDay(day + 1);
    } else if (ox > 60 && day > 0) {
      selectDay(day - 1);
    } else {
      offsetRef.current = 0;
      setOffsetX(0);
    }
    setIsSwiping(false);
  }

  function handleTouchCancel() {
    offsetRef.current = 0;
    setOffsetX(0);
    setIsSwiping(false);
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]"
      style={{
        boxShadow: allComplete
          ? "inset 0 0 60px rgba(239,68,68,0.075), inset 0 0 150px rgba(239,68,68,0.045), inset 0 0 300px rgba(239,68,68,0.02)"
          : "none",
        transition: "box-shadow 1s ease-out",
      }}
    >
      <div className="flex-1">
        {/* Header */}
        <header className="animate-in mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <svg
              width="36"
              height="36"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path d="M16 2L14.5 16.5L16 18L17.5 16.5L16 2Z" fill="#d4d4d8" />
              <rect x="10" y="17.5" width="12" height="2" rx="1" fill="#a1a1aa" />
              <rect x="14.75" y="19.5" width="2.5" height="6" rx="0.5" fill="#71717a" />
              <circle cx="16" cy="27.5" r="2" fill="#a1a1aa" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Dungym</h1>
          </div>
          <div className="flex gap-1.5">
            {workoutPlan.days.map((d, i) => (
              <button
                key={d.label}
                onClick={() => selectDay(i)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all active:scale-[0.97] ${
                  i === activeDay
                    ? "border-red-500/40 bg-[#1a1a1a] text-white"
                    : "border-white/20 text-zinc-400 hover:text-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </header>

        {/* Session timer */}
        <div
          className="animate-in mb-3 flex h-10 items-center rounded-xl border border-white/10 bg-[#1a1a1a] px-4"
          style={{ animationDelay: "50ms" }}
        >
          <span className="text-sm font-medium text-zinc-400">Session</span>
          <span className="ml-auto font-mono text-sm text-zinc-500">
            {sessionStarted ? formatTime(sessionElapsed) : "0:00"}
          </span>
          <div className="ml-3 flex items-center gap-2">
            {sessionActive ? (
              <button onClick={sessionPause} className="text-zinc-500 active:text-zinc-300">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => sessionStarted ? sessionResume() : setSessionStart(Date.now())}
                className="text-zinc-500 active:text-zinc-300"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
            )}
            {sessionStarted && (
              <button
                onClick={sessionReset}
                className={`transition-colors ${resetConfirm ? "text-red-500" : "text-zinc-500 active:text-zinc-300"}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M1 4v6h6" />
                  <path strokeLinecap="round" d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Warm-up */}
        <Collapsible title="Warm-up" className="animate-in" style={{ animationDelay: "75ms" }}>
          <div className="space-y-1.5">
            {warmUpItems.map((item) => (
              <div key={item.name} className="flex items-baseline justify-between">
                <span className="text-sm text-zinc-300">{item.name}</span>
                <span className="text-xs text-zinc-500">{item.time}</span>
              </div>
            ))}
          </div>
        </Collapsible>

        {/* Complex */}
        <div className="animate-in mt-4" style={{ animationDelay: "100ms" }}>
          <ComplexCard
            completed={counts["complex"] ?? 0}
            onTap={() => tap("complex", workoutPlan.complex.rounds)}
            onStartTimer={(rest) => startTimer(rest, "complex", workoutPlan.complex.rounds)}
            openExercise={openExercise}
            setOpenExercise={setOpenExercise}
            logs={exerciseLogs}
            onLogChange={updateLog}
            previousLogs={previousSession}
          />
        </div>

        {/* Swipeable day content */}
        <div
          className="animate-in overflow-hidden"
          style={{ animationDelay: "150ms" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(calc(-${activeDay * 100}% + ${offsetX}px))`,
              transition: isSwiping ? "none" : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {workoutPlan.days.map((d) => (
              <DayContent
                key={d.label}
                day={d}
                counts={counts}
                onTap={tap}
                onStartTimer={startTimer}
                openExercise={openExercise}
                setOpenExercise={setOpenExercise}
                logs={exerciseLogs}
                onLogChange={updateLog}
                previousLogs={previousSession}
              />
            ))}
          </div>
        </div>

        {/* Progression notes */}
        <div className="animate-in mt-8 space-y-2" style={{ animationDelay: "350ms" }}>
          <Collapsible title="Progression Notes">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-zinc-300">Heavy Bell</h4>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Should make round 3 challenging but clean. If form breaks on the
                  press, size down.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-300">Light Bell</h4>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Windmills should be slow and controlled. No grinding.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-300">Moving Up</h4>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Progress heavy bell first. When 3 rounds feel controlled, bump up
                  one size.
                </p>
              </div>
            </div>
          </Collapsible>

          <Collapsible title="Tempo Guide">
            <p className="text-sm text-zinc-400">
              {workoutPlan.tempoExplanation}
            </p>
          </Collapsible>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="animate-in mt-8 space-y-3 border-t border-white/5 py-4"
        style={{ animationDelay: "400ms" }}
      >
        <button
          onClick={() => {
            const json = exportSessions();
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
        <p className="text-center text-sm text-zinc-500">A workout program by <a href="mailto:tprince09@gmail.com" className="text-red-500/60">Taylor Prince</a></p>
      </footer>

      {/* Rest countdown timer */}
      {timer && (
        <TimerBubble
          seconds={timer.seconds}
          total={timer.total}
          lower={timer.lower}
          finished={timer.finished}
          onCancel={cancelTimer}
        />
      )}
    </div>
  );
}
