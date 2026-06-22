"use client";

import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import {
  expenditureProgressBelanjaHref,
  type ExpenditureProgressBelanjaContext,
} from "@/constants/expenditure-progress";
import { cn } from "@/lib/cn";

type ExpenditureProgressBelanjaShortcutProps = {
  context?: ExpenditureProgressBelanjaContext;
  href?: string;
  className?: string;
  compact?: boolean;
};

export function ExpenditureProgressBelanjaShortcut({
  context = "monitoring",
  href,
  className,
  compact = false,
}: ExpenditureProgressBelanjaShortcutProps) {
  const targetHref = href ?? expenditureProgressBelanjaHref(context);

  return (
    <Link
      href={targetHref}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50 to-white px-3 py-2.5 shadow-sm transition-colors hover:border-sky-300 hover:from-sky-100/80",
        compact && "py-2",
        className
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
        <BarChart3 className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-sky-900">Dashboard Progres Belanja</span>
        <span className="mt-0.5 block text-[11px] text-slate-500">
          {compact
            ? "Lihat posisi AJU per tahap workflow"
            : "Pantau KPI proses, reject, close, dan distribusi AJU per tahap persetujuan"}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-sky-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
