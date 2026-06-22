"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ClipboardList,
  FileStack,
  Loader2,
  Receipt,
  Scale,
} from "lucide-react";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PAYMENT_WORKFLOW_SUMMARY } from "@/constants/payment-workflow";
import { fetchPaymentWorkflowDashboard } from "@/services/paymentWorkflowService";
import type { PaymentWorkflowDashboard } from "@/types/payment-workflow-data";
import { cn } from "@/lib/cn";

const STAGE_CARDS: {
  key: keyof PaymentWorkflowDashboard["kpi"];
  stage: string;
  label: string;
  description: string;
  icon: typeof Receipt;
  tone: string;
  iconBg: string;
}[] = [
  {
    key: "belum_proses_tagihan",
    stage: "belum-proses-tagihan",
    label: "Belum Proses Tagihan",
    description: "Penerimaan barang (INBELIH) belum masuk tukar faktur",
    icon: Receipt,
    tone: "border-slate-200 bg-slate-50 text-slate-800",
    iconBg: "bg-slate-600",
  },
  {
    key: "permintaan_bayar",
    stage: "permintaan-bayar",
    label: "Permintaan Bayar",
    description: "Tukar faktur baru — belum masuk rencana bayar",
    icon: ClipboardList,
    tone: "border-sky-200 bg-sky-50 text-sky-900",
    iconBg: "bg-sky-600",
  },
  {
    key: "rencana_bayar",
    stage: "rencana-bayar",
    label: "Rencana Bayar",
    description: "TKRFKTR dengan detail rencana bayar aktif",
    icon: FileStack,
    tone: "border-indigo-200 bg-indigo-50 text-indigo-900",
    iconBg: "bg-indigo-600",
  },
  {
    key: "verifikasi_pajak",
    stage: "verifikasi-pajak",
    label: "Verifikasi Pajak",
    description: "Menunggu verifikasi pajak (LTAX belum selesai)",
    icon: Scale,
    tone: "border-violet-200 bg-violet-50 text-violet-900",
    iconBg: "bg-violet-600",
  },
  {
    key: "pembayaran_selesai",
    stage: "pembayaran-selesai",
    label: "Pembayaran Selesai",
    description: "Sudah tercatat di BKU — terbayar",
    icon: BadgeCheck,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconBg: "bg-emerald-600",
  },
];

function PaymentsDashboardInner() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [data, setData] = useState<PaymentWorkflowDashboard | null>(null);
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
      const result = await fetchPaymentWorkflowDashboard(budgetYearId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard pembayaran.");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-slate-700">Alur: </span>
          {PAYMENT_WORKFLOW_SUMMARY}
        </p>
        <BudgetYearScopeBar compact />
      </div>

      {!budgetYearId ? (
        <EmptyState
          title="Pilih tahun anggaran"
          description="Dashboard pembayaran membutuhkan tahun anggaran aktif."
          className="mt-0"
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : data ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <div className={cardClassName({ variant: "default", className: "!p-4 sm:col-span-2 lg:col-span-1" })}>
              <p className="text-[11px] font-medium text-slate-500">Total Antrian Pembayaran</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                {data.kpi.total_antrian}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Tahun {budgetYear?.tahun ?? data.tahun} · belum termasuk yang sudah dibayar
              </p>
            </div>
            {STAGE_CARDS.slice(0, 2).map((card) => {
              const Icon = card.icon;
              const value = data.kpi[card.key];
              return (
                <Link
                  key={card.stage}
                  href={`/finance/payments/alur-pembayaran?tab=${card.stage}`}
                  className={cn(
                    "group rounded-lg border p-4 transition-shadow hover:shadow-md",
                    card.tone
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium opacity-80">{card.label}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
                      <p className="mt-1 text-[10px] opacity-70">{card.description}</p>
                    </div>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
                        card.iconBg
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STAGE_CARDS.slice(2).map((card) => {
              const Icon = card.icon;
              const value = data.kpi[card.key];
              return (
                <Link
                  key={card.stage}
                  href={`/finance/payments/alur-pembayaran?tab=${card.stage}`}
                  className={cn(
                    "group rounded-lg border p-4 transition-shadow hover:shadow-md",
                    card.tone
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium opacity-80">{card.label}</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
                      <p className="mt-1 text-[10px] opacity-70">{card.description}</p>
                    </div>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
                        card.iconBg
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400">
            Data dari SIMARTDB — INBELIH, TKRFKTR/TKRFKTRD, dan BKUH/BKUD. Klik kartu untuk membuka
            detail per tahap.
          </p>
        </>
      ) : null}
    </div>
  );
}

export function PaymentsDashboard() {
  return (
    <BudgetYearScopeProvider>
      <PageFrame
        title="Dashboard Pembayaran"
        description="Ringkasan antrian per tahap alur pembayaran dan status pencairan dana"
      >
        <BudgetYearScopedContent>
          <PaymentsDashboardInner />
        </BudgetYearScopedContent>
      </PageFrame>
    </BudgetYearScopeProvider>
  );
}
