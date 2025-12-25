import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseCard } from "@/components/expense/ExpenseCard";
import { AmountDisplay } from "@/components/expense/AmountDisplay";
import { CoachTipCard } from "@/components/expense/CoachTipCard";
import { Category, Expense, SpendingSummary } from "@/types/expense";
import { getExpenses, getCategories, getSettings } from "@/lib/storage";
import { calculateSummary, generateCoachTip, getWeeklyComparison } from "@/lib/calculations";

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [coachTip, setCoachTip] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [weeklyComparison, setWeeklyComparison] = useState({ percentChange: 0 });

  useEffect(() => {
    const loadData = () => {
      const loadedExpenses = getExpenses();
      const loadedCategories = getCategories();
      const settings = getSettings();
      
      setExpenses(loadedExpenses);
      setCategories(loadedCategories);
      setCurrency(settings.currency);
      
      const calculatedSummary = calculateSummary(loadedExpenses, loadedCategories);
      setSummary(calculatedSummary);
      setCoachTip(generateCoachTip(loadedExpenses, loadedCategories, calculatedSummary));
      setWeeklyComparison(getWeeklyComparison(loadedExpenses));
    };

    loadData();
  }, []);

  // Sort by date descending and take last 5
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const isEmpty = expenses.length === 0;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Receipt Coach
        </h1>
        <p className="text-muted-foreground text-sm">
          Track smarter, spend wiser
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 stagger-children">
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <AmountDisplay
            amount={summary?.todayTotal || 0}
            currency={currency}
            label="Today"
            size="md"
          />
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex items-start justify-between">
            <AmountDisplay
              amount={summary?.weekTotal || 0}
              currency={currency}
              label="This Week"
              size="md"
            />
            {weeklyComparison.percentChange !== 0 && (
              <div className={`flex items-center gap-0.5 text-xs font-medium ${
                weeklyComparison.percentChange > 0 ? "text-destructive" : "text-success"
              }`}>
                {weeklyComparison.percentChange > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(weeklyComparison.percentChange).toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Category */}
      {summary?.topCategory && (
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
            <span className="text-lg">{summary.topCategory.icon}</span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Top category this week</p>
              <p className="font-medium text-foreground text-sm">{summary.topCategory.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Coach Tip */}
      <div className="mb-6 animate-slide-up">
        <CoachTipCard tip={coachTip} />
      </div>

      {/* Quick Add Button */}
      <Link to="/add" className="block mb-6">
        <Button variant="gradient" size="lg" className="w-full">
          <Plus className="w-5 h-5" />
          Add Expense
        </Button>
      </Link>

      {/* Recent Expenses */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-foreground">
            Recent Expenses
          </h2>
          {!isEmpty && (
            <Link
              to="/history"
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {isEmpty ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-card">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No expenses yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first expense to start tracking!
            </p>
            <Link to="/add">
              <Button variant="soft" size="sm">
                <Plus className="w-4 h-4" />
                Add First Expense
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2 stagger-children">
            {recentExpenses.map((expense) => (
              <Link key={expense.id} to={`/history?edit=${expense.id}`}>
                <ExpenseCard
                  expense={expense}
                  category={categories.find((c) => c.id === expense.categoryId)}
                  currency={currency}
                  compact
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
