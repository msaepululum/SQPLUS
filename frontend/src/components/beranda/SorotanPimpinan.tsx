"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Star,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import type { BerandaHighlight } from "@/lib/berandaInsights";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

const TONE_STYLES = {
  emerald: {
    icon: TrendingUp,
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
  },
  red: {
    icon: AlertTriangle,
    bg: "bg-red-50",
    iconColor: "text-red-500",
    border: "border-red-100",
  },
  violet: {
    icon: Users,
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-violet-100",
  },
  blue: {
    icon: Wrench,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-100",
  },
  amber: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-amber-100",
  },
};

type SorotanPimpinanProps = {
  highlights: BerandaHighlight[];
  loading?: boolean;
};

export function SorotanPimpinan({ highlights, loading }: SorotanPimpinanProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-sq-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-sq-border px-4 py-3 dark:border-slate-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
          <Star className="h-4 w-4" strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-sq-dark dark:text-white">
            Sorotan Pimpinan
          </h3>
          <p className="text-[10px] text-sq-slate">Insight otomatis dari data live</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {loading && highlights.length === 0 ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-6 text-sm text-sq-slate">
            <Loader2 className="h-4 w-4 animate-spin" />
            Menganalisis data...
          </div>
        ) : highlights.length === 0 ? (
          <p className="py-4 text-center text-sm text-sq-slate">
            Belum ada sorotan khusus — kondisi operasional dalam batas normal.
          </p>
        ) : (
          highlights.map((item) => {
            const style = TONE_STYLES[item.tone];
            const Icon = style.icon;
            const content = (
              <div
                className={cn(
                  "flex gap-3 rounded-lg border px-3 py-2.5 transition",
                  style.border,
                  item.href && "hover:border-sq-blue/40 hover:shadow-sm",
                  "dark:border-slate-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    style.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", style.iconColor)} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sq-dark dark:text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-sq-slate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );

            return item.href ? (
              <Link key={item.title} href={item.href}>
                {content}
              </Link>
            ) : (
              <div key={item.title}>{content}</div>
            );
          })
        )}

        <Link
          href="/finance/executive-insight"
          className="mt-auto flex w-full items-center justify-center gap-1 rounded-lg border border-sq-blue py-2 text-xs font-semibold text-sq-blue transition hover:bg-blue-50 dark:hover:bg-blue-500/10"
        >
          Lihat Executive Insight
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
