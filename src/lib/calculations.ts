import { Category, Expense, SpendingSummary } from "@/types/expense";
import { startOfDay, startOfWeek, startOfMonth, isWithinInterval, subWeeks, parseISO } from "date-fns";

export function calculateSummary(
  expenses: Expense[],
  categories: Category[]
): SpendingSummary {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const monthStart = startOfMonth(now);

  let todayTotal = 0;
  let weekTotal = 0;
  let monthTotal = 0;
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((expense) => {
    const expenseDate = parseISO(expense.date);
    const amount = expense.amount;

    // This month
    if (isWithinInterval(expenseDate, { start: monthStart, end: now })) {
      monthTotal += amount;
      categoryTotals[expense.categoryId] = (categoryTotals[expense.categoryId] || 0) + amount;

      // This week
      if (isWithinInterval(expenseDate, { start: weekStart, end: now })) {
        weekTotal += amount;

        // Today
        if (isWithinInterval(expenseDate, { start: todayStart, end: now })) {
          todayTotal += amount;
        }
      }
    }
  });

  // Find top category
  let topCategoryId: string | null = null;
  let topAmount = 0;
  Object.entries(categoryTotals).forEach(([id, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCategoryId = id;
    }
  });

  const topCategory = topCategoryId ? categories.find((c) => c.id === topCategoryId) || null : null;

  // Category breakdown
  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([id, amount]) => {
      const category = categories.find((c) => c.id === id);
      return category
        ? {
            category,
            amount,
            percentage: monthTotal > 0 ? (amount / monthTotal) * 100 : 0,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.amount - a!.amount) as SpendingSummary["categoryBreakdown"];

  return {
    todayTotal,
    weekTotal,
    monthTotal,
    topCategory,
    categoryBreakdown,
  };
}

export function getWeeklyComparison(expenses: Expense[]): {
  currentWeek: number;
  lastWeek: number;
  percentChange: number;
} {
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(currentWeekStart, 1);
  const lastWeekEnd = currentWeekStart;

  let currentWeek = 0;
  let lastWeek = 0;

  expenses.forEach((expense) => {
    const expenseDate = parseISO(expense.date);
    
    if (isWithinInterval(expenseDate, { start: currentWeekStart, end: now })) {
      currentWeek += expense.amount;
    } else if (isWithinInterval(expenseDate, { start: lastWeekStart, end: lastWeekEnd })) {
      lastWeek += expense.amount;
    }
  });

  const percentChange = lastWeek > 0 ? ((currentWeek - lastWeek) / lastWeek) * 100 : 0;

  return { currentWeek, lastWeek, percentChange };
}

export function generateCoachTip(
  expenses: Expense[],
  categories: Category[],
  summary: SpendingSummary
): string {
  const comparison = getWeeklyComparison(expenses);
  
  // No expenses yet
  if (expenses.length === 0) {
    return "Welcome! Start tracking your expenses to get personalized insights. Even small wins add up! 🌱";
  }

  // Spending increased significantly
  if (comparison.percentChange > 20) {
    const topCategory = summary.topCategory;
    if (topCategory) {
      return `Your spending is up ${Math.round(comparison.percentChange)}% this week. Try a 2-day challenge: skip ${topCategory.name.toLowerCase()} and watch the savings grow! 💪`;
    }
    return `Spending jumped ${Math.round(comparison.percentChange)}% this week. Pick one category to pause for 2 days — small breaks = big savings! 💪`;
  }

  // Spending decreased
  if (comparison.percentChange < -10) {
    return `Amazing! You've cut spending by ${Math.abs(Math.round(comparison.percentChange))}% compared to last week. Keep that momentum going! 🎉`;
  }

  // One category dominates (>40% of total)
  if (summary.categoryBreakdown[0]?.percentage > 40) {
    const dominantCategory = summary.categoryBreakdown[0].category;
    return `${dominantCategory.icon} ${dominantCategory.name} is ${Math.round(summary.categoryBreakdown[0].percentage)}% of your spending. Try finding one cheaper alternative this week!`;
  }

  // Stable spending
  if (Math.abs(comparison.percentChange) <= 10) {
    return "Your spending is steady — that's consistency! Now pick one small expense to optimize this week. Every dollar counts! ✨";
  }

  // Default tip
  return "You're building great tracking habits! Review your top category and find one small way to save this week. 🌟";
}
