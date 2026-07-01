import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function requireUser(): Promise<
  | { user: User; response?: never }
  | { user?: never; response: Response }
> {
  if (!hasSupabaseEnv()) {
    return {
      response: Response.json(
        { error: "Supabase env vars are missing" },
        { status: 503 },
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user: data.user };
}
