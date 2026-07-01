import type {
  MealItemDraft,
  NutritionPer100g,
  NutritionTotals,
  ProfileTargetsInput,
} from "@/lib/types";

export function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateFromPer100g(
  nutrition: NutritionPer100g,
  grams: number,
): NutritionTotals {
  const multiplier = grams / 100;

  return {
    kcal: Math.round(nutrition.kcal * multiplier),
    protein: roundMacro(nutrition.protein * multiplier),
    carbs: roundMacro(nutrition.carbs * multiplier),
    fat: roundMacro(nutrition.fat * multiplier),
  };
}

export function calculateTotals(items: Pick<MealItemDraft, "kcal" | "protein" | "carbs" | "fat">[]): NutritionTotals {
  return items.reduce<NutritionTotals>(
    (total, item) => ({
      kcal: total.kcal + item.kcal,
      protein: roundMacro(total.protein + item.protein),
      carbs: roundMacro(total.carbs + item.carbs),
      fat: roundMacro(total.fat + item.fat),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function calculateTargets(input: ProfileTargetsInput): NutritionTotals {
  const bmr =
    10 * input.weightKg +
    6.25 * input.heightCm -
    5 * input.age +
    (input.sex === "male" ? 5 : -161);

  const activityFactor = {
    low: 1.35,
    medium: 1.55,
    high: 1.75,
  }[input.activity];

  const goalAdjustment = {
    maintain: 0,
    lose: -350,
    gain_slow: 250,
    gain_fast: 450,
  }[input.goal];

  const kcal = Math.max(1200, Math.round(bmr * activityFactor + goalAdjustment));
  const protein = Math.round(input.weightKg * 1.8);
  const fat = Math.round(input.weightKg * 0.8);
  const caloriesAfterProteinAndFat = kcal - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(caloriesAfterProteinAndFat / 4));

  return { kcal, protein, carbs, fat };
}

export function emptyTotals(): NutritionTotals {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
}
