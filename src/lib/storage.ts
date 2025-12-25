import { Category, Expense, UserSettings } from "@/types/expense";
import { defaultCategories } from "./defaultCategories";

const STORAGE_KEYS = {
  EXPENSES: "receipt_coach_expenses",
  CATEGORIES: "receipt_coach_categories",
  SETTINGS: "receipt_coach_settings",
};

// Expenses
export function getExpenses(): Expense[] {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return data ? JSON.parse(data) : [];
}

export function saveExpense(expense: Expense): void {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex((e) => e.id === expense.id);
  
  if (existingIndex >= 0) {
    expenses[existingIndex] = { ...expense, updatedAt: new Date().toISOString() };
  } else {
    expenses.push(expense);
  }
  
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

// Categories
export function getCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (data) {
    return JSON.parse(data);
  }
  // Initialize with defaults
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  return defaultCategories;
}

export function saveCategory(category: Category): void {
  const categories = getCategories();
  const existingIndex = categories.findIndex((c) => c.id === category.id);
  
  if (existingIndex >= 0) {
    categories[existingIndex] = category;
  } else {
    categories.push(category);
  }
  
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function deleteCategory(id: string): void {
  const categories = getCategories().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

// Settings
export function getSettings(): UserSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) {
    return JSON.parse(data);
  }
  const defaults: UserSettings = {
    currency: "CAD",
    weeklyBudget: null,
    alertsEnabled: false,
  };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaults));
  return defaults;
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Export to CSV
export function exportToCSV(): string {
  const expenses = getExpenses();
  const categories = getCategories();
  
  const headers = ["Date", "Merchant", "Category", "Amount", "Currency", "Notes"];
  const rows = expenses.map((e) => {
    const category = categories.find((c) => c.id === e.categoryId);
    return [
      e.date,
      e.merchant,
      category?.name || "Unknown",
      e.amount.toString(),
      e.currency,
      e.notes,
    ].map((val) => `"${val.replace(/"/g, '""')}"`).join(",");
  });
  
  return [headers.join(","), ...rows].join("\n");
}
