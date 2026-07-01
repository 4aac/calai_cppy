import { NextRequest } from "next/server";

import { emptyTotals } from "@/lib/nutrition";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DailySummary, MealItemDraft, MealType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const date =
    request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const supabase = await createSupabaseServerClient();

  const [{ data: profile }, { data: meals, error: mealsError }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("date", date)
      .order("created_at", { ascending: true }),
  ]);

  if (mealsError) {
    return Response.json({ error: mealsError.message }, { status: 500 });
  }

  const mealIds = (meals ?? []).map((meal) => meal.id);
  const { data: mealItems } = mealIds.length
    ? await supabase.from("meal_items").select("*").in("meal_id", mealIds)
    : { data: [] };

  const target = profile
    ? {
        kcal: profile.target_kcal,
        protein: profile.target_protein_g,
        carbs: profile.target_carbs_g,
        fat: profile.target_fat_g,
      }
    : { kcal: 2850, protein: 160, carbs: 385, fat: 75 };

  const summary: DailySummary = {
    date,
    target,
    consumed: emptyTotals(),
    meals: (meals ?? []).map((meal) => {
      const items: MealItemDraft[] = (mealItems ?? [])
        .filter((item) => item.meal_id === meal.id)
        .map((item) => ({
          id: item.id,
          foodId: item.food_id,
          productId: item.product_id,
          name: item.name,
          grams: item.grams,
          kcal: item.kcal,
          protein: item.protein_g,
          carbs: item.carbs_g,
          fat: item.fat_g,
          confidence: item.confidence as MealItemDraft["confidence"],
          source: item.source as MealItemDraft["source"],
        }));

      return {
        id: meal.id,
        mealType: meal.meal_type as MealType,
        title: meal.title,
        total: {
          kcal: meal.total_kcal,
          protein: meal.total_protein_g,
          carbs: meal.total_carbs_g,
          fat: meal.total_fat_g,
        },
        items,
      };
    }),
  };

  summary.consumed = summary.meals.reduce(
    (total, meal) => ({
      kcal: total.kcal + meal.total.kcal,
      protein: total.protein + meal.total.protein,
      carbs: total.carbs + meal.total.carbs,
      fat: total.fat + meal.total.fat,
    }),
    emptyTotals(),
  );

  return Response.json(summary);
}
