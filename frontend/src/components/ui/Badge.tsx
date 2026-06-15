import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "draft";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  warning:
    "bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
  danger:
    "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
  draft:
    "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-700/40 dark:text-slate-300 dark:ring-slate-400/20",
};

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = "draft", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
