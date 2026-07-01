"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, SelectField } from "@/components/ui/field";
import { calculateTargets } from "@/lib/nutrition";
import type { ProfileTargetsInput } from "@/lib/types";

export function OnboardingForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileTargetsInput>({
    age: 28,
    sex: "male",
    heightCm: 178,
    weightKg: 75,
    goal: "gain_slow",
    activity: "medium",
  });

  const targets = useMemo(() => calculateTargets(form), [form]);

  async function submit() {
    setMessage(null);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setMessage("Guarda las claves de Supabase para persistir el perfil. Estos objetivos ya estan calculados localmente.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Edad" type="number" value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} />
        <SelectField label="Sexo" value={form.sex} onChange={(event) => setForm({ ...form, sex: event.target.value as ProfileTargetsInput["sex"] })}>
          <option value="male">Hombre</option>
          <option value="female">Mujer</option>
        </SelectField>
        <Field label="Altura cm" type="number" value={form.heightCm} onChange={(event) => setForm({ ...form, heightCm: Number(event.target.value) })} />
        <Field label="Peso kg" type="number" value={form.weightKg} onChange={(event) => setForm({ ...form, weightKg: Number(event.target.value) })} />
      </div>
      <SelectField label="Objetivo" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value as ProfileTargetsInput["goal"] })}>
        <option value="maintain">Mantener</option>
        <option value="lose">Perder grasa</option>
        <option value="gain_slow">Subir lento</option>
        <option value="gain_fast">Subir rapido</option>
      </SelectField>
      <SelectField label="Actividad semanal" value={form.activity} onChange={(event) => setForm({ ...form, activity: event.target.value as ProfileTargetsInput["activity"] })}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </SelectField>
      <section className="rounded-2xl bg-[#f4faf6] p-4">
        <p className="text-sm font-semibold text-[#587064]">Objetivo sugerido</p>
        <div className="mt-2 text-3xl font-semibold">{targets.kcal} kcal</div>
        <p className="mt-2 text-sm text-[#6d7d74]">
          {targets.protein} g proteina · {targets.carbs} g carbs · {targets.fat} g grasas
        </p>
      </section>
      {message ? <p className="rounded-xl bg-[#fff9eb] p-3 text-sm font-medium text-[#8b6415]">{message}</p> : null}
      <Button onClick={submit} icon={<Check className="h-4 w-4" />}>
        Continuar
      </Button>
    </div>
  );
}
