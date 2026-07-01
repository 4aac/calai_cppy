import type { FoodRecord, NutritionPer100g } from "@/lib/types";

export interface OpenFoodFactsProductResponse {
  status: number;
  product?: {
    code?: string;
    product_name?: string;
    product_name_es?: string;
    brands?: string;
    serving_quantity?: string | number;
    nutriments?: Record<string, unknown>;
  };
}

function numberFrom(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function mapOpenFoodFactsProduct(
  barcode: string,
  response: OpenFoodFactsProductResponse,
): FoodRecord | null {
  if (response.status !== 1 || !response.product) {
    return null;
  }

  const nutriments = response.product.nutriments ?? {};
  const nutritionPer100g: NutritionPer100g = {
    kcal: numberFrom(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]),
    protein: numberFrom(nutriments.proteins_100g),
    carbs: numberFrom(nutriments.carbohydrates_100g),
    fat: numberFrom(nutriments.fat_100g),
    fiber: numberFrom(nutriments.fiber_100g),
  };

  if (!nutritionPer100g.kcal) {
    return null;
  }

  const name =
    response.product.product_name_es ||
    response.product.product_name ||
    `Producto ${barcode}`;

  return {
    barcode,
    brand: response.product.brands ?? null,
    name,
    nameEs: name,
    source: "open_food_facts",
    verified: false,
    servingSizeG: numberFrom(response.product.serving_quantity) || null,
    nutritionPer100g,
  };
}

export async function fetchOpenFoodFactsProduct(barcode: string) {
  const userAgent =
    process.env.OPEN_FOOD_FACTS_USER_AGENT ||
    "CalAI Copy MVP - contact: add-user-agent@example.com";

  const response = await fetch(
    `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(barcode)}.json`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": userAgent,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Open Food Facts responded with ${response.status}`);
  }

  const payload = (await response.json()) as OpenFoodFactsProductResponse;
  return mapOpenFoodFactsProduct(barcode, payload);
}
