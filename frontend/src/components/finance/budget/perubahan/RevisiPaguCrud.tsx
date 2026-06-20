"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
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
  BudgetPaguRevisiApiError,
  createBudgetPaguRevision,
  fetchBudgetPaguRevisions,
  fetchBudgetPaguRevisiMeta,
  fetchBudgetPaguRevisiTargets,
  submitBudgetPaguRevision,
} from "@/services/budgetPaguRevisiService";
import {
  formatRevisiAmount,
  formatRevisiSelisih,
  REVISI_LEVEL_OPTIONS,
  REVISI_STATUS_FILTER_OPTIONS,
  type BudgetPaguRevisiMeta,
  type BudgetPaguRevisiRow,
  type BudgetPaguRevisiSummary,
  type BudgetPaguRevisiTarget,
  type RevisiLevel,
  type RevisiStatus,
} from "@/types/budget-pagu-revisi";
import type { BudgetRiwayatEvent } from "@/types/budget-riwayat-perubahan";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import {
  ChevronLeft,
  ChevronRight,
  FileEdit,
  History,
  LayoutGrid,
  List,
  Loader2,
  Send,
} from "lucide-react";

type ViewMode = "pagu" | "pengajuan";

function statusBadgeVariant(status: RevisiStatus): "success" | "warning" | "danger" | "info" | "draft" {
  if (status === "applied") return "success";
  if (status === "rejected") return "danger";
  if (status === "draft") return "draft";
  if (status === "in_review" || status === "submitted") return "info";
  if (status === "approved") return "warning";
  return "draft";
}

function selisihClass(selisi: number) {
  if (selisi > 0) return "text-emerald-700";
  if (selisi < 0) return "text-amber-700";
  return "text-slate-600";
}

