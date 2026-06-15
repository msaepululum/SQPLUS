import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <div className="relative inline-flex w-full items-center">
      <select
        ref={ref}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-sq-border bg-white pl-3 pr-8 text-xs font-medium text-sq-dark focus:border-sq-blue focus:outline-none focus:ring-2 focus:ring-sq-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-sq-slate" strokeWidth={2} />
    </div>
  );
});
