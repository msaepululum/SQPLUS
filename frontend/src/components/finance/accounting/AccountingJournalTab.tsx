"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccountingBulanFilter } from "@/components/finance/accounting/AccountingBulanFilter";
import { useAccountingJournalDetail } from "@/components/finance/accounting/AccountingJournalDetail";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  ToolbarFilter,
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
import {
  fetchAccJurnalOtomatis,
  fetchAccJurnalUmum,
  fetchAccPostingJurnal,
} from "@/services/accountingService";
import type { AccJournalRow } from "@/types/accounting";
import { formatAccAmount, formatAccDate } from "@/types/accounting";
import { Eye, Loader2 } from "lucide-react";

type AccountingJournalTabProps = {
  mode: "umum" | "otomatis" | "posting";
};

const FETCHERS = {
  umum: fetchAccJurnalUmum,
  otomatis: fetchAccJurnalOtomatis,
  posting: fetchAccPostingJurnal,
} as const;

const MODE_LABELS = {
  umum: "Jurnal Umum (BKA)",
  otomatis: "Jurnal Otomatis",
  posting: "Belum Diposting",
};

const OTOMATIS_TYPE_OPTIONS = [
  { value: "", label: "Semua Jenis" },
  { value: "BIL", label: "BIL — Billing" },
  { value: "BIF", label: "BIF — Billing Farmasi" },
  { value: "BKM", label: "BKM — Kas Masuk" },
  { value: "BBM", label: "BBM — Bank Masuk" },
  { value: "BBK", label: "BBK — Bank Keluar" },
  { value: "BKK", label: "BKK — Kas Keluar" },
  { value: "BBA", label: "BBA — Beban Admin Bank" },
  { value: "BLF", label: "BLF — Belanja Farmasi" },
  { value: "BLL", label: "BLL — Belanja Lainnya" },
  { value: "BUM", label: "BUM — Belanja Umum" },
  { value: "PRI", label: "PRI — Penerimaan Internal" },
];

export function AccountingJournalTab({ mode }: AccountingJournalTabProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const { bulan } = useAccountingBulanFilter();
  const { openJournal, drawer } = useAccountingJournalDetail(budgetYearId);
  const [rows, setRows] = useState<AccJournalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [journalType, setJournalType] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [summary, setSummary] = useState({ total_debet: 0, total_kredit: 0 });

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await FETCHERS[mode](budgetYearId, {
        search: search || undefined,
        bulan,
        journal_type: mode === "otomatis" && journalType ? journalType : undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
      setSummary({
        total_debet: Number(result.summary.total_debet ?? 0),
        total_kredit: Number(result.summary.total_kredit ?? 0),
      });
    } catch {
      setRows([]);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, mode, search, bulan, journalType, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search, budgetYearId, mode, bulan, journalType]);

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat {MODE_LABELS[mode]}...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState title="Pilih tahun anggaran" description="Data jurnal dikunci per tahun anggaran." />
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari no jurnal, keterangan..." />
        {mode === "otomatis" && (
          <ToolbarFilter label="Jenis" value={journalType} onChange={setJournalType}>
            {OTOMATIS_TYPE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </ToolbarFilter>
        )}
        <ToolbarKpi
          items={[
            { label: "Total Debet", value: formatAccAmount(summary.total_debet), tone: "default" },
            { label: "Total Kredit", value: formatAccAmount(summary.total_kredit), tone: "default" },
            { label: "Baris", value: String(totalRows), tone: "muted" },
          ]}
        />
      </ToolbarShell>

      <div className={tableGridShellClassName}>
        <Table>
          <THead>
            <TR>
              <TH>No Jurnal</TH>
              <TH>Tanggal</TH>
              <TH>Jenis</TH>
              <TH>Keterangan</TH>
              <TH className="text-right">Debet</TH>
              <TH className="text-right">Kredit</TH>
              <TH>Status</TH>
              <TH className="w-10" />
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD colSpan={8} className="py-8 text-center text-sm text-slate-400">
                  Tidak ada jurnal
                </TD>
              </TR>
            ) : (
              rows.map((row) => (
                <TR key={row.no_jurnal} className="group">
                  <TD className="font-mono text-xs">{row.no_jurnal}</TD>
                  <TD>{formatAccDate(row.tanggal)}</TD>
                  <TD>
                    <Badge variant="info">{row.journal_type}</Badge>
                  </TD>
                  <TD className="max-w-[200px] truncate">{row.keterangan || "—"}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.debet)}</TD>
                  <TD className="text-right tabular-nums">{formatAccAmount(row.kredit)}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={row.posted ? "success" : "warning"}>
                        {row.posted ? "Posted" : "Draft"}
                      </Badge>
                      {row.valid && <Badge variant="draft">Valid</Badge>}
                    </div>
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
          itemLabel="jurnal"
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
        />
      </div>
      <p className="text-[11px] text-slate-400">Sumber: ACC2026.JURNAL_H — {MODE_LABELS[mode]}</p>
      {drawer}
    </div>
  );
}