export function RevisiPaguCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<BudgetPaguRevisiMeta | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("pagu");
  const [level, setLevel] = useState<RevisiLevel>("jenis_belanja");
  const [targets, setTargets] = useState<BudgetPaguRevisiTarget[]>([]);
  const [rows, setRows] = useState<BudgetPaguRevisiRow[]>([]);
  const [summary, setSummary] = useState<BudgetPaguRevisiSummary | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BudgetPaguRevisiTarget | null>(null);
  const [paguSesudah, setPaguSesudah] = useState("");
  const [alasan, setAlasan] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [historyRowId, setHistoryRowId] = useState<number | null>(null);
  const [historyEvents, setHistoryEvents] = useState<BudgetRiwayatEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    void fetchBudgetPaguRevisiMeta()
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
      const data = await fetchBudgetPaguRevisiTargets({
        budget_year_id: budgetYearId,
        level,
        ptk_id: filterPtk || undefined,
        kelompok_belanja_id: filterKelompok || undefined,
        jenis_belanja_id: filterJenis || undefined,
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
  }, [budgetYearId, level, filterPtk, filterKelompok, filterJenis, search]);

  const loadRevisions = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchBudgetPaguRevisions({
        budget_year_id: budgetYearId,
        level,
        status: filterStatus || undefined,
        ptk_id: filterPtk || undefined,
        kelompok_belanja_id: filterKelompok || undefined,
        jenis_belanja_id: filterJenis || undefined,
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
        text: err instanceof Error ? err.message : "Gagal memuat pengajuan revisi.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    budgetYearId,
    level,
    filterStatus,
    filterPtk,
    filterKelompok,
    filterJenis,
    search,
    page,
  ]);

  useEffect(() => {
    if (viewMode === "pagu") {
      void loadTargets();
    } else {
      void loadRevisions();
    }
  }, [viewMode, loadTargets, loadRevisions]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, level, filterPtk, filterKelompok, filterJenis, filterStatus, search, viewMode]);

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

  const openRevisionForm = (target: BudgetPaguRevisiTarget) => {
    if (target.pending_revision) return;
    setSelected(target);
    setPaguSesudah("");
    setAlasan("");
  };

  const closeRevisionForm = () => {
    setSelected(null);
    setPaguSesudah("");
    setAlasan("");
  };

  const previewSelisih = useMemo(() => {
    if (!selected) return null;
    const sesudah = Number(paguSesudah.replace(/[^\d]/g, "") || "0");
    return sesudah - selected.pagu_saat_ini;
  }, [selected, paguSesudah]);

  const handleCreateRevision = async (submitAfter = false) => {
    if (!budgetYearId || !selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const revision = await createBudgetPaguRevision({
        budget_year_id: budgetYearId,
        level: selected.level,
        finance_id: selected.finance_id,
        pagu_sesudah: paguSesudah,
        alasan,
      });

      if (submitAfter) {
        const text = await submitBudgetPaguRevision(revision.id);
        setMessage({ type: "success", text });
      } else {
        setMessage({ type: "success", text: "Draft revisi pagu berhasil disimpan." });
      }

      closeRevisionForm();
      setViewMode("pengajuan");
      await loadRevisions();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof BudgetPaguRevisiApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gagal menyimpan revisi pagu.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitDraft = async (row: BudgetPaguRevisiRow) => {
    setSaving(true);
    setMessage(null);
    try {
      const text = await submitBudgetPaguRevision(row.id);
      setMessage({ type: "success", text });
      await loadRevisions();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengajukan revisi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleHistory = async (row: BudgetPaguRevisiRow) => {
    if (historyRowId === row.id) {
      setHistoryRowId(null);
      setHistoryEvents([]);
      return;
    }
    setHistoryRowId(row.id);
    setHistoryLoading(true);
    setHistoryEvents([]);
    try {
      const data = await fetchBudgetRiwayatEvents("revisi", row.id);
      setHistoryEvents(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat riwayat revisi.",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const kpiItems = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Total", value: String(summary.total), tone: "muted" as const },
      { label: "Draft", value: String(summary.draft), tone: "default" as const },
      { label: "Review", value: String(summary.in_progress), tone: "actual" as const },
      { label: "Diterapkan", value: String(summary.applied), tone: "plan" as const },
    ];
  }, [summary]);

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
              closeRevisionForm();
            }}
            options={[
              {
                value: "pagu",
                label: "Pagu Saat Ini",
                shortLabel: "Pagu",
                icon: <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} />,
                hint: "Daftar pagu yang dapat direvisi",
              },
              {
                value: "pengajuan",
                label: "Pengajuan Revisi",
                shortLabel: "Pengajuan",
                icon: <List className="h-3.5 w-3.5" strokeWidth={2.25} />,
                hint: "Riwayat dan status pengajuan revisi",
              },
            ]}
          />
          <ToolbarSegmented<RevisiLevel>
            value={level}
            onChange={(v) => {
              setLevel(v);
              closeRevisionForm();
            }}
            options={REVISI_LEVEL_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
              shortLabel: opt.shortLabel,
            }))}
          />
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
          {viewMode === "pengajuan" && (
            <ToolbarFilter label="Status" value={filterStatus} onChange={setFilterStatus}>
              {REVISI_STATUS_FILTER_OPTIONS.map((opt) => (
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
          Revisi pagu · tahun {budgetYear.tahun} · alur persetujuan: Manajer Keuangan → Direktur
          (≥ Rp 100 jt)
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

      {selected && (
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-b from-sky-50/60 to-white p-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800">
                {selected.nama_satuan_ptk} · {selected.kode_jenis_belanja}
              </p>
              {selected.kode_ksro && (
                <p className="mt-0.5 font-mono text-[10px] text-slate-400">{selected.kode_ksro}</p>
              )}
              {selected.nama_ksro && (
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-600">
                  {selected.nama_ksro}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={closeRevisionForm}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Pagu saat ini</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-[#0d6e63]">
                {formatRevisiAmount(selected.pagu_saat_ini)}
              </p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pagu revisi
              </span>
              <Input
                value={paguSesudah}
                onChange={(e) => setPaguSesudah(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Nilai baru"
                className="h-8 text-xs tabular-nums"
              />
            </label>
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Selisih</p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold tabular-nums",
                  previewSelisih != null ? selisihClass(previewSelisih) : "text-slate-300"
                )}
              >
                {previewSelisih != null ? formatRevisiSelisih(previewSelisih) : "—"}
              </p>
            </div>
            <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Alasan revisi
              </span>
              <Input
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Minimal 10 karakter"
                className="h-8 text-xs"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleCreateRevision(false)}
              disabled={saving || alasan.trim().length < 10 || !paguSesudah}
              className="h-8 text-xs"
            >
              <FileEdit className="mr-1.5 h-3.5 w-3.5" />
              Simpan Draft
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreateRevision(true)}
              disabled={saving || alasan.trim().length < 10 || !paguSesudah}
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
      ) : viewMode === "pagu" ? (
        targets.length === 0 ? (
          <EmptyState
            title="Belum ada pagu"
            description="Lengkapi Input Pagu Unit atau Distribusi Pagu terlebih dahulu."
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
                {level === "ksro" ? "Pagu Distribusi KSRO" : "Pagu Induk per Jenis Belanja"}
              </h3>
            </div>
            <Table embedded>
              <THead>
                <TR>
                  <TH>Unit / Jenis</TH>
                  {level === "ksro" && <TH>KSRO</TH>}
                  <TH className="text-right">Pagu</TH>
                  <TH className="w-20 text-center">Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {targets.map((row) => (
                  <TR key={`${row.level}-${row.finance_id}`}>
                    <TD className="align-top text-[11px]">
                      <div className="font-medium text-slate-700">{row.nama_satuan_ptk}</div>
                      <div className="text-[10px] text-slate-400">
                        {row.kode_kelompok_belanja} · {row.kode_jenis_belanja}
                      </div>
                    </TD>
                    {level === "ksro" && (
                      <TD className="align-top">
                        <div className="font-mono text-[10px] text-slate-400">{row.kode_ksro}</div>
                        <div className="line-clamp-1 text-[11px] text-slate-700">
                          {row.nama_ksro}
                        </div>
                      </TD>
                    )}
                    <TD className="text-right align-top tabular-nums text-[11px] font-semibold text-[#0d6e63]">
                      {formatRevisiAmount(row.pagu_saat_ini)}
                    </TD>
                    <TD className="text-center align-top">
                      {row.pending_revision ? (
                        <Badge variant="warning" className="text-[10px]">
                          Aktif
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => openRevisionForm(row)}
                          className="h-7 px-2 text-[10px]"
                        >
                          <FileEdit className="h-3 w-3" />
                        </Button>
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
          title="Belum ada pengajuan revisi"
          description="Buat revisi dari tab Pagu Saat Ini atau sesuaikan filter."
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
            <h3 className="text-xs font-semibold text-slate-800">Pengajuan Revisi Pagu</h3>
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
                <TH>No / Unit</TH>
                <TH>Objek</TH>
                <TH className="text-right">Sebelum</TH>
                <TH className="text-right">Sesudah</TH>
                <TH className="text-right">Selisih</TH>
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
                    <div className="font-medium text-slate-700">{row.nama_satuan_ptk}</div>
                  </TD>
                  <TD className="align-top text-[11px]">
                    <div className="text-slate-600">{row.level_label}</div>
                    <div className="text-[10px] text-slate-400">
                      {row.kode_ksro ?? row.kode_jenis_belanja}
                    </div>
                    <div className="mt-0.5 line-clamp-1 italic text-slate-400">{row.alasan}</div>
                  </TD>
                  <TD className="text-right align-top tabular-nums text-[11px] text-slate-600">
                    {formatRevisiAmount(row.pagu_sebelum)}
                  </TD>
                  <TD className="text-right align-top tabular-nums text-[11px] font-medium text-[#0d6e63]">
                    {formatRevisiAmount(row.pagu_sesudah)}
                  </TD>
                  <TD
                    className={cn(
                      "text-right align-top tabular-nums text-[11px] font-medium",
                      selisihClass(row.selisih)
                    )}
                  >
                    {formatRevisiSelisih(row.selisih)}
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
