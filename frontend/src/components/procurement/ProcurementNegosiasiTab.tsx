"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ProcurementListShell } from "@/components/procurement/ProcurementListShell";
import { fetchProcurementMeta, fetchProcurementNegosiasi } from "@/services/procurementService";
import {
  formatProcurementAmount,
  formatProcurementDate,
  type ProcurementMeta,
  type ProcurementNegosiasiRow,
} from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

export function ProcurementNegosiasiTab() {
  const { budgetYearId } = useBudgetYearScope();
  const [meta, setMeta] = useState<ProcurementMeta | null>(null);
  const [rows, setRows] = useState<ProcurementNegosiasiRow[]>([]);
  const [summary, setSummary] = useState<Record<string, string | number | null>>({});
  const [listMeta, setListMeta] = useState<{
    total: number;
    page: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchProcurementMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProcurementNegosiasi({
        budget_year_id: budgetYearId,
        bulan: bulan ? Number(bulan) : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setListMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat negosiasi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, search, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, bulan, search, perPage]);

  return (
    <ProcurementListShell
      title="Negosiasi Harga"
      description="Proses negosiasi dengan vendor — sumber FINANCE.nego_harga terhubung ke AJU"
      source={String(summary.sumber ?? "FINANCE.nego_harga")}
      loading={loading}
      error={error}
      meta={listMeta}
      summary={summary}
      search={search}
      onSearchChange={setSearch}
      bulan={bulan}
      onBulanChange={setBulan}
      bulanOptions={meta?.bulan_options ?? []}
      page={page}
      perPage={perPage}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
    >
      <div className={tableGridShellClassName()}>
        <Table>
          <THead>
            <TR>
              <TH>No. Nego</TH>
              <TH>No. AJU</TH>
              <TH>Tanggal</TH>
              <TH>Uraian AJU</TH>
              <TH className="text-right">Nilai</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.no_nego}>
                <TD className="font-medium text-slate-800">{row.no_nego}</TD>
                <TD className="text-xs">{row.no_aju}</TD>
                <TD>{formatProcurementDate(row.tgl_nego)}</TD>
                <TD className="max-w-[180px] truncate" title={row.nama_aju}>
                  {row.nama_aju}
                </TD>
                <TD className="text-right tabular-nums">Rp {formatProcurementAmount(row.nilai_aju)}</TD>
                <TD>
                  <Badge variant="draft">{row.nego_status_label}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </ProcurementListShell>
  );
}
