"use client";

import { useMemo, useState } from "react";
import { Camera, Save, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { hasPublicSupabaseEnv } from "@/lib/client-env";
import { calculateTotals, roundMacro } from "@/lib/nutrition";
import type { MealItemDraft } from "@/lib/types";

export function PhotoAnalyzer() {
  const [items, setItems] = useState<MealItemDraft[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [mealName, setMealName] = useState("Resultado");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const total = useMemo(() => calculateTotals(items), [items]);

  async function analyze(formData: FormData) {
    const image = formData.get("image");
    if (!(image instanceof File) || image.size === 0) {
      setStatus("Selecciona una foto para analizar una comida real.");
      return;
    }

    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase y Gemini para analizar fotos reales.");
      return;
    }

    setPending(true);
    setStatus(null);
    const response = await fetch("/api/analyze-photo", {
      method: "POST",
      body: formData,
    });
    setPending(false);

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
      setStatus(payload?.error ?? "No se pudo analizar la imagen. Revisa API keys y sesion.");
      return;
    }

    setMealName(payload.mealName ?? "Resultado");
    setItems(payload.items);
    setWarnings(payload.warnings ?? []);
    if (!payload.items?.length) {
      setStatus("La IA no encontro alimentos con base nutricional real en Supabase.");
    }
  }

  function updateGrams(index: number, grams: number) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const ratio = grams / item.grams;
        return {
          ...item,
          grams,
          kcal: Math.round(item.kcal * ratio),
          protein: roundMacro(item.protein * ratio),
          carbs: roundMacro(item.carbs * ratio),
          fat: roundMacro(item.fat * ratio),
        };
      }),
    );
  }

  async function saveMeal() {
    if (!items.length) {
      setStatus("Analiza una comida con alimentos reales antes de guardar.");
      return;
    }

    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase para guardar comidas.");
      return;
    }

    setPending(true);
    setStatus(null);
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType: "lunch",
        date: today,
        title: mealName,
        items: items.map((item) => ({
          name: item.name,
          grams: item.grams,
          kcalPer100g: (item.kcal / item.grams) * 100,
          proteinPer100g: (item.protein / item.grams) * 100,
          carbsPer100g: (item.carbs / item.grams) * 100,
          fatPer100g: (item.fat / item.grams) * 100,
          confidence: item.confidence,
          source: item.source,
          foodId: item.foodId ?? null,
          productId: item.productId ?? null,
        })),
      }),
    });
    setPending(false);
    setStatus(response.ok ? "Comida guardada" : "Inicia sesion y configura Supabase para guardar.");
  }

  return (
    <div className="grid gap-5">
      <form action={analyze} className="grid gap-3">
        <label className="grid min-h-36 place-items-center rounded-3xl border border-dashed border-[#cddbd3] bg-[#f8fbf9] p-5 text-center">
          <Camera className="h-8 w-8 text-[#1f9d62]" />
          <span className="mt-3 text-sm font-semibold text-[#53645b]">Hacer foto o subir imagen</span>
          <input name="image" type="file" accept="image/*" capture="environment" className="sr-only" />
        </label>
        <Button disabled={pending} icon={<SlidersHorizontal className="h-4 w-4" />}>
          {pending ? "Analizando" : "Analizar foto"}
        </Button>
      </form>

      <section className="grid gap-4 rounded-3xl border border-[#edf1ee] p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-[#708078]">{mealName}</p>
            <h2 className="mt-1 text-3xl font-semibold">{total.kcal} kcal</h2>
          </div>
          <span className="rounded-full bg-[#edf8f1] px-3 py-1 text-xs font-semibold text-[#1f9d62]">
            Confianza media
          </span>
        </div>

        <div className="grid gap-3">
          {items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="grid grid-cols-[1fr_92px] items-end gap-3 border-t border-[#edf1ee] pt-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-[#708078]">
                  {item.kcal} kcal - {item.confidence}
                </p>
              </div>
              <Field
                label="g"
                type="number"
                min={1}
                value={Math.round(item.grams)}
                onChange={(event) => updateGrams(index, Number(event.target.value))}
              />
            </div>
          ))}
          {!items.length ? (
            <p className="rounded-2xl border border-dashed border-[#dfe7e2] px-4 py-5 text-sm font-medium text-[#708078]">
              El resultado aparecera aqui despues de analizar una foto real.
            </p>
          ) : null}
        </div>

        {warnings.map((warning) => (
          <p key={warning} className="rounded-xl bg-[#fff9eb] px-3 py-2 text-sm font-medium text-[#8b6415]">
            {warning}
          </p>
        ))}

        <Button onClick={saveMeal} disabled={pending} icon={<Save className="h-4 w-4" />}>
          Guardar comida
        </Button>
      </section>

      {status ? <p className="text-sm font-medium text-[#607369]">{status}</p> : null}
    </div>
  );
}
