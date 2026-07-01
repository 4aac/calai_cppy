import { Barcode, Camera, Edit3, Search } from "lucide-react";

import { MobileShell } from "@/components/app/mobile-shell";
import { ButtonLink } from "@/components/ui/button";
import { protectPage } from "@/lib/supabase/page-auth";

const actions = [
  {
    href: "/add/photo",
    label: "Foto",
    description: "Detecta alimentos y edita gramos",
    icon: Camera,
  },
  {
    href: "/add/code",
    label: "Codigo",
    description: "Busca producto por EAN o QR",
    icon: Barcode,
  },
  {
    href: "/search",
    label: "Buscar",
    description: "Alimento comun o favorito",
    icon: Search,
  },
  {
    href: "/search?manual=1",
    label: "Manual",
    description: "Introduce valores de etiqueta",
    icon: Edit3,
  },
];

export default async function AddPage() {
  await protectPage();

  return (
    <MobileShell>
      <div className="grid gap-7">
        <header>
          <p className="text-sm font-semibold text-[#6c7d72]">Anadir comida</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Metodo</h1>
        </header>

        <section className="grid gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <ButtonLink key={action.href} href={action.href} variant="secondary" className="h-auto justify-start gap-4 p-4">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf8f1] text-[#1f9d62]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-left">
                  <span className="block text-base font-semibold">{action.label}</span>
                  <span className="mt-1 block text-sm font-medium text-[#718078]">{action.description}</span>
                </span>
              </ButtonLink>
            );
          })}
        </section>
      </div>
    </MobileShell>
  );
}
