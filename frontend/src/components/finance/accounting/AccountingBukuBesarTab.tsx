"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccountingBulanFilter } from "@/components/finance/accounting/AccountingBulanFilter";
import { useAccountingJournalDetail } from "@/components/finance/accounting/AccountingJournalDetail";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { HpTablePagination } from "@/components/finance/receivables-payables/HpTablePagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccBukuBesar } from "@/services/accountingService";
import type { AccBukuBesarRow } from "@/types/accounting";
import { formatAccAmount, formatAccDate } from "@/types/accounting";
import { Eye, Loader2 } from "lucide-react";

export function AccountingBukuBesarTab() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const { bulan } = useAccountingBulanFilter();
  const { openJournal, drawer } = useAccountingJournalDetail(budgetYearId);
  const [rows, setRows] = useState<AccBukuBesarRow[]>([]);
  const [accountNo, setAccountNo] = useState("");
  const [accountOptions, setAccountOptions] = useState<{ value: string; label: string }[]>([]);
  const [accountInfo, setAccountInfo] = useState<{
    account_no: string;
    account_name: string;
    kelompok_label: string;
    saldo: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchAccBukuBesar(budgetYearId, {
        account_no: accountNo || undefined,
        bulan,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setAccountOptions(result.account_options);
      setAccountInfo(result.account);
      if (!accountNo && result.account?.account_no) {
        setAccountNo(result.account.account_no);
      }
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
    } catch {
      setRows([]);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, accountNo, bulan, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search, accountNo, budgetYearId, bulan]);

  if (yearLoading || (loading && rows.length === 0 && !accountInfo)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat buku besar...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="Buku besar dikunci per tahun anggaran." />
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <select
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value)}
          className="min-w-[220px] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          {accountOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari jurnal, keterangan..." />
        {accountInfo && (
          <ToolbarKpi
            items={[
              { label: "Kelompok", value: accountInfo.kelompok_label, tone: "default" },
              { label: "Saldo Akun", value: formatAccAmount(accountInfo.saldo), tone: "default" },
            ]}
          />
        )}
      </ToolbarShell>

      <div className={tableGridShellClassName}>
        <Table>
          <THead>
            <TR>
              <TH>Tanggal</TH>
              <TH>No Jurnal</TH>
              <TH>Keterangan</TH>
              <TH className="text-right">Debet</TH>
              <TH className="text-right">Kredit</TH>
              <TH className="text-right">Saldo</TH>
              <TH>Status</TH>
              <TH className="w-10" />
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD colSpan={8} className="py-8 text-center text-sm text-slate-400">
                  Tidak ada mutasi
                </TD>
              </TR>
            ) : (
              rows.map((row) => (
                <TR key={`${row.no_jurnal}-${row.tanggal}`} className="group">
                  <TD>{formatAccDate(row.tanggal)}</TD>
                  <TD className="font-mono text-xs">{row.no_jurnal}</TD>
                  <TD className="max-w-[180px] truncate">{row.keterangan || "—"}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.debet)}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.kredit)}</TD>
                  <TD className="text-right tabular-nums font-medium">{formatAccAmount(row.saldo)}</TD>
                  <TD>
                    <Badge variant={row.posted ? "success" : "warning"}>
                      {row.posted ? "Posted" : "Draft"}
                    </Badge>
                  </TD>
                  <TD>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100"
                      onClick={() => void openJournal(row.no_jurnal)}
                      aria-label="Lihat detail jurnal"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TD>
                </TR>
              ))
            )}
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
      </div>
      <p className="text-[11px] text-slate-400">Sumber: ACC2026.JURNAL_E — Buku Besar per akun</p>
      {drawer}
    </div>
  );
}
