"use client";

import { useState, useMemo } from "react";
import type { WorkoutSession } from "@/lib/storage";
import { workoutPlan } from "@/lib/workout-data";
import { parseExerciseUnit } from "@/lib/units";

// Canonical exercise order + unit label from workout plan
const { exerciseOrder, exerciseUnit } = (() => {
  const order: Record<string, number> = {};
  const unit: Record<string, string> = {};
  let idx = 0;
  for (const ex of workoutPlan.complex.exercises) {
    order[ex.name] = idx++;
    unit[ex.name] = parseExerciseUnit(ex.reps).label;
  }
  for (const day of workoutPlan.days) {
    for (const ss of day.supersets) {
      for (const ex of ss.exercises) {
        if (!(ex.name in order)) {
          order[ex.name] = idx++;
          unit[ex.name] = parseExerciseUnit(ex.reps).label;
        }
      }
    }
    if (!(day.finisher.name in order)) {
      order[day.finisher.name] = idx++;
      unit[day.finisher.name] = parseExerciseUnit(day.finisher.reps).label;
    }
  }
  return { exerciseOrder: order, exerciseUnit: unit };
})();

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function niceStep(range: number): number {
  if (range <= 0) return 5;
  const rough = range / 3;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  if (norm <= 1.5) return mag;
  if (norm <= 3.5) return 2.5 * mag;
  if (norm <= 7.5) return 5 * mag;
  return 10 * mag;
}

function computeAxis(values: number[]) {
  if (values.length === 0) return { minV: 0, maxV: 1, range: 1, gridLines: [0, 1] };
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const dataRange = rawMax - rawMin;
  const pad = dataRange > 0 ? dataRange * 0.15 : Math.max(rawMax * 0.2, 5);
  const step = niceStep(dataRange + pad * 2);
  const minV = Math.floor((rawMin - pad) / step) * step;
  const maxV = Math.ceil((rawMax + pad) / step) * step;
  const range = maxV - minV || 1;

  const gridLines: number[] = [];
  for (let v = minV; v <= maxV; v += step) gridLines.push(v);

  return { minV, maxV, range, gridLines };
}

