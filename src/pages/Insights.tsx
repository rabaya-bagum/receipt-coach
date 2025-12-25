import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { CategoryBreakdown } from "@/components/expense/CategoryBreakdown";
import { CoachTipCard } from "@/components/expense/CoachTipCard";
import { AmountDisplay } from "@/components/expense/AmountDisplay";
import { Category, Expense, SpendingSummary } from "@/types/expense";
import { getExpenses, getCategories, getSettings } from "@/lib/storage";
import { calculateSummary, generateCoachTip, getWeeklyComparison } from "@/lib/calculations";
import { cn } from "@/lib/utils";

type Period = "week" | "month";

export default function Insights() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState(getSettings());
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [coachTip, setCoachTip] = useState("");
  const [comparison, setComparison] = useState({ currentWeek: 0, lastWeek: 0, percentChange: 0 });
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    const loadedExpenses = getExpenses();
    const loadedCategories = getCategories();
    const loadedSettings = getSettings();
    
    setExpenses(loadedExpenses);
    setCategories(loadedCategories);
    setSettings(loadedSettings);
    
    const calculatedSummary = calculateSummary(loadedExpenses, loadedCategories);
    setSummary(calculatedSummary);
    setCoachTip(generateCoachTip(loadedExpenses, loadedCategories, calculatedSummary));
    setComparison(getWeeklyComparison(loadedExpenses));
  }, []);

  const trendIcon = comparison.percentChange > 5 
    ? TrendingUp 
    : comparison.percentChange < -5 
      ? TrendingDown 
      : Minus;

  const trendColor = comparison.percentChange > 5 
    ? "text-destructive" 
    : comparison.percentChange < -5 
      ? "text-success" 
      : "text-muted-foreground";

  const trendBg = comparison.percentChange > 5 
    ? "bg-destructive/10" 
    : comparison.percentChange < -5 
      ? "bg-success/10" 
      : "bg-muted";

  const displayTotal = period === "week" ? summary?.weekTotal : summary?.monthTotal;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Your spending patterns
        </p>
      </header>

      {/* Coach Tip */}
      <div className="mb-6 animate-slide-up">
        <CoachTipCard tip={coachTip} />
      </div>

      {/* Week vs Week Comparison */}
      <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
        <h3 className="font-display font-semibold text-foreground mb-4">
          Weekly Trend
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              This Week
            </p>
            <p className="text-2xl font-display font-bold text-foreground tabular-nums">
              {new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: settings.currency,
                minimumFractionDigits: 0,
              }).format(comparison.currentWeek)}
            </p>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
            trendBg
          )}>
            {(() => {
              const Icon = trendIcon;
              return <Icon className={cn("w-4 h-4", trendColor)} />;
            })()}
            <span className={cn("font-semibold text-sm", trendColor)}>
              {comparison.percentChange > 0 ? "+" : ""}
              {comparison.percentChange.toFixed(0)}%
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Last Week
            </p>
            <p className="text-lg font-medium text-muted-foreground tabular-nums">
              {new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: settings.currency,
                minimumFractionDigits: 0,
              }).format(comparison.lastWeek)}
            </p>
          </div>
        </div>

        {comparison.percentChange > 10 && (
          <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
            💡 Spending is up — review your top categories below for opportunities to cut back
          </p>
        )}
        {comparison.percentChange < -10 && (
          <p className="text-sm text-muted-foreground bg-success/10 rounded-lg p-3">
            🎉 Great progress! Keep the momentum going this week
          </p>
        )}
      </div>

      {/* Budget Status (if set) */}
      {settings.weeklyBudget && (
        <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground">
              Weekly Budget
            </h3>
          </div>
          
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-display font-bold text-foreground tabular-nums">
              {new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: settings.currency,
                minimumFractionDigits: 0,
              }).format(summary?.weekTotal || 0)}
            </span>
            <span className="text-muted-foreground text-sm">
              of {new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: settings.currency,
                minimumFractionDigits: 0,
              }).format(settings.weeklyBudget)}
            </span>
          </div>
          
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                (summary?.weekTotal || 0) > settings.weeklyBudget
                  ? "bg-destructive"
                  : "bg-gradient-primary"
              )}
              style={{
                width: `${Math.min(100, ((summary?.weekTotal || 0) / settings.weeklyBudget) * 100)}%`,
              }}
            />
          </div>
          
          {(summary?.weekTotal || 0) > settings.weeklyBudget && (
            <p className="text-sm text-destructive mt-2">
              Over budget by {new Intl.NumberFormat("en-CA", {
                style: "currency",
                currency: settings.currency,
                minimumFractionDigits: 0,
              }).format((summary?.weekTotal || 0) - settings.weeklyBudget)}
            </p>
          )}
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">
            Where Money Goes
          </h3>
          
          <div className="flex gap-1 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setPeriod("week")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                period === "week"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                period === "month"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Month
            </button>
          </div>
        </div>

        <div className="mb-4">
          <AmountDisplay
            amount={displayTotal || 0}
            currency={settings.currency}
            label={period === "week" ? "This Week" : "This Month"}
            size="lg"
          />
        </div>

        <CategoryBreakdown
          breakdown={summary?.categoryBreakdown || []}
          currency={settings.currency}
        />
      </div>
    </div>
  );
}
