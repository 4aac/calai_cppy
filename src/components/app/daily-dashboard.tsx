"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Camera, LoaderCircle, Plus, ScanBarcode, Trash2 } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { hasPublicSupabaseEnv } from "@/lib/client-env";
import { roundMacro } from "@/lib/nutrition";
import type { DailySummary } from "@/lib/types";

const mealLabels = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Snack",
  dinner: "Cena",
};

export function DailyDashboard() {
  const [summary, setSummary] = useState<DailySummary>(() => emptyDailySummary());
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPublicSupabaseEnv()) {
      return;
    }

    const date = new Date().toISOString().slice(0, 10);
    fetch(`/api/daily-summary?date=${date}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: DailySummary | null) => {
        if (data) setSummary(data);
      })
      .catch(() => undefined);
  }, []);

  async function deleteMeal(mealId: string) {
    if (deletingMealId) return;

    setDeletingMealId(mealId);
    setStatus(null);

    try {
      const response = await fetch(`/api/meals?id=${encodeURIComponent(mealId)}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus(payload?.error ?? "No se pudo eliminar la comida.");
        return;
      }

      setSummary((current) => removeMealFromSummary(current, mealId));
      setStatus("Comida eliminada del dia.");
    } catch {
      setStatus("No se pudo eliminar la comida.");
    } finally {
      setDeletingMealId(null);
    }
  }

  return (
    <div className="grid gap-7">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6c7d72]">CalAI Copy</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal text-[#142019]">Hoy</h1>
        </div>
        <div className="rounded-full border border-[#dfe7e2] px-3 py-2 text-xs font-semibold text-[#52635a]">
          {new Date(summary.date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
          })}
        </div>
      </header>

      <section className="grid gap-5">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-5xl font-semibold tracking-normal text-[#142019]">
                {summary.consumed.kcal.toLocaleString("es-ES")}
              </div>
              <p className="mt-1 text-sm font-medium text-[#65766d]">
                / {summary.target.kcal.toLocaleString("es-ES")} kcal
              </p>
            </div>
            <ButtonLink href="/add" icon={<Plus className="h-4 w-4" />}>
              Anadir
            </ButtonLink>
          </div>
          <Progress value={summary.consumed.kcal} max={summary.target.kcal} className="mt-5" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Macro label="Proteina" value={summary.consumed.protein} max={summary.target.protein} />
          <Macro label="Carbs" value={summary.consumed.carbs} max={summary.target.carbs} />
          <Macro label="Grasas" value={summary.consumed.fat} max={summary.target.fat} />
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Comidas</h2>
          <div className="flex gap-2 text-[#1f9d62]">
            <Camera className="h-5 w-5" />
            <ScanBarcode className="h-5 w-5" />
          </div>
        </div>

        {(["breakfast", "lunch", "snack", "dinner"] as const).map((mealType) => {
          const meals = summary.meals.filter((item) => item.mealType === mealType);
          const kcal = meals.reduce((total, meal) => total + meal.total.kcal, 0);

          return (
            <div
              key={mealType}
              className="min-h-16 border-b border-[#edf1ee] py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">{mealLabels[mealType]}</p>
                  <p className="mt-1 text-sm text-[#718078]">
                    {meals.length ? `${meals.length} registros` : "Sin registrar"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#2b3a31]">
                  {meals.length ? `${kcal} kcal` : "+"}
                </span>
              </div>

              {meals.length ? (
                <div className="mt-3 grid gap-2">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-2xl bg-[#f8fbf9] px-3 py-2"
                    >
                      <Link href={`/meal/${meal.id}`} className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#17231d]">{meal.title}</p>
                        <p className="mt-0.5 text-xs font-medium text-[#718078]">
                          {meal.items.length} {meal.items.length === 1 ? "alimento" : "alimentos"}
                        </p>
                      </Link>
                      <span className="whitespace-nowrap text-sm font-semibold text-[#2b3a31]">
                        {meal.total.kcal} kcal
                      </span>
                      <button
                        type="button"
                        aria-label={`Eliminar ${meal.title}`}
                        className="grid h-10 w-10 place-items-center rounded-xl text-[#b23620] transition hover:bg-[#fff2ef] disabled:cursor-not-allowed disabled:opacity-55"
                        disabled={deletingMealId !== null}
                        onClick={() => deleteMeal(meal.id)}
                      >
                        {deletingMealId === meal.id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        {status ? <p className="text-sm font-medium text-[#607369]">{status}</p> : null}
      </section>
    </div>
  );
}

function emptyDailySummary(): DailySummary {
  return {
    date: new Date().toISOString().slice(0, 10),
    target: { kcal: 2850, protein: 160, carbs: 385, fat: 75 },
    consumed: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    meals: [],
  };
}

function Macro({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="rounded-2xl border border-[#edf1ee] p-3">
      <p className="text-xs font-semibold text-[#6f8077]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#15211a]">{Math.round(value)} g</p>
      <Progress value={value} max={max} className="mt-3 h-1.5" />
    </div>
  );
}

function removeMealFromSummary(summary: DailySummary, mealId: string): DailySummary {
  const removed = summary.meals.find((meal) => meal.id === mealId);
  if (!removed) return summary;

  return {
    ...summary,
    consumed: {
      kcal: Math.max(0, summary.consumed.kcal - removed.total.kcal),
      protein: Math.max(0, roundMacro(summary.consumed.protein - removed.total.protein)),
      carbs: Math.max(0, roundMacro(summary.consumed.carbs - removed.total.carbs)),
      fat: Math.max(0, roundMacro(summary.consumed.fat - removed.total.fat)),
    },
    meals: summary.meals.filter((meal) => meal.id !== mealId),
  };
}
