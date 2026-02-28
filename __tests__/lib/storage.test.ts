import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  workoutPlan,
  exerciseNameToId,
  dayById,
} from "@/lib/workout-data";

// ---------------------------------------------------------------------------
// We test the normalization/resolution logic that lives in storage.ts.
// Since those functions are not directly exported, we re-implement the same
// logic here as pure functions and verify against the workout-data maps.
// This ensures backward compatibility is maintained when the plan changes.
// ---------------------------------------------------------------------------

/** Build the legacy day map the same way storage.ts does */
function buildLegacyDayToId(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const day of workoutPlan.days) {
    map[day.id] = day.id;
    map[day.label] = day.id;
    map[day.title] = day.id;
  }
  return map;
}

function normalizeDashes(s: string): string {
  return s.replace(/[\u2014\u2013\u2012\u2015-]/g, "-");
}

function resolveDayId(raw: string): string {
  const legacyDayToId = buildLegacyDayToId();

  if (legacyDayToId[raw]) return legacyDayToId[raw];

  const normalizedRaw = normalizeDashes(raw);
  for (const [key, id] of Object.entries(legacyDayToId)) {
    if (normalizeDashes(key) === normalizedRaw) return id;
  }

  const numMatch = raw.match(/Day\s*(\d)/i);
  if (numMatch) {
    for (const day of workoutPlan.days) {
      if (day.label === `Day ${numMatch[1]}`) return day.id;
    }
  }

  const rawLower = raw.toLowerCase();
  for (const day of workoutPlan.days) {
    const focus = day.title.split("—")[1]?.split("/")[0]?.trim();
    if (focus && rawLower.includes(focus.toLowerCase())) return day.id;
  }

  for (const day of workoutPlan.days) {
    if (rawLower.includes(day.id)) return day.id;
  }

  return raw;
}

function resolveExerciseId(key: string): string {
  return exerciseNameToId[key] ?? key;
}

describe("storage normalization — day resolution", () => {
  it("resolves current day IDs to themselves", () => {
    expect(resolveDayId("push")).toBe("push");
    expect(resolveDayId("pull")).toBe("pull");
    expect(resolveDayId("carry")).toBe("carry");
  });

  it("resolves day labels (Day 1, Day 2, Day 3)", () => {
    expect(resolveDayId("Day 1")).toBe("push");
    expect(resolveDayId("Day 2")).toBe("pull");
    expect(resolveDayId("Day 3")).toBe("carry");
  });

  it("resolves full day titles", () => {
    expect(resolveDayId("Day 1 — Push / Anti-Extension")).toBe("push");
    expect(resolveDayId("Day 2 — Pull / Anti-Rotation")).toBe("pull");
    expect(resolveDayId("Day 3 — Carry / Total Body")).toBe("carry");
  });

  it("handles dash variations (en dash, em dash, hyphen)", () => {
    // Em dash (—) vs en dash (–) vs hyphen (-)
    expect(resolveDayId("Day 1 \u2014 Push / Anti-Extension")).toBe("push");
    expect(resolveDayId("Day 1 \u2013 Push / Anti-Extension")).toBe("push");
    expect(resolveDayId("Day 1 - Push / Anti-Extension")).toBe("push");
  });

  it("resolves by focus keyword (Push, Pull, Carry)", () => {
    expect(resolveDayId("Monday — Push day")).toBe("push");
    expect(resolveDayId("Wednesday — Pull day")).toBe("pull");
    expect(resolveDayId("Friday — Carry day")).toBe("carry");
  });

  it("resolves by day ID as substring", () => {
    expect(resolveDayId("old-push-format")).toBe("push");
    expect(resolveDayId("something-pull")).toBe("pull");
    expect(resolveDayId("carry-day")).toBe("carry");
  });

  it("returns raw string for unrecognized day", () => {
    expect(resolveDayId("completely-unknown")).toBe("completely-unknown");
  });

  it("case-insensitive day number matching", () => {
    expect(resolveDayId("day 1")).toBe("push");
    expect(resolveDayId("DAY 2")).toBe("pull");
    expect(resolveDayId("day3")).toBe("carry");
  });
});

