import { cn } from "@/lib/cn";

type CardGridProps = {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6;
};

const GRID_COLS: Record<NonNullable<CardGridProps["cols"]>, string> = {
  1: "grid grid-cols-1 gap-4",
  2: "grid grid-cols-1 gap-4 sm:grid-cols-2",
  3: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  6: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

export function CardGrid({ children, className, cols = 4 }: CardGridProps) {
  return <div className={cn(GRID_COLS[cols], className)}>{children}</div>;
}
