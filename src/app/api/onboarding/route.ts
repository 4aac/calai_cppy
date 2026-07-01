import { calculateTargets } from "@/lib/nutrition";
import { onboardingSchema } from "@/lib/schemas/api";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = onboardingSchema.safeParse(await request.json());
  if (!body.success) {
    return Response.json({ error: "Invalid onboarding payload" }, { status: 400 });
  }

  const targets = calculateTargets(body.data);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: auth.user.id,
      email: auth.user.email ?? null,
      age: body.data.age,
      sex: body.data.sex,
      height_cm: body.data.heightCm,
      weight_kg: body.data.weightKg,
      goal: body.data.goal,
      activity: body.data.activity,
      target_kcal: targets.kcal,
      target_protein_g: targets.protein,
      target_carbs_g: targets.carbs,
      target_fat_g: targets.fat,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ profile: data, targets });
}
