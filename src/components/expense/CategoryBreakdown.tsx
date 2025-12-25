import { SpendingSummary } from "@/types/expense";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  breakdown: SpendingSummary["categoryBreakdown"];
  currency: string;
  limit?: number;
}

export function CategoryBreakdown({
  breakdown,
  currency,
  limit,
}: CategoryBreakdownProps) {
  const items = limit ? breakdown.slice(0, limit) : breakdown;

  if (items.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4 text-sm">
        No spending data yet
      </p>
    );
  }

  const maxAmount = Math.max(...items.map((item) => item.amount));

  return (
    <div className="space-y-3">
      {items.map(({ category, amount, percentage }) => {
        const formatted = new Intl.NumberFormat("en-CA", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);

        const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

        return (
          <div key={category.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base">{category.icon}</span>
                <span className="font-medium text-foreground">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {percentage.toFixed(0)}%
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatted}
                </span>
              </div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out"
                )}
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
