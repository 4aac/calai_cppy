import { describe, expect, it } from "vitest";

import { mapOpenFoodFactsProduct } from "@/lib/services/open-food-facts";

describe("Open Food Facts mapping", () => {
  it("maps API nutrients into app product records", () => {
    const product = mapOpenFoodFactsProduct("8410000000000", {
      status: 1,
      product: {
        product_name_es: "Yogur natural",
        brands: "Marca",
        serving_quantity: "125",
        nutriments: {
          "energy-kcal_100g": 72,
          proteins_100g: 4,
          carbohydrates_100g: 6,
          fat_100g: 3,
        },
      },
    });

    expect(product).toMatchObject({
      barcode: "8410000000000",
      brand: "Marca",
      nameEs: "Yogur natural",
      servingSizeG: 125,
      nutritionPer100g: { kcal: 72, protein: 4, carbs: 6, fat: 3 },
    });
  });

  it("returns null when product or kcal data is missing", () => {
    expect(mapOpenFoodFactsProduct("1", { status: 0 })).toBeNull();
    expect(
      mapOpenFoodFactsProduct("1", {
        status: 1,
        product: { product_name: "Sin datos", nutriments: {} },
      }),
    ).toBeNull();
  });
});
