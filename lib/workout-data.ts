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

export type ExerciseDetail = {
  videoUrl: string;
  instructions: string;
};

export const exerciseDetails: Record<string, ExerciseDetail> = {
  "Single-Arm Swings": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Hinge at the hips and drive the bell with your glutes. Keep your core braced and shoulder packed throughout the movement.",
  },
  "SA Clean → Front Squat → Press": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Clean the bell to rack, squat to depth with an upright torso, then press overhead. Control the descent on each phase.",
  },
  Windmill: {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Keep your eyes on the bell overhead. Push your hip out and slowly fold down, maintaining a straight arm and packed shoulder.",
  },
  "Bench Press": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Retract your shoulder blades and arch slightly. Lower the bar with control to your mid-chest, then press evenly.",
  },
  "Single-Arm KB Row": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Brace on a bench with your opposite hand. Pull the bell to your hip, squeezing your lat at the top. Control the negative.",
  },
  "Hanging Leg Raises": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Hang with a dead grip and raise your legs by curling your pelvis. Avoid swinging — use control on the way up and down.",
  },
  "Pull-Ups": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Start from a dead hang, pull your chest to the bar by driving your elbows down. Control the descent fully.",
  },
  "Pallof Press": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Stand perpendicular to the cable or band. Press your hands forward and resist the rotation — hold the fully extended position.",
  },
  "Goblet Cossack Squat": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Hold a kettlebell at your chest. Shift your weight to one side, sitting deep into the hip while the other leg stays straight.",
  },
  "Barbell RDL": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Keep a soft knee and hinge at the hips, pushing your glutes back. Lower until you feel a deep hamstring stretch, then drive up.",
  },
  "Dead Bug": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Press your lower back into the floor. Extend opposite arm and leg slowly while maintaining core tension throughout.",
  },
  "Farmer's Carry": {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions:
      "Grip heavy dumbbells or kettlebells at your sides. Walk with tall posture, shoulders packed, and core fully braced.",
  },
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
          name: "Superset",
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
          name: "Superset",
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
          name: "Superset",
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
        name: "Farmer's Carry",
        sets: 3,
        reps: "50 yd",
        rpe: "7–8",
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
