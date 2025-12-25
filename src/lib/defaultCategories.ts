import { Category } from "@/types/expense";

export const defaultCategories: Category[] = [
  { id: "food", name: "Food & Dining", icon: "🍽️", color: "hsl(12, 80%, 62%)" },
  { id: "groceries", name: "Groceries", icon: "🛒", color: "hsl(152, 60%, 45%)" },
  { id: "transport", name: "Transport", icon: "🚗", color: "hsl(220, 60%, 55%)" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "hsl(280, 60%, 55%)" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "hsl(340, 65%, 55%)" },
  { id: "health", name: "Health", icon: "💊", color: "hsl(168, 55%, 42%)" },
  { id: "bills", name: "Bills & Utilities", icon: "📄", color: "hsl(38, 92%, 50%)" },
  { id: "coffee", name: "Coffee & Drinks", icon: "☕", color: "hsl(25, 70%, 45%)" },
  { id: "subscriptions", name: "Subscriptions", icon: "📱", color: "hsl(260, 55%, 50%)" },
  { id: "other", name: "Other", icon: "📦", color: "hsl(220, 10%, 50%)" },
];
