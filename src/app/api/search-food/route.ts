import { NextRequest } from "next/server";

import { findSeedFoods } from "@/lib/sample-data";
import { foodRecordFromSupabase, toSearchResult } from "@/lib/services/foods";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const supabase = await createSupabaseServerClient();
  const pattern = `%${query.replace(/[%_]/g, "")}%`;

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.${pattern},name_es.ilike.${pattern}`)
    .limit(12);

  const supabaseResults = error ? [] : (data ?? []).map(foodRecordFromSupabase);
  const seedResults = findSeedFoods(query);

  const merged = [...supabaseResults, ...seedResults]
    .filter((food, index, all) => all.findIndex((item) => item.nameEs === food.nameEs) === index)
    .slice(0, 12)
    .map(toSearchResult);

  return Response.json({ results: merged });
}
