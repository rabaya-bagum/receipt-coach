import { Sparkles } from "lucide-react";

interface CoachTipCardProps {
  tip: string;
}

export function CoachTipCard({ tip }: CoachTipCardProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-card rounded-2xl p-5 shadow-card border border-primary/10">
      {/* Decorative background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
      
      <div className="relative flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-card">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground mb-1">
            Weekly Coach Tip
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
