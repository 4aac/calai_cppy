import { describe, expect, it } from "vitest";

import { photoAnalysisSchema, saveMealSchema } from "@/lib/schemas/api";

describe("API schemas", () => {
  it("accepts strict Gemma photo analysis payloads", () => {
    const parsed = photoAnalysisSchema.parse({
      meal_name: "Arroz con pollo",
      items: [
        {
          food_name_es: "arroz blanco cocido",
          estimated_grams: 180,
          confidence: "medium",
          reason: "porcion visible",
        },
      ],
      warnings: ["No se puede estimar aceite con precision."],
    });

    expect(parsed.items[0].estimated_grams).toBe(180);
  });

  it("rejects meal items without nutrition basis", () => {
    expect(() =>
      saveMealSchema.parse({
        mealType: "lunch",
        date: "2026-07-01",
        title: "Comida",
        items: [{ name: "Pollo", grams: 150 }],
      }),
    ).toThrow();
  });

  it("rejects non-manual meal items without a real food or product id", () => {
    expect(() =>
      saveMealSchema.parse({
        mealType: "lunch",
        date: "2026-07-01",
        title: "Comida",
        items: [
          {
            name: "Pollo",
            grams: 150,
            kcalPer100g: 165,
            proteinPer100g: 31,
            carbsPer100g: 0,
            fatPer100g: 3.6,
            confidence: "high",
            source: "search",
          },
        ],
      }),
    ).toThrow();
  });
});
