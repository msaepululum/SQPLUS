"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { HpTablePagination } from "@/components/finance/receivables-payables/HpTablePagination";
import { fetchRekonPiutang } from "@/services/hutangPiutangService";
import type { PiutangJenisId } from "@/constants/piutang-categories";
import type { HpJournalRow } from "@/types/hutang-piutang";
import { formatHpAmount, formatHpDate, hpStatusLabel } from "@/types/hutang-piutang";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type RekonPiutangTabProps = {
  jenis?: PiutangJenisId | "";
};

export function RekonPiutangTab({ jenis }: RekonPiutangTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<HpJournalRow[]>([]);
  const [summary, setSummary] = useState<{ total_matched?: number; total_pending?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchRekonPiutang(budgetYearId, {
        jenis: jenis || undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
    } catch {
      setRows([]);
      setSummary(null);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, jenis, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [jenis, search, budgetYearId]);

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat rekonsiliasi piutang...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return <EmptyState title="Pilih tahun anggaran" description="Rekonsiliasi piutang." />;
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari jurnal, no reg..." />
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi
            items={[
              { label: "Cocok", value: String(summary?.total_matched ?? 0), tone: "plan" },
              { label: "Belum Cocok", value: String(summary?.total_pending ?? 0), tone: "actual" },
            ]}
          />
        </div>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Tidak ada jurnal piutang untuk direkonsiliasi." />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH className="w-[5.5rem]">Tanggal</TH>
                  <TH className="w-[8rem]">No. Jurnal</TH>
                  <TH>Keterangan</TH>
                  <TH className="w-[5rem]">No. Reg</TH>
                  <TH className="w-[5rem]">No. MR</TH>
                  <TH className="text-right">Amount</TH>
                  <TH className="w-[5rem]">Rekon</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row, i) => (
                  <TR key={`${row.no_jurnal}-${i}`}>
                    <TD className="text-[11px]">{formatHpDate(row.tanggal)}</TD>
                    <TD className="font-mono text-[11px]">{row.no_jurnal}</TD>
                    <TD className="max-w-[14rem] truncate text-[11px]">{row.keterangan || "—"}</TD>
                    <TD className="font-mono text-[10px]">{row.no_reg || "—"}</TD>
                    <TD className="font-mono text-[10px]">{row.no_mr || "—"}</TD>
                    <TD className="text-right tabular-nums text-[11px]">{formatHpAmount(row.amount)}</TD>
                    <TD>
                      <Badge variant={row.rekon_status === "matched" ? "success" : "warning"}>
                        {hpStatusLabel(row.rekon_status ?? "pending")}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <HpTablePagination
              page={page}
              lastPage={lastPage}
              perPage={perPage}
              totalRows={totalRows}
              itemLabel="item rekon"
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
        Rekonsiliasi jurnal piutang dengan referensi registrasi pasien (cnoreg)
      </p>
    </div>
  );
}
