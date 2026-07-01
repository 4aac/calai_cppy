import type { ComponentProps } from "react";

import { cn } from "@/lib/ui";

interface FieldProps extends ComponentProps<"input"> {
  label: string;
}

export function Field({ label, className, ...props }: FieldProps) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-[#53645b]">
      {label}
      <input
        className={cn(
          "h-12 w-full min-w-0 rounded-xl border border-[#dfe7e2] bg-white px-4 text-[16px] font-medium text-[#15211a] outline-none transition placeholder:text-[#9ca9a1] focus:border-[#1f9d62] focus:ring-4 focus:ring-[#1f9d62]/10",
          className,
        )}
        {...props}
      />
    </label>
  );
}

interface SelectFieldProps extends ComponentProps<"select"> {
  label: string;
}

export function SelectField({ label, className, children, ...props }: SelectFieldProps) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium text-[#53645b]">
      {label}
      <select
        className={cn(
          "h-12 w-full min-w-0 rounded-xl border border-[#dfe7e2] bg-white px-4 text-[16px] font-medium text-[#15211a] outline-none transition focus:border-[#1f9d62] focus:ring-4 focus:ring-[#1f9d62]/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
