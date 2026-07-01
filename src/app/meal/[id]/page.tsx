import Link from "next/link";

import { MobileShell } from "@/components/app/mobile-shell";
import { demoSummary } from "@/lib/sample-data";
import { protectPage } from "@/lib/supabase/page-auth";

export default async function MealPage({ params }: { params: Promise<{ id: string }> }) {
  await protectPage();

  const { id } = await params;
  const meal = demoSummary.meals.find((item) => item.id === id) ?? demoSummary.meals[1];

  return (
    <MobileShell>
      <div className="grid gap-6">
        <header>
          <Link href="/" className="text-sm font-semibold text-[#1f9d62]">
            Volver
          </Link>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">{meal.title}</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">{meal.total.kcal} kcal totales</p>
        </header>

        <section className="grid gap-3">
          {meal.items.map((item) => (
            <div key={item.name} className="rounded-2xl border border-[#edf1ee] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-[#708078]">{item.grams} g - {item.confidence}</p>
                </div>
                <p className="text-sm font-semibold">{item.kcal} kcal</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </MobileShell>
  );
}
