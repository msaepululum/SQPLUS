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
  ToolbarSegmented,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { BudgetHistoryTimeline } from "@/components/finance/budget/perubahan/BudgetHistoryTimeline";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { fetchBudgetRiwayatEvents } from "@/services/budgetRiwayatPerubahanService";
import {
  BudgetPaguPergeseranApiError,
  createBudgetPaguPergeseran,
  fetchBudgetPaguPergeseran,
  fetchBudgetPaguPergeseranMeta,
  fetchBudgetPaguPergeseranTargets,
  submitBudgetPaguPergeseran,
} from "@/services/budgetPaguPergeseranService";
import {
  formatPergeseranAmount,
  PERGESERAN_LEVEL_OPTIONS,
  PERGESERAN_STATUS_FILTER_OPTIONS,
  targetLabel,
  type BudgetPaguPergeseranMeta,
  type BudgetPaguPergeseranRow,
  type BudgetPaguPergeseranSummary,
  type BudgetPaguPergeseranTarget,
  type PergeseranLevel,
  type PergeseranStatus,
} from "@/types/budget-pagu-pergeseran";
import type { BudgetRiwayatEvent } from "@/types/budget-riwayat-perubahan";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  History,
  List,
  Loader2,
  Plus,
  Send,
} from "lucide-react";

type ViewMode = "buat" | "pengajuan";

function statusBadgeVariant(
  status: PergeseranStatus
): "success" | "warning" | "danger" | "info" | "draft" {
  if (status === "applied") return "success";
  if (status === "rejected") return "danger";
  if (status === "draft") return "draft";
  if (status === "in_review" || status === "submitted") return "info";
  return "warning";
}

function ShiftEndpoint({
  title,
  unit,
  detail,
  pagu,
  after,
  tone,
}: {
  title: string;
  unit: string | null;
  detail: string | null;
  pagu: number;
  after?: number;
  tone: "source" | "dest";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        tone === "source"
          ? "border-amber-200/80 bg-amber-50/40"
          : "border-emerald-200/80 bg-emerald-50/40"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 text-[11px] font-medium text-slate-800">{unit ?? "—"}</p>
      {detail && <p className="text-[10px] text-slate-500">{detail}</p>}
      <p className="mt-1.5 text-sm font-semibold tabular-nums text-[#0d6e63]">
        {formatPergeseranAmount(pagu)}
      </p>
      {after != null && (
        <p className="text-[10px] tabular-nums text-slate-500">
          → {formatPergeseranAmount(after)}
        </p>
      )}
    </div>
  );
}

