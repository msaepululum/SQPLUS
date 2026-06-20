"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  BudgetBlokirAnggaranApiError,
  fetchBudgetBlokirAnggaran,
  fetchBudgetBlokirAnggaranMeta,
  fetchBudgetBlokirHistori,
  saveBudgetBlokirAnggaran,
} from "@/services/budgetBlokirAnggaranService";
import {
  BLOKIR_BLOCK_TYPE_LABELS,
  BLOKIR_STATUS_FILTER_OPTIONS,
  formatBlokirAmount,
  type BlokirBlockType,
  type BlokirStatusKey,
  type BudgetBlokirAnggaranMeta,
  type BudgetBlokirAnggaranRow,
  type BudgetBlokirAnggaranSummary,
  type BudgetBlokirHistoriRow,
} from "@/types/budget-blokir-anggaran";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import {
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";

function statusBadgeVariant(status: BlokirStatusKey): "success" | "warning" | "danger" {
  if (status === "sebagian") return "warning";
  if (status === "total") return "danger";
  return "success";
}

function BlockTypeSelect({
  value,
  onChange,
  disabled,
}: {
  value: BlokirBlockType;
  onChange: (value: BlokirBlockType) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as BlokirBlockType)}
      disabled={disabled}
      className="h-8 text-xs"
    >
      <option value="P">{BLOKIR_BLOCK_TYPE_LABELS.P}</option>
      <option value="T">{BLOKIR_BLOCK_TYPE_LABELS.T}</option>
      <option value="O">{BLOKIR_BLOCK_TYPE_LABELS.O}</option>
    </Select>
  );
}

