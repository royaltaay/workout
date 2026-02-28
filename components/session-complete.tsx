"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  getSessions,
  type WorkoutSession,
  type SetEntry,
} from "@/lib/storage";
import { exerciseIdToName, dayById } from "@/lib/workout-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SessionCompleteProps = {
  session: WorkoutSession;
  onDismiss: () => void;
};

type NewPR = {
  exercise: string;
  weight: number;
  previousWeight: number | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function computeVolume(exercises: Record<string, SetEntry[]>): number {
  let vol = 0;
  for (const sets of Object.values(exercises)) {
    for (const set of sets) {
      const w = parseFloat(set.weight) || 0;
      const r = parseInt(set.reps) || 0;
      if (w > 0 && r > 0) vol += w * r;
    }
  }
  return vol;
}

function formatVolume(vol: number): string {
  if (vol === 0) return "—";
  if (vol >= 10_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toLocaleString();
}

function countSets(exercises: Record<string, SetEntry[]>): number {
  let total = 0;
  for (const sets of Object.values(exercises)) {
    total += sets.filter(
      (s) => (parseFloat(s.weight) || 0) > 0 || (parseInt(s.reps) || 0) > 0,
    ).length;
  }
  return total;
}

function countExercises(exercises: Record<string, SetEntry[]>): number {
  let count = 0;
  for (const sets of Object.values(exercises)) {
    if (
      sets.some(
        (s) =>
          (parseFloat(s.weight) || 0) > 0 || (parseInt(s.reps) || 0) > 0,
      )
    ) {
      count++;
    }
  }
  return count;
}

/** Find PRs set in this session compared to all previous sessions */
function findNewPRs(
  current: WorkoutSession,
  history: WorkoutSession[],
): NewPR[] {
  // Build map of previous max weight per exercise (excluding current session)
  const previousMax: Record<string, number> = {};
  for (const s of history) {
    if (s.id === current.id) continue;
    for (const [exerciseId, sets] of Object.entries(s.exercises)) {
      for (const set of sets) {
        const w = parseFloat(set.weight) || 0;
        if (w > 0 && (!previousMax[exerciseId] || w > previousMax[exerciseId])) {
          previousMax[exerciseId] = w;
        }
      }
    }
  }

  // Check current session for new PRs
  const prs: NewPR[] = [];
  for (const [exerciseId, sets] of Object.entries(current.exercises)) {
    for (const set of sets) {
      const w = parseFloat(set.weight) || 0;
      if (w > 0 && (!previousMax[exerciseId] || w > previousMax[exerciseId])) {
        // Only add once per exercise (highest weight)
        const existing = prs.find((p) => p.exercise === exerciseId);
        if (!existing || w > existing.weight) {
          if (existing) {
            existing.weight = w;
          } else {
            prs.push({
              exercise: exerciseId,
              weight: w,
              previousWeight: previousMax[exerciseId] ?? null,
            });
          }
        }
      }
    }
  }

  return prs.sort((a, b) => b.weight - a.weight);
}

function computeStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;
  const toKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const daysBetween = (a: string, b: string) => {
    const da = new Date(a + "T00:00:00");
    const db = new Date(b + "T00:00:00");
    return Math.round(Math.abs(da.getTime() - db.getTime()) / 86_400_000);
  };

  const uniqueDates = Array.from(
    new Set(sessions.map((s) => toKey(s.date))),
  ).sort();
  const today = toKey(new Date().toISOString());
  const last = uniqueDates[uniqueDates.length - 1];
  if (daysBetween(today, last) > 3) return 0;

  let streak = 1;
  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    if (daysBetween(uniqueDates[i], uniqueDates[i + 1]) <= 3) streak++;
    else break;
  }
  return streak;
}

function getDayLabel(dayId: string): string {
  const day = dayById[dayId];
  if (!day) return dayId;
  const focus = day.title.split("—")[1]?.trim();
  return focus || day.label;
}

function getExerciseName(id: string): string {
  return exerciseIdToName[id] || id;
}

