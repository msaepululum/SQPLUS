"use client";

import { useCallback, useEffect, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { HpTablePagination } from "@/components/finance/receivables-payables/HpTablePagination";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccCoa } from "@/services/accountingService";
import type { AccCoaRow } from "@/types/accounting";
import { formatAccAmount } from "@/types/accounting";
import { Loader2 } from "lucide-react";

const KELOMPOK_OPTIONS = [
  { value: "", label: "Semua Kelompok" },
  { value: "A", label: "Aset" },
  { value: "P", label: "Kewajiban" },
  { value: "M", label: "Ekuitas" },
  { value: "R", label: "Pendapatan" },
  { value: "B", label: "Beban" },
];

export function AccountingCoaTab() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<AccCoaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelompok, setKelompok] = useState("");
  const [detailOnly, setDetailOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [totalCoa, setTotalCoa] = useState(0);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchAccCoa(budgetYearId, {
        search: search || undefined,
        kelompok: kelompok || undefined,
        detail_only: detailOnly,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
      setTotalCoa(result.summary.total_accounts ?? 0);
    } catch {
      setRows([]);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, search, kelompok, detailOnly, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search, kelompok, detailOnly, budgetYearId]);

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat Chart of Accounts...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="COA dikunci per tahun anggaran." />
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari kode / nama akun..." />
        <select
          value={kelompok}
          onChange={(e) => setKelompok(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
        >
          {KELOMPOK_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={detailOnly}
            onChange={(e) => setDetailOnly(e.target.checked)}
            className="rounded border-slate-300"
          />
          Hanya akun detail
        </label>
        <ToolbarKpi items={[{ label: "Total COA", value: String(totalCoa), tone: "default" }]} />
      </ToolbarShell>

      <div className={tableGridShellClassName}>
        <Table>
          <THead>
            <TR>
              <TH>Kode Akun</TH>
              <TH>Nama Akun</TH>
              <TH>Kelompok</TH>
              <TH>Level</TH>
              <TH className="text-right">Saldo</TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD colSpan={5} className="py-8 text-center text-sm text-slate-400">
                  Tidak ada akun ditemukan
                </TD>
              </TR>
            ) : (
              rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-xs">{row.account_no}</TD>
                  <TD>
                    <span style={{ paddingLeft: `${Math.max(0, row.level - 1) * 12}px` }}>
                      {row.account_name}
                    </span>
                    {!row.is_detail && (
                      <Badge variant="draft" className="ml-2">
                        Header
                      </Badge>
                    )}
                  </TD>
                  <TD>
                    <Badge variant="info">{row.kelompok_label}</Badge>
                  </TD>
                  <TD>{row.level}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.saldo)}</TD>
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
          itemLabel="akun"
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
        />
      </div>
      <p className="text-[11px] text-slate-400">Sumber: ACC2026.CHARTACC</p>
    </div>
  );
}
