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
          estimated_kcal_per_100g: 130,
          estimated_protein_per_100g: 2.7,
          estimated_carbs_per_100g: 28.2,
          estimated_fat_per_100g: 0.3,
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

  it("rejects search meal items without a real food or product id", () => {
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

  it("accepts confirmed photo items with AI-estimated nutrition", () => {
    const parsed = saveMealSchema.parse({
      mealType: "lunch",
      date: "2026-07-01",
      title: "Comida",
      items: [
        {
          name: "Tortilla de patata",
          grams: 180,
          kcalPer100g: 210,
          proteinPer100g: 6,
          carbsPer100g: 18,
          fatPer100g: 12,
          confidence: "medium",
          source: "photo_ai",
        },
      ],
    });

    expect(parsed.items[0].source).toBe("photo_ai");
  });
});