// ---------------------------------------------------------------------------
// Contextual headline
// ---------------------------------------------------------------------------

function getHeadline(
  prs: NewPR[],
  streak: number,
  totalSessions: number,
): { title: string; subtitle: string } {
  if (totalSessions <= 1) {
    return {
      title: "First one down",
      subtitle: "Welcome to the program. Consistency starts now.",
    };
  }
  if (prs.length > 0) {
    return {
      title: prs.length === 1 ? "New PR" : `${prs.length} new PRs`,
      subtitle: "You're getting stronger.",
    };
  }
  if (streak >= 10) {
    return {
      title: `${streak} sessions deep`,
      subtitle: "That's serious consistency.",
    };
  }
  if (streak >= 5) {
    return {
      title: "On a roll",
      subtitle: `${streak} sessions and counting.`,
    };
  }
  if (streak >= 3) {
    return {
      title: "Building momentum",
      subtitle: `${streak} in a row. Keep showing up.`,
    };
  }
  // Rotate through general messages based on session count
  const messages = [
    { title: "Session complete", subtitle: "Another one in the books." },
    { title: "Work done", subtitle: "That's how it's built." },
    { title: "Solid session", subtitle: "Show up again next time." },
  ];
  return messages[totalSessions % messages.length];
}

// ---------------------------------------------------------------------------
// Share card renderer (canvas)
// ---------------------------------------------------------------------------

