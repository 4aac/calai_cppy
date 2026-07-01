import { calculateFromPer100g } from "@/lib/nutrition";
import { scanCodeSchema } from "@/lib/schemas/api";
import { parseScannedCode } from "@/lib/services/code";
import { productRecordFromSupabase, toSearchResult } from "@/lib/services/foods";
import { fetchOpenFoodFactsProduct } from "@/lib/services/open-food-facts";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = scanCodeSchema.safeParse(await request.json());
  if (!body.success) {
    return Response.json({ error: "Invalid code payload" }, { status: 400 });
  }

  const parsed = parseScannedCode(body.data.code);
  const barcode = parsed.type === "barcode" ? parsed.value : parsed.barcodeCandidate;

  if (!barcode) {
    return Response.json({
      status: "unsupported_qr",
      parsed,
      message: "El QR no contiene un codigo nutricional util. Usa foto de etiqueta o entrada manual.",
    });
  }

  const supabase = await createSupabaseServerClient();
  const { data: cached } = await supabase
    .from("branded_products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();

  let product = cached ? productRecordFromSupabase(cached) : null;

  if (!product) {
    product = await fetchOpenFoodFactsProduct(barcode);
    if (!product) {
      return Response.json({
        status: "not_found",
        parsed,
        barcode,
        message: "Producto no encontrado. Introduce la etiqueta manualmente.",
      });
    }

    const { data: saved } = await supabase
      .from("branded_products")
      .upsert(
        {
          barcode,
          brand: product.brand ?? null,
          product_name: product.nameEs,
          kcal_per_100g: product.nutritionPer100g.kcal,
          protein_per_100g: product.nutritionPer100g.protein,
          carbs_per_100g: product.nutritionPer100g.carbs,
          fat_per_100g: product.nutritionPer100g.fat,
          fiber_per_100g: product.nutritionPer100g.fiber ?? null,
          serving_size_g: product.servingSizeG ?? null,
          source: "open_food_facts",
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: "barcode" },
      )
      .select()
      .single();

    if (saved) {
      product = productRecordFromSupabase(saved);
    }
  }

  const grams = product.servingSizeG ?? 100;
  return Response.json({
    status: "found",
    parsed,
    product: toSearchResult(product),
    defaultItem: {
      name: product.nameEs,
      grams,
      ...calculateFromPer100g(product.nutritionPer100g, grams),
      confidence: "high",
      source: "barcode",
    },
  });
}
