"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchPiutangUmur } from "@/services/hutangPiutangService";
import type { PiutangJenisId } from "@/constants/piutang-categories";
import type { HpAgingRow } from "@/types/hutang-piutang";
import { formatHpAmount, formatHpDate, hutangJenisLabel } from "@/types/hutang-piutang";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type PiutangUmurTabProps = {
  jenis?: PiutangJenisId | "";
};

export function PiutangUmurTab({ jenis }: PiutangUmurTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [buckets, setBuckets] = useState<{ key: string; label: string; amount: number }[]>([]);
  const [rows, setRows] = useState<HpAgingRow[]>([]);
  const [summary, setSummary] = useState<{ total_outstanding?: number; jumlah_faktur?: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchPiutangUmur(budgetYearId, jenis || undefined);
      setBuckets(result.buckets);
      setRows(result.rows);
      setSummary(result.summary);
    } catch {
      setBuckets([]);
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, jenis]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat umur piutang...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return <EmptyState title="Pilih tahun anggaran" description="Analisis umur piutang." />;
  }

  const maxBucket = Math.max(...buckets.map((b) => b.amount), 1);

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi
            items={[
              {
                label: "Outstanding",
                value: formatHpAmount(Number(summary?.total_outstanding ?? 0)),
                tone: "actual",
              },
              { label: "Faktur", value: String(summary?.jumlah_faktur ?? 0), tone: "muted" },
            ]}
          />
        </div>
      </ToolbarShell>

      <div className="grid gap-2 sm:grid-cols-5">
        {buckets.map((b) => (
          <div key={b.key} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
            <p className="text-[10px] font-medium text-slate-500">{b.label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">{formatHpAmount(b.amount)}</p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{ width: `${Math.min(100, (b.amount / maxBucket) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {rows.length === 0 ? (
          <EmptyState title="Tidak ada piutang outstanding" description="Semua piutang sudah lunas." />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-[5.5rem]">Tanggal</TH>
                <TH className="w-[8rem]">No. Jurnal</TH>
                <TH>Keterangan</TH>
                <TH className="w-[5rem]">Jenis</TH>
                <TH className="w-[4rem] text-right">Umur</TH>
                <TH className="w-[5rem]">Bucket</TH>
                <TH className="text-right">Outstanding</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, i) => (
                <TR key={`${row.no_jurnal}-${i}`}>
                  <TD className="text-[11px]">{formatHpDate(row.tanggal)}</TD>
                  <TD className="font-mono text-[11px]">{row.no_jurnal}</TD>
                  <TD className="max-w-[14rem] truncate text-[11px]">{row.keterangan || "—"}</TD>
                  <TD className="text-[10px]">{hutangJenisLabel(row.jenis)}</TD>
                  <TD className="text-right tabular-nums text-[11px]">{row.umur_hari}d</TD>
                  <TD>
                    <Badge variant="info">{row.bucket_label}</Badge>
                  </TD>
                  <TD className="text-right tabular-nums text-[11px] font-semibold text-amber-700">
                    {formatHpAmount(row.outstanding)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
