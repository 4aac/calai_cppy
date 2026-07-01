import { describe, expect, it } from "vitest";

import { calculateFromPer100g, calculateTargets, calculateTotals } from "@/lib/nutrition";

describe("nutrition calculations", () => {
  it("calculates macros from grams and per-100g values", () => {
    expect(
      calculateFromPer100g(
        { kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
        150,
      ),
    ).toEqual({ kcal: 248, protein: 46.5, carbs: 0, fat: 5.4 });
  });

  it("aggregates meal totals", () => {
    expect(
      calculateTotals([
        { kcal: 234, protein: 4.9, carbs: 50.4, fat: 0.5 },
        { kcal: 248, protein: 46.5, carbs: 0, fat: 5.4 },
      ]),
    ).toEqual({ kcal: 482, protein: 51.4, carbs: 50.4, fat: 5.9 });
  });

  it("calculates realistic profile targets", () => {
    const targets = calculateTargets({
      age: 28,
      sex: "male",
      heightCm: 178,
      weightKg: 75,
      goal: "gain_slow",
      activity: "medium",
    });

    expect(targets.kcal).toBeGreaterThan(2500);
    expect(targets.protein).toBe(135);
    expect(targets.fat).toBe(60);
    expect(targets.carbs).toBeGreaterThan(250);
  });
});
