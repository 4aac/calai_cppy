import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function POST() {
  if (!hasSupabaseEnv()) {
    return Response.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return Response.json({ ok: true });
}