export default function ProgressChart({ sessions }: { sessions: WorkoutSession[] }) {
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of sessions) {
      for (const name of Object.keys(s.exercises)) {
        const sets = s.exercises[name];
        if (sets?.some((e) => e.weight || e.reps)) names.add(name);
      }
    }
    return Array.from(names).sort(
      (a, b) => (exerciseOrder[a] ?? 999) - (exerciseOrder[b] ?? 999)
    );
  }, [sessions]);

  const [selected, setSelected] = useState<string>(exerciseNames[0] ?? "");

  const dataPoints = useMemo(() => {
    if (!selected) return [];
    const relevant = [...sessions]
      .filter((s) => s.exercises[selected]?.some((e) => e.weight || e.reps))
      .reverse()
      .slice(-10);

    return relevant.map((s) => {
      const sets = s.exercises[selected];
      return {
        date: s.date,
        weight: Math.max(...sets.map((e) => parseFloat(e.weight) || 0)),
        reps: Math.max(...sets.map((e) => parseInt(e.reps) || 0)),
      };
    });
  }, [sessions, selected]);

  if (exerciseNames.length === 0) return null;

  const hasWeight = dataPoints.some((d) => d.weight > 0);
  const hasReps = dataPoints.some((d) => d.reps > 0);
  const dualAxis = hasWeight && hasReps;

  // SVG dimensions — wider right padding when dual-axis for reps labels
  const W = 320;
  const H = 160;
  const PAD = { top: 20, right: dualAxis ? 36 : 16, bottom: 28, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const weightAxis = hasWeight ? computeAxis(dataPoints.map((d) => d.weight)) : null;
  const repsAxis = hasReps ? computeAxis(dataPoints.map((d) => d.reps)) : null;

  function x(i: number) {
    return PAD.left + (dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * chartW : chartW / 2);
  }
  function yWeight(v: number) {
    if (!weightAxis) return 0;
    return PAD.top + chartH - ((v - weightAxis.minV) / weightAxis.range) * chartH;
  }
  function yReps(v: number) {
    if (!repsAxis) return 0;
    return PAD.top + chartH - ((v - repsAxis.minV) / repsAxis.range) * chartH;
  }

  const weightLine = hasWeight
    ? dataPoints.map((d, i) => `${x(i)},${yWeight(d.weight)}`).join(" ")
    : "";
  const repsLine = hasReps
    ? dataPoints.map((d, i) => `${x(i)},${yReps(d.reps)}`).join(" ")
    : "";

  // Use weight axis grid lines as primary; fall back to reps
  const primaryAxis = weightAxis ?? repsAxis;

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Progress</h3>
        {dualAxis && (
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-full bg-red-500" />
              <span className="text-zinc-500">Weight</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-3 rounded-full bg-zinc-400" />
              <span className="text-zinc-500">{exerciseUnit[selected] ?? "Reps"}</span>
            </span>
          </div>
        )}
      </div>

      {/* Exercise picker */}
      <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {exerciseNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              selected === name
                ? "border-red-500/40 bg-[#1a1a1a] text-white"
                : "border-white/10 text-zinc-500 active:text-zinc-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {dataPoints.length < 2 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-xs text-zinc-600">Need 2+ sessions to show chart</p>
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines from primary axis */}
          {primaryAxis?.gridLines.map((v, i) => {
            const yPos = weightAxis
              ? PAD.top + chartH - ((v - weightAxis.minV) / weightAxis.range) * chartH
              : PAD.top + chartH - ((v - repsAxis!.minV) / repsAxis!.range) * chartH;
            return (
              <line
                key={i}
                x1={PAD.left}
                y1={yPos}
                x2={W - PAD.right}
                y2={yPos}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Left Y-axis labels (weight or sole metric) */}
          {weightAxis?.gridLines.map((v, i) => (
            <text
              key={`wl-${i}`}
              x={PAD.left - 6}
              y={yWeight(v) + 3}
              textAnchor="end"
              className="fill-zinc-600"
              fontSize="9"
            >
              {Math.round(v)}
            </text>
          ))}

          {/* Right Y-axis labels (reps, only in dual-axis mode) */}
          {dualAxis && repsAxis?.gridLines.map((v, i) => (
            <text
              key={`rl-${i}`}
              x={W - PAD.right + 6}
              y={yReps(v) + 3}
              textAnchor="start"
              className="fill-zinc-500"
              fontSize="9"
            >
              {Math.round(v)}
            </text>
          ))}

          {/* If only reps (no weight), show reps labels on left */}
          {!hasWeight && repsAxis?.gridLines.map((v, i) => (
            <text
              key={`rl-${i}`}
              x={PAD.left - 6}
              y={yReps(v) + 3}
              textAnchor="end"
              className="fill-zinc-600"
              fontSize="9"
            >
              {Math.round(v)}
            </text>
          ))}

          {/* Weight line */}
          {hasWeight && (
            <polyline
              points={weightLine}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Reps line */}
          {hasReps && (
            <polyline
              points={repsLine}
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={dualAxis ? "4 3" : "none"}
            />
          )}

          {/* Weight dots */}
          {hasWeight && dataPoints.map((d, i) => (
            <g key={`wd-${i}`}>
              <circle cx={x(i)} cy={yWeight(d.weight)} r="3.5" fill="#ef4444" />
              <circle cx={x(i)} cy={yWeight(d.weight)} r="2" fill="#1a1a1a" />
            </g>
          ))}

          {/* Reps dots */}
          {hasReps && dataPoints.map((d, i) => (
            <g key={`rd-${i}`}>
              <circle cx={x(i)} cy={yReps(d.reps)} r="3" fill="#a1a1aa" />
              <circle cx={x(i)} cy={yReps(d.reps)} r="1.5" fill="#1a1a1a" />
            </g>
          ))}

          {/* Date labels */}
          {dataPoints.map((d, i) => (
            (i === 0 || i === dataPoints.length - 1 || i % 2 === 0) ? (
              <text
                key={`dl-${i}`}
                x={x(i)}
                y={H - 6}
                textAnchor="middle"
                className="fill-zinc-600"
                fontSize="8"
              >
                {formatDate(d.date)}
              </text>
            ) : null
          ))}
        </svg>
      )}
    </div>
  );
}
