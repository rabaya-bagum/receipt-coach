import { cn } from "@/lib/utils";

interface AmountDisplayProps {
  amount: number;
  currency: string;
  label: string;
  size?: "sm" | "md" | "lg";
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function AmountDisplay({
  amount,
  currency,
  label,
  size = "md",
  trend,
  className,
}: AmountDisplayProps) {
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-muted-foreground text-xs uppercase tracking-wide font-medium">
        {label}
      </span>
      <span
        className={cn(
          "font-display font-bold tabular-nums",
          size === "sm" && "text-lg",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl",
          trend === "up" && "text-destructive",
          trend === "down" && "text-success"
        )}
      >
        {formatted}
      </span>
    </div>
  );
}
