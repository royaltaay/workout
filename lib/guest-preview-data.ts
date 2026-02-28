/**
 * Deterministic sample data shown to anonymous visitors so they can preview
 * the History and Stats views before signing up.
 *
 * Dates are anchored to "today" so the calendar and streak calculations
 * always look current.  IDs are fixed strings (not random) so React keys
 * stay stable across renders.
 */
import type { WorkoutSession, SetEntry } from "./storage";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function s(weight: number, reps: number, count = 3, note?: string): SetEntry[] {
  return Array.from({ length: count }, () => ({
    weight: String(weight),
    reps: String(reps),
    ...(note ? { note } : {}),
  }));
}

let _cached: WorkoutSession[] | null = null;

export function getGuestPreviewSessions(): WorkoutSession[] {
  if (_cached) return _cached;

  const sessions: WorkoutSession[] = [
    // --- Push sessions (6) ---
    {
      id: "preview-push-1",
      date: daysAgo(42),
      day: "push",
      duration: 3200,
      exercises: {
        "sa-swings": s(50, 10),
        "sa-clean-fsq-press": s(40, 5),
        "windmill": s(25, 5),
        "bench-press": s(135, 8),
        "sa-kb-row": s(50, 8),
        "hanging-leg-raises": s(0, 10),
      },
    },
    {
      id: "preview-push-2",
      date: daysAgo(35),
      day: "push",
      duration: 3400,
      exercises: {
        "sa-swings": s(55, 10),
        "sa-clean-fsq-press": s(40, 5),
        "windmill": s(25, 5),
        "bench-press": s(140, 8),
        "sa-kb-row": s(55, 8),
        "hanging-leg-raises": s(0, 12),
      },
    },
    {
      id: "preview-push-3",
      date: daysAgo(28),
      day: "push",
      duration: 3100,
      exercises: {
        "sa-swings": s(55, 10),
        "sa-clean-fsq-press": s(45, 5),
        "windmill": s(30, 5),
        "bench-press": s(145, 8),
        "sa-kb-row": s(55, 8),
        "hanging-leg-raises": s(0, 12),
      },
    },
    {
      id: "preview-push-4",
      date: daysAgo(21),
      day: "push",
      duration: 3300,
      exercises: {
        "sa-swings": s(60, 10),
        "sa-clean-fsq-press": s(45, 5),
        "windmill": s(30, 5),
        "bench-press": s(150, 8),
        "sa-kb-row": s(60, 8),
        "hanging-leg-raises": s(0, 14),
      },
    },
    {
      id: "preview-push-5",
      date: daysAgo(14),
      day: "push",
      duration: 3500,
      exercises: {
        "sa-swings": s(60, 10),
        "sa-clean-fsq-press": s(50, 5),
        "windmill": s(30, 5),
        "bench-press": s(155, 8),
        "sa-kb-row": s(60, 8),
        "hanging-leg-raises": s(0, 15, 3, "strict form"),
      },
    },
    {
      id: "preview-push-6",
      date: daysAgo(7),
      day: "push",
      duration: 3250,
      exercises: {
        "sa-swings": s(65, 10),
        "sa-clean-fsq-press": s(50, 5),
        "windmill": s(35, 5),
        "bench-press": s(160, 8),
        "sa-kb-row": s(65, 8),
        "hanging-leg-raises": s(0, 15),
      },
    },

    // --- Pull sessions (6) ---
    {
      id: "preview-pull-1",
      date: daysAgo(40),
      day: "pull",
      duration: 2900,
      exercises: {
        "sa-swings": s(50, 10),
        "sa-clean-fsq-press": s(40, 5),
        "windmill": s(25, 5),
        "pull-ups": s(0, 6),
        "pallof-press": s(30, 10),
        "goblet-cossack-squat": s(35, 6),
      },
    },
    {
      id: "preview-pull-2",
      date: daysAgo(33),
      day: "pull",
      duration: 3000,
      exercises: {
        "sa-swings": s(55, 10),
        "sa-clean-fsq-press": s(40, 5),
        "windmill": s(25, 5),
        "pull-ups": s(0, 7),
        "pallof-press": s(30, 10),
        "goblet-cossack-squat": s(35, 6),
      },
    },
    {
      id: "preview-pull-3",
      date: daysAgo(26),
      day: "pull",
      duration: 3100,
      exercises: {
        "sa-swings": s(55, 10),
        "sa-clean-fsq-press": s(45, 5),
        "windmill": s(30, 5),
        "pull-ups": s(0, 8),
        "pallof-press": s(35, 10),
        "goblet-cossack-squat": s(40, 6),
      },
    },
    {
      id: "preview-pull-4",
      date: daysAgo(19),
      day: "pull",
      duration: 3200,
      exercises: {
        "sa-swings": s(60, 10),
        "sa-clean-fsq-press": s(45, 5),
        "windmill": s(30, 5),
        "pull-ups": s(0, 9),
        "pallof-press": s(35, 10),
        "goblet-cossack-squat": s(40, 6),
      },
    },
    {
      id: "preview-pull-5",
      date: daysAgo(12),
      day: "pull",
      duration: 3300,
      exercises: {
        "sa-swings": s(60, 10),
        "sa-clean-fsq-press": s(50, 5),
        "windmill": s(30, 5),
        "pull-ups": s(10, 8, 3, "weighted"),
        "pallof-press": s(40, 10),
        "goblet-cossack-squat": s(45, 6),
      },
    },
    {
      id: "preview-pull-6",
      date: daysAgo(5),
      day: "pull",
      duration: 3150,
      exercises: {
        "sa-swings": s(65, 10),
        "sa-clean-fsq-press": s(50, 5),
        "windmill": s(35, 5),
        "pull-ups": s(15, 8, 3, "weighted"),
        "pallof-press": s(40, 10),
        "goblet-cossack-squat": s(45, 6),
      },
    },

    // --- Carry sessions (6) ---
    {
      id: "preview-carry-1",
      date: daysAgo(38),
      day: "carry",
      duration: 2800,
      exercises: {
        "sa-swings": s(50, 10),
        "sa-clean-fsq-press": s(40, 5),
        "windmill": s(25, 5),
        "rdl": s(155, 8),
        "dead-bug": s(0, 10),
        "farmers-carry": s(60, 50),
      },
    },
    {
      id: "preview-carry-2",
      date: daysAgo(31),
      day: "carry",
      duration: 3000,
      exercises: {
        "sa-swings": s(55, 10),
        "sa-clean-fsq-press": s(40, 5),
        "windmill": s(25, 5),
        "rdl": s(165, 8),
        "dead-bug": s(0, 10),
        "farmers-carry": s(65, 50),
      },
    },
    {
      id: "preview-carry-3",
      date: daysAgo(24),
      day: "carry",
      duration: 3100,
      exercises: {
        "sa-swings": s(55, 10),
        "sa-clean-fsq-press": s(45, 5),
        "windmill": s(30, 5),
        "rdl": s(175, 8),
        "dead-bug": s(0, 12),
        "farmers-carry": s(70, 50),
      },
    },
    {
      id: "preview-carry-4",
      date: daysAgo(17),
      day: "carry",
      duration: 3200,
      exercises: {
        "sa-swings": s(60, 10),
        "sa-clean-fsq-press": s(45, 5),
        "windmill": s(30, 5),
        "rdl": s(185, 8),
        "dead-bug": s(0, 12),
        "farmers-carry": s(70, 50),
      },
    },
    {
      id: "preview-carry-5",
      date: daysAgo(10),
      day: "carry",
      duration: 3400,
      exercises: {
        "sa-swings": s(60, 10),
        "sa-clean-fsq-press": s(50, 5),
        "windmill": s(30, 5),
        "rdl": s(195, 8),
        "dead-bug": s(0, 14),
        "farmers-carry": s(75, 50),
      },
    },
    {
      id: "preview-carry-6",
      date: daysAgo(3),
      day: "carry",
      duration: 3300,
      exercises: {
        "sa-swings": s(65, 10),
        "sa-clean-fsq-press": s(50, 5),
        "windmill": s(35, 5),
        "rdl": s(205, 8),
        "dead-bug": s(0, 15),
        "farmers-carry": s(80, 50),
      },
    },
  ];

  _cached = sessions.sort((a, b) => b.date.localeCompare(a.date));
  return _cached;
}
