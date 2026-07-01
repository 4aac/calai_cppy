"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    setPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "No se pudo iniciar sesion");
      return;
    }

    router.push(mode === "signup" ? "/onboarding" : "/");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <Field label="Email" name="email" type="email" placeholder="tu@email.com" required />
      <Field label="Contrasena" name="password" type="password" placeholder="Minimo 6 caracteres" required />
      {error ? <p className="rounded-xl bg-[#fff2ef] px-4 py-3 text-sm font-medium text-[#b23620]">{error}</p> : null}
      <Button disabled={pending} icon={mode === "login" ? <Lock className="h-4 w-4" /> : <Mail className="h-4 w-4" />}>
        {pending ? "Procesando" : mode === "login" ? "Entrar" : "Crear cuenta"}
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="h-11 text-sm font-semibold text-[#1f9d62]"
      >
        {mode === "login" ? "Crear cuenta nueva" : "Ya tengo cuenta"}
      </button>
    </form>
  );
}
