import type { ReactNode } from "react";

import { BottomNav } from "@/components/app/nav";

interface MobileShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MobileShell({ children, showNav = true }: MobileShellProps) {
  return (
    <div className="min-h-dvh bg-[#f5f7f4] text-[#142019]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-[0_0_40px_rgba(15,37,26,0.08)]">
        <main className="flex-1 px-5 pb-24 pt-5">{children}</main>
        {showNav ? <BottomNav /> : null}
      </div>
    </div>
  );
}
