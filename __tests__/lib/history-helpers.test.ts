import { describe, it, expect } from "vitest";
import {
  toDateKey,
  formatDate,
  formatDuration,
  sessionVolume,
  formatVolume,
} from "@/components/history-view";
import type { WorkoutSession } from "@/lib/storage";

function mockSession(overrides: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: "test",
    date: "2025-06-15T12:00:00Z",
    day: "push",
    duration: 3600,
    exercises: {},
    ...overrides,
  };
}

describe("history — toDateKey", () => {
  it("converts ISO to YYYY-MM-DD", () => {
    const key = toDateKey("2025-06-15T12:00:00Z");
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("history — formatDate", () => {
  it("formats a date to a readable string", () => {
    const result = formatDate("2025-06-15T12:00:00Z");
    // Should contain a weekday abbreviation and month
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(3);
  });
});

describe("history — formatDuration", () => {
  it("formats seconds to minutes", () => {
    expect(formatDuration(300)).toBe("5m");
  });

  it("formats 0 seconds", () => {
    expect(formatDuration(0)).toBe("0m");
  });

  it("formats over an hour", () => {
    expect(formatDuration(3660)).toBe("1h 1m");
  });
});

describe("history — sessionVolume", () => {
  it("returns 0 for no exercises", () => {
    expect(sessionVolume(mockSession({}))).toBe(0);
  });

  it("computes weight x reps for each set", () => {
    const session = mockSession({
      exercises: {
        "bench-press": [
          { weight: "100", reps: "10" },
          { weight: "100", reps: "8" },
        ],
      },
    });
    // 100*10 + 100*8 = 1800
    expect(sessionVolume(session)).toBe(1800);
  });

  it("ignores sets with no weight", () => {
    const session = mockSession({
      exercises: {
        "pull-ups": [
          { weight: "", reps: "10" },
        ],
      },
    });
    expect(sessionVolume(session)).toBe(0);
  });

  it("ignores sets with no reps", () => {
    const session = mockSession({
      exercises: {
        "bench-press": [
          { weight: "100", reps: "" },
        ],
      },
    });
    expect(sessionVolume(session)).toBe(0);
  });

  it("handles multiple exercises", () => {
    const session = mockSession({
      exercises: {
        "bench-press": [{ weight: "135", reps: "10" }],
        "rdl": [{ weight: "185", reps: "8" }],
      },
    });
    // 135*10 + 185*8 = 1350 + 1480 = 2830
    expect(sessionVolume(session)).toBe(2830);
  });
});

describe("history — formatVolume", () => {
  it("returns empty string for 0", () => {
    expect(formatVolume(0)).toBe("");
  });

  it("formats thousands with K suffix", () => {
    expect(formatVolume(1500)).toBe("1.5K lb");
  });

  it("formats small numbers in pounds", () => {
    expect(formatVolume(500)).toBe("500 lb");
  });

  it("formats large numbers with K", () => {
    expect(formatVolume(10000)).toBe("10.0K lb");
  });
});
