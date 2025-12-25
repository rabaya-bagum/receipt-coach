import { Category, Expense } from "@/types/expense";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ExpenseCardProps {
  expense: Expense;
  category: Category | undefined;
  currency: string;
  onClick?: () => void;
  compact?: boolean;
}

export function ExpenseCard({
  expense,
  category,
  currency,
  onClick,
  compact = false,
}: ExpenseCardProps) {
  const formattedAmount = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(expense.amount);

  const formattedDate = format(parseISO(expense.date), compact ? "MMM d" : "MMM d, yyyy");

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 bg-card rounded-xl shadow-card transition-all duration-200 hover:shadow-card-hover tap-highlight-none active:scale-[0.99] text-left",
        compact && "p-3"
      )}
    >
      {/* Category Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl text-xl",
          compact ? "w-10 h-10" : "w-12 h-12"
        )}
        style={{ backgroundColor: `${category?.color}20` }}
      >
        {category?.icon || "📦"}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-foreground truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {expense.merchant || category?.name || "Expense"}
        </p>
        <p className="text-xs text-muted-foreground">
          {category?.name} • {formattedDate}
        </p>
      </div>

      {/* Amount */}
      <p className={cn(
        "font-semibold text-foreground tabular-nums",
        compact ? "text-sm" : "text-base"
      )}>
        {formattedAmount}
      </p>
    </button>
  );
}
