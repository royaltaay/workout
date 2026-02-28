import { describe, it, expect } from "vitest";
import {
  toDateKey,
  daysBetween,
  computeStreaks,
  computePersonalRecords,
  formatDuration,
  formatVolume,
} from "@/components/stats-view";
import type { WorkoutSession } from "@/lib/storage";

// ---------------------------------------------------------------------------
// Helper to create mock sessions
// ---------------------------------------------------------------------------

function mockSession(overrides: Partial<WorkoutSession> & { date: string }): WorkoutSession {
  return {
    id: Math.random().toString(36).slice(2),
    day: "push",
    duration: 3600,
    exercises: {},
    ...overrides,
  };
}

describe("toDateKey", () => {
  it("converts ISO string to YYYY-MM-DD in local time", () => {
    // Use a date with no timezone ambiguity
    const key = toDateKey("2025-06-15T12:00:00Z");
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("pads month and day with leading zeros", () => {
    const key = toDateKey("2025-01-05T12:00:00Z");
    expect(key).toMatch(/-01-/);
    expect(key).toMatch(/-05$/);
  });
});

describe("daysBetween", () => {
  it("returns 0 for same date", () => {
    expect(daysBetween("2025-06-15", "2025-06-15")).toBe(0);
  });

  it("returns positive for different dates regardless of order", () => {
    expect(daysBetween("2025-06-15", "2025-06-18")).toBe(3);
    expect(daysBetween("2025-06-18", "2025-06-15")).toBe(3);
  });

  it("handles month boundaries", () => {
    expect(daysBetween("2025-01-30", "2025-02-02")).toBe(3);
  });

  it("handles year boundaries", () => {
    expect(daysBetween("2024-12-30", "2025-01-02")).toBe(3);
  });
});

describe("computeStreaks", () => {
  it("returns zeros for empty sessions", () => {
    const result = computeStreaks([]);
    expect(result).toEqual({ current: 0, longest: 0, thisWeek: 0 });
  });

  it("returns 1 for a single recent session", () => {
    const today = new Date().toISOString();
    const result = computeStreaks([mockSession({ date: today })]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it("counts consecutive days within 3-day gaps as a streak", () => {
    const now = new Date();
    const sessions = [
      mockSession({ date: new Date(now.getTime() - 0 * 86400000).toISOString() }), // today
      mockSession({ date: new Date(now.getTime() - 2 * 86400000).toISOString() }), // 2 days ago
      mockSession({ date: new Date(now.getTime() - 4 * 86400000).toISOString() }), // 4 days ago
    ];
    const result = computeStreaks(sessions);
    expect(result.current).toBe(3);
  });

  it("breaks streak after more than 3-day gap", () => {
    const now = new Date();
    const sessions = [
      mockSession({ date: new Date(now.getTime() - 0 * 86400000).toISOString() }),
      mockSession({ date: new Date(now.getTime() - 5 * 86400000).toISOString() }), // 5-day gap
    ];
    const result = computeStreaks(sessions);
    expect(result.current).toBe(1);
  });

  it("current streak is 0 when last workout was more than 3 days ago", () => {
    const now = new Date();
    const sessions = [
      mockSession({ date: new Date(now.getTime() - 5 * 86400000).toISOString() }),
    ];
    const result = computeStreaks(sessions);
    expect(result.current).toBe(0);
  });

  it("tracks longest streak separately from current", () => {
    const now = new Date();
    // Old streak: 3 sessions close together, then big gap, then 1 recent
    const sessions = [
      mockSession({ date: new Date(now.getTime() - 0 * 86400000).toISOString() }),
      // big gap
      mockSession({ date: new Date(now.getTime() - 30 * 86400000).toISOString() }),
      mockSession({ date: new Date(now.getTime() - 32 * 86400000).toISOString() }),
      mockSession({ date: new Date(now.getTime() - 34 * 86400000).toISOString() }),
    ];
    const result = computeStreaks(sessions);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(3);
  });

  it("counts thisWeek sessions from Monday", () => {
    // Create a session for today — should always be >= 1
    const today = new Date().toISOString();
    const result = computeStreaks([mockSession({ date: today })]);
    expect(result.thisWeek).toBeGreaterThanOrEqual(1);
  });

  it("deduplicates dates when computing streaks", () => {
    const now = new Date();
    const sameDay = now.toISOString();
    const sessions = [
      mockSession({ date: sameDay }),
      mockSession({ date: sameDay }), // same day, different session
    ];
    const result = computeStreaks(sessions);
    expect(result.current).toBe(1); // still just 1 unique day
  });
});

describe("computePersonalRecords", () => {
  it("returns empty array for empty sessions", () => {
    expect(computePersonalRecords([])).toEqual([]);
  });

  it("finds the heaviest weight for each exercise", () => {
    const sessions: WorkoutSession[] = [
      mockSession({
        date: "2025-01-10T10:00:00Z",
        exercises: {
          "bench-press": [
            { weight: "135", reps: "10" },
            { weight: "155", reps: "8" },
          ],
        },
      }),
      mockSession({
        date: "2025-01-12T10:00:00Z",
        exercises: {
          "bench-press": [
            { weight: "165", reps: "6" },
          ],
        },
      }),
    ];

    const prs = computePersonalRecords(sessions);
    expect(prs).toHaveLength(1);
    expect(prs[0].exercise).toBe("bench-press");
    expect(prs[0].weight).toBe(165);
    expect(prs[0].reps).toBe("6");
    expect(prs[0].date).toBe("2025-01-12T10:00:00Z");
  });

  it("ignores sets with no weight", () => {
    const sessions: WorkoutSession[] = [
      mockSession({
        date: "2025-01-10T10:00:00Z",
        exercises: {
          "pull-ups": [
            { weight: "", reps: "10" },
            { weight: "0", reps: "8" },
          ],
        },
      }),
    ];

    expect(computePersonalRecords(sessions)).toEqual([]);
  });

  it("sorts PRs by weight descending", () => {
    const sessions: WorkoutSession[] = [
      mockSession({
        date: "2025-01-10T10:00:00Z",
        exercises: {
          "bench-press": [{ weight: "200", reps: "5" }],
          "rdl": [{ weight: "300", reps: "8" }],
          "sa-kb-row": [{ weight: "50", reps: "8" }],
        },
      }),
    ];

    const prs = computePersonalRecords(sessions);
    expect(prs[0].weight).toBe(300);
    expect(prs[1].weight).toBe(200);
    expect(prs[2].weight).toBe(50);
  });
});

describe("formatDuration", () => {
  it("formats seconds under an hour as minutes", () => {
    expect(formatDuration(300)).toBe("5m");
    expect(formatDuration(3599)).toBe("59m");
  });

  it("formats 0 seconds as 0m", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("formats exactly one hour", () => {
    expect(formatDuration(3600)).toBe("1h 0m");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(5400)).toBe("1h 30m");
  });
});

describe("formatVolume", () => {
  it("formats large volumes with commas", () => {
    const result = formatVolume(150000);
    expect(result).toContain("150");
    expect(result).toContain("lb");
  });

  it("formats small volumes", () => {
    const result = formatVolume(500);
    expect(result).toContain("500");
    expect(result).toContain("lb");
  });
});
