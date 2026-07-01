import { NextRequest } from "next/server";

import { foodRecordFromSupabase, sanitizeFoodSearchQuery, toSearchResult } from "@/lib/services/foods";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const supabase = createSupabaseServiceClient();
  const safeQuery = sanitizeFoodSearchQuery(query);
  const shouldSearchDatabase = safeQuery.length > 0 || query.length === 0;

  const supabaseResults = shouldSearchDatabase
    ? await searchSupabaseFoods(supabase, safeQuery)
    : [];
  const merged = supabaseResults
    .filter((food, index, all) => all.findIndex((item) => item.nameEs === food.nameEs) === index)
    .slice(0, 12)
    .map(toSearchResult);

  return Response.json({ results: merged });
}

async function searchSupabaseFoods(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  safeQuery: string,
) {
  const pattern = `%${safeQuery}%`;
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.${pattern},name_es.ilike.${pattern}`)
    .limit(12);

  return error ? [] : (data ?? []).map(foodRecordFromSupabase);
}
