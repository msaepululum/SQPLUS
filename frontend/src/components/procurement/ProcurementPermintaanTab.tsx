"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ProcurementListShell } from "@/components/procurement/ProcurementListShell";
import {
  fetchProcurementMeta,
  fetchProcurementPermintaan,
} from "@/services/procurementService";
import {
  formatProcurementAmount,
  formatProcurementDate,
  type ProcurementMeta,
  type ProcurementPermintaanRow,
} from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

type ProcurementPermintaanTabProps = {
  tab: "daftar" | "tracking" | "buat";
};

const QUEUE_BY_TAB: Record<string, "antrian" | "close" | "all"> = {
  daftar: "close",
  tracking: "antrian",
};

export function ProcurementPermintaanTab({ tab }: ProcurementPermintaanTabProps) {
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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchProcurementMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId || tab === "buat") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProcurementPermintaan({
        budget_year_id: budgetYearId,
        queue: QUEUE_BY_TAB[tab] ?? "antrian",
        bulan: bulan ? Number(bulan) : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setListMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat permintaan.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, tab, bulan, search, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, tab, bulan, search, perPage]);

  if (tab === "buat") {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
        <h3 className="text-base font-semibold text-slate-800">Buat Permintaan Baru</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          Pengajuan permintaan barang/jasa dibuat di modul Keuangan & Belanja (AJU). Setelah
          disetujui, data muncul di antrian pengadaan ini untuk diproses di SIMARTDB.
        </p>
        <Link
          href="/finance/expenditure/proses-belanja/pengajuan"
          className="mt-4 inline-flex rounded-lg bg-[#0d6e63] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a5a52]"
        >
          Buka Pengajuan Belanja (Keuangan)
        </Link>
      </div>
    );
  }

  const title = tab === "tracking" ? "Tracking Antrian Pengadaan" : "Daftar Permintaan (AJU Close)";
  const description =
    tab === "tracking"
      ? "AJU approved / dalam proses pengadaan — negosiasi, PO, penerimaan"
      : "Permintaan bersumber dari AJU modul Keuangan dengan status CLOSE, diproses di SIMARTDB";

  return (
    <ProcurementListShell
      title={title}
      description={description}
      source={String(summary.sumber ?? "FINANCE.aju")}
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
              <TH>No. AJU</TH>
              <TH>Tanggal</TH>
              <TH>Unit</TH>
              <TH>Uraian</TH>
              <TH className="text-right">Nilai</TH>
              <TH>Tahap</TH>
              <TH>PO / GR</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.no_pengajuan}>
                <TD className="font-medium text-slate-800">{row.no_pengajuan}</TD>
                <TD>{formatProcurementDate(row.tanggal)}</TD>
                <TD>{row.unit}</TD>
                <TD className="max-w-[200px] truncate" title={row.uraian}>
                  {row.uraian}
                </TD>
                <TD className="text-right tabular-nums">Rp {formatProcurementAmount(row.total)}</TD>
                <TD>
                  <Badge variant="draft">{row.tahap_label}</Badge>
                </TD>
                <TD className="text-xs text-slate-500">
                  {row.no_po_simart ? `PO: ${row.no_po_simart}` : "—"}
                  {row.no_beli_simart ? ` · GR: ${row.no_beli_simart}` : ""}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </ProcurementListShell>
  );
}
