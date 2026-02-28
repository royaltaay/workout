import { describe, it, expect } from "vitest";
import { parseExerciseUnit } from "@/lib/units";

describe("parseExerciseUnit", () => {
  it("returns reps for plain number strings", () => {
    const result = parseExerciseUnit("10");
    expect(result.short).toBe("reps");
    expect(result.label).toBe("Reps");
  });

  it("returns reps for rep ranges like 8–10", () => {
    expect(parseExerciseUnit("8–10").short).toBe("reps");
  });

  it("returns reps for per-arm notation like 10/arm", () => {
    // "10/arm" ends with "arm" which is not in the unit map
    expect(parseExerciseUnit("10/arm").short).toBe("reps");
  });

  it("returns reps for per-side notation like 6/side", () => {
    expect(parseExerciseUnit("6/side").short).toBe("reps");
  });

  it("parses yards (yd)", () => {
    const result = parseExerciseUnit("50 yd");
    expect(result.short).toBe("yd");
    expect(result.label).toBe("Distance (yd)");
  });

  it("parses meters (m)", () => {
    const result = parseExerciseUnit("100m");
    expect(result.short).toBe("m");
    expect(result.label).toBe("Distance (m)");
  });

  it("parses feet (ft)", () => {
    const result = parseExerciseUnit("20ft");
    expect(result.short).toBe("ft");
    expect(result.label).toBe("Distance (ft)");
  });

  it("parses seconds (sec)", () => {
    const result = parseExerciseUnit("30sec");
    expect(result.short).toBe("sec");
    expect(result.label).toBe("Time");
  });

  it("parses minutes (min)", () => {
    const result = parseExerciseUnit("2min");
    expect(result.short).toBe("min");
    expect(result.label).toBe("Time");
  });

  it("is case-insensitive for units", () => {
    expect(parseExerciseUnit("50 YD").short).toBe("yd");
    expect(parseExerciseUnit("100M").short).toBe("m");
  });

  it("returns reps for empty string", () => {
    expect(parseExerciseUnit("").short).toBe("reps");
  });

  it("handles the actual farmer's carry rep string from workout data", () => {
    // Farmer's carry uses "50 yd"
    expect(parseExerciseUnit("50 yd").short).toBe("yd");
  });
});
