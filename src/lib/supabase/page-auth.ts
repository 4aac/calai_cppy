import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function protectPage() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return data.user;
}
