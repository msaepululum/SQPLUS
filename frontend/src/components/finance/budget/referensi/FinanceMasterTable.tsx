"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, cardClassName } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import type { FinanceMasterTabId } from "@/types/finance-master";
import {
  fetchJenisBelanjaMaster,
  fetchJenisRekeningMaster,
  fetchKelompokBelanja,
  fetchPptkMaster,
  fetchPtkMaster,
  fetchSatuanMaster,
  fetchSroMaster,
} from "@/services/financeMasterService";
import { Database, Loader2 } from "lucide-react";

type ColumnDef<T> = {
  key: keyof T | string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type TabConfig<T> = {
  title: string;
  description: string;
  searchPlaceholder: string;
  load: () => Promise<T[]>;
  columns: ColumnDef<T>[];
  searchKeys: (keyof T)[];
};

const FINANCE_MASTER_CONFIG: Record<FinanceMasterTabId, TabConfig<Record<string, unknown>>> = {
  "kelompok-belanja": {
    title: "Kelompok Belanja",
    description: "Master kelompok belanja APBD dari database FINANCE",
    searchPlaceholder: "Cari kode kelompok belanja...",
    load: fetchKelompokBelanja,
    searchKeys: ["kode_kelompok_belanja"],
    columns: [{ key: "kode_kelompok_belanja", label: "Kode Kelompok Belanja" }],
  },
  "jenis-belanja": {
    title: "Jenis Belanja",
    description: "Master jenis belanja per kelompok dari database FINANCE",
    searchPlaceholder: "Cari kode jenis atau kelompok...",
    load: fetchJenisBelanjaMaster,
    searchKeys: ["kode_jenis_belanja", "kelompok_kode"],
    columns: [
      { key: "kelompok_kode", label: "Kelompok", className: "w-48" },
      { key: "kode_jenis_belanja", label: "Kode Jenis Belanja" },
    ],
  },
  pptk: {
    title: "PPTK",
    description: "Pejabat Pelaksana Teknis Kegiatan dari database FINANCE",
    searchPlaceholder: "Cari nama, NIP, atau no absen...",
    load: fetchPptkMaster,
    searchKeys: ["nama_pptk", "nip_pptk", "no_absen"],
    columns: [
      { key: "nama_pptk", label: "Nama PPTK" },
      { key: "nip_pptk", label: "NIP", className: "w-40" },
      { key: "no_absen", label: "No Absen", className: "w-28" },
    ],
  },
  "unit-ptk": {
    title: "Unit PTK",
    description: "Satuan pelaksana teknis kegiatan (unit kerja) dari database FINANCE",
    searchPlaceholder: "Cari satuan, nama PTK, atau PPTK...",
    load: fetchPtkMaster,
    searchKeys: ["nama_satuan_ptk", "nama_ptk", "pptk_nama", "nip_ptk", "no_absen"],
    columns: [
      { key: "nama_satuan_ptk", label: "Satuan PTK" },
      { key: "nama_ptk", label: "Nama PTK" },
      { key: "pptk_nama", label: "PPTK", className: "hidden lg:table-cell" },
      { key: "nip_ptk", label: "NIP", className: "w-36 hidden md:table-cell" },
      { key: "no_absen", label: "No Absen", className: "w-24" },
    ],
  },
  "jenis-rekening": {
    title: "Jenis Rekening",
    description: "Master kode rekening belanja dari database FINANCE",
    searchPlaceholder: "Cari no rekening atau nama...",
    load: fetchJenisRekeningMaster,
    searchKeys: ["no_rekening", "nama_jenis_rekening"],
    columns: [
      { key: "no_rekening", label: "No Rekening", className: "w-44 tabular-nums" },
      { key: "nama_jenis_rekening", label: "Nama Jenis Rekening" },
    ],
  },
  sro: {
    title: "SRO",
    description: "Standar Rekening Objek belanja dari database FINANCE",
    searchPlaceholder: "Cari no rekening, nama SRO, atau jenis belanja...",
    load: fetchSroMaster,
    searchKeys: ["no_rekening", "nama_sro", "jenis_belanja_kode"],
    columns: [
      { key: "no_rekening", label: "No Rekening", className: "w-40 tabular-nums" },
      { key: "nama_sro", label: "Nama SRO" },
      { key: "jenis_belanja_kode", label: "Jenis Belanja", className: "w-52 hidden md:table-cell" },
    ],
  },
  satuan: {
    title: "Satuan",
    description: "Master satuan barang/jasa dari database FINANCE",
    searchPlaceholder: "Cari nama satuan...",
    load: fetchSatuanMaster,
    searchKeys: ["nama_satuan"],
    columns: [{ key: "nama_satuan", label: "Nama Satuan" }],
  },
};

function cellValue(row: Record<string, unknown>, key: string): React.ReactNode {
  const value = row[key];
  if (value == null || value === "") return "—";
  return String(value);
}

type FinanceMasterTableProps = {
  tabId: FinanceMasterTabId;
};

export function FinanceMasterTable({ tabId }: FinanceMasterTableProps) {
  const config = FINANCE_MASTER_CONFIG[tabId];
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await config.load();
      setRows(data as Record<string, unknown>[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data master FINANCE.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      config.searchKeys.some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [rows, search, config.searchKeys]);

  return (
    <div className="mt-3 space-y-3">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">{config.title}</h3>
              <Badge variant="info" className="gap-1 text-[10px]">
                <Database className="h-3 w-3" />
                FINANCE · Read-only
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">{config.description}</p>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={config.searchPlaceholder}
            className="max-w-xs"
          />
        </div>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-500">
            {loading ? "Memuat..." : `${filteredRows.length} data`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data master...
          </div>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="Tidak ada data"
            description={error ? "Periksa koneksi database FINANCE." : "Belum ada data yang cocok dengan pencarian."}
            className="border-0 py-12"
          />
        ) : (
          <Table embedded>
            <THead>
              <TR>
                <TH className="w-14">No</TH>
                {config.columns.map((col) => (
                  <TH key={String(col.key)} className={col.className}>
                    {col.label}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {filteredRows.map((row, index) => (
                <TR key={String(row.id ?? index)}>
                  <TD className="tabular-nums text-slate-400">{index + 1}</TD>
                  {config.columns.map((col) => (
                    <TD key={String(col.key)} className={col.className}>
                      {col.render ? col.render(row) : cellValue(row, String(col.key))}
                    </TD>
                  ))}
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
