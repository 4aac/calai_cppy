import { FoodSearch } from "@/components/app/food-search";
import { MobileShell } from "@/components/app/mobile-shell";
import { protectPage } from "@/lib/supabase/page-auth";

export default async function SearchPage() {
  await protectPage();

  return (
    <MobileShell>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold text-[#6c7d72]">Buscar</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Alimento</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">
            Busca una base comun, ajusta gramos y guarda.
          </p>
        </header>
        <FoodSearch />
      </div>
    </MobileShell>
  );
}
