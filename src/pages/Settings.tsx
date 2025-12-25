import { useState, useEffect } from "react";
import { Save, Download, Plus, Trash2, Bell, DollarSign, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Category, UserSettings } from "@/types/expense";
import { getCategories, saveCategory, deleteCategory, getSettings, saveSettings, exportToCSV } from "@/lib/storage";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMOJI_OPTIONS = ["🍽️", "🛒", "🚗", "🛍️", "🎬", "💊", "📄", "☕", "📱", "📦", "✈️", "🏠", "💼", "🎮", "📚", "🎵", "🏋️", "💇", "🐕", "🎁"];
const COLOR_OPTIONS = [
  "hsl(12, 80%, 62%)",
  "hsl(152, 60%, 45%)",
  "hsl(220, 60%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(340, 65%, 55%)",
  "hsl(168, 55%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(25, 70%, 45%)",
  "hsl(260, 55%, 50%)",
  "hsl(220, 10%, 50%)",
];

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📦");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const handleSaveSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
    toast.success("Settings saved");
  };

  const handleExportCSV = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-coach-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const openNewCategory = () => {
    setIsNew(true);
    setNewCategoryName("");
    setNewCategoryIcon("📦");
    setNewCategoryColor(COLOR_OPTIONS[0]);
    setShowCategoryDialog(true);
  };

  const openEditCategory = (category: Category) => {
    setIsNew(false);
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon);
    setNewCategoryColor(category.color);
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const category: Category = {
      id: isNew ? crypto.randomUUID() : editingCategory!.id,
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      color: newCategoryColor,
    };

    saveCategory(category);
    setCategories(getCategories());
    setShowCategoryDialog(false);
    toast.success(isNew ? "Category added" : "Category updated");
  };

  const handleDeleteCategory = () => {
    if (!editingCategory) return;
    
    deleteCategory(editingCategory.id);
    setCategories(getCategories());
    setShowCategoryDialog(false);
    toast.success("Category deleted");
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your experience
        </p>
      </header>

      {/* Currency */}
      <section className="bg-card rounded-2xl p-5 shadow-card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Currency</h2>
            <p className="text-sm text-muted-foreground">Set your default currency</p>
          </div>
        </div>
        
        <select
          value={settings.currency}
          onChange={(e) => handleSaveSettings({ currency: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground"
        >
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
        </select>
      </section>

      {/* Weekly Budget */}
      <section className="bg-card rounded-2xl p-5 shadow-card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Weekly Budget</h2>
            <p className="text-sm text-muted-foreground">Set a spending goal (optional)</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="e.g., 500"
            value={settings.weeklyBudget || ""}
            onChange={(e) => handleSaveSettings({ 
              weeklyBudget: e.target.value ? parseFloat(e.target.value) : null 
            })}
          />
          {settings.weeklyBudget && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSaveSettings({ weeklyBudget: null })}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </section>

      {/* Alerts */}
      <section className="bg-card rounded-2xl p-5 shadow-card mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Budget Alerts</h2>
              <p className="text-sm text-muted-foreground">Get notified when over budget</p>
            </div>
          </div>
          
          <Switch
            checked={settings.alertsEnabled}
            onCheckedChange={(checked) => handleSaveSettings({ alertsEnabled: checked })}
          />
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card rounded-2xl p-5 shadow-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Categories</h2>
              <p className="text-sm text-muted-foreground">Manage spending categories</p>
            </div>
          </div>
          
          <Button variant="soft" size="sm" onClick={openNewCategory}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => openEditCategory(category)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </span>
              <span className="font-medium text-foreground">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-success" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Export Data</h2>
            <p className="text-sm text-muted-foreground">Download all expenses as CSV</p>
          </div>
        </div>
        
        <Button variant="outline" className="w-full" onClick={handleExportCSV}>
          <Download className="w-4 h-4" />
          Export to CSV
        </Button>
      </section>

      {/* Category Edit Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>{isNew ? "New Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Name
              </label>
              <Input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewCategoryIcon(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      newCategoryIcon === emoji
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newCategoryColor === color ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {!isNew && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleDeleteCategory}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                className={isNew ? "w-full" : "flex-1"}
                onClick={handleSaveCategory}
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
