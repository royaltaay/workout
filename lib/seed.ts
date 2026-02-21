/**
 * Seed data for local development.
 * Run from browser console: `import("/lib/seed.js").then(m => m.seed())`
 * Or call `seed()` from a dev button.
 */
import type { WorkoutSession, SetEntry } from "./storage";

function id() {
  return crypto.randomUUID();
}

function date(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function sets(weight: number, reps: number, count = 3, note?: string): SetEntry[] {
  return Array.from({ length: count }, () => ({
    weight: String(weight),
    reps: String(reps),
    ...(note ? { note } : {}),
  }));
}

// Small random variance to make charts look realistic
function vary(base: number, pct = 0.05): number {
  return Math.round(base * (1 + (Math.random() * 2 - 1) * pct));
}

const SESSIONS_KEY = "dungym-sessions";

export function seed() {
  const sessions: WorkoutSession[] = [
    // --- Monday/Tuesday sessions (Day 1) ---
    {
      id: id(),
      date: date(42),
      day: "Monday — Upper Push / Pull",
      duration: 3200,
      exercises: {
        "Single-Arm Swings": sets(50, 10, 3),
        "SA Clean → Front Squat → Press": sets(40, 5, 3),
        "Windmill": sets(25, 5, 3),
        "Bench Press": sets(135, 8, 3),
        "Single-Arm KB Row": sets(50, 8, 3),
        "Hanging Leg Raises": sets(0, 10, 3),
      },
    },
    {
      id: id(),
      date: date(35),
      day: "Monday — Upper Push / Pull",
      duration: 3400,
      exercises: {
        "Single-Arm Swings": sets(55, 10, 3),
        "SA Clean → Front Squat → Press": sets(40, 5, 3),
        "Windmill": sets(25, 5, 3),
        "Bench Press": sets(140, 8, 3),
        "Single-Arm KB Row": sets(55, 8, 3),
        "Hanging Leg Raises": sets(0, 12, 3),
      },
    },
    {
      id: id(),
      date: date(28),
      day: "Monday — Upper Push / Pull",
      duration: 3100,
      exercises: {
        "Single-Arm Swings": sets(55, 10, 3),
        "SA Clean → Front Squat → Press": sets(45, 5, 3),
        "Windmill": sets(30, 5, 3),
        "Bench Press": sets(145, vary(9), 3),
        "Single-Arm KB Row": sets(55, 8, 3),
        "Hanging Leg Raises": sets(0, 12, 3),
      },
    },
    {
      id: id(),
      date: date(21),
      day: "Monday — Upper Push / Pull",
      duration: 3300,
      exercises: {
        "Single-Arm Swings": sets(60, 10, 3),
        "SA Clean → Front Squat → Press": sets(45, 5, 3),
        "Windmill": sets(30, 5, 3),
        "Bench Press": sets(150, 8, 3),
        "Single-Arm KB Row": sets(60, 8, 3),
        "Hanging Leg Raises": sets(0, 14, 3),
      },
    },
    {
      id: id(),
      date: date(14),
      day: "Monday — Upper Push / Pull",
      duration: 3500,
      exercises: {
        "Single-Arm Swings": sets(60, 10, 3),
        "SA Clean → Front Squat → Press": sets(50, 5, 3),
        "Windmill": sets(30, 5, 3),
        "Bench Press": sets(155, vary(8), 3),
        "Single-Arm KB Row": sets(60, 8, 3),
        "Hanging Leg Raises": sets(0, 15, 3, "strict form"),
      },
    },
    {
      id: id(),
      date: date(7),
      day: "Monday — Upper Push / Pull",
      duration: 3250,
      exercises: {
        "Single-Arm Swings": sets(65, 10, 3),
        "SA Clean → Front Squat → Press": sets(50, 5, 3),
        "Windmill": sets(35, 5, 3),
        "Bench Press": sets(160, 8, 3),
        "Single-Arm KB Row": sets(65, 8, 3),
        "Hanging Leg Raises": sets(0, 15, 3),
      },
    },

    // --- Wednesday/Thursday sessions (Day 2) ---
    {
      id: id(),
      date: date(40),
      day: "Wednesday — Pull / Core",
      duration: 2900,
      exercises: {
        "Single-Arm Swings": sets(50, 10, 3),
        "SA Clean → Front Squat → Press": sets(40, 5, 3),
        "Windmill": sets(25, 5, 3),
        "Pull-Ups": sets(0, 6, 3),
        "Pallof Press": sets(30, 10, 3),
        "Goblet Cossack Squat": sets(35, 6, 3),
      },
    },
    {
      id: id(),
      date: date(33),
      day: "Wednesday — Pull / Core",
      duration: 3000,
      exercises: {
        "Single-Arm Swings": sets(55, 10, 3),
        "SA Clean → Front Squat → Press": sets(40, 5, 3),
        "Windmill": sets(25, 5, 3),
        "Pull-Ups": sets(0, 7, 3),
        "Pallof Press": sets(30, 10, 3),
        "Goblet Cossack Squat": sets(35, 6, 3),
      },
    },
    {
      id: id(),
      date: date(26),
      day: "Wednesday — Pull / Core",
      duration: 3100,
      exercises: {
        "Single-Arm Swings": sets(55, 10, 3),
        "SA Clean → Front Squat → Press": sets(45, 5, 3),
        "Windmill": sets(30, 5, 3),
        "Pull-Ups": sets(0, 8, 3),
        "Pallof Press": sets(35, 10, 3),
        "Goblet Cossack Squat": sets(40, 6, 3),
      },
    },
    {
      id: id(),
      date: date(19),
      day: "Wednesday — Pull / Core",
      duration: 3200,
      exercises: {
        "Single-Arm Swings": sets(60, 10, 3),
        "SA Clean → Front Squat → Press": sets(45, 5, 3),
        "Windmill": sets(30, 5, 3),
        "Pull-Ups": sets(0, vary(9), 3),
        "Pallof Press": sets(35, 10, 3),
        "Goblet Cossack Squat": sets(40, 6, 3),
      },
    },
    {
      id: id(),
      date: date(12),
      day: "Wednesday — Pull / Core",
      duration: 3300,
      exercises: {
        "Single-Arm Swings": sets(60, 10, 3),
        "SA Clean → Front Squat → Press": sets(50, 5, 3),
        "Windmill": sets(30, 5, 3),
        "Pull-Ups": sets(10, 8, 3, "weighted"),
        "Pallof Press": sets(40, 10, 3),
        "Goblet Cossack Squat": sets(45, 6, 3),
      },
    },

    // --- Friday sessions (Day 3) ---
    {
      id: id(),
      date: date(38),
      day: "Friday — Carry / Total Body",
      duration: 2800,
      exercises: {
        "Single-Arm Swings": sets(50, 10, 3),
        "SA Clean → Front Squat → Press": sets(40, 5, 3),
        "Windmill": sets(25, 5, 3),
        "RDL": sets(155, 8, 3),
        "Dead Bug": sets(0, 10, 3),
        "Farmer's Carry": sets(60, 50, 3),
      },
    },
    {
      id: id(),
      date: date(31),
      day: "Friday — Carry / Total Body",
      duration: 3000,
      exercises: {
        "Single-Arm Swings": sets(55, 10, 3),
        "SA Clean → Front Squat → Press": sets(40, 5, 3),
        "Windmill": sets(25, 5, 3),
        "RDL": sets(165, 8, 3),
        "Dead Bug": sets(0, 10, 3),
        "Farmer's Carry": sets(65, 50, 3),
      },
    },
    {
      id: id(),
      date: date(24),
      day: "Friday — Carry / Total Body",
      duration: 3100,
      exercises: {
        "Single-Arm Swings": sets(55, 10, 3),
        "SA Clean → Front Squat → Press": sets(45, 5, 3),
        "Windmill": sets(30, 5, 3),
        "RDL": sets(175, vary(9), 3),
        "Dead Bug": sets(0, 12, 3),
        "Farmer's Carry": sets(70, 50, 3),
      },
    },
    {
      id: id(),
      date: date(17),
      day: "Friday — Carry / Total Body",
      duration: 3200,
      exercises: {
        "Single-Arm Swings": sets(60, 10, 3),
        "SA Clean → Front Squat → Press": sets(45, 5, 3),
        "Windmill": sets(30, 5, 3),
        "RDL": sets(185, 8, 3),
        "Dead Bug": sets(0, 12, 3),
        "Farmer's Carry": sets(70, 50, 3),
      },
    },
    {
      id: id(),
      date: date(10),
      day: "Friday — Carry / Total Body",
      duration: 3400,
      exercises: {
        "Single-Arm Swings": sets(60, 10, 3),
        "SA Clean → Front Squat → Press": sets(50, 5, 3),
        "Windmill": sets(30, 5, 3),
        "RDL": sets(195, 8, 3),
        "Dead Bug": sets(0, 14, 3),
        "Farmer's Carry": sets(75, 50, 3),
      },
    },
    {
      id: id(),
      date: date(3),
      day: "Friday — Carry / Total Body",
      duration: 3300,
      exercises: {
        "Single-Arm Swings": sets(65, 10, 3),
        "SA Clean → Front Squat → Press": sets(50, 5, 3),
        "Windmill": sets(35, 5, 3),
        "RDL": sets(205, vary(8), 3),
        "Dead Bug": sets(0, 15, 3),
        "Farmer's Carry": sets(80, 50, 3),
      },
    },
  ];

  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  console.log(`Seeded ${sessions.length} workout sessions. Reload the page to see them.`);
}

export function clearSeed() {
  localStorage.removeItem(SESSIONS_KEY);
  console.log("Cleared all local sessions. Reload the page.");
}