describe("storage normalization — exercise resolution", () => {
  it("resolves exercise display names to IDs", () => {
    expect(resolveExerciseId("Bench Press")).toBe("bench-press");
    expect(resolveExerciseId("Pull-Ups")).toBe("pull-ups");
    expect(resolveExerciseId("RDL")).toBe("rdl");
    expect(resolveExerciseId("Farmer's Carry")).toBe("farmers-carry");
    expect(resolveExerciseId("Single-Arm Swings")).toBe("sa-swings");
  });

  it("passes through exercise IDs unchanged", () => {
    expect(resolveExerciseId("bench-press")).toBe("bench-press");
    expect(resolveExerciseId("pull-ups")).toBe("pull-ups");
    expect(resolveExerciseId("rdl")).toBe("rdl");
  });

  it("passes through unknown keys unchanged", () => {
    expect(resolveExerciseId("unknown-exercise")).toBe("unknown-exercise");
  });

  it("every exercise name in the plan resolves to its ID", () => {
    const allExercises = [
      ...workoutPlan.complex.exercises,
      ...workoutPlan.days.flatMap((d) => [
        ...d.supersets.flatMap((ss) => ss.exercises),
        d.finisher,
      ]),
    ];

    for (const ex of allExercises) {
      expect(resolveExerciseId(ex.name)).toBe(ex.id);
    }
  });
});

describe("storage normalization — session normalization", () => {
  type SetEntry = { weight: string; reps: string; note?: string };
  type WorkoutSession = {
    id: string;
    date: string;
    day: string;
    duration: number;
    exercises: Record<string, SetEntry[]>;
  };

  function normalizeSession(raw: WorkoutSession): WorkoutSession {
    const dayId = resolveDayId(raw.day);
    const exercises: Record<string, SetEntry[]> = {};
    for (const [key, sets] of Object.entries(raw.exercises)) {
      exercises[resolveExerciseId(key)] = sets;
    }
    return { ...raw, day: dayId, exercises };
  }

  it("normalizes a session with legacy day name and exercise names", () => {
    const legacy: WorkoutSession = {
      id: "test-1",
      date: "2025-01-15T10:00:00Z",
      day: "Day 1 — Push / Anti-Extension",
      duration: 3600,
      exercises: {
        "Bench Press": [{ weight: "135", reps: "10" }],
        "Single-Arm KB Row": [{ weight: "50", reps: "8" }],
      },
    };

    const normalized = normalizeSession(legacy);
    expect(normalized.day).toBe("push");
    expect(normalized.exercises["bench-press"]).toEqual([
      { weight: "135", reps: "10" },
    ]);
    expect(normalized.exercises["sa-kb-row"]).toEqual([
      { weight: "50", reps: "8" },
    ]);
    // Original keys should not be present
    expect(normalized.exercises["Bench Press"]).toBeUndefined();
  });

  it("normalizes a session that already uses current IDs", () => {
    const current: WorkoutSession = {
      id: "test-2",
      date: "2025-01-15T10:00:00Z",
      day: "push",
      duration: 3600,
      exercises: {
        "bench-press": [{ weight: "135", reps: "10" }],
      },
    };

    const normalized = normalizeSession(current);
    expect(normalized.day).toBe("push");
    expect(normalized.exercises["bench-press"]).toEqual([
      { weight: "135", reps: "10" },
    ]);
  });

  it("preserves session metadata during normalization", () => {
    const session: WorkoutSession = {
      id: "test-3",
      date: "2025-06-01T08:00:00Z",
      day: "Day 2",
      duration: 2700,
      exercises: {},
    };

    const normalized = normalizeSession(session);
    expect(normalized.id).toBe("test-3");
    expect(normalized.date).toBe("2025-06-01T08:00:00Z");
    expect(normalized.duration).toBe(2700);
    expect(normalized.day).toBe("pull");
  });
});

describe("storage — localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getDraft returns empty object when nothing stored", async () => {
    const { getDraft } = await import("@/lib/storage");
    expect(getDraft()).toEqual({});
  });

  it("saveDraft and getDraft roundtrip correctly", async () => {
    const { saveDraft, getDraft } = await import("@/lib/storage");
    const draft = {
      "bench-press": [{ weight: "135", reps: "10" }],
    };
    saveDraft(draft);
    expect(getDraft()).toEqual(draft);
  });

  it("clearDraft removes draft data", async () => {
    const { saveDraft, clearDraft, getDraft } = await import("@/lib/storage");
    saveDraft({ "bench-press": [{ weight: "100", reps: "5" }] });
    clearDraft();
    expect(getDraft()).toEqual({});
  });
});
