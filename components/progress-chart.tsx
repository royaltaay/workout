"use client";

import { useState, useMemo } from "react";
import type { WorkoutSession } from "@/lib/storage";

type Metric = "weight" | "reps";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    return Array.from(names);
  }, [sessions]);

  const [selected, setSelected] = useState<string>(exerciseNames[0] ?? "");
  const [metric, setMetric] = useState<Metric>("weight");

  const dataPoints = useMemo(() => {
    if (!selected) return [];
    // Oldest first, last 10
    const relevant = [...sessions]
      .filter((s) => s.exercises[selected]?.some((e) => e.weight || e.reps))
      .reverse()
      .slice(-10);

    return relevant.map((s) => {
      const sets = s.exercises[selected];
      let value = 0;
      if (metric === "weight") {
        value = Math.max(...sets.map((e) => parseFloat(e.weight) || 0));
      } else {
        value = Math.max(...sets.map((e) => parseInt(e.reps) || 0));
      }
      return { date: s.date, value };
    });
  }, [sessions, selected, metric]);

  if (exerciseNames.length === 0) return null;

  // SVG dimensions
  const W = 320;
  const H = 160;
  const PAD = { top: 20, right: 16, bottom: 28, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = dataPoints.map((d) => d.value);
  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 1);
  const range = maxV - minV || 1;

  function x(i: number) {
    return PAD.left + (dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * chartW : chartW / 2);
  }
  function y(v: number) {
    return PAD.top + chartH - ((v - minV) / range) * chartH;
  }

  const polyline = dataPoints.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");

  // Y-axis grid: 3-4 lines
  const gridCount = 3;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const v = minV + (range / gridCount) * i;
    return { v, yPos: y(v) };
  });

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Progress</h3>
        <div className="flex gap-1">
          {(["weight", "reps"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                metric === m
                  ? "bg-white/10 text-white"
                  : "text-zinc-600 active:text-zinc-400"
              }`}
            >
              {m === "weight" ? "Weight" : "Reps"}
            </button>
          ))}
        </div>
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
          {/* Grid lines */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={g.yPos}
                x2={W - PAD.right}
                y2={g.yPos}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 6}
                y={g.yPos + 3}
                textAnchor="end"
                className="fill-zinc-600"
                fontSize="9"
              >
                {Math.round(g.v)}
              </text>
            </g>
          ))}

          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots + date labels */}
          {dataPoints.map((d, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(d.value)} r="3.5" fill="#ef4444" />
              <circle cx={x(i)} cy={y(d.value)} r="2" fill="#1a1a1a" />
              {/* Show date labels for first, last, and every other */}
              {(i === 0 || i === dataPoints.length - 1 || i % 2 === 0) && (
                <text
                  x={x(i)}
                  y={H - 6}
                  textAnchor="middle"
                  className="fill-zinc-600"
                  fontSize="8"
                >
                  {formatDate(d.date)}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
