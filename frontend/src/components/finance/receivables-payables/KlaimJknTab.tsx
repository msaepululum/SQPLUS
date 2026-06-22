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
import { HpTablePagination } from "@/components/finance/receivables-payables/HpTablePagination";
import { fetchKlaimJknList, fetchKlaimJknMeta } from "@/services/klaimJknService";
import type { KlaimJknMeta, KlaimJknRow } from "@/types/klaim-jkn";
import {
  formatKlaimAmount,
  formatKlaimDate,
  klaimStatusVariant,
} from "@/types/klaim-jkn";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

export function KlaimJknTab() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [meta, setMeta] = useState<KlaimJknMeta | null>(null);
  const [rows, setRows] = useState<KlaimJknRow[]>([]);
  const [summary, setSummary] = useState<{
    jumlah_klaim: number;
    total_pengajuan: number;
    total_setujui: number;
    total_tarif_rs: number;
    selisih_rs_gruper: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchKlaimJknMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const loadData = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    try {
      const result = await fetchKlaimJknList(budgetYearId, {
        status: status || undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
      setTotalRows(result.meta.total);
    } catch {
      setRows([]);
      setSummary(null);
      setLastPage(1);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, status, search, page, perPage]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [status, search, budgetYearId]);

  if (yearLoading || (loading && rows.length === 0 && !summary)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat klaim JKN...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Klaim JKN difilter berdasarkan tahun SEP/pulang."
      />
    );
  }

  const kpiItems = [
    { label: "Jumlah Klaim", value: String(summary?.jumlah_klaim ?? 0), tone: "muted" as const },
    {
      label: "Pengajuan",
      value: formatKlaimAmount(summary?.total_pengajuan ?? 0),
      tone: "plan" as const,
    },
    {
      label: "Disetujui",
      value: formatKlaimAmount(summary?.total_setujui ?? 0),
      tone: "default" as const,
    },
    {
      label: "Tarif RS",
      value: formatKlaimAmount(summary?.total_tarif_rs ?? 0),
      tone: "actual" as const,
    },
  ];

  return (
    <div className="mt-2 space-y-2">
      <ToolbarShell>
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder="Cari nama, SEP, MR, FPK, kartu..."
        />
        <ToolbarFilter label="Status" value={status} onChange={setStatus}>
          <option value="">Semua status</option>
          {meta?.status_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <div className="flex flex-1 flex-wrap items-end justify-end gap-2">
          <ToolbarKpi items={kpiItems} />
        </div>
      </ToolbarShell>

      <div className={cn(tableGridShellClassName, "overflow-hidden")}>
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data klaim...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Tidak ada klaim"
            description={`Belum ada data klaim JKN untuk tahun ${budgetYear.tahun}. Data tersedia di SIMRS_V2 (${meta?.source_table ?? "klaimbpjs"}).`}
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH className="w-[5.5rem]">Tgl Pulang</TH>
                  <TH className="w-[7.5rem]">No. SEP</TH>
                  <TH>Pasien</TH>
                  <TH className="w-[4rem]">Poli</TH>
                  <TH className="text-right">Pengajuan</TH>
                  <TH className="text-right">Grouper</TH>
                  <TH className="text-right">Tarif RS</TH>
                  <TH className="text-right">Setujui</TH>
                  <TH className="w-[5.5rem]">Status</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id_klaim}>
                    <TD className="text-[11px] tabular-nums">{formatKlaimDate(row.tgl_pulang)}</TD>
                    <TD className="font-mono text-[10px]" title={row.no_sep}>
                      {row.no_sep || "—"}
                    </TD>
                    <TD>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-slate-800">{row.nama}</p>
                        <p className="truncate text-[10px] text-slate-500">
                          {row.no_mr} · {row.no_kartu}
                        </p>
                      </div>
                    </TD>
                    <TD className="text-[10px]">{row.poli || "—"}</TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      {formatKlaimAmount(row.by_pengajuan)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-slate-600">
                      {formatKlaimAmount(row.by_tarif_gruper)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      {formatKlaimAmount(row.by_tarif_rs)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] font-semibold text-emerald-700">
                      {row.by_setujui > 0 ? formatKlaimAmount(row.by_setujui) : "—"}
                    </TD>
                    <TD>
                      <Badge variant={klaimStatusVariant(row.status_label)}>{row.status_label}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <HpTablePagination
              page={page}
              lastPage={lastPage}
              perPage={perPage}
              totalRows={totalRows}
              itemLabel="klaim"
              onPageChange={setPage}
              onPerPageChange={(n) => {
                setPerPage(n);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {meta && (
        <p className={cn(cardClassName({ variant: "flat", className: "!p-2 text-[10px] text-slate-500" }))}>
          Sumber: {meta.source_db}.{meta.source_table} · INACBG grouper · Selisih RS−Grouper tahun ini:{" "}
          {formatKlaimAmount(summary?.selisih_rs_gruper ?? 0)}
        </p>
      )}
    </div>
  );
}
