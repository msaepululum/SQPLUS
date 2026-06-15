import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1 text-xs text-sq-slate", className)}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1">
            {item.href && !last ? (
              <Link href={item.href} className="hover:text-sq-blue">
                {item.label}
              </Link>
            ) : (
              <span className={cn(last && "font-medium text-sq-dark dark:text-slate-200")}>
                {item.label}
              </span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 text-sq-slate/60" strokeWidth={2} />}
          </span>
        );
      })}
    </nav>
  );
}
