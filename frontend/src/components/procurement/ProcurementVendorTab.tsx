"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ProcurementListShell } from "@/components/procurement/ProcurementListShell";
import { fetchProcurementVendor } from "@/services/procurementService";
import type { ProcurementVendorRow } from "@/types/procurement";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

export function ProcurementVendorTab() {
  const [rows, setRows] = useState<ProcurementVendorRow[]>([]);
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
  const [aktif, setAktif] = useState<"aktif" | "nonaktif" | "all">("aktif");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProcurementVendor({
        search: search || undefined,
        aktif,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setListMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat vendor.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, aktif, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, aktif, perPage]);

  return (
    <ProcurementListShell
      title="Daftar Vendor / Rekanan"
      description="Master supplier dari SIMARTDB.SUPL — registrasi, NPWP, dan status blacklist"
      source={String(summary.sumber ?? "SIMARTDB.SUPL")}
      loading={loading}
      error={error}
      meta={listMeta}
      summary={summary}
      search={search}
      onSearchChange={setSearch}
      bulan=""
      onBulanChange={() => {}}
      bulanOptions={[]}
      showBulan={false}
      page={page}
      perPage={perPage}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      extraFilters={
        <select
          value={aktif}
          onChange={(e) => setAktif(e.target.value as "aktif" | "nonaktif" | "all")}
          className="rounded border border-slate-200 px-2 py-1.5 text-xs"
        >
          <option value="aktif">Aktif</option>
          <option value="nonaktif">Nonaktif</option>
          <option value="all">Semua</option>
        </select>
      }
    >
      <div className={tableGridShellClassName()}>
        <Table>
          <THead>
            <TR>
              <TH>Kode</TH>
              <TH>Nama Vendor</TH>
              <TH>NPWP</TH>
              <TH>Kontak</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.kode_supplier}>
                <TD className="font-mono text-xs">{row.kode_supplier}</TD>
                <TD>
                  <p className="font-medium text-slate-800">{row.nama_supplier}</p>
                  <p className="text-[10px] text-slate-400">{row.alamat}</p>
                </TD>
                <TD className="text-xs">{row.npwp ?? "—"}</TD>
                <TD className="text-xs">{row.telepon ?? row.contact_person ?? "—"}</TD>
                <TD>
                  {row.blacklist ? (
                    <Badge variant="danger">Blacklist</Badge>
                  ) : row.aktif ? (
                    <Badge variant="success">Aktif</Badge>
                  ) : (
                    <Badge variant="draft">Nonaktif</Badge>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </ProcurementListShell>
  );
}
