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
  allSessions: WorkoutSession[],
): Promise<Blob> {
  // 4:5 ratio (Instagram post)
  const W = 1080;
  const H = 1350;
  const PAD = 72;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const FONT = "-apple-system, BlinkMacSystemFont, sans-serif";

  // Rounded rect helper
  function roundRect(
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
  }

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Red glow at top
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 600);
  glow.addColorStop(0, "rgba(239, 68, 68, 0.14)");
  glow.addColorStop(0.6, "rgba(239, 68, 68, 0.03)");
  glow.addColorStop(1, "rgba(239, 68, 68, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 600);

  let y = 80;

  // DUNGYM wordmark
  ctx.fillStyle = "#ef4444";
  ctx.font = `bold 28px ${FONT}`;
  ctx.letterSpacing = "5px";
  ctx.fillText("DUNGYM", PAD, y);
  ctx.letterSpacing = "0px";

  // Day label + date
  y += 56;
  const dayLabel = getDayLabel(session.day);
  const dateStr = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  ctx.fillStyle = "#a1a1aa";
  ctx.font = `500 24px ${FONT}`;
  ctx.fillText(`${dayLabel}  ·  ${dateStr}`, PAD, y);

  // Red accent line
  y += 44;
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(PAD, y, 48, 3);

  // --- Stat cards (2x2 grid) mirroring the modal ---
  y += 36;
  const statItems = [
    { label: "Duration", value: stats.duration },
    { label: "Volume", value: stats.volume === "—" ? "—" : stats.volume, unit: stats.volume !== "—" ? " lb" : "" },
    { label: "Sets", value: String(stats.sets) },
    { label: "Exercises", value: String(stats.exercises) },
  ];

  const cardGap = 20;
  const cardW = (W - PAD * 2 - cardGap) / 2;
  const cardH = 120;
  const cardRadius = 24;

  for (let i = 0; i < statItems.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = PAD + col * (cardW + cardGap);
    const cy = y + row * (cardH + cardGap);

    // Card background
    roundRect(cx, cy, cardW, cardH, cardRadius);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    // Card border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Value
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 44px ${FONT}`;
    ctx.fillText(statItems[i].value, cx + 28, cy + 56);

    // Unit suffix
    if ("unit" in statItems[i] && statItems[i].unit) {
      const valWidth = ctx.measureText(statItems[i].value).width;
      ctx.fillStyle = "#71717a";
      ctx.font = `600 22px ${FONT}`;
      ctx.fillText(statItems[i].unit!, cx + 28 + valWidth + 4, cy + 56);
    }

    // Label
    ctx.fillStyle = "#71717a";
    ctx.font = `600 18px ${FONT}`;
    ctx.fillText(statItems[i].label, cx + 28, cy + 88);
  }

  y += (cardH + cardGap) * 2 + 16;

  // --- PRs ---
  if (prs.length > 0) {
    const prCardH = 48 + prs.slice(0, 3).length * 44 + 20;
    roundRect(PAD, y, W - PAD * 2, prCardH, cardRadius);
    ctx.fillStyle = "rgba(239, 68, 68, 0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.20)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // PR header
    ctx.fillStyle = "#ef4444";
    ctx.font = `bold 16px ${FONT}`;
    ctx.letterSpacing = "2px";
    ctx.fillText(prs.length === 1 ? "NEW PERSONAL RECORD" : "NEW PERSONAL RECORDS", PAD + 28, y + 36);
    ctx.letterSpacing = "0px";

    // PR rows
    let pry = y + 72;
    for (const pr of prs.slice(0, 3)) {
      ctx.fillStyle = "#ffffff";
      ctx.font = `500 24px ${FONT}`;
      ctx.fillText(getExerciseName(pr.exercise), PAD + 28, pry);

      ctx.fillStyle = "#ef4444";
      ctx.font = `bold 24px ${FONT}`;
      const weightStr = `${pr.weight} lb`;
      const ww = ctx.measureText(weightStr).width;
      ctx.fillText(weightStr, W - PAD - 28 - ww, pry);
      pry += 44;
    }
    y += prCardH + 16;
  }

  // --- Volume chart (last 8 sessions as bars) ---
  const volumeHistory = [...allSessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map((s) => ({
      vol: computeVolume(s.exercises),
      isCurrent: s.id === session.id,
      date: s.date,
    }));

  if (volumeHistory.length >= 2) {
    const chartPad = 28;
    const chartH = 130;
    const chartCardH = chartH + 72;
    roundRect(PAD, y, W - PAD * 2, chartCardH, cardRadius);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chart label
    ctx.fillStyle = "#71717a";
    ctx.font = `600 16px ${FONT}`;
    ctx.letterSpacing = "1px";
    ctx.fillText("VOLUME", PAD + chartPad, y + 30);
    ctx.letterSpacing = "0px";

    const barAreaX = PAD + chartPad;
    const barAreaW = W - PAD * 2 - chartPad * 2;
    const barAreaY = y + 46;
    const barAreaH = chartH - 6;
    const maxVol = Math.max(...volumeHistory.map((v) => v.vol), 1);
    const barW = Math.min(
      (barAreaW - (volumeHistory.length - 1) * 8) / volumeHistory.length,
      60,
    );
    const totalBarsW = volumeHistory.length * barW + (volumeHistory.length - 1) * 8;
    const barsStartX = barAreaX + (barAreaW - totalBarsW) / 2;

    for (let i = 0; i < volumeHistory.length; i++) {
      const v = volumeHistory[i];
      const barH = Math.max((v.vol / maxVol) * barAreaH, 4);
      const bx = barsStartX + i * (barW + 8);
      const by = barAreaY + barAreaH - barH;

      roundRect(bx, by, barW, barH, 6);
      ctx.fillStyle = v.isCurrent ? "#ef4444" : "rgba(255, 255, 255, 0.10)";
      ctx.fill();
    }

    y += chartCardH + 16;
  }

  // --- Streak ---
  if (streak >= 2 && y < H - 160) {
    const streakH = 72;
    roundRect(PAD, y, W - PAD * 2, streakH, cardRadius);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(239, 68, 68, 0.10)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 32px ${FONT}`;
    ctx.fillText(`${streak}`, PAD + 28, y + 46);
    const numW = ctx.measureText(`${streak}`).width;
    ctx.fillStyle = "#a1a1aa";
    ctx.font = `500 22px ${FONT}`;
    ctx.fillText(" session streak", PAD + 28 + numW, y + 46);
  }

  // --- Footer — DUNGYM.APP ---
  ctx.fillStyle = "#ef4444";
  ctx.font = `bold 24px ${FONT}`;
  ctx.letterSpacing = "4px";
  const footerText = "DUNGYM.APP";
  const footerW = ctx.measureText(footerText).width;
  ctx.fillText(footerText, (W - footerW) / 2, H - 56);
  ctx.letterSpacing = "0px";

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
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([]);
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
      setAllSessions(all);
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
        allSessions,
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
          `${dayLabel} — ${durationStr} · ${sets} sets · ${volumeStr} lb volume\ndungym.app`,
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
  }, [session, durationStr, volumeStr, sets, exercises, prs, streak, allSessions]);

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
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      {/* Red glow at top */}
      <div
        className="absolute inset-0"
        style={{
          background: prs.length > 0
            ? "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(239,68,68,0.18) 0%, transparent 100%)"
            : "radial-gradient(ellipse 90% 50% at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        style={{
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "transform 400ms ease-out",
        }}
      >
        {/* Headline */}
        <div className="mb-2">
          {/* Red accent bar */}
          <div className="mb-4 h-1 w-10 rounded-full bg-red-500" />
          <h1 className="text-4xl font-bold tracking-tight text-white">
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

        {/* Stats grid — large for mobile readability */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <StatCard label="Duration" value={durationStr} />
          <StatCard
            label="Volume"
            value={volumeStr}
            unit={volume > 0 ? "lb" : undefined}
          />
          <StatCard label="Sets" value={String(sets)} />
          <StatCard label="Exercises" value={String(exercises)} />
        </div>

        {/* New PRs */}
        {prs.length > 0 && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/8 px-5 py-4">
            <div className="mb-3 text-[11px] font-bold tracking-[0.15em] text-red-500">
              {prs.length === 1 ? "NEW PERSONAL RECORD" : "NEW PERSONAL RECORDS"}
            </div>
            {prs.map((pr) => (
              <div
                key={pr.exercise}
                className="flex items-baseline justify-between py-1.5"
              >
                <span className="text-[15px] font-medium text-white">
                  {getExerciseName(pr.exercise)}
                </span>
                <span className="text-[15px] font-semibold text-red-400">
                  {pr.weight} lb
                  {pr.previousWeight && (
                    <span className="ml-2 text-xs font-normal text-zinc-600">
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
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-500/15 bg-white/5 px-5 py-4">
            <span className="text-3xl font-bold text-white">{streak}</span>
            <span className="text-sm font-medium text-zinc-400">session streak</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* dungym.app branding */}
        <div className="mb-5 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-red-500/60">
            DUNGYM.APP
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-red-500 py-4 text-[15px] font-bold text-white transition-opacity active:scale-[0.98] disabled:opacity-40"
          >
            {copied ? (
              "Copied to clipboard"
            ) : sharing ? (
              "Preparing..."
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
                Share to stories
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-4 text-[15px] font-medium text-zinc-500 transition-colors active:text-zinc-300"
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
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
      <div className="text-4xl font-bold tracking-tight text-white">
        {value}
        {unit && (
          <span className="ml-1 text-base font-semibold text-zinc-500">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs font-semibold tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}
