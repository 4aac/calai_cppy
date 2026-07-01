import { calculateFromPer100g, calculateTotals } from "@/lib/nutrition";
import { analyzeFoodPhoto } from "@/lib/services/gemma";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FoodRecord, MealItemDraft } from "@/lib/types";

export const maxDuration = 45;

async function fileToBase64(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  return bytes.toString("base64");
}

function normalizeFoodName(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[%_]/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function foodSearchTerms(name: string) {
  const normalized = normalizeFoodName(name);
  const stopWords = new Set(["con", "de", "del", "la", "el", "los", "las", "un", "una", "y", "a"]);
  const tokens = normalized
    .toLowerCase()
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));

  return [normalized, ...tokens.sort((first, second) => second.length - first.length)].filter(
    (term, index, all) => term.length > 0 && all.indexOf(term) === index,
  );
}

async function findBestFood(name: string): Promise<FoodRecord | null> {
  const supabase = await createSupabaseServerClient();

  for (const term of foodSearchTerms(name)) {
    const pattern = `%${term}%`;
    const { data } = await supabase
      .from("foods")
      .select("*")
      .or(`name.ilike.${pattern},name_es.ilike.${pattern}`)
      .order("verified", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        name: data.name,
        nameEs: data.name_es,
        source: "supabase",
        verified: data.verified,
        nutritionPer100g: {
          kcal: data.kcal_per_100g,
          protein: data.protein_per_100g,
          carbs: data.carbs_per_100g,
          fat: data.fat_per_100g,
          fiber: data.fiber_per_100g ?? undefined,
        },
      };
    }
  }

  return null;
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY is missing" }, { status: 503 });
  }

  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return Response.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!image.type.startsWith("image/")) {
    return Response.json({ error: "Only image uploads are supported" }, { status: 400 });
  }

  if (image.size > 7 * 1024 * 1024) {
    return Response.json({ error: "Image exceeds 7 MB" }, { status: 413 });
  }

  const analysis = await analyzeFoodPhoto({
    base64: await fileToBase64(image),
    mimeType: image.type || "image/jpeg",
  });
  const items: MealItemDraft[] = [];
  const warnings = [...analysis.warnings];

  for (const item of analysis.items) {
    const matchedFood = await findBestFood(item.food_name_es);

    if (!matchedFood) {
      warnings.push(
        `${item.food_name_es}: identificado por IA, pero sin alimento real verificado en la base nutricional.`,
      );
      continue;
    }

    const nutrition = calculateFromPer100g(matchedFood.nutritionPer100g, item.estimated_grams);

    items.push({
      foodId: matchedFood.id ?? null,
      name: matchedFood.nameEs,
      grams: item.estimated_grams,
      ...nutrition,
      confidence: item.confidence,
      source: "photo_ai",
      reason: item.reason,
    });
  }

  return Response.json({
    mealName: analysis.meal_name,
    items,
    warnings,
    total: calculateTotals(items),
  });
}
