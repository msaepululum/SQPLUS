"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calculator, FileText, Loader2, Receipt, Scale, Wallet } from "lucide-react";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchFinanceTaxDashboard } from "@/services/financeTaxService";
import type { FinanceTaxDashboard } from "@/types/finance-tax";
import { formatTaxAmount } from "@/types/finance-tax";
import { cn } from "@/lib/cn";

const KPI_CARDS = [
  { key: "antrian_verifikasi" as const, label: "Antrian Verifikasi", tab: "antrian-verifikasi", icon: Scale, tone: "border-violet-200 bg-violet-50 text-violet-900", iconBg: "bg-violet-600", format: (v: number) => String(v) },
  { key: "ppn_tagihan" as const, label: "PPN Tagihan", tab: "tagihan-pembelian", icon: Receipt, tone: "border-sky-200 bg-sky-50 text-sky-900", iconBg: "bg-sky-600", format: (v: number) => `Rp ${formatTaxAmount(v)}` },
  { key: "ppn_faktur" as const, label: "PPN Faktur", tab: "detail-perhitungan", icon: FileText, tone: "border-indigo-200 bg-indigo-50 text-indigo-900", iconBg: "bg-indigo-600", format: (v: number) => `Rp ${formatTaxAmount(v)}` },
  { key: "pph22_faktur" as const, label: "PPh 22 Faktur", tab: "detail-perhitungan", icon: Calculator, tone: "border-amber-200 bg-amber-50 text-amber-900", iconBg: "bg-amber-500", format: (v: number) => `Rp ${formatTaxAmount(v)}` },
  { key: "pph23_faktur" as const, label: "PPh 23 Faktur", tab: "detail-perhitungan", icon: Calculator, tone: "border-orange-200 bg-orange-50 text-orange-900", iconBg: "bg-orange-500", format: (v: number) => `Rp ${formatTaxAmount(v)}` },
  { key: "setoran_pajak" as const, label: "Setoran Pajak", tab: "setoran-pajak", icon: Wallet, tone: "border-emerald-200 bg-emerald-50 text-emerald-900", iconBg: "bg-emerald-600", format: (v: number) => `Rp ${formatTaxAmount(v)}` },
  { key: "ppn_pengajuan" as const, label: "PPN Pengajuan", tab: "pajak-pengajuan", icon: FileText, tone: "border-teal-200 bg-teal-50 text-teal-900", iconBg: "bg-teal-600", format: (v: number) => `Rp ${formatTaxAmount(v)}` },
];

function TaxDashboardInner() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [data, setData] = useState<FinanceTaxDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!budgetYearId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchFinanceTaxDashboard(budgetYearId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard pajak.");
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
        <EmptyState title="Pilih tahun anggaran" description="Dashboard pajak membutuhkan tahun anggaran aktif." className="mt-0" />
      ) : loading ? (
        <div className="flex justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm">Memuat data pajak dari SIMARTDB...</span>
        </div>
      ) : error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      ) : data ? (
        <>
          <div className={cardClassName({ variant: "default", className: "!p-4" })}>
            <h2 className="text-base font-semibold text-slate-900">Ringkasan Pajak {budgetYear?.tahun ?? data.tahun}</h2>
            <p className="mt-1 text-xs text-slate-500">
              PPN & PPh dari tagihan pembelian, tukar faktur, setoran BKU, dan pengajuan belanja.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {KPI_CARDS.map((card) => {
              const Icon = card.icon;
              const value = data.kpi[card.key];
              return (
                <Link
                  key={card.key}
                  href={`/finance/tax/manajemen-pajak?tab=${card.tab}`}
                  className={cn("rounded-lg border p-3 transition-shadow hover:shadow-md", card.tone)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium opacity-80">{card.label}</p>
                      <p className="mt-1 text-lg font-bold tabular-nums">{card.format(value)}</p>
                    </div>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white", card.iconBg)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400">
            Perhitungan: DPP + PPN (BYR_PPN/NPPN) − PPh 22 − PPh 23. Tarif PPN efektif = PPN ÷ DPP × 100%.
            Klik kartu untuk detail per tahap.
          </p>
        </>
      ) : null}
    </div>
  );
}

export function TaxDashboard() {
  return (
    <BudgetYearScopeProvider>
      <PageFrame title="Dashboard Pajak" description="Ringkasan PPN, PPh, verifikasi, dan setoran pajak rumah sakit">
        <BudgetYearScopedContent>
          <TaxDashboardInner />
        </BudgetYearScopedContent>
      </PageFrame>
    </BudgetYearScopeProvider>
  );
}
