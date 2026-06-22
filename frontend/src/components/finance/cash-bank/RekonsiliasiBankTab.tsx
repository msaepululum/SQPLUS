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
import {
  fetchCashBankRekonMeta,
  fetchRekonsiliasiBank,
} from "@/services/cashBankRekonService";
import type {
  CashBankRekonMeta,
  RekonsiliasiAccountSummary,
  RekonsiliasiRow,
} from "@/types/cash-bank-rekon";
import {
  formatBankAmount,
  formatBankDate,
  rekonStatusLabel,
} from "@/types/cash-bank-rekon";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

type RekonsiliasiBankTabProps = {
  title: string;
};

function statusBadgeVariant(status: RekonsiliasiRow["status"]) {
  switch (status) {
    case "matched":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "selisih":
      return "danger" as const;
  }
}

export function RekonsiliasiBankTab({ title }: RekonsiliasiBankTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [meta, setMeta] = useState<CashBankRekonMeta | null>(null);
  const [accountSummaries, setAccountSummaries] = useState<RekonsiliasiAccountSummary[]>([]);
  const [rows, setRows] = useState<RekonsiliasiRow[]>([]);
  const [summary, setSummary] = useState<{
    total_matched: number;
    total_pending: number;
    total_selisih: number;
    total_items: number;
    bulan_label: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchCashBankRekonMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchRekonsiliasiBank(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        bank_account_no: bankAccount || undefined,
        status: status !== "all" ? status : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setAccountSummaries(result.account_summaries);
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
    } catch {
      setAccountSummaries([]);
      setRows([]);
      setSummary(null);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, bankAccount, status, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [bulan, bankAccount, status, search, budgetYearId]);

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
    { label: "Cocok", value: String(summary?.total_matched ?? 0), tone: "plan" as const },
    { label: "Belum ACC", value: String(summary?.total_pending ?? 0), tone: "actual" as const },
    { label: "Selisih", value: String(summary?.total_selisih ?? 0), tone: "muted" as const },
    { label: "Total Item", value: String(summary?.total_items ?? 0), tone: "default" as const },
  ];

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Cari no BKU, jurnal..."
        />
        <ToolbarFilter label="Rekening" value={bankAccount} onChange={setBankAccount}>
          <option value="">Semua rekening</option>
          {meta?.bank_account_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
          <option value="">Tahun penuh</option>
          {meta?.bulan_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <ToolbarFilter label="Status" value={status} onChange={setStatus}>
          <option value="all">Semua</option>
          <option value="matched">Cocok</option>
          <option value="pending">Belum ACC</option>
          <option value="selisih">Selisih</option>
        </ToolbarFilter>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi items={kpiItems} />
        </div>
      </ToolbarShell>

      {accountSummaries.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {accountSummaries
            .filter((a) => a.matched + a.pending + a.selisih_item > 0)
            .slice(0, 4)
            .map((acc) => (
              <div
                key={acc.account_no}
                className={cardClassName({ variant: "default", className: "!p-2.5" })}
              >
                <p className="truncate text-[10px] font-medium text-slate-500">{acc.bank_name}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">{acc.account_name}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                  <span>Buku: {formatBankAmount(acc.saldo_buku)}</span>
                  {acc.selisih !== null && (
                    <span className={acc.selisih !== 0 ? "text-amber-600" : "text-emerald-600"}>
                      Selisih: {formatBankAmount(acc.selisih)}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat rekonsiliasi...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Tidak ada data rekonsiliasi"
            description="Tidak ada transaksi BKU bank untuk filter ini."
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH className="w-[5.5rem]">Tanggal</TH>
                  <TH className="w-[7rem]">No. BKU</TH>
                  <TH className="w-[7rem]">No. Jurnal</TH>
                  <TH>Rekening</TH>
                  <TH>Keterangan</TH>
                  <TH className="text-right">BKU</TH>
                  <TH className="text-right">ACC</TH>
                  <TH className="text-right">Selisih</TH>
                  <TH className="w-[5rem]">Status</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row, idx) => (
                  <TR key={`${row.no_bku}-${idx}`}>
                    <TD className="text-[11px] tabular-nums">{formatBankDate(row.tanggal)}</TD>
                    <TD className="font-mono text-[11px]">{row.no_bku}</TD>
                    <TD className="font-mono text-[11px] text-slate-500">{row.no_jurnal || "—"}</TD>
                    <TD className="max-w-[10rem] truncate text-[10px]" title={row.account_name}>
                      {row.account_name}
                    </TD>
                    <TD className="max-w-[12rem] truncate text-[11px]" title={row.keterangan}>
                      {row.keterangan || "—"}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] font-medium text-slate-800">
                      {formatBankAmount(row.amount_bku)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-slate-600">
                      {row.amount_acc !== null ? formatBankAmount(row.amount_acc) : "—"}
                    </TD>
                    <TD
                      className={cn(
                        "text-right tabular-nums text-[11px]",
                        row.selisih && row.selisih !== 0 ? "text-amber-700" : "text-slate-400"
                      )}
                    >
                      {row.selisih !== null ? formatBankAmount(row.selisih) : "—"}
                    </TD>
                    <TD>
                      <Badge variant={statusBadgeVariant(row.status)}>
                        {rekonStatusLabel(row.status)}
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
              itemLabel="item rekonsiliasi"
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
          Rekonsiliasi BKU (SIMARTDB) ↔ Jurnal ACC2026 · Periode: {summary.bulan_label}
        </p>
      )}
    </div>
  );
}