function HistoriPanel({
  rows,
  loading,
}: {
  rows: BudgetBlokirHistoriRow[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Memuat riwayat...
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className="py-2 text-xs text-slate-400">Belum ada riwayat blokir.</p>;
  }
  return (
    <div className="max-h-40 space-y-1.5 overflow-y-auto">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex flex-wrap items-start justify-between gap-2 rounded-md border border-slate-100 bg-white px-2.5 py-1.5 text-[11px]"
        >
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-700">
              {BLOKIR_BLOCK_TYPE_LABELS[row.block_type]}
            </span>
            {row.block_type === "P" && (
              <span className="ml-1.5 text-slate-500">vol. {row.block_volume}</span>
            )}
            {row.catatan && (
              <p className="mt-0.5 line-clamp-2 text-slate-500">{row.catatan}</p>
            )}
          </div>
          <span className="shrink-0 tabular-nums text-slate-400">
            {row.created_at?.slice(0, 16).replace("T", " ") ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BlokirAnggaranCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<BudgetBlokirAnggaranMeta | null>(null);
  const [rows, setRows] = useState<BudgetBlokirAnggaranRow[]>([]);
  const [summary, setSummary] = useState<BudgetBlokirAnggaranSummary | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BudgetBlokirAnggaranRow | null>(null);
  const [blockType, setBlockType] = useState<BlokirBlockType>("P");
  const [blockVolume, setBlockVolume] = useState("");
  const [catatan, setCatatan] = useState("");
  const [histori, setHistori] = useState<BudgetBlokirHistoriRow[]>([]);
  const [historiLoading, setHistoriLoading] = useState(false);
  const [showHistori, setShowHistori] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    void fetchBudgetBlokirAnggaranMeta()
      .then(setMeta)
      .catch((err) => {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal memuat referensi.",
        });
      });
  }, []);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchBudgetBlokirAnggaran({
        budget_year_id: budgetYearId,
        ptk_id: filterPtk || undefined,
        kelompok_belanja_id: filterKelompok || undefined,
        jenis_belanja_id: filterJenis || undefined,
        block_status: filterStatus || undefined,
        search: search || undefined,
        page,
        per_page: 50,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data blokir anggaran.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    budgetYearId,
    filterPtk,
    filterKelompok,
    filterJenis,
    filterStatus,
    search,
    page,
  ]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, filterPtk, filterKelompok, filterJenis, filterStatus, search]);

  const jenisOptionsForKelompok = useCallback(
    (kelompokId: string) => {
      if (!meta) return [];
      if (!kelompokId) return meta.jenis_belanja;
      return meta.jenis_belanja.filter(
        (jb) => String(jb.kelompok_belanja_id) === kelompokId
      );
    },
    [meta]
  );

  const hasActiveFilters = Boolean(
    filterPtk || filterKelompok || filterJenis || filterStatus || search
  );

  const resetFilters = () => {
    setFilterPtk("");
    setFilterKelompok("");
    setFilterJenis("");
    setFilterStatus("");
    setSearch("");
  };

  const openBlockPanel = (row: BudgetBlokirAnggaranRow) => {
    setSelected(row);
    setBlockType(row.status === "total" ? "O" : row.status === "sebagian" ? "O" : "P");
    setBlockVolume(row.block_volume ? String(row.block_volume) : "");
    setCatatan("");
    setShowHistori(false);
    setHistori([]);
  };

  const closeBlockPanel = () => {
    setSelected(null);
    setShowHistori(false);
    setHistori([]);
  };

  const loadHistori = async (rbaId: number) => {
    setHistoriLoading(true);
    try {
      const data = await fetchBudgetBlokirHistori(rbaId);
      setHistori(data);
      setShowHistori(true);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat riwayat blokir.",
      });
    } finally {
      setHistoriLoading(false);
    }
  };

  const handleSaveBlock = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const text = await saveBudgetBlokirAnggaran({
        rba_id: selected.rba_id,
        block_type: blockType,
        block_volume: blockVolume,
        catatan,
      });
      setMessage({ type: "success", text });
      closeBlockPanel();
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof BudgetBlokirAnggaranApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gagal menyimpan blokir.",
      });
    } finally {
      setSaving(false);
    }
  };

  const kpiItems = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Komponen", value: String(summary.total_rows), tone: "muted" as const },
      { label: "Aktif", value: String(summary.active_rows), tone: "plan" as const },
      {
        label: "Diblokir",
        value: String(summary.blocked_partial + summary.blocked_total),
        tone: "actual" as const,
      },
      {
        label: "Nilai diblokir",
        value: formatBlokirAmount(summary.blocked_nilai),
        tone: "default" as const,
      },
    ];
  }, [summary]);

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell footer={summary ? <ToolbarKpi items={kpiItems} /> : undefined}>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <ToolbarFilter label="Unit PTK" value={filterPtk} onChange={setFilterPtk}>
            <option value="">Semua</option>
            {(meta?.ptk ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_satuan_ptk}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter
            label="Kelompok"
            value={filterKelompok}
            onChange={(v) => {
              setFilterKelompok(v);
              setFilterJenis("");
            }}
          >
            <option value="">Semua</option>
            {(meta?.kelompok_belanja ?? []).map((k) => (
              <option key={k.id} value={k.id}>
                {k.kode_kelompok_belanja}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Jenis" value={filterJenis} onChange={setFilterJenis}>
            <option value="">Semua</option>
            {jenisOptionsForKelompok(filterKelompok).map((j) => (
              <option key={j.id} value={j.id}>
                {j.kode_jenis_belanja}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Status" value={filterStatus} onChange={setFilterStatus}>
            {BLOKIR_STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="KSRO / komponen..."
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mb-0.5 text-[10px] font-medium text-sky-600 hover:text-sky-800 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        {budgetYear && (
          <p className="text-[10px] text-slate-400 lg:ml-auto lg:pb-1">
            Komponen RBA · tahun {budgetYear.tahun}
          </p>
        )}
      </ToolbarShell>

      {message && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      {selected && (
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-b from-sky-50/60 to-white p-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800">{selected.nama_komponen}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">{selected.kode_ksro}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {selected.nama_satuan_ptk} · vol. {selected.volume}{" "}
                {selected.nama_satuan ?? ""} · {formatBlokirAmount(selected.total)}
              </p>
            </div>
            <button
              type="button"
              onClick={closeBlockPanel}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Aksi
              </span>
              <BlockTypeSelect value={blockType} onChange={setBlockType} disabled={saving} />
            </label>
            {blockType === "P" && (
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Volume blokir
                </span>
                <Input
                  value={blockVolume}
                  onChange={(e) => setBlockVolume(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={`Maks ${selected.volume || "—"}`}
                  className="h-8 text-xs"
                />
              </label>
            )}
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Catatan
              </span>
              <Input
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Alasan blokir / lepas blokir (opsional)"
                className="h-8 text-xs"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => void handleSaveBlock()}
              disabled={saving}
              className="h-8 text-xs"
            >
              {saving ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : blockType === "O" ? (
                <Unlock className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Lock className="mr-1.5 h-3.5 w-3.5" />
              )}
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadHistori(selected.rba_id)}
              disabled={historiLoading}
              className="h-8 text-xs"
            >
              <History className="mr-1.5 h-3.5 w-3.5" />
              Riwayat
            </Button>
          </div>
          {showHistori && <div className="mt-3 border-t border-sky-100 pt-2"><HistoriPanel rows={histori} loading={historiLoading} /></div>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat komponen RBA...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada komponen RBA"
          description="Sesuaikan filter atau pastikan data RBA tahun anggaran ini sudah tersedia di FINANCE."
          className="mt-0"
        />
      ) : (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0", tableGridShellClassName),
          })}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-800">Daftar Komponen RBA</h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[4.5rem] text-center tabular-nums">
                {page} / {lastPage}
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Table embedded>
            <THead>
              <TR>
                <TH className="min-w-[7rem]">Unit</TH>
                <TH className="min-w-[10rem]">KSRO / Komponen</TH>
                <TH className="w-14 text-right">Vol</TH>
                <TH className="text-right">Total</TH>
                <TH className="w-28">Status</TH>
                <TH className="w-20 text-center">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR
                  key={row.rba_id}
                  className={cn(
                    selected?.rba_id === row.rba_id && "bg-sky-50/70"
                  )}
                >
                  <TD className="align-top text-[11px] font-medium text-slate-700">
                    <div className="line-clamp-2">{row.nama_satuan_ptk}</div>
                    <div className="mt-0.5 text-[9px] text-slate-400">
                      {row.kode_jenis_belanja}
                    </div>
                  </TD>
                  <TD className="align-top">
                    <div className="font-mono text-[10px] text-slate-400">{row.kode_ksro}</div>
                    <div className="text-[11px] font-medium text-slate-800">
                      {row.nama_komponen}
                    </div>
                    {row.block_catatan && row.status !== "aktif" && (
                      <div className="mt-0.5 line-clamp-1 text-[10px] italic text-slate-400">
                        {row.block_catatan}
                      </div>
                    )}
                  </TD>
                  <TD className="text-right align-top tabular-nums text-[11px] text-slate-600">
                    {row.volume}
                    {row.block_volume != null && row.status === "sebagian" && (
                      <div className="text-[9px] text-amber-600">blok {row.block_volume}</div>
                    )}
                  </TD>
                  <TD className="text-right align-top tabular-nums text-[11px] font-medium text-[#0d6e63]">
                    {formatBlokirAmount(row.total)}
                  </TD>
                  <TD className="align-top">
                    <Badge variant={statusBadgeVariant(row.status)} className="text-[10px]">
                      {row.status_label}
                    </Badge>
                  </TD>
                  <TD className="text-center align-top">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => openBlockPanel(row)}
                      className="h-7 px-2 text-[10px]"
                    >
                      {row.status === "aktif" ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
