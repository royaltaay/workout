export type ExerciseUnit = { short: string; label: string };

const unitMap: Record<string, ExerciseUnit> = {
  yd:  { short: "yd",  label: "Distance (yd)" },
  m:   { short: "m",   label: "Distance (m)" },
  ft:  { short: "ft",  label: "Distance (ft)" },
  sec: { short: "sec", label: "Time" },
  min: { short: "min", label: "Time" },
};

const defaultUnit: ExerciseUnit = { short: "reps", label: "Reps" };

export function parseExerciseUnit(reps: string): ExerciseUnit {
  const match = reps.match(/[a-zA-Z]+$/);
  if (!match) return defaultUnit;
  return unitMap[match[0].toLowerCase()] ?? defaultUnit;
}
