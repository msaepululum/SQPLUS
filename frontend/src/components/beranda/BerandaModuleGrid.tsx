"use client";

import Link from "next/link";
import {
  Boxes,
  ChevronRight,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { MAIN_MENU } from "@/constants/menu";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/cn";

const MODULE_ICONS: Record<string, LucideIcon> = {
  "/finance": Wallet,
  "/hr": Users,
  "/procurement": ShoppingCart,
  "/supply-chain": Boxes,
};

const MODULE_COLORS: Record<string, string> = {
  "/finance": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "/hr": "bg-violet-50 text-violet-700 border-violet-100",
  "/procurement": "bg-orange-50 text-orange-700 border-orange-100",
  "/supply-chain": "bg-teal-50 text-teal-700 border-teal-100",
};

export function BerandaModuleGrid() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-sq-dark dark:text-white">
          Modul Backoffice
        </h3>
        <p className="text-[10px] text-sq-slate">
          Akses cepat ke seluruh modul SQ+
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-2 p-4 sm:grid-cols-2">
        {MAIN_MENU.map((mod) => {
          const Icon = MODULE_ICONS[mod.href] ?? Wallet;
          const color = MODULE_COLORS[mod.href] ?? "bg-slate-50 text-slate-700 border-slate-100";
          const childCount = mod.children?.length ?? 0;

          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={cn(
                "group flex flex-col rounded-lg border p-3 transition hover:shadow-md",
                color
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold group-hover:underline">
                    {t(mod.labelKey)}
                  </p>
                  <p className="text-[10px] opacity-70">{childCount} sub-modul</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-100" />
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] opacity-80">
                {t(mod.descriptionKey)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
