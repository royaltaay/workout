"use client";

import { useState, useRef, useCallback } from "react";
import {
  workoutPlan,
  type ComplexExercise,
  type Exercise,
  type Day,
} from "@/lib/workout-data";

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

function ComplexCard({
  completed,
  onTap,
}: {
  completed: number;
  onTap: () => void;
}) {
  const { complex } = workoutPlan;
  const allDone = completed >= complex.rounds;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">The Complex</h2>
        <RoundDots total={complex.rounds} completed={completed} onTap={onTap} label="Rounds" />
      </div>
      <div className={`space-y-3 transition-opacity ${allDone ? "opacity-40" : ""}`}>
        {complex.exercises.map((ex: ComplexExercise) => (
          <div key={ex.name}>
            <p className="font-medium text-white">{ex.name}</p>
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
      <p className="mt-4 text-sm text-zinc-500">
        Rest between rounds: {complex.rest}
      </p>
    </div>
  );
}

function SupersetCard({
  superset,
  completed,
  onTap,
}: {
  superset: Day["supersets"][number];
  completed: number;
  onTap: () => void;
}) {
  const allDone = completed >= superset.rounds;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{superset.name}</h3>
        <RoundDots total={superset.rounds} completed={completed} onTap={onTap} label="Rounds" />
      </div>
      <div className={`space-y-3 transition-opacity ${allDone ? "opacity-40" : ""}`}>
        {superset.exercises.map((ex: Exercise) => (
          <div key={ex.name}>
            <p className="font-medium text-white">{ex.name}</p>
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
      <p className="mt-4 text-sm text-zinc-500">Rest: {superset.rest}</p>
    </div>
  );
}

function FinisherCard({
  finisher,
  completed,
  onTap,
}: {
  finisher: Day["finisher"];
  completed: number;
  onTap: () => void;
}) {
  const allDone = completed >= finisher.sets;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Finisher</h3>
        <RoundDots total={finisher.sets} completed={completed} onTap={onTap} label="Sets" />
      </div>
      <div className={`transition-opacity ${allDone ? "opacity-40" : ""}`}>
        <p className="font-medium text-white">{finisher.name}</p>
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
      <p className="mt-4 text-sm text-zinc-500">Rest: {finisher.rest}</p>
    </div>
  );
}

function DayContent({
  day,
  counts,
  onTap,
}: {
  day: Day;
  counts: Record<string, number>;
  onTap: (key: string, max: number) => void;
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
          />
        ))}
      </div>
      <div className="mt-4">
        <FinisherCard
          finisher={day.finisher}
          completed={counts[`finisher-${day.label}`] ?? 0}
          onTap={() => onTap(`finisher-${day.label}`, day.finisher.sets)}
        />
      </div>
    </div>
  );
}

export default function WorkoutViewer() {
  const [activeDay, setActiveDay] = useState(getTodayTab);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, locked: false });

  function tap(key: string, max: number) {
    setCounts((prev) => {
      const current = prev[key] ?? 0;
      return { ...prev, [key]: current >= max ? 0 : current + 1 };
    });
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      locked: false,
    };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchRef.current.startX;
    const dy = e.touches[0].clientY - touchRef.current.startY;

    // Lock direction on first significant move
    if (!touchRef.current.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      touchRef.current.locked = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Vertical scroll — bail out
        setIsSwiping(false);
        return;
      }
    }

    if (!isSwiping) return;

    // Dampen at edges
    const atEdge =
      (activeDay === 0 && dx > 0) ||
      (activeDay === workoutPlan.days.length - 1 && dx < 0);
    setOffsetX(atEdge ? dx * 0.2 : dx);
  }, [activeDay, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    const threshold = 60;
    if (offsetX < -threshold && activeDay < workoutPlan.days.length - 1) {
      setActiveDay((prev) => prev + 1);
    } else if (offsetX > threshold && activeDay > 0) {
      setActiveDay((prev) => prev - 1);
    }
    setOffsetX(0);
    setIsSwiping(false);
  }, [offsetX, activeDay]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
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
                onClick={() => setActiveDay(i)}
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
          />
        </div>

        {/* Swipeable day content */}
        <div
          className="animate-in overflow-hidden"
          style={{ animationDelay: "150ms" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
        className="animate-in mt-8 border-t border-white/5 py-4 text-center"
        style={{ animationDelay: "400ms" }}
      >
        <p className="text-sm text-zinc-500">A workout program by <a href="mailto:tprince09@gmail.com" className="text-red-500/60">Taylor Prince</a></p>
      </footer>
    </div>
  );
}
