export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  categoryId: string;
  merchant: string;
  date: string;
  notes: string;
  receiptImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  weekStartDate: string;
  totalSpend: number;
  topCategoryId: string;
  coachTipText: string;
  generatedAt: string;
}

export interface UserSettings {
  currency: string;
  weeklyBudget: number | null;
  alertsEnabled: boolean;
}

export interface SpendingSummary {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  topCategory: Category | null;
  categoryBreakdown: { category: Category; amount: number; percentage: number }[];
}
