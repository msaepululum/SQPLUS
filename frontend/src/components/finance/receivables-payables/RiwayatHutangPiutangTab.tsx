"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarFilter,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { HpTablePagination } from "@/components/finance/receivables-payables/HpTablePagination";
import { fetchHpRiwayat } from "@/services/hutangPiutangService";
import type { HpJournalRow } from "@/types/hutang-piutang";
import { formatHpAmount, formatHpDate, hpStatusLabel } from "@/types/hutang-piutang";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

export function RiwayatHutangPiutangTab() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<HpJournalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipe, setTipe] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchHpRiwayat(budgetYearId, {
        tipe: tipe !== "all" ? tipe : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
    } catch {
      setRows([]);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, tipe, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [tipe, search, budgetYearId]);

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat riwayat...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return <EmptyState title="Pilih tahun anggaran" description="Riwayat hutang & piutang." />;
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari jurnal, keterangan..." />
        <ToolbarFilter label="Tipe" value={tipe} onChange={setTipe}>
          <option value="all">Semua</option>
          <option value="hutang">Hutang</option>
          <option value="piutang">Piutang</option>
        </ToolbarFilter>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {rows.length === 0 ? (
          <EmptyState title="Tidak ada riwayat" description="Belum ada mutasi hutang/piutang." />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH className="w-[4rem]">Tipe</TH>
                  <TH className="w-[5.5rem]">Tanggal</TH>
                  <TH className="w-[8rem]">No. Jurnal</TH>
                  <TH>Keterangan</TH>
                  <TH className="text-right">Debet</TH>
                  <TH className="text-right">Kredit</TH>
                  <TH className="w-[4.5rem]">Status</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row, i) => (
                  <TR key={`${row.no_jurnal}-${i}`}>
                    <TD>
                      <Badge variant={row.tipe === "hutang" ? "danger" : "info"}>
                        {row.tipe === "hutang" ? "Hutang" : "Piutang"}
                      </Badge>
                    </TD>
                    <TD className="text-[11px]">{formatHpDate(row.tanggal)}</TD>
                    <TD className="font-mono text-[11px]">{row.no_jurnal}</TD>
                    <TD className="max-w-[14rem] truncate text-[11px]">{row.keterangan || "—"}</TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      {row.debet > 0 ? formatHpAmount(row.debet) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      {row.kredit > 0 ? formatHpAmount(row.kredit) : "—"}
                    </TD>
                    <TD className="text-[10px]">{hpStatusLabel(row.status)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <HpTablePagination
              page={page}
              lastPage={lastPage}
              perPage={perPage}
              totalRows={totalRows}
              itemLabel="mutasi"
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
