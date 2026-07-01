"use client";

import { useState } from "react";
import { Plus, Save, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { hasPublicSupabaseEnv } from "@/lib/client-env";

interface SearchResult {
  id: string | null;
  name: string;
  source: string;
  verified: boolean;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export function FoodSearch() {
  const [query, setQuery] = useState("");
  const [grams, setGrams] = useState(150);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"search" | "save" | null>(null);

  async function runSearch(value = query) {
    if (!hasPublicSupabaseEnv()) {
      setResults([]);
      setSelected(null);
      setStatus("Configura Supabase para buscar alimentos reales.");
      return;
    }

    setPendingAction("search");
    setStatus(null);
    try {
      const response = await fetch(`/api/search-food?q=${encodeURIComponent(value)}`);
      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.results) {
        setResults(payload.results);
        setSelected(payload.results[0] ?? null);
        setStatus(payload.results.length ? null : "No hay alimentos reales para esa busqueda.");
        return;
      }

      setResults([]);
      setSelected(null);
      setStatus(payload?.error ?? "No se pudo buscar en la base real.");
    } finally {
      setPendingAction(null);
    }
  }

  async function saveFood() {
    if (!selected) return;
    if (!hasPublicSupabaseEnv()) {
      setStatus("Configura Supabase para guardar comidas.");
      return;
    }

    setPendingAction("save");
    setStatus(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: "lunch",
          date: today,
          title: selected.name,
          items: [
            {
              foodId: selected.id,
              name: selected.name,
              grams,
              kcalPer100g: selected.kcalPer100g,
              proteinPer100g: selected.proteinPer100g,
              carbsPer100g: selected.carbsPer100g,
              fatPer100g: selected.fatPer100g,
              confidence: "high",
              source: "search",
            },
          ],
        }),
      });

      setStatus(response.ok ? "Comida guardada" : "Inicia sesion y configura Supabase para guardar.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Field label="Buscar alimento" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button
          type="button"
          onClick={() => runSearch()}
          loading={pendingAction === "search"}
          disabled={pendingAction !== null}
          icon={<Search className="h-4 w-4" />}
        >
          {pendingAction === "search" ? "Buscando" : "Buscar"}
        </Button>
      </div>

      <section className="grid gap-2">
        {results.map((result) => (
          <button
            key={`${result.name}-${result.source}`}
            onClick={() => setSelected(result)}
            className={`flex min-h-16 items-center justify-between rounded-2xl border px-4 text-left transition ${
              selected?.name === result.name
                ? "border-[#1f9d62] bg-[#f4faf6]"
                : "border-[#edf1ee] bg-white"
            }`}
          >
            <div>
              <p className="font-semibold">{result.name}</p>
              <p className="mt-1 text-sm text-[#708078]">{Math.round(result.kcalPer100g)} kcal / 100 g</p>
            </div>
            <Plus className="h-5 w-5 text-[#1f9d62]" />
          </button>
        ))}
        {!results.length ? (
          <p className="rounded-2xl border border-dashed border-[#dfe7e2] px-4 py-5 text-sm font-medium text-[#708078]">
            Busca un alimento guardado en Supabase o escanea un producto real.
          </p>
        ) : null}
      </section>

      {selected ? (
        <section className="grid gap-4 rounded-3xl border border-[#edf1ee] p-4">
          <div>
            <p className="text-sm font-semibold text-[#708078]">Cantidad</p>
            <h2 className="mt-1 text-2xl font-semibold">{selected.name}</h2>
          </div>
          <Field label="Gramos" type="number" value={grams} onChange={(event) => setGrams(Number(event.target.value))} />
          <Button
            onClick={saveFood}
            loading={pendingAction === "save"}
            disabled={pendingAction !== null}
            icon={<Save className="h-4 w-4" />}
          >
            {pendingAction === "save" ? "Guardando" : "Guardar"}
          </Button>
        </section>
      ) : null}

      {status ? <p className="text-sm font-medium text-[#607369]">{status}</p> : null}
    </div>
  );
}
