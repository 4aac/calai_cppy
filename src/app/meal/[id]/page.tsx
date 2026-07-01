import Link from "next/link";
import { notFound } from "next/navigation";

import { MobileShell } from "@/components/app/mobile-shell";
import { demoSummary } from "@/lib/sample-data";
import { protectPage } from "@/lib/supabase/page-auth";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { MealItemDraft, MealType } from "@/lib/types";

export default async function MealPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await protectPage();

  const { id } = await params;
  const meal = user && hasSupabaseEnv()
    ? await getUserMeal(id, user.id)
    : demoSummary.meals.find((item) => item.id === id) ?? demoSummary.meals[1];

  if (!meal) {
    notFound();
  }

  return (
    <MobileShell>
      <div className="grid gap-6">
        <header>
          <Link href="/" className="text-sm font-semibold text-[#1f9d62]">
            Volver
          </Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">{meal.title}</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">{meal.total.kcal} kcal totales</p>
        </header>

        <section className="grid gap-3">
          {meal.items.map((item) => (
            <div key={item.name} className="rounded-2xl border border-[#edf1ee] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-[#708078]">{item.grams} g - {item.confidence}</p>
                </div>
                <p className="text-sm font-semibold">{item.kcal} kcal</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </MobileShell>
  );
}

async function getUserMeal(id: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: meal, error } = await supabase
    .from("meals")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!meal) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("meal_items")
    .select("*")
    .eq("meal_id", meal.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

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
    items: (items ?? []).map((item): MealItemDraft => ({
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
    })),
  };
}
