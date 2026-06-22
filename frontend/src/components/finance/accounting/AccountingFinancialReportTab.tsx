"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccountingBulanFilter } from "@/components/finance/accounting/AccountingBulanFilter";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccLaporanOperasional, fetchAccNeraca } from "@/services/accountingService";
import type { AccFinancialReport } from "@/types/accounting";
import { formatAccAmount } from "@/types/accounting";
import { Loader2 } from "lucide-react";

type AccountingFinancialReportTabProps = {
  report: "neraca" | "operasional";
};

const FETCHERS = {
  neraca: fetchAccNeraca,
  operasional: fetchAccLaporanOperasional,
};

export function AccountingFinancialReportTab({ report }: AccountingFinancialReportTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const { bulan } = useAccountingBulanFilter();
  const [data, setData] = useState<AccFinancialReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      setData(await FETCHERS[report](budgetYearId, bulan));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, report, bulan]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || (loading && !data)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat laporan keuangan...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="Laporan keuangan dikunci per tahun anggaran." />
    );
  }

  if (!data) {
    return (
      <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil laporan dari ACC2026." />
    );
  }

  const summaryItems =
    report === "neraca"
      ? [
          { label: "Total Aset", value: formatAccAmount(data.summary.total_aset ?? 0) },
          { label: "Total Kewajiban", value: formatAccAmount(data.summary.total_kewajiban ?? 0) },
          { label: "Total Ekuitas", value: formatAccAmount(data.summary.total_ekuitas ?? 0) },
        ]
      : [
          { label: "Total Pendapatan", value: formatAccAmount(data.summary.total_pendapatan ?? 0) },
          { label: "Total Beban", value: formatAccAmount(data.summary.total_beban ?? 0) },
          {
            label: "Surplus / Defisit",
            value: formatAccAmount(data.summary.surplus_defisit ?? 0),
          },
        ];

  return (
    <div className="mt-2 space-y-3">
      <ToolbarShell>
        <ToolbarKpi
          items={summaryItems.map((kpi) => ({
            label: kpi.label,
            value: kpi.value,
            tone: "default" as const,
          }))}
        />
      </ToolbarShell>

      {data.sections.map((section) => (
        <div key={section.kelompok}>
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">{section.label}</h3>
            <span className="text-sm font-medium tabular-nums text-slate-700">
              {formatAccAmount(section.total)}
            </span>
          </div>
          <div className={tableGridShellClassName}>
            <Table>
              <THead>
                <TR>
                  <TH>Kode</TH>
                  <TH>Nama Akun</TH>
                  <TH>Level</TH>
                  <TH className="text-right">Saldo</TH>
                </TR>
              </THead>
              <TBody>
                {section.rows.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Tidak ada posisi
                    </TD>
                  </TR>
                ) : (
                  section.rows.map((row) => (
                    <TR key={row.account_no}>
                      <TD className="font-mono text-xs">{row.account_no}</TD>
                      <TD>
                        <span style={{ paddingLeft: `${Math.max(0, row.level - 1) * 10}px` }}>
                          {row.account_name}
                        </span>
                        {!row.is_detail && (
                          <Badge variant="draft" className="ml-1.5">
                            Header
                          </Badge>
                        )}
                      </TD>
                      <TD>{row.level}</TD>
                      <TD className="text-right tabular-nums">{formatAccAmount(row.saldo)}</TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        </div>
      ))}

      {report === "neraca" && (
        <div className={cardClassName({ variant: "default", className: "!p-3" })}>
          <p className="text-xs text-slate-500">Balance Check (Aset − Kewajiban − Ekuitas)</p>
          <p className="text-lg font-semibold tabular-nums text-slate-800">
            {formatAccAmount(data.summary.balance_check ?? 0)}
          </p>
        </div>
      )}

      <p className="text-[11px] text-slate-400">Sumber: {data.source}</p>
    </div>
  );
}
