import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: LucideIcon;
  rightSlot?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon: Icon, rightSlot, className, ...props },
  ref
) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-sq-slate" strokeWidth={2} />
      )}
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-lg border border-sq-border bg-white text-sm text-sq-dark placeholder:text-sq-slate/70 focus:border-sq-blue focus:outline-none focus:ring-2 focus:ring-sq-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
          Icon ? "pl-9" : "pl-3",
          rightSlot ? "pr-16" : "pr-3",
          className
        )}
        {...props}
      />
      {rightSlot && (
        <div className="absolute right-2 flex items-center">{rightSlot}</div>
      )}
    </div>
  );
});
