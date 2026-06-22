"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ProcurementListShell } from "@/components/procurement/ProcurementListShell";
import { ProcurementPoDetailDrawer } from "@/components/procurement/ProcurementPoDetailDrawer";
import { fetchProcurementMeta, fetchProcurementPo } from "@/services/procurementService";
import {
  formatProcurementAmount,
  formatProcurementDate,
  type ProcurementMeta,
  type ProcurementPoRow,
} from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

type ProcurementPoTabProps = {
  jenis: "po" | "spk" | "kontrak" | "all";
};

export function ProcurementPoTab({ jenis }: ProcurementPoTabProps) {
  const { budgetYearId } = useBudgetYearScope();
  const [meta, setMeta] = useState<ProcurementMeta | null>(null);
  const [rows, setRows] = useState<ProcurementPoRow[]>([]);
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
  const [selectedPo, setSelectedPo] = useState<string | null>(null);

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
      const result = await fetchProcurementPo({
        budget_year_id: budgetYearId,
        jenis,
        bulan: bulan ? Number(bulan) : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setListMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat PO/SPK.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, jenis, bulan, search, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, jenis, bulan, search, perPage]);

  const titleMap = {
    po: "Purchase Order (POH / POD)",
    spk: "Surat Perintah Kerja (SPK)",
    kontrak: "Kontrak Pengadaan",
    all: "Semua PO / SPK / Kontrak",
  };

  return (
    <>
      <ProcurementListShell
        title={titleMap[jenis]}
        description="Surat pesanan dan kontrak pengadaan — data header POH dan detail POD di SIMARTDB"
        source={String(summary.sumber ?? "SIMARTDB.POH / POD")}
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
                <TH>No. PO</TH>
                <TH>Tanggal</TH>
                <TH>No. AJU</TH>
                <TH>Supplier</TH>
                <TH>Jenis</TH>
                <TH className="text-right">Total</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR
                  key={row.no_po}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelectedPo(row.no_po)}
                >
                  <TD className="font-medium text-[#0d6e63]">{row.no_po}</TD>
                  <TD>{formatProcurementDate(row.tgl_po)}</TD>
                  <TD className="text-xs">{row.no_aju ?? "—"}</TD>
                  <TD className="max-w-[160px] truncate" title={row.nama_supplier}>
                    {row.nama_supplier}
                  </TD>
                  <TD>
                    <Badge variant="draft">{row.jenis_label}</Badge>
                  </TD>
                  <TD className="text-right tabular-nums">Rp {formatProcurementAmount(row.total)}</TD>
                  <TD>
                    {row.status_tutup ? (
                      <Badge variant="success">Tutup</Badge>
                    ) : (
                      <Badge variant="warning">Aktif</Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ProcurementListShell>

      <ProcurementPoDetailDrawer noPo={selectedPo} onClose={() => setSelectedPo(null)} />
    </>
  );
}
