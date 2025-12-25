import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExpenseCard } from "@/components/expense/ExpenseCard";
import { CategoryBadge } from "@/components/expense/CategoryBadge";
import { Category, Expense } from "@/types/expense";
import { getExpenses, getCategories, getSettings, saveExpense, deleteExpense } from "@/lib/storage";
import { parseISO, isWithinInterval, startOfWeek, startOfMonth, subMonths } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DateFilter = "week" | "month" | "all";

export default function History() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState(getSettings());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editMerchant, setEditMerchant] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      const expense = expenses.find((e) => e.id === editId);
      if (expense) {
        openEditDialog(expense);
      }
      setSearchParams({});
    }
  }, [expenses, searchParams]);

  const loadData = () => {
    setExpenses(getExpenses());
    setCategories(getCategories());
    setSettings(getSettings());
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditCategoryId(expense.categoryId);
    setEditMerchant(expense.merchant);
    setEditNotes(expense.notes);
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;
    
    const parsedAmount = parseFloat(editAmount);
    if (!parsedAmount || parsedAmount <= 0 || !editCategoryId) {
      toast.error("Please enter valid amount and category");
      return;
    }

    const updatedExpense: Expense = {
      ...editingExpense,
      amount: parsedAmount,
      categoryId: editCategoryId,
      merchant: editMerchant,
      notes: editNotes,
      updatedAt: new Date().toISOString(),
    };

    saveExpense(updatedExpense);
    toast.success("Expense updated");
    setEditingExpense(null);
    loadData();
  };

  const handleDelete = () => {
    if (!editingExpense) return;
    
    deleteExpense(editingExpense.id);
    toast.success("Expense deleted");
    setEditingExpense(null);
    loadData();
  };

  // Filter expenses
  const filteredExpenses = expenses
    .filter((expense) => {
      const expenseDate = parseISO(expense.date);
      const now = new Date();

      // Date filter
      if (dateFilter === "week") {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        if (!isWithinInterval(expenseDate, { start: weekStart, end: now })) {
          return false;
        }
      } else if (dateFilter === "month") {
        const monthStart = startOfMonth(now);
        if (!isWithinInterval(expenseDate, { start: monthStart, end: now })) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter && expense.categoryId !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const category = categories.find((c) => c.id === expense.categoryId);
        const matchesMerchant = expense.merchant.toLowerCase().includes(query);
        const matchesCategory = category?.name.toLowerCase().includes(query);
        const matchesNotes = expense.notes.toLowerCase().includes(query);
        if (!matchesMerchant && !matchesCategory && !matchesNotes) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">
          History
        </h1>
        <p className="text-sm text-muted-foreground">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
        </p>
      </header>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 mb-6 p-4 bg-card rounded-xl shadow-card animate-scale-in">
          {/* Date Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Time Period
            </label>
            <div className="flex gap-2">
              {[
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "all", label: "All Time" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setDateFilter(value as DateFilter)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                    dateFilter === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  !categoryFilter
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <CategoryBadge
                  key={category.id}
                  category={category}
                  selected={categoryFilter === category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">No expenses found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              category={categories.find((c) => c.id === expense.categoryId)}
              currency={settings.currency}
              onClick={() => openEditDialog(expense)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Amount
              </label>
              <Input
                type="number"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="text-lg font-bold"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <CategoryBadge
                    key={category.id}
                    category={category}
                    selected={editCategoryId === category.id}
                    onClick={() => setEditCategoryId(category.id)}
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Merchant
              </label>
              <Input
                type="text"
                value={editMerchant}
                onChange={(e) => setEditMerchant(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Notes
              </label>
              <Input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleSaveEdit}
              >
                <Check className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
