"use client";

import { useEffect, useState } from "react";
import { Camera, Plus, ScanBarcode } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { demoSummary } from "@/lib/sample-data";
import type { DailySummary } from "@/lib/types";

const mealLabels = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Snack",
  dinner: "Cena",
};

export function DailyDashboard() {
  const [summary, setSummary] = useState<DailySummary>(demoSummary);

  useEffect(() => {
    const date = new Date().toISOString().slice(0, 10);
    fetch(`/api/daily-summary?date=${date}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: DailySummary | null) => {
        if (data) setSummary(data);
      })
      .catch(() => undefined);
  }, []);

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
          const meal = summary.meals.find((item) => item.mealType === mealType);

          return (
            <div
              key={mealType}
              className="flex min-h-16 items-center justify-between border-b border-[#edf1ee] py-3"
            >
              <div>
                <p className="text-base font-semibold">{mealLabels[mealType]}</p>
                <p className="mt-1 text-sm text-[#718078]">
                  {meal ? `${meal.items.length} alimentos` : "Sin registrar"}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#2b3a31]">
                {meal ? `${meal.total.kcal} kcal` : "+"}
              </span>
            </div>
          );
        })}
      </section>
    </div>
  );
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
