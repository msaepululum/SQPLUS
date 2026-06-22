"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckSquare,
  ClipboardList,
  FileText,
  Handshake,
  Loader2,
  PackageCheck,
  Settings,
  ShoppingCart,
  Store,
  Target,
  Truck,
  ChevronRight,
} from "lucide-react";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { cardClassName } from "@/components/ui/Card";
import { PROCUREMENT_SUB_NAV } from "@/constants/procurement-navigation";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { fetchProcurementDashboard } from "@/services/procurementService";
import type { ProcurementDashboard as ProcurementDashboardData } from "@/types/procurement";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const MODULE_ICONS: Record<string, LucideIcon> = {
  "/procurement/permintaan": ClipboardList,
  "/procurement/perencanaan": Target,
  "/procurement/vendor": Store,
  "/procurement/hps-penawaran": FileText,
  "/procurement/negosiasi": Handshake,
  "/procurement/po-spk-kontrak": ShoppingCart,
  "/procurement/penerimaan": PackageCheck,
  "/procurement/dokumen": FileText,
  "/procurement/monitoring": Truck,
  "/procurement/approval": CheckSquare,
  "/procurement/laporan": BarChart3,
  "/procurement/pengaturan": Settings,
};

const KPI_CARDS = [
  { key: "aju_antrian" as const, label: "AJU Antrian", href: "/procurement/permintaan", tone: "border-sky-200 bg-sky-50 text-sky-900", iconBg: "bg-sky-600" },
  { key: "aju_close" as const, label: "AJU Close", href: "/procurement/permintaan?tab=tracking", tone: "border-emerald-200 bg-emerald-50 text-emerald-900", iconBg: "bg-emerald-600" },
  { key: "negosiasi_aktif" as const, label: "Negosiasi Aktif", href: "/procurement/negosiasi", tone: "border-violet-200 bg-violet-50 text-violet-900", iconBg: "bg-violet-600" },
  { key: "po_aktif" as const, label: "PO Aktif", href: "/procurement/po-spk-kontrak", tone: "border-amber-200 bg-amber-50 text-amber-900", iconBg: "bg-amber-500" },
  { key: "penerimaan" as const, label: "Penerimaan", href: "/procurement/penerimaan", tone: "border-teal-200 bg-teal-50 text-teal-900", iconBg: "bg-teal-600" },
  { key: "belum_tukar_faktur" as const, label: "Belum Tukar Faktur", href: "/finance/payments/belum-proses-tagihan", tone: "border-orange-200 bg-orange-50 text-orange-900", iconBg: "bg-orange-500" },
];

function ProcurementDashboardInner() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const { t } = useTranslation();
  const [data, setData] = useState<ProcurementDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modules = PROCUREMENT_SUB_NAV.filter((item) => item.href !== "/procurement");

  const load = useCallback(async () => {
    if (!budgetYearId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchProcurementDashboard(budgetYearId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard pengadaan.");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BudgetYearScopeBar compact />
      </div>

      {!budgetYearId ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Pilih tahun anggaran untuk memuat data pengadaan.
        </p>
      ) : loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm">Memuat data FINANCE & SIMARTDB...</span>
        </div>
      ) : error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      ) : data ? (
        <>
          <div className={cardClassName({ variant: "default", className: "!p-4" })}>
            <h2 className="text-base font-semibold text-slate-900">
              Ringkasan Pengadaan {budgetYear?.tahun ?? data.tahun}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Permintaan dari FINANCE.aju → POH/POD → INBELIH/INBELID di SIMARTDB
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {KPI_CARDS.map((card) => (
              <Link
                key={card.key}
                href={card.href}
                className={cn("rounded-lg border p-3 transition-shadow hover:shadow-md", card.tone)}
              >
                <p className="text-[11px] font-medium opacity-80">{card.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{data.kpi[card.key]}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => {
              const Icon = MODULE_ICONS[item.href] ?? ShoppingCart;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cardClassName({
                      variant: "default",
                      className:
                        "group flex items-center gap-3 !p-3 transition-shadow hover:border-[#0d6e63]/30 hover:shadow-md",
                    })}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0d6e63]/10 text-[#0d6e63]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 group-hover:text-[#0d6e63]">
                        {t(item.labelKey)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#0d6e63]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ProcurementDashboard() {
  return (
    <BudgetYearScopeProvider>
      <PageFrame
        title="Dashboard Pengadaan"
        description="Ringkasan siklus pengadaan — AJU Keuangan, PO/SPK SIMARTDB, dan penerimaan barang"
      >
        <BudgetYearScopedContent>
          <ProcurementDashboardInner />
        </BudgetYearScopedContent>
      </PageFrame>
    </BudgetYearScopeProvider>
  );
}
