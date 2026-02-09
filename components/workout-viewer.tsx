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
  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (day === 1 || day === 2) return 0; // Mon, Tue → Monday
  if (day === 3 || day === 4) return 1; // Wed, Thu → Wednesday
  return 2; // Fri, Sat, Sun → Friday
}

function TempoBadge({ tempo }: { tempo: string }) {
  return (
    <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
      {tempo}
    </span>
  );
}

function ComplexCard() {
  const { complex } = workoutPlan;
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-white">The Complex</h2>
        <span className="text-sm text-zinc-400">{complex.rounds} Rounds</span>
      </div>
      <div className="space-y-3">
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

function SupersetCard({ superset }: { superset: Day["supersets"][number] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-white">{superset.name}</h3>
        <span className="text-sm text-zinc-400">
          {superset.rounds} Rounds
        </span>
      </div>
      <div className="space-y-3">
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

function FinisherCard({ finisher }: { finisher: Day["finisher"] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Finisher</h3>
      </div>
      <div>
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
      <p className="mt-4 text-sm text-zinc-500">Rest: {finisher.rest}</p>
    </div>
  );
}

export default function WorkoutViewer() {
  const [activeDay, setActiveDay] = useState(getTodayTab);
  const day = workoutPlan.days[activeDay];

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Kettlebell Complex Program
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Warm-up: {workoutPlan.warmUp}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Tempo: {workoutPlan.tempoExplanation}
        </p>
      </header>

      {/* Day selector */}
      <div className="mb-6 flex gap-2">
        {workoutPlan.days.map((d, i) => (
          <button
            key={d.label}
            onClick={() => setActiveDay(i)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              i === activeDay
                ? "bg-white text-black"
                : "border border-white/20 text-zinc-400 hover:text-white"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Complex — always visible */}
      <ComplexCard />

      {/* Day title */}
      <h2 className="mb-4 mt-8 text-xl font-semibold text-white">
        {day.title}
      </h2>

      {/* Supersets */}
      <div className="space-y-4">
        {day.supersets.map((s) => (
          <SupersetCard key={s.name} superset={s} />
        ))}
      </div>

      {/* Finisher */}
      <div className="mt-4">
        <FinisherCard finisher={day.finisher} />
      </div>

      {/* Progression notes */}
      <div className="mt-8">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Progression Notes
        </h3>
        <ul className="space-y-1">
          {workoutPlan.progressionNotes.map((note) => (
            <li key={note} className="text-sm text-zinc-400">
              • {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
