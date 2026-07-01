import { AccountPanel } from "@/components/app/account-panel";
import { MobileShell } from "@/components/app/mobile-shell";
import { OnboardingForm } from "@/components/app/onboarding-form";
import { protectPage } from "@/lib/supabase/page-auth";

export default async function OnboardingPage() {
  const user = await protectPage();

  return (
    <MobileShell>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold text-[#6c7d72]">Perfil</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">Objetivo</h1>
          <p className="mt-3 text-base leading-7 text-[#66766d]">
            Ajusta lo minimo para calcular calorias y macros diarios.
          </p>
        </header>
        <AccountPanel email={user?.email} />
        <OnboardingForm />
      </div>
    </MobileShell>
  );
}
