"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Camera, LoaderCircle, Save } from "lucide-react";

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
  const [pendingAction, setPendingAction] = useState<"analyze" | "save" | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const analyzeRequestRef = useRef(0);

  const total = useMemo(() => calculateTotals(items), [items]);
  const pending = pendingAction !== null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function onPhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const image = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!image || image.size === 0) {
      setStatus("Selecciona una foto para analizar una comida real.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(image));
    await analyzeImage(image);
  }

  async function analyzeImage(image: File) {
    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase y Gemini para analizar fotos reales.");
      return;
    }

    const requestId = analyzeRequestRef.current + 1;
    analyzeRequestRef.current = requestId;
    const formData = new FormData();
    formData.append("image", image);

    setPendingAction("analyze");
    setStatus("Analizando foto...");
    setItems([]);
    setWarnings([]);
    setMealName("Resultado");

    try {
      const response = await fetch("/api/analyze-photo", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (analyzeRequestRef.current !== requestId) {
        return;
      }

      if (!response.ok || !payload) {
        setStatus(payload?.error ?? "No se pudo analizar la imagen. Revisa API keys y sesion.");
        return;
      }

      setMealName(payload.mealName ?? "Resultado");
      setItems(payload.items);
      setWarnings(payload.warnings ?? []);
      if (!payload.items?.length) {
        setStatus("No se pudo extraer ningun alimento de la foto.");
      } else {
        setStatus("Analisis listo. No cuenta para el dia hasta que pulses Anadir al dia.");
      }
    } finally {
      if (analyzeRequestRef.current === requestId) {
        setPendingAction(null);
      }
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

  async function addMealToDay() {
    if (!items.length) {
      setStatus("Analiza una comida antes de anadirla al dia.");
      return;
    }

    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase para guardar comidas.");
      return;
    }

    setPendingAction("save");
    setStatus(null);
    const today = new Date().toISOString().slice(0, 10);
    try {
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

      setStatus(response.ok ? "Comida anadida al dia." : "Inicia sesion y configura Supabase para guardar.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="grid gap-5">
      <label className="relative grid min-h-44 cursor-pointer place-items-center overflow-hidden rounded-3xl border border-dashed border-[#cddbd3] bg-[#f8fbf9] text-center transition hover:border-[#1f9d62]">
        {previewUrl ? (
          // Blob previews are local browser URLs; Next Image cannot optimize them.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Foto seleccionada" className="h-full min-h-44 w-full object-cover" />
        ) : (
          <div className="p-5">
            <Camera className="mx-auto h-8 w-8 text-[#1f9d62]" />
            <span className="mt-3 block text-sm font-semibold text-[#53645b]">
              Hacer foto o subir imagen
            </span>
          </div>
        )}

        {pendingAction === "analyze" ? (
          <span className="absolute inset-0 grid place-items-center bg-[#101a14]/55 text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#101a14]/80 px-4 py-2 text-sm font-semibold">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Analizando foto
            </span>
          </span>
        ) : previewUrl ? (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#1f9d62] shadow-sm">
            Cambiar foto
          </span>
        ) : null}

        <input
          name="image"
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onPhotoSelected}
        />
      </label>

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

        {items.length ? (
          <p className="rounded-2xl bg-[#f8fbf9] px-4 py-3 text-sm font-medium text-[#607369]">
            Solo es un analisis. No suma al diario hasta anadirlo al dia.
          </p>
        ) : null}

        <Button onClick={addMealToDay} loading={pendingAction === "save"} disabled={pending || !items.length} icon={<Save className="h-4 w-4" />}>
          {pendingAction === "save" ? "Anadiendo" : "Anadir al dia"}
        </Button>
      </section>

      {status ? <p className="text-sm font-medium text-[#607369]">{status}</p> : null}
    </div>
  );
}
