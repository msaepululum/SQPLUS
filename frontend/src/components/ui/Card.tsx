import { cn } from "@/lib/cn";

export const CARD_BASE =
  "w-full min-w-0 rounded-2xl border bg-white dark:bg-slate-900";
export const CARD_PADDING = "p-4 sm:p-5";
export const CARD_SHADOW =
  "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]";
export const CARD_HOVER =
  "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.08)]";

export type CardVariant = "default" | "elevated" | "interactive" | "dashed" | "flat";

const VARIANT_STYLES: Record<CardVariant, string> = {
  default: cn("border-slate-200/80 dark:border-slate-800", CARD_SHADOW),
  elevated: cn("border-slate-200/80 dark:border-slate-800", CARD_SHADOW, CARD_HOVER),
  interactive: cn(
    "border-slate-200/80 dark:border-slate-800",
    CARD_SHADOW,
    "cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_4px_12px_rgba(14,165,233,0.08),0_16px_40px_rgba(15,23,42,0.08)] dark:hover:border-sky-900"
  ),
  dashed: "border-dashed border-slate-300 shadow-sm dark:border-slate-700",
  flat: "border-slate-200 shadow-sm dark:border-slate-800",
};

type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  variant?: CardVariant;
  padding?: boolean;
};

export function cardClassName({
  variant = "default",
  padding = true,
  className,
}: {
  variant?: CardVariant;
  padding?: boolean;
  className?: string;
}) {
  return cn(CARD_BASE, padding && CARD_PADDING, VARIANT_STYLES[variant], className);
}

export function Card({
  variant = "default",
  padding = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cardClassName({ variant, padding, className })} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn("text-sm font-semibold text-slate-900 dark:text-slate-100", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-xs text-slate-500 dark:text-slate-400 sm:text-[0.8125rem]", className)}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  scrollable = false,
  children,
}: {
  className?: string;
  scrollable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(scrollable && "overflow-x-auto", className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:mt-4 sm:pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
