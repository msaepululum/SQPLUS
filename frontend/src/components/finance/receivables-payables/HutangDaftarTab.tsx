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
import { fetchHutangDaftar } from "@/services/hutangPiutangService";
import type { HutangJenisId, HutangTahunPeriodeId } from "@/constants/hutang-categories";
import type { HpJournalRow } from "@/types/hutang-piutang";
import {
  formatHpAmount,
  formatHpDate,
  hpStatusLabel,
  hutangJenisLabel,
} from "@/types/hutang-piutang";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type HutangDaftarTabProps = {
  jenis?: HutangJenisId | "";
  periode?: HutangTahunPeriodeId | "";
};

function statusVariant(status: string) {
  if (status === "terutang") return "warning" as const;
  if (status === "dibayar") return "success" as const;
  return "draft" as const;
}

export function HutangDaftarTab({ jenis, periode }: HutangDaftarTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<HpJournalRow[]>([]);
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
      const result = await fetchHutangDaftar(budgetYearId, {
        jenis: jenis || undefined,
        periode: periode || undefined,
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
  }, [budgetYearId, jenis, periode, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [jenis, periode, search, budgetYearId]);

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat daftar hutang...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="Daftar hutang dikunci per tahun anggaran." />
    );
  }

  const totalAmount = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari jurnal, keterangan, no beli..." />
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi
            items={[
              { label: "Total Baris", value: String(totalRows), tone: "muted" },
              { label: "Halaman", value: formatHpAmount(totalAmount), tone: "actual" },
            ]}
          />
        </div>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {rows.length === 0 ? (
          <EmptyState title="Tidak ada hutang" description="Tidak ada jurnal hutang untuk filter ini." />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH className="w-[5.5rem]">Tanggal</TH>
                  <TH className="w-[8rem]">No. Jurnal</TH>
                  <TH>Keterangan</TH>
                  <TH className="w-[5rem]">Jenis</TH>
                  <TH className="w-[7rem]">COA</TH>
                  <TH className="text-right">Debet</TH>
                  <TH className="text-right">Kredit</TH>
                  <TH className="w-[4.5rem]">Status</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row, i) => (
                  <TR key={`${row.no_jurnal}-${i}`}>
                    <TD className="text-[11px]">{formatHpDate(row.tanggal)}</TD>
                    <TD className="font-mono text-[11px]">{row.no_jurnal}</TD>
                    <TD className="max-w-[16rem] truncate text-[11px]" title={row.keterangan}>
                      {row.keterangan || "—"}
                    </TD>
                    <TD className="text-[10px]">{hutangJenisLabel(row.jenis)}</TD>
                    <TD className="font-mono text-[10px] text-slate-500">{row.account_no}</TD>
                    <TD className="text-right tabular-nums text-[11px] text-red-600">
                      {row.debet > 0 ? formatHpAmount(row.debet) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                      {row.kredit > 0 ? formatHpAmount(row.kredit) : "—"}
                    </TD>
                    <TD>
                      <Badge variant={statusVariant(row.status)}>{hpStatusLabel(row.status)}</Badge>
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
              itemLabel="jurnal hutang"
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
        Sumber: ACC2026 JURNAL — akun kewajiban 2.1.01.03/04
      </p>
    </div>
  );
}
