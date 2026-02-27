"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  workoutPlan,
  exerciseDetails,
  type ComplexExercise,
  type Exercise,
  type Day,
} from "@/lib/workout-data";
import { parseExerciseUnit } from "@/lib/units";
import {
  type SetEntry,
  getDraft,
  saveDraft,
  clearDraft,
  saveSession,
  getLastSession,
} from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import HistoryView from "./history-view";
import StatsView from "./stats-view";
import AccountView from "./account-view";
import SplashScreen from "./splash-screen";

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
  repsLabel,
  entries,
  onChange,
  previous,
  expanded,
  onToggle,
  children,
  readOnly,
  onAuthPrompt,
}: {
  name: string;
  sets: number;
  repsLabel?: string;
  entries: SetEntry[];
  onChange: (name: string, entries: SetEntry[]) => void;
  previous: SetEntry[] | undefined;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  readOnly?: boolean;
  onAuthPrompt?: () => void;
}) {
  const detail = exerciseDetails[name];
  const [noteOpen, setNoteOpen] = useState<number | null>(null);
  const prevSet1Ref = useRef("");

  // Auto-fill: when set 1 weight changes, propagate to subsequent sets
  // that are empty or still match the previous set-1 value (i.e. were auto-filled)
  function handleWeightChange(index: number, value: string) {
    const updated = [...entries];
    while (updated.length <= index) updated.push({ weight: "", reps: "" });
    const oldSet1 = prevSet1Ref.current;
    updated[index] = { ...updated[index], weight: value };
    if (index === 0) {
      prevSet1Ref.current = value;
      if (value) {
        for (let j = 1; j < sets; j++) {
          while (updated.length <= j) updated.push({ weight: "", reps: "" });
          if (!updated[j].weight || updated[j].weight === oldSet1) {
            updated[j] = { ...updated[j], weight: value };
          }
        }
      }
    }
    onChange(name, updated);
  }

  function toggleNote(i: number) {
    if (noteOpen === i) {
      // Closing — if note is empty, clear it
      const entry = entries[i];
      if (!entry?.note) setNoteOpen(null);
      else setNoteOpen(null);
      return;
    }
    setNoteOpen(i);
  }

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
      {children}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 space-y-3">
            {/* Form guide */}
            {detail && (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-zinc-400">
                  {detail.instructions}
                </p>
              </div>
            )}

            {/* Set inputs — or sign-in prompt for anonymous users */}
            {readOnly ? (
              <button
                onClick={onAuthPrompt}
                className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-zinc-500 transition-colors active:bg-white/10 active:text-zinc-300"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Sign in to log your sets
              </button>
            ) : (
            <div className="space-y-1">
              {Array.from({ length: sets }, (_, i) => {
                const entry = entries[i] ?? { weight: "", reps: "" };
                const prev = previous?.[i];
                return (
                  <div key={i}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 text-center text-xs tabular-nums text-zinc-600">
                        {i + 1}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder={prev?.weight || "—"}
                        value={entry.weight}
                        onChange={(e) => handleWeightChange(i, e.target.value)}
                        className="w-20 rounded bg-white/5 px-2 py-2.5 text-center text-base text-white placeholder:text-zinc-700 focus:outline-none focus:outline-1 focus:outline-white/20"
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
                        className="w-16 rounded bg-white/5 px-2 py-2.5 text-center text-base text-white placeholder:text-zinc-700 focus:outline-none focus:outline-1 focus:outline-white/20"
                      />
                      <span className="text-xs text-zinc-600">{repsLabel ?? "reps"}</span>
                      <button
                        onClick={() => toggleNote(i)}
                        className={`ml-auto flex h-7 w-7 items-center justify-center rounded transition-colors ${
                          entry.note || noteOpen === i ? "text-zinc-400" : "text-zinc-700"
                        } active:text-zinc-300`}
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                        </svg>
                      </button>
                    </div>
                    {/* Per-set note input */}
                    {noteOpen === i && (
                      <div className="ml-5 mt-1 mb-1">
                        <input
                          type="text"
                          placeholder="Note (e.g. press failed rep 4)"
                          value={entry.note ?? ""}
                          onChange={(e) => {
                            const updated = [...entries];
                            while (updated.length <= i) updated.push({ weight: "", reps: "" });
                            updated[i] = { ...updated[i], note: e.target.value || undefined };
                            onChange(name, updated);
                          }}
                          className="w-full rounded bg-white/5 px-2.5 py-1.5 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:outline-1 focus:outline-white/20"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
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
  onStart,
}: {
  rest: string;
  onStart: (rest: string) => void;
}) {
  const { upper } = parseRest(rest);
  return (
    <button
      onClick={() => onStart(rest)}
      className="mt-4 flex items-center gap-1.5 border-t border-white/5 pt-4 text-sm text-zinc-500 transition-colors active:text-zinc-300"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 7v5l3 2" />
      </svg>
      <span>Rest {upper}s</span>
    </button>
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
  readOnly,
  onAuthPrompt,
}: {
  completed: number;
  onTap: () => void;
  onStartTimer: (rest: string) => void;
  openExercise: string | null;
  setOpenExercise: (name: string | null) => void;
  logs: Record<string, SetEntry[]>;
  onLogChange: (name: string, entries: SetEntry[]) => void;
  previousLogs: Record<string, SetEntry[]> | undefined;
  readOnly?: boolean;
  onAuthPrompt?: () => void;
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
              repsLabel={parseExerciseUnit(ex.reps).short}
              entries={logs[ex.name] ?? []}
              onChange={onLogChange}
              previous={previousLogs?.[ex.name]}
              expanded={openExercise === ex.name}
              onToggle={() => setOpenExercise(openExercise === ex.name ? null : ex.name)}
              readOnly={readOnly}
              onAuthPrompt={onAuthPrompt}
            >
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <span className="capitalize">{ex.bell}</span>
                <span>·</span>
                <span>{ex.reps}</span>
                <span>·</span>
                <TempoBadge tempo={ex.tempo} />
                <span>·</span>
                <span>RPE {ex.rpe}</span>
              </p>
            </ExerciseDetail>
          </div>
        ))}
      </div>
      <RestButton rest={complex.rest} onStart={onStartTimer} />
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
  readOnly,
  onAuthPrompt,
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
  readOnly?: boolean;
  onAuthPrompt?: () => void;
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
              repsLabel={parseExerciseUnit(ex.reps).short}
              entries={logs[ex.name] ?? []}
              onChange={onLogChange}
              previous={previousLogs?.[ex.name]}
              expanded={openExercise === ex.name}
              onToggle={() => setOpenExercise(openExercise === ex.name ? null : ex.name)}
              readOnly={readOnly}
              onAuthPrompt={onAuthPrompt}
            >
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <span>{ex.reps}</span>
                <span>·</span>
                <TempoBadge tempo={ex.tempo} />
                <span>·</span>
                <span>RPE {ex.rpe}</span>
              </p>
            </ExerciseDetail>
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
  readOnly,
  onAuthPrompt,
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
  readOnly?: boolean;
  onAuthPrompt?: () => void;
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
          repsLabel={parseExerciseUnit(finisher.reps).short}
          entries={logs[finisher.name] ?? []}
          onChange={onLogChange}
          previous={previousLogs?.[finisher.name]}
          expanded={openExercise === finisher.name}
          onToggle={() => setOpenExercise(openExercise === finisher.name ? null : finisher.name)}
          readOnly={readOnly}
          onAuthPrompt={onAuthPrompt}
        >
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
        </ExerciseDetail>
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
  readOnly,
  onAuthPrompt,
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
  readOnly?: boolean;
  onAuthPrompt?: () => void;
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
            readOnly={readOnly}
            onAuthPrompt={onAuthPrompt}
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
          readOnly={readOnly}
          onAuthPrompt={onAuthPrompt}
        />
      </div>
    </div>
  );
}

export default function WorkoutViewer() {
  const { user, isAnonymous, loading } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<"workout" | "history" | "stats" | "account">("workout");
  const [activeDay, setActiveDay] = useState(0);
  const [hydrated, setHydrated] = useState(false);
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

  // Set correct day and load draft on mount (client-side only, after hydration)
  useEffect(() => {
    setActiveDay(getTodayTab());
    setHydrated(true);
    setExerciseLogs(getDraft());
    // Show splash if user hasn't dismissed it before
    const dismissed = localStorage.getItem("dungym-splash-dismissed");
    setShowSplash(!dismissed);
  }, []);

  // Load previous session (async — Supabase with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    getLastSession(workoutPlan.days[activeDay].label).then((prev) => {
      if (!cancelled) setPreviousSession(prev?.exercises);
    });
    return () => { cancelled = true; };
  }, [activeDay]);

  const hasLoggedData = Object.values(exerciseLogs).some((sets) =>
    sets.some((s) => s.weight || s.reps)
  );

  function updateLog(name: string, entries: SetEntry[]) {
    setExerciseLogs((prev) => {
      const updated = { ...prev, [name]: entries };
      saveDraft(updated);
      return updated;
    });
    // Auto-start session on first input
    if (!sessionStarted) setSessionStart(Date.now());
    else if (!sessionActive) sessionResume();
  }

  function sessionPause() {
    if (!sessionStart) return;
    setSessionBank(sessionElapsed);
    setSessionStart(null);
  }

  function sessionResume() {
    setSessionStart(Date.now());
  }

  const [finishConfirm, setFinishConfirm] = useState(false);
  const finishConfirmRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const discardConfirmRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function resetState() {
    clearDraft();
    setExerciseLogs({});
    if (sessionRef.current) clearInterval(sessionRef.current);
    setSessionStart(null);
    setSessionBank(0);
    setSessionElapsed(0);
    setCounts({});
    setFinishConfirm(false);
    setDiscardConfirm(false);
  }

  function finishWorkout() {
    if (!finishConfirm) {
      setFinishConfirm(true);
      finishConfirmRef.current = setTimeout(() => setFinishConfirm(false), 3000);
      return;
    }
    clearTimeout(finishConfirmRef.current);
    // Save session
    const logSnapshot = { ...exerciseLogs };
    saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      day: activeDayData.label,
      duration: sessionElapsed,
      exercises: logSnapshot,
    });
    setPreviousSession(logSnapshot);
    resetState();
  }

  function discardSession() {
    if (!discardConfirm) {
      setDiscardConfirm(true);
      discardConfirmRef.current = setTimeout(() => setDiscardConfirm(false), 2000);
      return;
    }
    clearTimeout(discardConfirmRef.current);
    resetState();
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
          // Auto-dismiss after 5 seconds
          dismissRef.current = setTimeout(() => {
            setTimer((t) => (t?.finished ? null : t));
          }, 5000);
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

  // Dev: expose seed helpers on window
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@/lib/seed").then(({ seed, clearSeed }) => {
        Object.assign(window, { __seed: seed, __clearSeed: clearSeed });
        console.log("Dev helpers ready: __seed() / __clearSeed()");
      });
    }
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
    setHydrated(true);
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

  // Show splash for anonymous users who haven't dismissed it
  // Wait for both auth loading and splash state hydration before deciding
  if (loading || showSplash === null) {
    return null;
  }

  if (showSplash && isAnonymous) {
    return (
      <SplashScreen
        onViewProgram={() => {
          localStorage.setItem("dungym-splash-dismissed", "1");
          setShowSplash(false);
        }}
        onSignIn={() => {
          localStorage.setItem("dungym-splash-dismissed", "1");
          setShowSplash(false);
          setActiveView("account");
        }}
      />
    );
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-0 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]"
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
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block shrink-0"
            >
              <path d="M16 2L14.5 16.5L16 18L17.5 16.5L16 2Z" fill="#d4d4d8" />
              <rect x="10" y="17.5" width="12" height="2" rx="1" fill="#a1a1aa" />
              <rect x="14.75" y="19.5" width="2.5" height="6" rx="0.5" fill="#71717a" />
              <circle cx="16" cy="27.5" r="2" fill="#a1a1aa" />
            </svg>
            <h1 className="text-xl font-bold leading-none text-white">Dungym</h1>
          </div>
          {activeView === "workout" && (
            <div className="flex items-center gap-1">
              {workoutPlan.days.map((d, i) => {
                const isActive = hydrated && i === activeDay;
                return (
                  <button
                    key={d.label}
                    onClick={() => selectDay(i)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all active:scale-[0.97] ${
                      isActive
                        ? "border-red-500/40 bg-[#1a1a1a] text-white"
                        : "border-white/10 text-zinc-500 active:text-zinc-300"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {activeView === "account" ? (
          <AccountView />
        ) : activeView === "stats" ? (
          <StatsView onOpenAuth={() => setActiveView("account")} />
        ) : activeView === "workout" ? (
          <>
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
                readOnly={isAnonymous}
                onAuthPrompt={() => setActiveView("account")}
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
                    readOnly={isAnonymous}
                    onAuthPrompt={() => setActiveView("account")}
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

            <p className="mt-8 mb-6 text-center text-sm text-zinc-500">
              A workout program by{" "}
              <a href="mailto:tprince09@gmail.com" className="text-red-500/60">
                Taylor Prince
              </a>
            </p>
          </>
        ) : (
          <HistoryView onOpenAuth={() => setActiveView("account")} />
        )}
      </div>

      {/* Bottom bar */}
      <nav
        className="sticky bottom-0 z-30 bg-[#0a0a0a]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Session bar — integrated above tabs */}
        {activeView === "workout" && (
          <div className="flex h-14 items-center border-t border-white/10 px-4">
            {timer ? (
              /* Rest timer takes over the bar */
              <button
                onClick={cancelTimer}
                className="flex w-full items-center justify-between"
              >
                <span className={`font-mono text-xl font-semibold tabular-nums ${timer.finished || timer.seconds <= 0 ? "text-red-400" : timer.seconds <= timer.total - timer.lower && timer.total > timer.lower ? "text-red-400" : "text-white"}`}>
                  {timer.finished || timer.seconds <= 0 ? "GO" : formatTime(timer.seconds)}
                </span>
                <div className="flex items-center gap-3">
                  {/* Progress bar */}
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-1000 ease-linear"
                      style={{ width: `${timer.total > 0 ? ((timer.total - timer.seconds) / timer.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">Skip</span>
                </div>
              </button>
            ) : sessionStarted ? (
              <div className="flex w-full items-center gap-2">
                <span className="font-mono text-xl font-semibold tabular-nums text-white">
                  {formatTime(sessionElapsed)}
                </span>

                <div className="ml-auto flex items-center gap-2">
                  {sessionActive ? (
                    <button
                      onClick={sessionPause}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 active:bg-white/5 active:text-white"
                    >
                      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={sessionResume}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 active:bg-white/5 active:text-white"
                      >
                        <svg className="ml-0.5 h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </button>
                      <button
                        onClick={discardSession}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                          discardConfirm
                            ? "border-red-500/40 text-red-500"
                            : "border-white/10 text-zinc-600 active:text-zinc-300"
                        }`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}

                  <button
                    onClick={finishWorkout}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors active:scale-[0.97] ${
                      finishConfirm
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-red-500/20 text-zinc-400 active:text-white"
                    }`}
                  >
                    {finishConfirm ? "Confirm" : "Finish"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSessionStart(Date.now())}
                className="flex w-full items-center justify-center gap-2 text-base font-medium text-zinc-500 transition-colors active:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Start session
              </button>
            )}
          </div>
        )}

        {/* Tab icons */}
        <div className="flex border-t border-white/10">
          <button
            onClick={() => setActiveView("workout")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeView === "workout" ? "text-white" : "text-zinc-600"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === "workout" ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
            <span className="text-[10px] font-medium">Workout</span>
          </button>
          <button
            onClick={() => setActiveView(isAnonymous ? "account" : "history")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeView === "history" ? "text-white" : "text-zinc-600"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === "history" ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium">History</span>
          </button>
          <button
            onClick={() => setActiveView(isAnonymous ? "account" : "stats")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeView === "stats" ? "text-white" : "text-zinc-600"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === "stats" ? 2.5 : 1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <span className="text-[10px] font-medium">Stats</span>
          </button>
          <button
            onClick={() => setActiveView("account")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeView === "account" ? "text-white" : "text-zinc-600"
            }`}
          >
            {!isAnonymous && user?.email ? (
              <>
                <span className={`flex h-5 w-5 items-center justify-center text-xs font-semibold ${activeView === "account" ? "text-white" : "text-zinc-400"}`}>
                  {user.email[0].toUpperCase()}
                </span>
                <span className="text-[10px] font-medium">Account</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeView === "account" ? 2.5 : 1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-[10px] font-medium">Sign in</span>
              </>
            )}
          </button>
        </div>
      </nav>

    </div>
  );
}
