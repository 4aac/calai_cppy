import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/ui";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#1f9d62] text-white shadow-[0_10px_24px_rgba(31,157,98,0.18)] hover:bg-[#198957]",
  secondary: "border border-[#dfe7e2] bg-white text-[#17231d] hover:border-[#b9d7c7]",
  ghost: "bg-transparent text-[#4f6258] hover:bg-[#f3f7f4]",
  danger: "bg-[#fff2ef] text-[#b23620] hover:bg-[#ffe7e0]",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

export function ButtonLink({
  className,
  variant = "primary",
  icon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}
