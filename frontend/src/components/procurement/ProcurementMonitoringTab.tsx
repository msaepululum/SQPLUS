"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ProcurementListShell } from "@/components/procurement/ProcurementListShell";
import { fetchProcurementMeta, fetchProcurementMonitoring } from "@/services/procurementService";
import {
  formatProcurementAmount,
  formatProcurementDate,
  type ProcurementMeta,
  type ProcurementPermintaanRow,
} from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

const STAGE_OPTIONS = [
  { value: "", label: "Semua tahap" },
  { value: "disetujui", label: "Disetujui" },
  { value: "negosiasi", label: "Negosiasi" },
  { value: "surat-pesanan", label: "Surat Pesanan" },
  { value: "penerimaan-barang", label: "Penerimaan Barang" },
  { value: "verifikasi-berkas", label: "Verifikasi Berkas" },
  { value: "pembayaran-berhasil", label: "Pembayaran Berhasil" },
];

export function ProcurementMonitoringTab() {
  const { budgetYearId } = useBudgetYearScope();
  const [meta, setMeta] = useState<ProcurementMeta | null>(null);
  const [rows, setRows] = useState<ProcurementPermintaanRow[]>([]);
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
  const [stage, setStage] = useState("");
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
      const result = await fetchProcurementMonitoring({
        budget_year_id: budgetYearId,
        stage: stage || undefined,
        bulan: bulan ? Number(bulan) : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setListMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat monitoring.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, stage, bulan, search, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, stage, bulan, search, perPage]);

  return (
    <ProcurementListShell
      title="Monitoring Pipeline Pengadaan"
      description="Lacak AJU dari Keuangan hingga PO dan penerimaan di SIMARTDB"
      source={String(summary.sumber ?? "FINANCE.aju + SIMARTDB")}
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
      extraFilters={
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded border border-slate-200 px-2 py-1.5 text-xs"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      }
    >
      <div className={tableGridShellClassName()}>
        <Table>
          <THead>
            <TR>
              <TH>No. AJU</TH>
              <TH>Tahap</TH>
              <TH>Unit</TH>
              <TH className="text-right">Nilai</TH>
              <TH>PO SIMART</TH>
              <TH>GR SIMART</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.no_pengajuan}>
                <TD className="font-medium">{row.no_pengajuan}</TD>
                <TD>
                  <Badge variant="draft">{row.tahap_label}</Badge>
                </TD>
                <TD>{row.unit}</TD>
                <TD className="text-right tabular-nums">Rp {formatProcurementAmount(row.total)}</TD>
                <TD className="text-xs">{row.no_po_simart ?? "—"}</TD>
                <TD className="text-xs">{row.no_beli_simart ?? "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </ProcurementListShell>
  );
}
