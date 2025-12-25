import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Receipt, X, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryBadge } from "@/components/expense/CategoryBadge";
import { Category, Expense } from "@/types/expense";
import { getCategories, getSettings, saveExpense } from "@/lib/storage";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "quick" | "receipt";

export default function AddExpense() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<Mode>("quick");
  const [categories] = useState<Category[]>(getCategories());
  const [settings] = useState(getSettings());
  
  // Form state
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parsedAmount,
      currency: settings.currency,
      categoryId: selectedCategoryId,
      merchant: merchant.trim(),
      date,
      notes: notes.trim(),
      receiptImageUrl: receiptImage || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      saveExpense(expense);
      toast.success("Expense added!", {
        description: `${new Intl.NumberFormat("en-CA", {
          style: "currency",
          currency: settings.currency,
        }).format(parsedAmount)} in ${categories.find(c => c.id === selectedCategoryId)?.name}`,
      });
      navigate("/");
    } catch (error) {
      toast.error("Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = parseFloat(amount) > 0 && selectedCategoryId;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-foreground">
          Add Expense
        </h1>
        <Button variant="ghost" size="iconSm" onClick={() => navigate(-1)}>
          <X className="w-5 h-5" />
        </Button>
      </header>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
        <button
          onClick={() => setMode("quick")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            mode === "quick"
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground"
          )}
        >
          <Receipt className="w-4 h-4" />
          Quick Entry
        </button>
        <button
          onClick={() => setMode("receipt")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            mode === "receipt"
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground"
          )}
        >
          <Camera className="w-4 h-4" />
          Receipt Upload
        </button>
      </div>

      {/* Receipt Upload Section */}
      {mode === "receipt" && (
        <div className="mb-6 animate-fade-in">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {receiptImage ? (
            <div className="relative rounded-2xl overflow-hidden bg-secondary">
              <img
                src={receiptImage}
                alt="Receipt"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setReceiptImage(null)}
                className="absolute top-2 right-2 p-2 bg-card/90 backdrop-blur-sm rounded-full shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl bg-secondary/30 transition-colors hover:bg-secondary/50"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Upload Receipt</p>
                <p className="text-xs text-muted-foreground">Tap to take a photo or choose from gallery</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Amount *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $
          </span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-8 text-2xl font-display font-bold h-14"
            autoFocus={mode === "quick"}
          />
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Category *
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <CategoryBadge
              key={category.id}
              category={category}
              selected={selectedCategoryId === category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Merchant Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Merchant (optional)
        </label>
        <Input
          type="text"
          placeholder="e.g., Starbucks, Amazon"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
        />
      </div>

      {/* Date Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-11"
          />
        </div>
      </div>

      {/* Notes Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Notes (optional)
        </label>
        <Input
          type="text"
          placeholder="Add a note..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Submit Button */}
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={!canSubmit || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          "Saving..."
        ) : (
          <>
            <Check className="w-5 h-5" />
            Save Expense
          </>
        )}
      </Button>
    </div>
  );
}
