"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AccountingBulanToolbarFilter,
  useAccountingBulanFilter,
} from "@/components/finance/accounting/AccountingBulanFilter";
import { useAccountingJournalDetail } from "@/components/finance/accounting/AccountingJournalDetail";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
  useBudgetYearScope,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { ACCOUNTING_SUB_NAV } from "@/constants/accounting-navigation";
import { ACCOUNTING_CYCLE_SUMMARY } from "@/constants/accounting-standards";
import { fetchAccDashboard } from "@/services/accountingService";
import type { AccDashboardData } from "@/types/accounting";
import { formatAccAmount, formatAccDate, formatAccNumber } from "@/types/accounting";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Eye, Loader2 } from "lucide-react";

function AccountingDashboardInner() {
  const { t } = useTranslation();
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const { bulan } = useAccountingBulanFilter();
  const { openJournal, drawer } = useAccountingJournalDetail(budgetYearId);
  const [data, setData] = useState<AccDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      setData(await fetchAccDashboard(budgetYearId, bulan));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && !data)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat dashboard akuntansi dari ACC2026...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Dashboard akuntansi dikunci per tahun anggaran."
      />
    );
  }

  if (!data) {
    return (
      <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil data dari ACC2026." />
    );
  }

  const kpis = [
    { label: "Total Jurnal", value: formatAccNumber(data.kpis.total_jurnal), tone: "bg-blue-600" },
    { label: "Belum Posting", value: formatAccNumber(data.kpis.belum_posting), tone: "bg-orange-500" },
    { label: "Sudah Posting", value: formatAccNumber(data.kpis.sudah_posting), tone: "bg-emerald-600" },
    { label: "Total COA", value: formatAccNumber(data.kpis.total_coa), tone: "bg-violet-600" },
    { label: "Saldo Aset", value: formatAccAmount(data.kpis.saldo_aset), tone: "bg-teal-600" },
    { label: "Saldo Kewajiban", value: formatAccAmount(data.kpis.saldo_kewajiban), tone: "bg-red-500" },
    { label: "Saldo Ekuitas", value: formatAccAmount(data.kpis.saldo_ekuitas), tone: "bg-indigo-600" },
    {
      label: "Surplus / Defisit",
      value: formatAccAmount(data.kpis.surplus_periode),
      tone: data.kpis.surplus_periode >= 0 ? "bg-emerald-700" : "bg-red-600",
    },
  ];

  const maxTrend = Math.max(...data.monthly_trend.map((t) => t.count), 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-end gap-2">
        <AccountingBulanToolbarFilter />
        <BudgetYearScopeBar compact />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {ACCOUNTING_SUB_NAV.filter((item) => item.href !== "/finance/accounting").map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cardClassName({
              variant: "default",
              className:
                "!p-3 transition-colors hover:border-[#0d6e63]/30 hover:bg-emerald-50/40",
            })}
          >
            <p className="text-xs font-semibold text-[#0d6e63]">{t(item.labelKey)}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">ACC2026</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
            <div className={`mb-1.5 h-1 w-8 rounded-full ${kpi.tone}`} />
            <p className="text-[10px] text-slate-500">{kpi.label}</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <h3 className="text-sm font-semibold text-slate-800">Volume Jurnal Bulanan</h3>
          <div className="mt-3 grid grid-cols-6 gap-1 sm:grid-cols-12">
            {data.monthly_trend.map((m) => (
              <div key={m.bulan} className="text-center">
                <div className="mx-auto flex h-14 w-full max-w-[1.75rem] items-end justify-center rounded bg-slate-100">
                  <div
                    className="w-full rounded bg-[#0d6e63]"
                    style={{ height: `${Math.max(6, (m.count / maxTrend) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[9px] text-slate-500">{m.label.slice(0, 3)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <h3 className="text-sm font-semibold text-slate-800">Komposisi COA per Kelompok</h3>
          <div className="mt-2 space-y-1.5">
            {data.group_composition.map((g) => {
              const maxSaldo = Math.max(...data.group_composition.map((x) => x.saldo), 1);
              return (
                <div key={g.kelompok}>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">{g.label}</span>
                    <span className="tabular-nums font-medium text-slate-800">
                      {formatAccAmount(g.saldo)}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0d6e63]"
                      style={{ width: `${(g.saldo / maxSaldo) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Jurnal per Jenis</h3>
          <div className={tableGridShellClassName}>
            <Table>
              <THead>
                <TR>
                  <TH>Jenis</TH>
                  <TH className="text-right">Jumlah</TH>
                  <TH className="text-right">Total Debet</TH>
                </TR>
              </THead>
              <TBody>
                {data.journal_by_type.map((j) => (
                  <TR key={j.journal_type}>
                    <TD>
                      <Badge variant="info">{j.journal_type}</Badge>
                      <span className="ml-1.5 text-xs text-slate-600">{j.label}</span>
                    </TD>
                    <TD className="text-right tabular-nums">{formatAccNumber(j.count)}</TD>
                    <TD className="text-right tabular-nums">{formatAccAmount(j.total_debet)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </div>

        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Jurnal Terbaru</h3>
          <div className={tableGridShellClassName}>
            <Table>
              <THead>
                <TR>
                  <TH>No</TH>
                  <TH>Tanggal</TH>
                  <TH>Jenis</TH>
                  <TH>Status</TH>
                  <TH className="w-10" />
                </TR>
              </THead>
              <TBody>
                {data.recent_journals.map((j) => (
                  <TR key={j.no_jurnal} className="group">
                    <TD className="max-w-[100px] truncate font-mono text-xs">{j.no_jurnal}</TD>
                    <TD>{formatAccDate(j.tanggal)}</TD>
                    <TD>
                      <Badge variant="info">{j.journal_type}</Badge>
                    </TD>
                    <TD>
                      <Badge variant={j.posted ? "success" : "warning"}>
                        {j.posted ? "Posted" : "Draft"}
                      </Badge>
                    </TD>
                    <TD>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100"
                        onClick={() => void openJournal(j.no_jurnal)}
                        aria-label="Lihat detail jurnal"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        Sumber data real: {data.source} · Periode terbuka: {data.kpis.periode_terbuka} bulan
      </p>
      {drawer}
    </div>
  );
}

export function AccountingDashboard() {
  return (
    <PageFrame
      title="Dashboard Akuntansi"
      description="Ringkasan posisi keuangan, jurnal belum diposting, dan status penutupan periode"
    >
      <p className="mb-3 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Siklus: </span>
        {ACCOUNTING_CYCLE_SUMMARY}
      </p>
      <BudgetYearScopeProvider>
        <BudgetYearScopedContent>
          <AccountingDashboardInner />
        </BudgetYearScopedContent>
      </BudgetYearScopeProvider>
    </PageFrame>
  );
}
