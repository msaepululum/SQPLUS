import { cn } from "@/lib/cn";
import { Inbox, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-sq-border bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sq-soft text-sq-slate dark:bg-slate-800 dark:text-slate-400">
        <Icon className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-sq-dark dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-sq-slate">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
