"use client";

import { useState, type FormEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { hasPublicSupabaseEnv } from "@/lib/client-env";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    if (!hasPublicSupabaseEnv()) {
      setPending(false);
      setError("Configura Supabase en .env para usar autenticacion real.");
      return;
    }

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    setPending(false);

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error ?? "No se pudo iniciar sesion");
      return;
    }

    if (mode === "signup" && payload.needsConfirmation) {
      setError("Cuenta creada. Revisa tu email para confirmar el acceso y luego inicia sesion.");
      return;
    }

    router.push(mode === "signup" ? "/onboarding" : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label="Email" name="email" type="email" placeholder="tu@email.com" required />
      <Field label="Contrasena" name="password" type="password" placeholder="Minimo 6 caracteres" required />
      {error ? <p className="rounded-xl bg-[#fff2ef] px-4 py-3 text-sm font-medium text-[#b23620]">{error}</p> : null}
      <Button
        type="submit"
        loading={pending}
        icon={mode === "login" ? <Lock className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
      >
        {pending ? "Procesando" : mode === "login" ? "Entrar" : "Crear cuenta"}
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        disabled={pending}
        className="h-11 text-sm font-semibold text-[#1f9d62]"
      >
        {mode === "login" ? "Crear cuenta nueva" : "Ya tengo cuenta"}
      </button>
    </form>
  );
}
