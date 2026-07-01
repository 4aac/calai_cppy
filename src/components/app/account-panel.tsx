"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { hasPublicSupabaseEnv } from "@/lib/client-env";

interface AccountPanelProps {
  email?: string | null;
}

export function AccountPanel({ email }: AccountPanelProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function logout() {
    setPending(true);
    setMessage(null);

    const response = await fetch("/api/auth/logout", { method: "POST" });
    setPending(false);

    if (!response.ok) {
      setMessage("No se pudo cerrar sesion.");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  if (!hasPublicSupabaseEnv()) {
    return (
      <section className="rounded-2xl border border-[#edf1ee] p-4">
        <p className="text-sm font-semibold text-[#708078]">Sesion</p>
        <p className="mt-2 text-sm leading-6 text-[#66766d]">
          Configura Supabase en `.env` para usar una cuenta real y aislar tus datos.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-[#edf1ee] p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf8f1] text-[#1f9d62]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#708078]">Sesion privada</p>
          <p className="mt-1 truncate text-base font-semibold">{email ?? "Usuario autenticado"}</p>
          <p className="mt-1 text-sm leading-6 text-[#66766d]">
            Tus comidas, objetivos y correcciones se guardan con tu usuario de Supabase.
          </p>
        </div>
      </div>
      {message ? <p className="text-sm font-medium text-[#b23620]">{message}</p> : null}
      <Button type="button" variant="secondary" onClick={logout} disabled={pending} icon={<LogOut className="h-4 w-4" />}>
        {pending ? "Cerrando" : "Cerrar sesion"}
      </Button>
    </section>
  );
}
