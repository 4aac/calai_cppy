import { PhotoAnalyzer } from "@/components/app/photo-analyzer";
import { MobileShell } from "@/components/app/mobile-shell";
import { protectPage } from "@/lib/supabase/page-auth";

export default async function PhotoPage() {
  await protectPage();

  return (
    <MobileShell>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold text-[#6c7d72]">Foto</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Resultado</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">
            La IA estima alimentos y gramos; los macros se calculan con base nutricional.
          </p>
        </header>
        <PhotoAnalyzer />
      </div>
    </MobileShell>
  );
}
