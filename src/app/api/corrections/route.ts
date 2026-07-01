import { correctionSchema } from "@/lib/schemas/api";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = correctionSchema.safeParse(await request.json());
  if (!body.success) {
    return Response.json({ error: "Invalid correction payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_corrections")
    .insert({
      user_id: auth.user.id,
      meal_item_id: body.data.mealItemId ?? null,
      original_prediction: body.data.originalPrediction,
      corrected_food: body.data.correctedFood,
      corrected_grams: body.data.correctedGrams,
      photo_id: body.data.photoId ?? null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ correction: data });
}
