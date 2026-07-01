import { DailyDashboard } from "@/components/app/daily-dashboard";
import { MobileShell } from "@/components/app/mobile-shell";

export default function HomePage() {
  return (
    <MobileShell>
      <DailyDashboard />
    </MobileShell>
  );
}