async function renderShareCard(
  session: WorkoutSession,
  stats: { duration: string; volume: string; sets: number; exercises: number },
  prs: NewPR[],
  streak: number,
): Promise<Blob> {
  const W = 720;
  const H = 960;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);

  // Subtle red glow at top
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 400);
  glow.addColorStop(0, "rgba(239, 68, 68, 0.08)");
  glow.addColorStop(1, "rgba(239, 68, 68, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 400);

  let y = 80;

  // DUNGYM
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("DUNGYM", 60, y);
  ctx.letterSpacing = "0px";

  // Day label + date
  y += 60;
  const dayLabel = getDayLabel(session.day);
  const dateStr = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  ctx.fillStyle = "#a1a1aa"; // zinc-400
  ctx.font = "500 18px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${dayLabel}  ·  ${dateStr}`, 60, y);

  // Divider
  y += 40;
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(60, y, W - 120, 1);

  // Stats grid (2x2)
  y += 50;
  const statItems = [
    { label: "Duration", value: stats.duration },
    { label: "Volume", value: stats.volume === "—" ? "—" : `${stats.volume} lb` },
    { label: "Sets", value: String(stats.sets) },
    { label: "Exercises", value: String(stats.exercises) },
  ];

  const colW = (W - 120) / 2;
  for (let i = 0; i < statItems.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 60 + col * colW;
    const sy = y + row * 100;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(statItems[i].value, x, sy);

    ctx.fillStyle = "#71717a"; // zinc-500
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(statItems[i].label, x, sy + 28);
  }

  y += 220;

  // PRs
  if (prs.length > 0) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(60, y, W - 120, 1);
    y += 40;

    ctx.fillStyle = "#ef4444"; // red-500
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("PERSONAL RECORDS", 60, y);
    ctx.letterSpacing = "0px";
    y += 35;

    for (const pr of prs.slice(0, 3)) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 20px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`${getExerciseName(pr.exercise)}  —  ${pr.weight} lb`, 60, y);
      y += 32;
    }
    y += 15;
  }

  // Streak
  if (streak >= 2) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(60, y, W - 120, 1);
    y += 40;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`${streak}`, 60, y);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 18px -apple-system, BlinkMacSystemFont, sans-serif";
    const numWidth = ctx.measureText(`${streak}`).width;
    ctx.fillText("  session streak", 60 + numWidth, y);
  }

  // Footer
  ctx.fillStyle = "#3f3f46"; // zinc-700
  ctx.font = "500 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("dungym.com", 60, H - 50);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SessionComplete({
  session,
  onDismiss,
}: SessionCompleteProps) {
  const [visible, setVisible] = useState(false);
  const [prs, setPrs] = useState<NewPR[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const dismissing = useRef(false);

  // Compute stats from the session
  const volume = computeVolume(session.exercises);
  const sets = countSets(session.exercises);
  const exercises = countExercises(session.exercises);
  const durationStr = formatDuration(session.duration);
  const volumeStr = formatVolume(volume);

  // Load history for PRs and streak
  useEffect(() => {
    getSessions().then((all) => {
      setTotalSessions(all.length);
      setPrs(findNewPRs(session, all));
      setStreak(computeStreak(all));
    });
  }, [session]);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, []);

  const handleDismiss = useCallback(() => {
    if (dismissing.current) return;
    dismissing.current = true;
    setVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const blob = await renderShareCard(
        session,
        { duration: durationStr, volume: volumeStr, sets, exercises },
        prs,
        streak,
      );
      const file = new File([blob], "dungym-session.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Dungym Workout",
        });
      } else if (navigator.share) {
        // Fallback: text-only share
        const dayLabel = getDayLabel(session.day);
        await navigator.share({
          title: "Dungym Workout",
          text: `${dayLabel} — ${durationStr} · ${sets} sets · ${volumeStr} lb volume`,
        });
      } else {
        // Clipboard fallback
        const dayLabel = getDayLabel(session.day);
        await navigator.clipboard.writeText(
          `${dayLabel} — ${durationStr} · ${sets} sets · ${volumeStr} lb volume\ndungym.com`,
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      // User cancelled share — ignore
      if ((e as Error).name !== "AbortError") {
        console.error("Share failed:", e);
      }
    }
    setSharing(false);
  }, [session, durationStr, volumeStr, sets, exercises, prs, streak]);

  const { title, subtitle } = getHeadline(prs, streak, totalSessions);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Subtle red glow at top — mirrors the completion glow */}
      <div
        className="absolute inset-0"
        style={{
          background: prs.length > 0
            ? "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(239,68,68,0.12) 0%, transparent 100%)"
            : "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-1 flex-col px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]"
        style={{
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "transform 400ms ease-out",
        }}
      >
        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 text-base text-zinc-400">{subtitle}</p>
        </div>

        {/* Day + date */}
        <div className="mb-6 text-sm font-medium text-zinc-500">
          {getDayLabel(session.day)} &middot;{" "}
          {new Date(session.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>

        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <StatCard label="Duration" value={durationStr} />
          <StatCard
            label="Volume"
            value={volumeStr}
            unit={volume > 0 ? "lb" : undefined}
          />
          <StatCard label="Sets logged" value={String(sets)} />
          <StatCard label="Exercises" value={String(exercises)} />
        </div>

        {/* New PRs */}
        {prs.length > 0 && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <div className="mb-2 text-xs font-semibold tracking-wider text-red-500/80">
              {prs.length === 1 ? "NEW PR" : "NEW PRs"}
            </div>
            {prs.map((pr) => (
              <div
                key={pr.exercise}
                className="flex items-baseline justify-between py-1"
              >
                <span className="text-sm font-medium text-white">
                  {getExerciseName(pr.exercise)}
                </span>
                <span className="text-sm text-zinc-300">
                  {pr.weight} lb
                  {pr.previousWeight && (
                    <span className="ml-1.5 text-xs text-zinc-600">
                      was {pr.previousWeight}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Streak */}
        {streak >= 2 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-2xl font-bold text-white">{streak}</span>
            <span className="text-sm text-zinc-400">session streak</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition-opacity active:scale-[0.98] disabled:opacity-40"
          >
            {copied ? (
              "Copied to clipboard"
            ) : sharing ? (
              "Preparing..."
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3-3m0 0 3 3m-3-3v12M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
                Share workout
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3.5 text-sm font-medium text-zinc-500 transition-colors active:text-zinc-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-2xl font-bold text-white">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-medium text-zinc-500">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-0.5 text-xs font-medium text-zinc-500">{label}</div>
    </div>
  );
}
