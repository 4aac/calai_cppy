export type Confidence = "low" | "medium" | "high";

export type MealSource = "photo_ai" | "barcode" | "manual" | "search";

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export interface NutritionPer100g {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface NutritionTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodRecord {
  id?: string;
  name: string;
  nameEs: string;
  source: "seed" | "supabase" | "open_food_facts" | "manual";
  nutritionPer100g: NutritionPer100g;
  verified: boolean;
  brand?: string | null;
  barcode?: string | null;
  servingSizeG?: number | null;
}

export interface MealItemDraft extends NutritionTotals {
  id?: string;
  foodId?: string | null;
  productId?: string | null;
  name: string;
  grams: number;
  confidence: Confidence;
  source: MealSource;
  reason?: string | null;
}

export interface AnalyzedMealDraft {
  mealName: string;
  items: MealItemDraft[];
  warnings: string[];
  total: NutritionTotals;
}

export interface DailySummary {
  date: string;
  target: NutritionTotals;
  consumed: NutritionTotals;
  meals: Array<{
    id: string;
    mealType: MealType;
    title: string;
    total: NutritionTotals;
    items: MealItemDraft[];
  }>;
}

export interface ProfileTargetsInput {
  age: number;
  sex: "male" | "female";
  heightCm: number;
  weightKg: number;
  goal: "maintain" | "lose" | "gain_slow" | "gain_fast";
  activity: "low" | "medium" | "high";
}
