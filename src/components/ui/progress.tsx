import { cn } from "@/lib/ui";

interface ProgressProps {
  value: number;
  max: number;
  className?: string;
}

export function Progress({ value, max, className }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("h-2 rounded-full bg-[#e9f0ec]", className)}>
      <div
        className="h-full rounded-full bg-[#1f9d62] transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