export function PergeseranPaguCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<BudgetPaguPergeseranMeta | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("buat");
  const [level, setLevel] = useState<PergeseranLevel>("jenis_belanja");
  const [targets, setTargets] = useState<BudgetPaguPergeseranTarget[]>([]);
  const [rows, setRows] = useState<BudgetPaguPergeseranRow[]>([]);
  const [summary, setSummary] = useState<BudgetPaguPergeseranSummary | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterInduk, setFilterInduk] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [nominal, setNominal] = useState("");
  const [alasan, setAlasan] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [historyRowId, setHistoryRowId] = useState<number | null>(null);
  const [historyEvents, setHistoryEvents] = useState<BudgetRiwayatEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    void fetchBudgetPaguPergeseranMeta()
      .then(setMeta)
      .catch((err) => {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal memuat referensi.",
        });
      });
  }, []);

  const loadTargets = useCallback(async () => {
    if (!budgetYearId) {
      setTargets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchBudgetPaguPergeseranTargets({
        budget_year_id: budgetYearId,
        level,
        ptk_id: filterPtk || undefined,
        kelompok_belanja_id: filterKelompok || undefined,
        jenis_belanja_id: filterJenis || undefined,
        pagu_jenis_belanja_id: level === "ksro" ? filterInduk || undefined : undefined,
        search: search || undefined,
      });
      setTargets(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data pagu.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, level, filterPtk, filterKelompok, filterJenis, filterInduk, search]);

  const loadShifts = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchBudgetPaguPergeseran({
        budget_year_id: budgetYearId,
        level,
        status: filterStatus || undefined,
        ptk_id: filterPtk || undefined,
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
        text: err instanceof Error ? err.message : "Gagal memuat pengajuan pergeseran.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, level, filterStatus, filterPtk, search, page]);

  useEffect(() => {
    if (viewMode === "buat") {
      void loadTargets();
    } else {
      void loadShifts();
    }
  }, [viewMode, loadTargets, loadShifts]);

  useEffect(() => {
    setPage(1);
    setSourceId("");
    setDestId("");
  }, [budgetYearId, level, filterPtk, filterKelompok, filterJenis, filterInduk, filterStatus, search, viewMode]);

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

  const indukOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of targets) {
      if (t.pagu_jenis_belanja_id && t.level === "ksro") {
        map.set(
          t.pagu_jenis_belanja_id,
          `${t.nama_satuan_ptk} · ${t.kode_jenis_belanja}`
        );
      }
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [targets]);

  const selectableTargets = useMemo(() => {
    let list = targets.filter((t) => !t.pending_shift && t.pagu_saat_ini > 0);
    if (level === "ksro" && filterInduk) {
      list = list.filter((t) => String(t.pagu_jenis_belanja_id) === filterInduk);
    }
    return list;
  }, [targets, level, filterInduk]);

  const sourceTarget = useMemo(
    () => selectableTargets.find((t) => String(t.finance_id) === sourceId) ?? null,
    [selectableTargets, sourceId]
  );

  const destOptions = useMemo(
    () => selectableTargets.filter((t) => String(t.finance_id) !== sourceId),
    [selectableTargets, sourceId]
  );

  const destTarget = useMemo(
    () => destOptions.find((t) => String(t.finance_id) === destId) ?? null,
    [destOptions, destId]
  );

  const nominalNum = Number(nominal.replace(/[^\d]/g, "") || "0");

  const hasActiveFilters = Boolean(
    filterPtk || filterKelompok || filterJenis || filterInduk || filterStatus || search
  );

  const resetFilters = () => {
    setFilterPtk("");
    setFilterKelompok("");
    setFilterJenis("");
    setFilterInduk("");
    setFilterStatus("");
    setSearch("");
  };

  const resetForm = () => {
    setShowForm(false);
    setSourceId("");
    setDestId("");
    setNominal("");
    setAlasan("");
  };

  const handleCreate = async (submitAfter = false) => {
    if (!budgetYearId || !sourceId || !destId) return;
    setSaving(true);
    setMessage(null);
    try {
      const id = await createBudgetPaguPergeseran({
        budget_year_id: budgetYearId,
        level,
        source_finance_id: Number(sourceId),
        dest_finance_id: Number(destId),
        nominal,
        alasan,
      });

      if (submitAfter) {
        const text = await submitBudgetPaguPergeseran(id);
        setMessage({ type: "success", text });
      } else {
        setMessage({ type: "success", text: "Draft pergeseran pagu berhasil disimpan." });
      }

      resetForm();
      setViewMode("pengajuan");
      await loadShifts();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof BudgetPaguPergeseranApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gagal menyimpan pergeseran pagu.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitDraft = async (row: BudgetPaguPergeseranRow) => {
    setSaving(true);
    setMessage(null);
    try {
      const text = await submitBudgetPaguPergeseran(row.id);
      setMessage({ type: "success", text });
      await loadShifts();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengajukan pergeseran.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleHistory = async (row: BudgetPaguPergeseranRow) => {
    if (historyRowId === row.id) {
      setHistoryRowId(null);
      setHistoryEvents([]);
      return;
    }
    setHistoryRowId(row.id);
    setHistoryLoading(true);
    setHistoryEvents([]);
    try {
      const data = await fetchBudgetRiwayatEvents("pergeseran", row.id);
      setHistoryEvents(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat riwayat pergeseran.",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const kpiItems = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Total", value: String(summary.total), tone: "muted" as const },
      { label: "Review", value: String(summary.in_progress), tone: "actual" as const },
      { label: "Diterapkan", value: String(summary.applied), tone: "plan" as const },
      {
        label: "Nominal",
        value: formatPergeseranAmount(summary.total_nominal),
        tone: "default" as const,
      },
    ];
  }, [summary]);

  const canSubmitForm =
    alasan.trim().length >= 10 &&
    nominalNum > 0 &&
    sourceTarget != null &&
    destTarget != null &&
    nominalNum <= sourceTarget.pagu_saat_ini;

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell
        footer={
          viewMode === "pengajuan" && summary ? <ToolbarKpi items={kpiItems} /> : undefined
        }
      >
        <div className="flex flex-wrap items-end gap-2">
          <ToolbarSegmented<ViewMode>
            value={viewMode}
            onChange={(mode) => {
              setViewMode(mode);
              resetForm();
            }}
            options={[
              {
                value: "buat",
                label: "Buat Pergeseran",
                shortLabel: "Buat",
                icon: <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />,
              },
              {
                value: "pengajuan",
                label: "Pengajuan",
                shortLabel: "Daftar",
                icon: <List className="h-3.5 w-3.5" strokeWidth={2.25} />,
              },
            ]}
          />
          <ToolbarSegmented<PergeseranLevel>
            value={level}
            onChange={(v) => {
              setLevel(v);
              resetForm();
              setFilterInduk("");
            }}
            options={PERGESERAN_LEVEL_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
              shortLabel: opt.shortLabel,
              hint: opt.hint,
            }))}
          />
          {viewMode === "buat" && !showForm && (
            <Button
              type="button"
              onClick={() => setShowForm(true)}
              className="h-[30px] px-2.5 text-[11px]"
            >
              <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
              Form Pergeseran
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-2 lg:border-l lg:border-slate-200/80 lg:pl-4">
          <ToolbarFilter label="Unit PTK" value={filterPtk} onChange={setFilterPtk}>
            <option value="">Semua</option>
            {(meta?.ptk ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_satuan_ptk}
              </option>
            ))}
          </ToolbarFilter>
          {level === "jenis_belanja" && (
            <>
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
            </>
          )}
          {level === "ksro" && indukOptions.length > 0 && (
            <ToolbarFilter label="Pagu Induk" value={filterInduk} onChange={setFilterInduk}>
              <option value="">Semua induk</option>
              {indukOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </ToolbarFilter>
          )}
          {viewMode === "pengajuan" && (
            <ToolbarFilter label="Status" value={filterStatus} onChange={setFilterStatus}>
              {PERGESERAN_STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </ToolbarFilter>
          )}
          <ToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder={level === "ksro" ? "KSRO..." : "Unit / jenis..."}
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
      </ToolbarShell>

      {budgetYear && (
        <p className="text-[10px] text-slate-400">
          Pergeseran pagu · tahun {budgetYear.tahun} · total anggaran tidak berubah (alokasi dipindah)
          {level === "ksro" ? " · KSRO dalam pagu induk yang sama" : " · antar unit/jenis belanja"}
        </p>
      )}

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

      {viewMode === "buat" && showForm && (
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-b from-sky-50/60 to-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-800">Form Pergeseran Pagu</h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pagu asal (kurang)
              </span>
              <Select
                value={sourceId}
                onChange={(e) => {
                  setSourceId(e.target.value);
                  setDestId("");
                }}
                className="h-8 text-xs"
              >
                <option value="">Pilih pagu asal</option>
                {selectableTargets.map((t) => (
                  <option key={t.finance_id} value={t.finance_id}>
                    {targetLabel(t)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pagu tujuan (tambah)
              </span>
              <Select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                disabled={!sourceId}
                className="h-8 text-xs"
              >
                <option value="">Pilih pagu tujuan</option>
                {destOptions.map((t) => (
                  <option key={t.finance_id} value={t.finance_id}>
                    {targetLabel(t)}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {sourceTarget ? (
              <ShiftEndpoint
                title="Asal"
                unit={sourceTarget.nama_satuan_ptk}
                detail={
                  sourceTarget.kode_ksro
                    ? sourceTarget.kode_ksro
                    : sourceTarget.kode_jenis_belanja
                }
                pagu={sourceTarget.pagu_saat_ini}
                after={
                  nominalNum > 0 ? Math.max(0, sourceTarget.pagu_saat_ini - nominalNum) : undefined
                }
                tone="source"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[11px] text-slate-400">
                Pilih pagu asal
              </div>
            )}
            <div className="flex flex-col items-center justify-center gap-1 px-2">
              <ArrowLeftRight className="h-5 w-5 text-sky-500" />
              <Input
                value={nominal}
                onChange={(e) => setNominal(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Nominal"
                className="h-8 w-full min-w-[7rem] text-center text-xs tabular-nums lg:w-28"
              />
            </div>
            {destTarget ? (
              <ShiftEndpoint
                title="Tujuan"
                unit={destTarget.nama_satuan_ptk}
                detail={
                  destTarget.kode_ksro ? destTarget.kode_ksro : destTarget.kode_jenis_belanja
                }
                pagu={destTarget.pagu_saat_ini}
                after={
                  nominalNum > 0 ? destTarget.pagu_saat_ini + nominalNum : undefined
                }
                tone="dest"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-[11px] text-slate-400">
                Pilih pagu tujuan
              </div>
            )}
          </div>

          <label className="mt-3 flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Alasan pergeseran
            </span>
            <Input
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Minimal 10 karakter"
              className="h-8 text-xs"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleCreate(false)}
              disabled={saving || !canSubmitForm}
              className="h-8 text-xs"
            >
              Simpan Draft
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreate(true)}
              disabled={saving || !canSubmitForm}
              className="h-8 text-xs"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {saving ? "Mengajukan..." : "Ajukan"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data...
        </div>
      ) : viewMode === "buat" ? (
        targets.length === 0 ? (
          <EmptyState
            title="Belum ada pagu"
            description="Lengkapi Input Pagu Unit dan Distribusi Pagu terlebih dahulu."
            className="mt-0"
          />
        ) : (
          <div
            className={cardClassName({
              variant: "default",
              className: cn("!p-0", tableGridShellClassName),
            })}
          >
            <div className="border-b border-slate-100 px-3 py-2">
              <h3 className="text-xs font-semibold text-slate-800">
                Referensi Pagu ({selectableTargets.length} dapat dipindah)
              </h3>
            </div>
            <Table embedded>
              <THead>
                <TR>
                  <TH>Unit / Jenis</TH>
                  {level === "ksro" && <TH>KSRO</TH>}
                  <TH className="text-right">Pagu</TH>
                  <TH className="w-24">Status</TH>
                </TR>
              </THead>
              <TBody>
                {targets.slice(0, 100).map((row) => (
                  <TR key={`${row.level}-${row.finance_id}`}>
                    <TD className="text-[11px]">
                      <div className="font-medium text-slate-700">{row.nama_satuan_ptk}</div>
                      <div className="text-[10px] text-slate-400">{row.kode_jenis_belanja}</div>
                    </TD>
                    {level === "ksro" && (
                      <TD className="text-[11px]">
                        <div className="font-mono text-[10px] text-slate-400">{row.kode_ksro}</div>
                        <div className="line-clamp-1">{row.nama_ksro}</div>
                      </TD>
                    )}
                    <TD className="text-right tabular-nums text-[11px] font-semibold text-[#0d6e63]">
                      {formatPergeseranAmount(row.pagu_saat_ini)}
                    </TD>
                    <TD>
                      {row.pending_shift ? (
                        <Badge variant="warning" className="text-[10px]">
                          Proses
                        </Badge>
                      ) : row.pagu_saat_ini > 0 ? (
                        <Badge variant="success" className="text-[10px]">
                          Siap
                        </Badge>
                      ) : (
                        <Badge variant="draft" className="text-[10px]">
                          Kosong
                        </Badge>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada pengajuan pergeseran"
          description="Buat pergeseran dari tab Buat Pergeseran."
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
            <h3 className="text-xs font-semibold text-slate-800">Daftar Pergeseran</h3>
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
                <TH>No</TH>
                <TH>Asal → Tujuan</TH>
                <TH className="text-right">Nominal</TH>
                <TH>Status</TH>
                <TH className="w-24 text-center">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="align-top text-[11px]">
                    <div className="font-mono text-[10px] text-slate-400">
                      {row.nomor_pengajuan ?? `#${row.id}`}
                    </div>
                    <div className="text-[10px] text-slate-500">{row.level_label}</div>
                  </TD>
                  <TD className="align-top text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <span className="font-medium text-amber-800">
                        {row.source_nama_satuan_ptk}
                      </span>
                      <ArrowLeftRight className="mt-0.5 h-3 w-3 shrink-0 text-slate-300" />
                      <span className="font-medium text-emerald-800">
                        {row.dest_nama_satuan_ptk}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {row.source_kode_ksro ?? row.source_kode_jenis_belanja} →{" "}
                      {row.dest_kode_ksro ?? row.dest_kode_jenis_belanja}
                    </div>
                    <div className="mt-0.5 line-clamp-1 italic text-slate-400">{row.alasan}</div>
                  </TD>
                  <TD className="text-right align-top tabular-nums text-[11px] font-semibold text-[#0d6e63]">
                    {formatPergeseranAmount(row.nominal)}
                  </TD>
                  <TD className="align-top">
                    <Badge variant={statusBadgeVariant(row.status)} className="text-[10px]">
                      {row.status_label}
                    </Badge>
                  </TD>
                  <TD className="text-center align-top">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void toggleHistory(row)}
                        disabled={historyLoading && historyRowId === row.id}
                        className="h-7 px-2 text-[10px]"
                        title="Riwayat"
                      >
                        <History className="h-3 w-3" />
                      </Button>
                      {row.status === "draft" && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void handleSubmitDraft(row)}
                          disabled={saving}
                          className="h-7 px-2 text-[10px]"
                          title="Ajukan"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {historyRowId !== null && (
            <div className="border-t border-sky-100 px-3 py-2">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Riwayat pengajuan #{historyRowId}
              </p>
              <BudgetHistoryTimeline rows={historyEvents} loading={historyLoading} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
