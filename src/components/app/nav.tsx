"use client";

import { Barcode, Home, Plus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/ui";

const items = [
  { href: "/", label: "Hoy", icon: Home },
  { href: "/add", label: "Anadir", icon: Plus },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/add/code", label: "Codigo", icon: Barcode },
  { href: "/onboarding", label: "Perfil", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-[#e6ede8] bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "grid justify-items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold text-[#718078] transition",
              active && "bg-[#edf8f1] text-[#1f9d62]",
            )}
          >
            <Icon aria-hidden className="h-5 w-5" strokeWidth={2.2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
