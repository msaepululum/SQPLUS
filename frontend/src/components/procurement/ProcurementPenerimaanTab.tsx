"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ProcurementListShell } from "@/components/procurement/ProcurementListShell";
import { ProcurementPenerimaanDetailDrawer } from "@/components/procurement/ProcurementPenerimaanDetailDrawer";
import { fetchProcurementMeta, fetchProcurementPenerimaan } from "@/services/procurementService";
import {
  formatProcurementAmount,
  formatProcurementDate,
  type ProcurementMeta,
  type ProcurementPenerimaanRow,
} from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

export function ProcurementPenerimaanTab() {
  const { budgetYearId } = useBudgetYearScope();
  const [meta, setMeta] = useState<ProcurementMeta | null>(null);
  const [rows, setRows] = useState<ProcurementPenerimaanRow[]>([]);
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
  const [selectedBeli, setSelectedBeli] = useState<string | null>(null);

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
      const result = await fetchProcurementPenerimaan({
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
      setError(err instanceof Error ? err.message : "Gagal memuat penerimaan.");
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
    <>
      <ProcurementListShell
        title="Penerimaan Barang/Jasa"
        description="Goods receipt — header INBELIH dan detail barang INBELID di SIMARTDB"
        source={String(summary.sumber ?? "SIMARTDB.INBELIH / INBELID")}
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
                <TH>No. Beli</TH>
                <TH>Tanggal</TH>
                <TH>No. AJU</TH>
                <TH>No. PO</TH>
                <TH>Supplier</TH>
                <TH className="text-right">Total</TH>
                <TH>BAST</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR
                  key={row.no_beli}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedBeli(row.no_beli)}
                >
                  <TD className="font-medium text-[#0d6e63]">{row.no_beli}</TD>
                  <TD>{formatProcurementDate(row.tgl_beli)}</TD>
                  <TD className="text-xs">{row.no_aju ?? "—"}</TD>
                  <TD className="text-xs">{row.no_po ?? "—"}</TD>
                  <TD className="max-w-[140px] truncate" title={row.nama_supplier}>
                    {row.nama_supplier}
                  </TD>
                  <TD className="text-right tabular-nums">Rp {formatProcurementAmount(row.total)}</TD>
                  <TD>
                    {row.no_bast ? (
                      <Badge variant="success">{row.no_bast}</Badge>
                    ) : (
                      <Badge variant="draft">—</Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ProcurementListShell>

      <ProcurementPenerimaanDetailDrawer
        noBeli={selectedBeli}
        onClose={() => setSelectedBeli(null)}
      />
    </>
  );
}
