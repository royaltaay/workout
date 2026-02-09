"use client";

import { useState } from "react";
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

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`mt-1.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-all active:scale-[0.85] ${
        checked
          ? "border-red-500/50 bg-red-500/20 text-red-400"
          : "border-white/20 text-transparent hover:border-white/40"
      }`}
    >
      {checked && (
        <svg
          className="h-2.5 w-2.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
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
  checked,
  onToggle,
}: {
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const { complex } = workoutPlan;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-white">The Complex</h2>
        <span className="text-sm text-zinc-400">{complex.rounds} Rounds</span>
      </div>
      <div className="space-y-3">
        {complex.exercises.map((ex: ComplexExercise) => {
          const key = `complex-${ex.name}`;
          return (
            <div key={ex.name} className="flex items-start gap-2">
              <Checkbox
                checked={!!checked[key]}
                onChange={() => onToggle(key)}
              />
              <div className={`transition-opacity ${checked[key] ? "opacity-40" : ""}`}>
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
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-zinc-500">
        Rest between rounds: {complex.rest}
      </p>
    </div>
  );
}

function SupersetCard({
  superset,
  checked,
  onToggle,
}: {
  superset: Day["supersets"][number];
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-white">{superset.name}</h3>
        <span className="text-sm text-zinc-400">
          {superset.rounds} Rounds
        </span>
      </div>
      <div className="space-y-3">
        {superset.exercises.map((ex: Exercise) => {
          const key = `${superset.name}-${ex.name}`;
          return (
            <div key={ex.name} className="flex items-start gap-2">
              <Checkbox
                checked={!!checked[key]}
                onChange={() => onToggle(key)}
              />
              <div className={`transition-opacity ${checked[key] ? "opacity-40" : ""}`}>
                <p className="font-medium text-white">{ex.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <span>{ex.reps}</span>
                  <span>·</span>
                  <TempoBadge tempo={ex.tempo} />
                  <span>·</span>
                  <span>RPE {ex.rpe}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-zinc-500">Rest: {superset.rest}</p>
    </div>
  );
}

function FinisherCard({
  finisher,
  checked,
  onToggle,
}: {
  finisher: Day["finisher"];
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Finisher</h3>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox checked={checked} onChange={onToggle} />
        <div className={`transition-opacity ${checked ? "opacity-40" : ""}`}>
          <p className="font-medium text-white">{finisher.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            <span>
              {finisher.sets}×{finisher.reps}
            </span>
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
      </div>
      <p className="mt-4 text-sm text-zinc-500">Rest: {finisher.rest}</p>
    </div>
  );
}

export default function WorkoutViewer() {
  const [activeDay, setActiveDay] = useState(getTodayTab);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const day = workoutPlan.days[activeDay];

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      <div className="flex-1">
        {/* Header */}
        <header className="animate-in mb-6">
          <div className="flex items-center gap-1.5">
            <svg
              width="50"
              height="50"
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
        </header>

        {/* Day selector */}
        <div className="animate-in mb-6 flex gap-2" style={{ animationDelay: "50ms" }}>
          {workoutPlan.days.map((d, i) => (
            <button
              key={d.label}
              onClick={() => setActiveDay(i)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all active:scale-[0.97] ${
                i === activeDay
                  ? "bg-white text-black"
                  : "border border-white/20 text-zinc-400 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Complex */}
        <div className="animate-in" style={{ animationDelay: "100ms" }}>
          <ComplexCard checked={checked} onToggle={toggle} />
        </div>

        {/* Day title */}
        <h2
          className="animate-in mb-4 mt-8 text-xl font-semibold text-white"
          style={{ animationDelay: "150ms" }}
        >
          {day.title}
        </h2>

        {/* Supersets */}
        <div className="space-y-4">
          {day.supersets.map((s, i) => (
            <div
              key={s.name}
              className="animate-in"
              style={{ animationDelay: `${200 + i * 50}ms` }}
            >
              <SupersetCard
                superset={s}
                checked={checked}
                onToggle={toggle}
              />
            </div>
          ))}
        </div>

        {/* Finisher */}
        <div className="animate-in mt-4" style={{ animationDelay: "300ms" }}>
          <FinisherCard
            finisher={day.finisher}
            checked={!!checked[`finisher-${day.finisher.name}`]}
            onToggle={() => toggle(`finisher-${day.finisher.name}`)}
          />
        </div>

        {/* Progression notes */}
        <div
          className="animate-in mt-8 space-y-3"
          style={{ animationDelay: "350ms" }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Progression Notes
          </h3>
          <p className="text-xs text-zinc-500">
            Tempo: {workoutPlan.tempoExplanation}
          </p>
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
      </div>

      {/* Footer */}
      <footer
        className="animate-in mt-12 border-t border-white/5 pt-6 pb-4 text-center"
        style={{ animationDelay: "400ms" }}
      >
        <p className="text-sm text-zinc-500">A workout program by Taylor Prince</p>
      </footer>
    </div>
  );
}
