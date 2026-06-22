"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  ToolbarFilter,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  expenditureStageBadgeClass,
  EXPENDITURE_PROCESS_FILTER_OPTIONS,
  EXPENDITURE_PROCESS_STAGE_LABELS,
  type ExpenditureProcessStageId,
} from "@/constants/expenditure-process";
import {
  createExpenditureAju,
  fetchExpenditureAjuList,
  fetchExpenditureAjuMeta,
} from "@/services/expenditureAjuService";
import {
  EXPENDITURE_AJU_PER_PAGE_OPTIONS,
  formatExpenditureAjuAmount,
  formatExpenditureAjuDate,
  type ExpenditureAjuMeta,
  type ExpenditureAjuRow,
  type ExpenditureAjuSummary,
} from "@/types/expenditure-aju";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

function FieldLabel({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="text-[11px] text-slate-400">{hint}</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

function stageBadgeVariant(
  stage: ExpenditureProcessStageId
): "success" | "warning" | "danger" | "info" | "draft" {
  if (stage === "pembayaran-berhasil" || stage === "disetujui") return "success";
  if (stage === "ditolak") return "danger";
  if (stage === "rencana-bayar" || stage === "menunggu-persetujuan") return "warning";
  if (stage === "diajukan" || stage === "negosiasi" || stage === "surat-pesanan") return "info";
  if (stage === "draft" || stage === "dibatalkan") return "draft";
  return "info";
}

const KPI_CARDS: {
  key: keyof ExpenditureAjuSummary;
  label: string;
  sublabel: string;
  icon: typeof FileText;
  iconBg: string;
  format?: (v: number) => string;
}[] = [
  {
    key: "total_pengajuan",
    label: "Total Pengajuan",
    sublabel: "Semua pengajuan",
    icon: FileText,
    iconBg: "bg-blue-600",
    format: (v) => String(v),
  },
  {
    key: "menunggu_persetujuan",
    label: "Menunggu Persetujuan",
    sublabel: "Perlu persetujuan",
    icon: Clock,
    iconBg: "bg-amber-500",
    format: (v) => String(v),
  },
  {
    key: "menunggu_pembayaran",
    label: "Menunggu Pembayaran",
    sublabel: "Siap dibayarkan",
    icon: CreditCard,
    iconBg: "bg-violet-600",
    format: (v) => String(v),
  },
  {
    key: "total_nilai",
    label: "Total Nilai Pengajuan",
    sublabel: "Total nilai pengajuan",
    icon: FileText,
    iconBg: "bg-emerald-600",
    format: (v) => `Rp ${formatExpenditureAjuAmount(v)}`,
  },
];

function PengajuanKpiRow({ summary }: { summary: ExpenditureAjuSummary }) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {KPI_CARDS.map((item) => {
        const Icon = item.icon;
        const value = summary[item.key];
        return (
          <div key={item.key} className={cardClassName({ variant: "default", className: "!p-3" })}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                  {item.format ? item.format(value) : value}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">{item.sublabel}</p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
                  item.iconBg
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type CreateForm = {
  ksro_id: string;
  nama_aju: string;
  catatan: string;
  total: string;
};

const EMPTY_CREATE_FORM: CreateForm = {
  ksro_id: "",
  nama_aju: "",
  catatan: "",
  total: "",
};

export function ExpenditurePengajuanCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<ExpenditureAjuMeta | null>(null);
  const [rows, setRows] = useState<ExpenditureAjuRow[]>([]);
  const [summary, setSummary] = useState<ExpenditureAjuSummary | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [filterBulan, setFilterBulan] = useState("");
  const [filterPtk, setFilterPtk] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const pengajuanDetailHref = (id: number) =>
    `/finance/expenditure/proses-belanja/pengajuan/${id}`;

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const data = await fetchExpenditureAjuMeta(budgetYearId ?? undefined);
      setMeta(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat referensi.",
      });
    } finally {
      setMetaLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await fetchExpenditureAjuList({
        budget_year_id: budgetYearId,
        bulan: filterBulan ? Number(filterBulan) : undefined,
        ptk_id: filterPtk ? Number(filterPtk) : undefined,
        jenis_belanja_id: filterJenis ? Number(filterJenis) : undefined,
        status: filterStatus || undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
      setTotal(result.meta.total);
      setFrom(result.meta.from);
      setTo(result.meta.to);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat daftar pengajuan.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    budgetYearId,
    filterBulan,
    filterPtk,
    filterStatus,
    filterJenis,
    search,
    page,
    perPage,
  ]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, filterBulan, filterPtk, filterStatus, filterJenis, search, perPage]);

  const bulanOptions = useMemo(() => meta?.bulan_options ?? [], [meta]);
  const tahapFilterOptions = useMemo(
    () => meta?.tahap_proses_options ?? EXPENDITURE_PROCESS_FILTER_OPTIONS.slice(1),
    [meta]
  );

  const canCreate = Boolean(meta?.can_create && budgetYearId && (meta?.ksro_options?.length ?? 0) > 0);

  const resetCreateForm = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateErrors({});
    setShowCreateForm(false);
  };

  const handleCreateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!budgetYearId) return;

    const errors: Record<string, string> = {};
    if (!createForm.ksro_id) errors.ksro_id = "Kode rekening belanja wajib dipilih.";
    if (!createForm.nama_aju.trim()) errors.nama_aju = "Uraian pengajuan wajib diisi.";
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreating(true);
    setCreateErrors({});
    setMessage(null);
    try {
      await createExpenditureAju({
        budget_year_id: budgetYearId,
        ksro_id: Number(createForm.ksro_id),
        nama_aju: createForm.nama_aju.trim(),
        catatan: createForm.catatan.trim() || undefined,
        total: createForm.total ? Number(createForm.total.replace(/\./g, "")) : undefined,
      });
      setMessage({ type: "success", text: "Pengajuan belanja draft berhasil dibuat." });
      resetCreateForm();
      setPage(1);
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal membuat pengajuan belanja.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Daftar Pengajuan Belanja
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Kelola dan pantau pengajuan belanja Anda — dari pengajuan hingga pembayaran berhasil.
            {meta?.scope?.name && (
              <>
                {" "}
                <span className="text-slate-600">
                  ({meta.scope.name}
                  {meta.scope.no_absen ? ` · ${meta.scope.no_absen}` : ""})
                </span>
              </>
            )}
          </p>
        </div>
        <Button
          type="button"
          className="h-9 shrink-0 gap-1.5 text-xs"
          disabled={!canCreate || metaLoading}
          title={
            !meta?.can_create
              ? "Departemen aktif tidak ditemukan"
              : (meta?.ksro_options?.length ?? 0) === 0
                ? "Belum ada pagu KSRO untuk unit Anda"
                : undefined
          }
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Buat Pengajuan Belanja
        </Button>
      </div>

      {summary && <PengajuanKpiRow summary={summary} />}

      {showCreateForm && (
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Buat Pengajuan Belanja</h3>
            <button
              type="button"
              onClick={resetCreateForm}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="grid gap-4 sm:grid-cols-2">
            <FieldLabel label="Tahun Anggaran">
              <Input
                value={budgetYear ? String(budgetYear.tahun) : ""}
                readOnly
                disabled
                className="bg-slate-50"
              />
            </FieldLabel>

            <FieldLabel label="Kode Rekening (KSRO)" required error={createErrors.ksro_id}>
              <Select
                value={createForm.ksro_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, ksro_id: e.target.value }))}
              >
                <option value="">Pilih kode rekening belanja</option>
                {(meta?.ksro_options ?? []).map((opt) => (
                  <option key={opt.ksro_id} value={opt.ksro_id}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            <FieldLabel
              label="Uraian Pengajuan"
              required
              error={createErrors.nama_aju}
              hint="Deskripsi singkat keperluan belanja"
            >
              <Input
                value={createForm.nama_aju}
                onChange={(e) => setCreateForm((f) => ({ ...f, nama_aju: e.target.value }))}
                placeholder="Contoh: Pembelian ATK bulan Januari"
              />
            </FieldLabel>

            <FieldLabel label="Nilai Pengajuan (Rp)" hint="Opsional — dapat diisi nanti">
              <Input
                type="text"
                inputMode="numeric"
                value={createForm.total}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setCreateForm((f) => ({
                    ...f,
                    total: raw ? formatExpenditureAjuAmount(Number(raw)) : "",
                  }));
                }}
                placeholder="0"
              />
            </FieldLabel>

            <FieldLabel label="Catatan" hint="Opsional">
              <Input
                value={createForm.catatan}
                onChange={(e) => setCreateForm((f) => ({ ...f, catatan: e.target.value }))}
                placeholder="Catatan tambahan"
              />
            </FieldLabel>

            <div className="flex items-end gap-2 sm:col-span-2">
              <Button type="submit" disabled={creating} className="h-9 text-xs">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Draft"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetCreateForm}
                className="h-9 text-xs"
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <ToolbarShell>
        <div className="flex flex-1 flex-wrap items-end gap-2">
          <ToolbarFilter label="Periode" value={filterBulan} onChange={setFilterBulan}>
            <option value="">Semua Bulan</option>
            {bulanOptions.map((opt) => (
              <option key={opt.value} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Unit" value={filterPtk} onChange={setFilterPtk}>
            <option value="">Semua Unit</option>
            {meta?.ptk.map((ptk) => (
              <option key={ptk.id} value={String(ptk.id)}>
                {ptk.nama_satuan_ptk}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Tahap Proses" value={filterStatus} onChange={setFilterStatus}>
            <option value="">Semua Tahap</option>
            {tahapFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Jenis Belanja" value={filterJenis} onChange={setFilterJenis}>
            <option value="">Semua Jenis</option>
            {meta?.jenis_belanja.map((jb) => (
              <option key={jb.id} value={String(jb.id)}>
                {jb.kode_jenis_belanja}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="Cari no / uraian..."
            className="min-w-[10rem] flex-1 sm:max-w-[12rem]"
          />
        </div>
      </ToolbarShell>

      {message && (
        <p
          className={cn(
            "rounded-md border px-3 py-2 text-xs",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada pengajuan belanja"
          description={
            meta?.scope?.name
              ? `Tidak ada pengajuan untuk ${meta.scope.name}. Sesuaikan filter atau pilih tahun anggaran lain.`
              : "Sesuaikan filter atau pilih tahun anggaran lain."
          }
          className="mt-0"
        />
      ) : (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0", tableGridShellClassName),
          })}
        >
          <Table embedded>
            <THead>
              <TR>
                <TH>No Pengajuan</TH>
                <TH>Tanggal</TH>
                <TH>Unit</TH>
                <TH>Jenis Belanja</TH>
                <TH className="min-w-[10rem]">Uraian Singkat</TH>
                <TH className="text-right">Sub Total</TH>
                <TH className="text-right">Pajak</TH>
                <TH className="text-right">Total</TH>
                <TH className="min-w-[8rem]">Tahap Proses</TH>
                <TH className="w-14 text-center">Detail</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => {
                const stage = row.tahap_proses ?? row.status;
                const stageLabel =
                  row.tahap_label ??
                  EXPENDITURE_PROCESS_STAGE_LABELS[stage as ExpenditureProcessStageId] ??
                  stage;

                return (
                  <TR key={row.id}>
                    <TD className="font-mono text-[10px] text-slate-600">{row.no_pengajuan}</TD>
                    <TD className="tabular-nums text-[11px]">{formatExpenditureAjuDate(row.tanggal)}</TD>
                    <TD className="max-w-[8rem] text-[11px]">
                      <span className="block truncate" title={row.unit}>
                        {row.unit}
                      </span>
                    </TD>
                    <TD className="max-w-[9rem] text-[11px]">
                      <span className="block truncate" title={row.jenis_belanja}>
                        {row.jenis_belanja}
                      </span>
                    </TD>
                    <TD className="max-w-[12rem] text-[11px] text-slate-600">
                      <span className="block truncate" title={row.uraian}>
                        {row.uraian || "—"}
                      </span>
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-slate-600">
                      Rp {formatExpenditureAjuAmount(row.sub_total)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] text-slate-600">
                      Rp {formatExpenditureAjuAmount(row.pajak)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] font-medium">
                      Rp {formatExpenditureAjuAmount(row.total)}
                    </TD>
                    <TD>
                      <Badge
                        variant={stageBadgeVariant(stage as ExpenditureProcessStageId)}
                        className={cn(
                          "text-[10px]",
                          expenditureStageBadgeClass(stage as ExpenditureProcessStageId)
                        )}
                      >
                        {stageLabel}
                      </Badge>
                    </TD>
                    <TD className="text-center">
                      <Link
                        href={pengajuanDetailHref(row.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-[#0d6e63]/30 hover:bg-[#0d6e63]/5 hover:text-[#0d6e63]"
                        aria-label={`Detail ${row.no_pengajuan}`}
                        title="Lihat detail"
                      >
                        <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>

          <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Menampilkan {from} – {to} dari {total} data
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                >
                  {EXPENDITURE_AJU_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / halaman
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[4.5rem] text-center text-[11px] tabular-nums text-slate-600">
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
          </div>
        </div>
      )}
    </div>
  );
}
