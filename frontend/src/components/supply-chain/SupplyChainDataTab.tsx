"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { fetchSupplyChainList } from "@/services/supplyChainService";
import {
  SUPPLY_CHAIN_PER_PAGE_OPTIONS,
  type SupplyChainListMeta,
} from "@/types/supply-chain";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import type { SupplyChainSection } from "@/constants/supply-chain-pages";

type SupplyChainDataTabProps = {
  slug: string;
  section: SupplyChainSection;
  title: string;
};

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "number") return value.toLocaleString("id-ID");
  return String(value);
}

export function SupplyChainDataTab({ slug, section, title }: SupplyChainDataTabProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [meta, setMeta] = useState<SupplyChainListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!section.dataStage) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSupplyChainList({
        slug,
        stage: section.dataStage,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.data);
      setColumns(result.columns);
      setMeta(result.meta);
      if (result.meta.error) setError(result.meta.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [slug, section.dataStage, search, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [slug, section.dataStage, search, perPage]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">
            Sumber: {section.source ?? meta?.source ?? "—"} · Read-only
          </p>
        </div>
        <input
          type="search"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm sm:w-56"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Memuat data dari {section.source}...
        </div>
      ) : error ? (
        <EmptyState title="Gagal memuat data" description={error} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada data"
          description={`Tabel ${section.source} kosong atau tidak ditemukan.`}
        />
      ) : (
        <>
          <div className={tableGridShellClassName}>
            <Table>
              <THead>
                <TR>
                  {columns.map((col) => (
                    <TH key={col}>{col}</TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {rows.map((row, idx) => (
                  <TR key={idx}>
                    {columns.map((col) => (
                      <TD key={col} className="max-w-[14rem] truncate text-xs">
                        {formatCell(row[col])}
                      </TD>
                    ))}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          {meta && meta.total > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan {meta.from}–{meta.to} dari {meta.total.toLocaleString("id-ID")} baris
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={String(perPage)}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="h-8 text-xs"
                >
                  {SUPPLY_CHAIN_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / hal
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded border border-slate-200 p-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-slate-600">
                  {meta.current_page} / {meta.last_page}
                </span>
                <button
                  type="button"
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded border border-slate-200 p-1.5 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
