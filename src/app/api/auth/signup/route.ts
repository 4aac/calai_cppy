import { loginSchema } from "@/lib/schemas/api";
import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return Response.json({ error: "Supabase env vars are missing" }, { status: 503 });
  }

  const body = loginSchema.safeParse(await request.json());
  if (!body.success) {
    return Response.json({ error: "Invalid signup payload" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp(body.data);

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "Signup failed" }, { status: 400 });
  }

  await supabase.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email ?? null,
  });

  return Response.json({ user: { id: data.user.id, email: data.user.email } });
}
