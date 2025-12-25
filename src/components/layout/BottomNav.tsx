import { Home, PlusCircle, Clock, Lightbulb, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/add", icon: PlusCircle, label: "Add", isMain: true },
  { to: "/insights", icon: Lightbulb, label: "Insights" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label, isMain }) => {
          const isActive = location.pathname === to;
          
          if (isMain) {
            return (
              <NavLink
                key={to}
                to={to}
                className="relative -mt-6 tap-highlight-none"
              >
                <div className={cn(
                  "flex items-center justify-center w-14 h-14 rounded-full bg-gradient-primary shadow-md transition-all duration-200",
                  isActive && "shadow-glow scale-110"
                )}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 tap-highlight-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
