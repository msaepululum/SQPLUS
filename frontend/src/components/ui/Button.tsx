import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "filter"
  | "ghost"
  | "danger";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-sq-blue text-white hover:bg-blue-700 border border-transparent",
  secondary:
    "border border-sq-border bg-white text-sq-blue hover:bg-sq-soft dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700",
  filter:
    "border border-sq-border bg-white text-sq-dark hover:bg-sq-soft dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  ghost:
    "border border-transparent bg-transparent text-sq-slate hover:bg-sq-soft dark:text-slate-400 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  block?: boolean;
};

export function Button({
  variant = "primary",
  icon: Icon,
  iconRight: IconRight,
  block = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sq-blue/40 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_STYLES[variant],
        block && "w-full",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
      {children}
      {IconRight && <IconRight className="h-4 w-4 shrink-0" strokeWidth={2} />}
    </button>
  );
}
