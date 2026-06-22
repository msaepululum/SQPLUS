"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { CashSaldoTablePagination } from "@/components/finance/cash-bank/CashSaldoTablePagination";
import { fetchBukuKasBesar, fetchCashSaldoMeta } from "@/services/cashSaldoRekapService";
import type { CashBukuKasRow, CashSaldoMeta } from "@/types/cash-saldo-rekap";
import { formatSaldoAmount, formatSaldoDate } from "@/types/cash-saldo-rekap";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type BukuKasBesarTabProps = {
  title: string;
};

export function BukuKasBesarTab({ title }: BukuKasBesarTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [meta, setMeta] = useState<CashSaldoMeta | null>(null);
  const [rows, setRows] = useState<CashBukuKasRow[]>([]);
  const [summary, setSummary] = useState<Record<string, number | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [kasAccount, setKasAccount] = useState("");

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchCashSaldoMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchBukuKasBesar(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        kas_account_no: kasAccount || undefined,
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
  }, [budgetYearId, bulan, kasAccount, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [bulan, kasAccount, search, budgetYearId]);

  if (yearLoading || (loading && rows.length === 0 && !summary)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat {title.toLowerCase()}...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description={`${title} dikunci per tahun anggaran.`}
        className="mt-3"
      />
    );
  }

  const kpiItems = [
    { label: "Saldo Awal", value: formatSaldoAmount(summary?.saldo_awal ?? 0), tone: "muted" as const },
    { label: "Total Masuk", value: formatSaldoAmount(summary?.total_masuk ?? 0), tone: "plan" as const },
    { label: "Total Keluar", value: formatSaldoAmount(summary?.total_keluar ?? 0), tone: "actual" as const },
    { label: "Saldo Akhir", value: formatSaldoAmount(summary?.saldo_akhir ?? 0), tone: "default" as const },
  ];

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Cari no BKU, jurnal, keterangan..."
        />
        <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
          <option value="">Semua bulan</option>
          {meta?.bulan_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <ToolbarFilter label="Rekening" value={kasAccount} onChange={setKasAccount}>
          <option value="">Semua rekening</option>
          {meta?.kas_account_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi items={kpiItems} />
        </div>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat ledger...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Tidak ada data" description="Tidak ada baris BKU untuk filter ini." />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH className="w-[5.5rem]">Tanggal</TH>
                  <TH className="w-[7rem]">No. BKU</TH>
                  <TH className="w-[7rem]">No. Jurnal</TH>
                  <TH>Keterangan</TH>
                  <TH className="text-right">Masuk</TH>
                  <TH className="text-right">Keluar</TH>
                  <TH className="text-right">Saldo</TH>
                  <TH className="w-[4.5rem]">ACC</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row, idx) => (
                  <TR key={`${row.no_bku}-${idx}`}>
                    <TD className="text-[11px] tabular-nums">{formatSaldoDate(row.tanggal)}</TD>
                    <TD className="font-mono text-[11px]">{row.no_bku}</TD>
                    <TD className="font-mono text-[11px] text-slate-500">{row.no_jurnal || "—"}</TD>
                    <TD className="max-w-[16rem] truncate text-[11px]" title={row.keterangan}>
                      {row.keterangan || "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-emerald-700">
                      {row.masuk > 0 ? formatSaldoAmount(row.masuk) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-red-600">
                      {row.keluar > 0 ? formatSaldoAmount(row.keluar) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] font-semibold text-slate-800">
                      {formatSaldoAmount(row.saldo ?? 0)}
                    </TD>
                    <TD>
                      <Badge variant={row.posted_acc ? "success" : "warning"}>
                        {row.posted_acc ? "Ya" : "Belum"}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>

            <CashSaldoTablePagination
              page={page}
              lastPage={lastPage}
              perPage={perPage}
              totalRows={totalRows}
              itemLabel="baris BKU"
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {summary && (
        <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
          Buku Kas Besar (BKUH) · {totalRows} baris · Terhubung ACC via cnojurnal
        </p>
      )}
    </div>
  );
}
