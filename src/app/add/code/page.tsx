import { CodeScanner } from "@/components/app/code-scanner";
import { MobileShell } from "@/components/app/mobile-shell";
import { protectPage } from "@/lib/supabase/page-auth";

export default async function CodePage() {
  await protectPage();

  return (
    <MobileShell>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold text-[#6c7d72]">Codigo</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Producto</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">
            EAN y UPC son precisos; un QR puede contener solo texto o una URL.
          </p>
        </header>
        <CodeScanner />
      </div>
    </MobileShell>
  );
}
