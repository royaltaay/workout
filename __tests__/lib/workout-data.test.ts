import { describe, it, expect } from "vitest";
import {
  workoutPlan,
  exerciseNameToId,
  exerciseIdToName,
  dayById,
  exerciseDetails,
} from "@/lib/workout-data";

describe("workout-data integrity", () => {
  // -----------------------------------------------------------------------
  // Workout plan structure
  // -----------------------------------------------------------------------

  it("has exactly 3 training days", () => {
    expect(workoutPlan.days).toHaveLength(3);
  });

  it("every day has a unique id, label, and title", () => {
    const ids = new Set<string>();
    const labels = new Set<string>();
    for (const day of workoutPlan.days) {
      expect(day.id).toBeTruthy();
      expect(day.label).toBeTruthy();
      expect(day.title).toBeTruthy();
      expect(ids.has(day.id)).toBe(false);
      expect(labels.has(day.label)).toBe(false);
      ids.add(day.id);
      labels.add(day.label);
    }
  });

  it("every day has at least one superset with exercises", () => {
    for (const day of workoutPlan.days) {
      expect(day.supersets.length).toBeGreaterThanOrEqual(1);
      for (const ss of day.supersets) {
        expect(ss.exercises.length).toBeGreaterThanOrEqual(1);
        expect(ss.rounds).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("every day has a finisher", () => {
    for (const day of workoutPlan.days) {
      expect(day.finisher).toBeDefined();
      expect(day.finisher.id).toBeTruthy();
      expect(day.finisher.name).toBeTruthy();
      expect(day.finisher.sets).toBeGreaterThanOrEqual(1);
    }
  });

  it("complex has exercises and rounds", () => {
    expect(workoutPlan.complex.rounds).toBeGreaterThanOrEqual(1);
    expect(workoutPlan.complex.exercises.length).toBeGreaterThanOrEqual(1);
  });

  // -----------------------------------------------------------------------
  // Exercise IDs are globally unique
  // -----------------------------------------------------------------------

  it("all exercise IDs are unique across the entire plan", () => {
    const ids = new Set<string>();

    for (const ex of workoutPlan.complex.exercises) {
      expect(ids.has(ex.id)).toBe(false);
      ids.add(ex.id);
    }

    for (const day of workoutPlan.days) {
      for (const ss of day.supersets) {
        for (const ex of ss.exercises) {
          expect(ids.has(ex.id)).toBe(false);
          ids.add(ex.id);
        }
      }
      expect(ids.has(day.finisher.id)).toBe(false);
      ids.add(day.finisher.id);
    }
  });

  // -----------------------------------------------------------------------
  // Every exercise has required fields
  // -----------------------------------------------------------------------

  it("every exercise has id, name, reps, tempo, and rpe", () => {
    const allExercises = [
      ...workoutPlan.complex.exercises,
      ...workoutPlan.days.flatMap((d) =>
        d.supersets.flatMap((ss) => ss.exercises)
      ),
    ];

    for (const ex of allExercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.reps).toBeTruthy();
      expect(ex.tempo).toBeTruthy();
      expect(ex.rpe).toBeTruthy();
    }
  });

  // -----------------------------------------------------------------------
  // Lookup maps are complete and consistent
  // -----------------------------------------------------------------------

  it("exerciseNameToId contains every exercise in the plan", () => {
    const allExercises = [
      ...workoutPlan.complex.exercises,
      ...workoutPlan.days.flatMap((d) => [
        ...d.supersets.flatMap((ss) => ss.exercises),
        d.finisher,
      ]),
    ];

    for (const ex of allExercises) {
      expect(exerciseNameToId[ex.name]).toBe(ex.id);
    }
  });

  it("exerciseIdToName is the inverse of exerciseNameToId", () => {
    for (const [name, id] of Object.entries(exerciseNameToId)) {
      expect(exerciseIdToName[id]).toBe(name);
    }
    for (const [id, name] of Object.entries(exerciseIdToName)) {
      expect(exerciseNameToId[name]).toBe(id);
    }
  });

  it("dayById contains all 3 days keyed by id", () => {
    for (const day of workoutPlan.days) {
      expect(dayById[day.id]).toBe(day);
    }
    expect(Object.keys(dayById)).toHaveLength(workoutPlan.days.length);
  });

  // -----------------------------------------------------------------------
  // Exercise details coverage
  // -----------------------------------------------------------------------

  it("exerciseDetails has an entry for every exercise", () => {
    const allIds = [
      ...workoutPlan.complex.exercises.map((e) => e.id),
      ...workoutPlan.days.flatMap((d) => [
        ...d.supersets.flatMap((ss) => ss.exercises.map((e) => e.id)),
        d.finisher.id,
      ]),
    ];

    for (const id of allIds) {
      expect(exerciseDetails[id]).toBeDefined();
      expect(exerciseDetails[id].instructions).toBeTruthy();
      expect(exerciseDetails[id].videoUrl).toBeTruthy();
    }
  });

  // -----------------------------------------------------------------------
  // Day IDs match expected values (push, pull, carry)
  // -----------------------------------------------------------------------

  it("day IDs are push, pull, carry", () => {
    const dayIds = workoutPlan.days.map((d) => d.id);
    expect(dayIds).toEqual(["push", "pull", "carry"]);
  });

  it("progression notes exist", () => {
    expect(workoutPlan.progressionNotes.length).toBeGreaterThanOrEqual(1);
  });
});
