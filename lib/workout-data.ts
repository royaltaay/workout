export type Exercise = {
  name: string;
  bell?: "Heavy" | "Light";
  reps: string;
  tempo: string;
  rpe: string;
  rest?: string;
};

export type Superset = {
  name: string;
  rounds: number;
  exercises: Exercise[];
  rest: string;
};

export type Finisher = {
  name: string;
  sets: number;
  reps: string;
  tempo?: string;
  rpe: string;
  rest: string;
};

export type Day = {
  label: string;
  title: string;
  supersets: Superset[];
  finisher: Finisher;
};

export type ComplexExercise = {
  name: string;
  bell: "Heavy" | "Light";
  reps: string;
  tempo: string;
  rpe: string;
};

export type WorkoutPlan = {
  warmUp: string;
  tempoExplanation: string;
  complex: {
    rounds: number;
    exercises: ComplexExercise[];
    rest: string;
  };
  days: Day[];
  progressionNotes: string[];
};

export const workoutPlan: WorkoutPlan = {
  warmUp: "5 min — hip 90/90s, arm bars, bodyweight windmills",
  tempoExplanation:
    "Eccentric – Bottom Pause – Concentric – Top Pause (in seconds). X = explosive.",
  complex: {
    rounds: 3,
    exercises: [
      {
        name: "Single-Arm Swings",
        bell: "Heavy",
        reps: "10/arm",
        tempo: "X-0-X-0",
        rpe: "7",
      },
      {
        name: "SA Clean → Front Squat → Press",
        bell: "Heavy",
        reps: "5/arm",
        tempo: "2-1-X-1",
        rpe: "8",
      },
      {
        name: "Windmill",
        bell: "Light",
        reps: "5–8/side",
        tempo: "3-1-3-1",
        rpe: "6–7",
      },
    ],
    rest: "90–120 sec",
  },
  days: [
    {
      label: "Mon",
      title: "Monday — Push / Anti-Extension",
      supersets: [
        {
          name: "Superset A",
          rounds: 3,
          exercises: [
            {
              name: "Bench Press",
              reps: "8–10",
              tempo: "3-1-1-0",
              rpe: "7–8",
            },
            {
              name: "Single-Arm KB Row",
              reps: "8/arm",
              tempo: "2-1-1-1",
              rpe: "7–8",
            },
          ],
          rest: "60–90 sec",
        },
      ],
      finisher: {
        name: "Hanging Leg Raises",
        sets: 3,
        reps: "10–15",
        tempo: "2-0-2-1",
        rpe: "8",
        rest: "60 sec",
      },
    },
    {
      label: "Wed",
      title: "Wednesday — Pull / Anti-Rotation",
      supersets: [
        {
          name: "Superset A",
          rounds: 3,
          exercises: [
            {
              name: "Pull-Ups",
              reps: "6–10 (or max)",
              tempo: "3-0-1-1",
              rpe: "8",
            },
            {
              name: "Pallof Press",
              reps: "10/side",
              tempo: "1-3-1-0",
              rpe: "7",
            },
          ],
          rest: "60–90 sec",
        },
      ],
      finisher: {
        name: "Goblet Cossack Squat",
        sets: 3,
        reps: "6/side",
        tempo: "3-2-2-0",
        rpe: "7",
        rest: "60 sec",
      },
    },
    {
      label: "Fri",
      title: "Friday — Carry / Total Body",
      supersets: [
        {
          name: "Superset A",
          rounds: 3,
          exercises: [
            {
              name: "Barbell RDL",
              reps: "8–10",
              tempo: "3-1-1-0",
              rpe: "7–8",
            },
            {
              name: "Dead Bug",
              reps: "8/side",
              tempo: "3-1-3-1",
              rpe: "7",
            },
          ],
          rest: "60–90 sec",
        },
      ],
      finisher: {
        name: "Single-Arm OH Carry",
        sets: 3,
        reps: "40 yd/arm",
        rpe: "7",
        rest: "60 sec",
      },
    },
  ],
  progressionNotes: [
    "Heavy bell: Should make round 3 challenging but clean. If form breaks on the press, size down.",
    "Light bell: Windmills should be slow and controlled. No grinding.",
    "Progress heavy bell first. When 3 rounds feel controlled, bump up one size.",
  ],
};
