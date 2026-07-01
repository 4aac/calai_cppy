import type { NextRequest } from "next/server";

import { calculateFromPer100g, calculateTotals } from "@/lib/nutrition";
import { deleteMealSchema, saveMealSchema } from "@/lib/schemas/api";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MealItemDraft } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = saveMealSchema.safeParse(await request.json());
  if (!body.success) {
    return Response.json({ error: "Invalid meal payload" }, { status: 400 });
  }

  const items: MealItemDraft[] = body.data.items.map((item) => ({
    foodId: item.foodId ?? null,
    productId: item.productId ?? null,
    name: item.name,
    grams: item.grams,
    ...calculateFromPer100g(
      {
        kcal: item.kcalPer100g,
        protein: item.proteinPer100g,
        carbs: item.carbsPer100g,
        fat: item.fatPer100g,
      },
      item.grams,
    ),
    confidence: item.confidence,
    source: item.source,
  }));
  const total = calculateTotals(items);

  const supabase = await createSupabaseServerClient();
  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      user_id: auth.user.id,
      meal_type: body.data.mealType,
      title: body.data.title,
      date: body.data.date,
      total_kcal: total.kcal,
      total_protein_g: total.protein,
      total_carbs_g: total.carbs,
      total_fat_g: total.fat,
    })
    .select()
    .single();

  if (mealError || !meal) {
    return Response.json({ error: mealError?.message ?? "Could not save meal" }, { status: 500 });
  }

  const { error: itemError } = await supabase.from("meal_items").insert(
    items.map((item) => ({
      meal_id: meal.id,
      food_id: item.foodId ?? null,
      product_id: item.productId ?? null,
      name: item.name,
      grams: item.grams,
      kcal: item.kcal,
      protein_g: item.protein,
      carbs_g: item.carbs,
      fat_g: item.fat,
      confidence: item.confidence,
      source: item.source,
    })),
  );

  if (itemError) {
    return Response.json({ error: itemError.message }, { status: 500 });
  }

  return Response.json({ meal, items, total });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const query = deleteMealSchema.safeParse({
    id: request.nextUrl.searchParams.get("id"),
  });
  if (!query.success) {
    return Response.json({ error: "Invalid meal id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("meals")
    .delete()
    .eq("id", query.data.id)
    .eq("user_id", auth.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  return Response.json({ deleted: data.id });
}
