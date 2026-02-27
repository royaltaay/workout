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
    // --- Push sessions ---
    {
      id: id(),
      date: date(42),
      day: "push",
      duration: 3200,
      exercises: {
        "sa-swings": sets(50, 10, 3),
        "sa-clean-fsq-press": sets(40, 5, 3),
        "windmill": sets(25, 5, 3),
        "bench-press": sets(135, 8, 3),
        "sa-kb-row": sets(50, 8, 3),
        "hanging-leg-raises": sets(0, 10, 3),
      },
    },
    {
      id: id(),
      date: date(35),
      day: "push",
      duration: 3400,
      exercises: {
        "sa-swings": sets(55, 10, 3),
        "sa-clean-fsq-press": sets(40, 5, 3),
        "windmill": sets(25, 5, 3),
        "bench-press": sets(140, 8, 3),
        "sa-kb-row": sets(55, 8, 3),
        "hanging-leg-raises": sets(0, 12, 3),
      },
    },
    {
      id: id(),
      date: date(28),
      day: "push",
      duration: 3100,
      exercises: {
        "sa-swings": sets(55, 10, 3),
        "sa-clean-fsq-press": sets(45, 5, 3),
        "windmill": sets(30, 5, 3),
        "bench-press": sets(145, vary(9), 3),
        "sa-kb-row": sets(55, 8, 3),
        "hanging-leg-raises": sets(0, 12, 3),
      },
    },
    {
      id: id(),
      date: date(21),
      day: "push",
      duration: 3300,
      exercises: {
        "sa-swings": sets(60, 10, 3),
        "sa-clean-fsq-press": sets(45, 5, 3),
        "windmill": sets(30, 5, 3),
        "bench-press": sets(150, 8, 3),
        "sa-kb-row": sets(60, 8, 3),
        "hanging-leg-raises": sets(0, 14, 3),
      },
    },
    {
      id: id(),
      date: date(14),
      day: "push",
      duration: 3500,
      exercises: {
        "sa-swings": sets(60, 10, 3),
        "sa-clean-fsq-press": sets(50, 5, 3),
        "windmill": sets(30, 5, 3),
        "bench-press": sets(155, vary(8), 3),
        "sa-kb-row": sets(60, 8, 3),
        "hanging-leg-raises": sets(0, 15, 3, "strict form"),
      },
    },
    {
      id: id(),
      date: date(7),
      day: "push",
      duration: 3250,
      exercises: {
        "sa-swings": sets(65, 10, 3),
        "sa-clean-fsq-press": sets(50, 5, 3),
        "windmill": sets(35, 5, 3),
        "bench-press": sets(160, 8, 3),
        "sa-kb-row": sets(65, 8, 3),
        "hanging-leg-raises": sets(0, 15, 3),
      },
    },

    // --- Pull sessions ---
    {
      id: id(),
      date: date(40),
      day: "pull",
      duration: 2900,
      exercises: {
        "sa-swings": sets(50, 10, 3),
        "sa-clean-fsq-press": sets(40, 5, 3),
        "windmill": sets(25, 5, 3),
        "pull-ups": sets(0, 6, 3),
        "pallof-press": sets(30, 10, 3),
        "goblet-cossack-squat": sets(35, 6, 3),
      },
    },
    {
      id: id(),
      date: date(33),
      day: "pull",
      duration: 3000,
      exercises: {
        "sa-swings": sets(55, 10, 3),
        "sa-clean-fsq-press": sets(40, 5, 3),
        "windmill": sets(25, 5, 3),
        "pull-ups": sets(0, 7, 3),
        "pallof-press": sets(30, 10, 3),
        "goblet-cossack-squat": sets(35, 6, 3),
      },
    },
    {
      id: id(),
      date: date(26),
      day: "pull",
      duration: 3100,
      exercises: {
        "sa-swings": sets(55, 10, 3),
        "sa-clean-fsq-press": sets(45, 5, 3),
        "windmill": sets(30, 5, 3),
        "pull-ups": sets(0, 8, 3),
        "pallof-press": sets(35, 10, 3),
        "goblet-cossack-squat": sets(40, 6, 3),
      },
    },
    {
      id: id(),
      date: date(19),
      day: "pull",
      duration: 3200,
      exercises: {
        "sa-swings": sets(60, 10, 3),
        "sa-clean-fsq-press": sets(45, 5, 3),
        "windmill": sets(30, 5, 3),
        "pull-ups": sets(0, vary(9), 3),
        "pallof-press": sets(35, 10, 3),
        "goblet-cossack-squat": sets(40, 6, 3),
      },
    },
    {
      id: id(),
      date: date(12),
      day: "pull",
      duration: 3300,
      exercises: {
        "sa-swings": sets(60, 10, 3),
        "sa-clean-fsq-press": sets(50, 5, 3),
        "windmill": sets(30, 5, 3),
        "pull-ups": sets(10, 8, 3, "weighted"),
        "pallof-press": sets(40, 10, 3),
        "goblet-cossack-squat": sets(45, 6, 3),
      },
    },

    // --- Carry sessions ---
    {
      id: id(),
      date: date(38),
      day: "carry",
      duration: 2800,
      exercises: {
        "sa-swings": sets(50, 10, 3),
        "sa-clean-fsq-press": sets(40, 5, 3),
        "windmill": sets(25, 5, 3),
        "rdl": sets(155, 8, 3),
        "dead-bug": sets(0, 10, 3),
        "farmers-carry": sets(60, 50, 3),
      },
    },
    {
      id: id(),
      date: date(31),
      day: "carry",
      duration: 3000,
      exercises: {
        "sa-swings": sets(55, 10, 3),
        "sa-clean-fsq-press": sets(40, 5, 3),
        "windmill": sets(25, 5, 3),
        "rdl": sets(165, 8, 3),
        "dead-bug": sets(0, 10, 3),
        "farmers-carry": sets(65, 50, 3),
      },
    },
    {
      id: id(),
      date: date(24),
      day: "carry",
      duration: 3100,
      exercises: {
        "sa-swings": sets(55, 10, 3),
        "sa-clean-fsq-press": sets(45, 5, 3),
        "windmill": sets(30, 5, 3),
        "rdl": sets(175, vary(9), 3),
        "dead-bug": sets(0, 12, 3),
        "farmers-carry": sets(70, 50, 3),
      },
    },
    {
      id: id(),
      date: date(17),
      day: "carry",
      duration: 3200,
      exercises: {
        "sa-swings": sets(60, 10, 3),
        "sa-clean-fsq-press": sets(45, 5, 3),
        "windmill": sets(30, 5, 3),
        "rdl": sets(185, 8, 3),
        "dead-bug": sets(0, 12, 3),
        "farmers-carry": sets(70, 50, 3),
      },
    },
    {
      id: id(),
      date: date(10),
      day: "carry",
      duration: 3400,
      exercises: {
        "sa-swings": sets(60, 10, 3),
        "sa-clean-fsq-press": sets(50, 5, 3),
        "windmill": sets(30, 5, 3),
        "rdl": sets(195, 8, 3),
        "dead-bug": sets(0, 14, 3),
        "farmers-carry": sets(75, 50, 3),
      },
    },
    {
      id: id(),
      date: date(3),
      day: "carry",
      duration: 3300,
      exercises: {
        "sa-swings": sets(65, 10, 3),
        "sa-clean-fsq-press": sets(50, 5, 3),
        "windmill": sets(35, 5, 3),
        "rdl": sets(205, vary(8), 3),
        "dead-bug": sets(0, 15, 3),
        "farmers-carry": sets(80, 50, 3),
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
