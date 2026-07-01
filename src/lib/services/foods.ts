import type { FoodRecord } from "@/lib/types";

export function foodRecordFromSupabase(row: {
  id?: string;
  name: string;
  name_es: string;
  source: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number | null;
  verified: boolean;
}): FoodRecord {
  return {
    id: row.id,
    name: row.name,
    nameEs: row.name_es,
    source: "supabase",
    verified: row.verified,
    nutritionPer100g: {
      kcal: row.kcal_per_100g,
      protein: row.protein_per_100g,
      carbs: row.carbs_per_100g,
      fat: row.fat_per_100g,
      fiber: row.fiber_per_100g ?? undefined,
    },
  };
}

export function productRecordFromSupabase(row: {
  id?: string;
  barcode: string;
  brand: string | null;
  product_name: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number | null;
  serving_size_g?: number | null;
}): FoodRecord {
  return {
    id: row.id,
    barcode: row.barcode,
    brand: row.brand,
    name: row.product_name,
    nameEs: row.product_name,
    source: "open_food_facts",
    verified: false,
    servingSizeG: row.serving_size_g ?? null,
    nutritionPer100g: {
      kcal: row.kcal_per_100g,
      protein: row.protein_per_100g,
      carbs: row.carbs_per_100g,
      fat: row.fat_per_100g,
      fiber: row.fiber_per_100g ?? undefined,
    },
  };
}

export function toSearchResult(food: FoodRecord) {
  return {
    id: food.id ?? null,
    name: food.nameEs,
    source: food.source,
    verified: food.verified,
    barcode: food.barcode ?? null,
    brand: food.brand ?? null,
    servingSizeG: food.servingSizeG ?? null,
    kcalPer100g: food.nutritionPer100g.kcal,
    proteinPer100g: food.nutritionPer100g.protein,
    carbsPer100g: food.nutritionPer100g.carbs,
    fatPer100g: food.nutritionPer100g.fat,
    fiberPer100g: food.nutritionPer100g.fiber ?? null,
  };
}
