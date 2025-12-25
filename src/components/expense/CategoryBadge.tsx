import { Category } from "@/types/expense";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function CategoryBadge({
  category,
  selected = false,
  onClick,
  size = "md",
}: CategoryBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl transition-all duration-200 tap-highlight-none",
        size === "sm" && "px-2.5 py-1.5 text-xs",
        size === "md" && "px-3 py-2 text-sm",
        size === "lg" && "px-4 py-2.5 text-base",
        selected
          ? "bg-primary text-primary-foreground shadow-card"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
      style={
        selected
          ? { backgroundColor: category.color }
          : { backgroundColor: `${category.color}15` }
      }
    >
      <span>{category.icon}</span>
      <span className="font-medium">{category.name}</span>
    </button>
  );
}
