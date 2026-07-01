import { DailyDashboard } from "@/components/app/daily-dashboard";
import { MobileShell } from "@/components/app/mobile-shell";
import { protectPage } from "@/lib/supabase/page-auth";

export default async function HomePage() {
  await protectPage();

  return (
    <MobileShell>
      <DailyDashboard />
    </MobileShell>
  );
}
