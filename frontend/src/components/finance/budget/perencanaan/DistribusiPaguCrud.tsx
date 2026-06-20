"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  BudgetPaguDistribusiApiError,
  createBudgetPaguDistribusi,
  deleteBudgetPaguDistribusi,
  fetchBudgetPaguDistribusi,
  fetchBudgetPaguDistribusiMeta,
  updateBudgetPaguDistribusi,
} from "@/services/budgetPaguDistribusiService";
import {
  EMPTY_BUDGET_PAGU_DISTRIBUSI_FORM,
  distribusiToForm,
  formatDistribusiPagu,
  type BudgetPaguDistribusiFormData,
  type BudgetPaguDistribusiMeta,
  type BudgetPaguDistribusiRow,
  type BudgetPaguDistribusiSummary,
} from "@/types/budget-pagu-distribusi";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

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

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "default" | "success" | "warning";
}) {
  const valueClass =
    accent === "success"
      ? "text-emerald-700"
      : accent === "warning"
        ? "text-amber-700"
        : "text-[#0d6e63]";

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold tabular-nums", valueClass)}>{value}</p>
    </div>
  );
}

export function DistribusiPaguCrud() {
  const { budgetYear } = useBudgetYearScope();
  const scopedTahun = budgetYear ? String(budgetYear.tahun) : "";

  const [meta, setMeta] = useState<BudgetPaguDistribusiMeta | null>(null);
  const [rows, setRows] = useState<BudgetPaguDistribusiRow[]>([]);
  const [summary, setSummary] = useState<BudgetPaguDistribusiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [paguIndukId, setPaguIndukId] = useState("");
  const [form, setForm] = useState<BudgetPaguDistribusiFormData>(
    EMPTY_BUDGET_PAGU_DISTRIBUSI_FORM
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const loadMeta = useCallback(async () => {
    if (!scopedTahun) return null;
    const data = await fetchBudgetPaguDistribusiMeta({
      tahun: scopedTahun,
      ptk_id: filterPtk || undefined,
      kelompok_belanja_id: filterKelompok || undefined,
      jenis_belanja_id: filterJenis || undefined,
    });
    setMeta(data);
    return data;
  }, [scopedTahun, filterPtk, filterKelompok, filterJenis]);

  const loadRows = useCallback(async () => {
    if (!paguIndukId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return { rows: [], summary: null };
    }
    setLoading(true);
    try {
      const result = await fetchBudgetPaguDistribusi(Number(paguIndukId), scopedTahun);
      setRows(result.rows);
      setSummary(result.summary);
      return result;
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat distribusi pagu.",
      });
      return { rows: [], summary: null };
    } finally {
      setLoading(false);
    }
  }, [paguIndukId, scopedTahun]);

  useEffect(() => {
    if (!scopedTahun) return;
    void loadMeta().catch((err) => {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat referensi distribusi pagu.",
      });
    });
  }, [loadMeta, scopedTahun]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPaguIndukId("");
  }, [filterPtk, filterKelompok, filterJenis, scopedTahun]);

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

  const selectedInduk = useMemo(
    () => meta?.pagu_induk.find((p) => String(p.pagu_jenis_belanja_id) === paguIndukId) ?? null,
    [meta, paguIndukId]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.kode_ksro.toLowerCase().includes(q) ||
        row.nama_ksro.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const resetForm = () => {
    setForm({
      ...EMPTY_BUDGET_PAGU_DISTRIBUSI_FORM,
      pagu_jenis_belanja_id: paguIndukId,
    });
    setEditingId(null);
    setFormErrors({});
    setShowForm(false);
  };

  const openCreate = () => {
    if (!paguIndukId) return;
    setEditingId(null);
    setForm({
      ...EMPTY_BUDGET_PAGU_DISTRIBUSI_FORM,
      pagu_jenis_belanja_id: paguIndukId,
    });
    setFormErrors({});
    setMessage(null);
    setShowForm(true);
  };

  const handleEdit = (row: BudgetPaguDistribusiRow) => {
    setEditingId(row.id);
    setForm(distribusiToForm(row));
    setFormErrors({});
    setMessage(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    try {
      if (editingId) {
        await updateBudgetPaguDistribusi(editingId, form.total_pagu);
        setMessage({ type: "success", text: "Distribusi pagu berhasil diperbarui." });
      } else {
        await createBudgetPaguDistribusi(form);
        setMessage({ type: "success", text: "Distribusi pagu berhasil ditambahkan." });
      }
      resetForm();
      await loadRows();
      await loadMeta();
    } catch (err) {
      if (err instanceof BudgetPaguDistribusiApiError && err.errors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(err.errors)) {
          flat[key] = msgs[0] ?? "Validasi gagal.";
        }
        setFormErrors(flat);
      }
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan distribusi pagu.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: BudgetPaguDistribusiRow) => {
    if (!window.confirm(`Hapus distribusi KSRO ${row.kode_ksro}?`)) return;
    setSaving(true);
    setMessage(null);
    try {
      await deleteBudgetPaguDistribusi(row.id);
      setMessage({ type: "success", text: "Distribusi pagu berhasil dihapus." });
      if (editingId === row.id) resetForm();
      await loadRows();
      await loadMeta();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus distribusi pagu.",
      });
    } finally {
      setSaving(false);
    }
  };

  const canSelectInduk = filterPtk && filterKelompok && filterJenis;

  return (
    <div className="mt-3 space-y-4">
      <Card className="p-4 sm:p-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Distribusi Pagu ke KSRO</h3>
          <p className="mt-1 text-xs text-slate-500">
            Memecah pagu induk per jenis belanja (Input Pagu Unit) menjadi detail KSRO — tahun{" "}
            <strong>{scopedTahun || "—"}</strong>
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FieldLabel label="Unit PTK" required>
            <Select value={filterPtk} onChange={(e) => setFilterPtk(e.target.value)}>
              <option value="">Pilih unit PTK</option>
              {(meta?.ptk ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_satuan_ptk}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Kelompok Belanja" required>
            <Select
              value={filterKelompok}
              onChange={(e) => {
                setFilterKelompok(e.target.value);
                setFilterJenis("");
              }}
            >
              <option value="">Pilih kelompok</option>
              {(meta?.kelompok_belanja ?? []).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.kode_kelompok_belanja}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Jenis Belanja" required>
            <Select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
              <option value="">Pilih jenis</option>
              {jenisOptionsForKelompok(filterKelompok).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.kode_jenis_belanja}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Pagu Induk (Jenis Belanja)" required hint="Dari Input Pagu Unit">
            <Select
              value={paguIndukId}
              onChange={(e) => setPaguIndukId(e.target.value)}
              disabled={!canSelectInduk}
            >
              <option value="">
                {canSelectInduk ? "Pilih pagu induk" : "Lengkapi filter di atas"}
              </option>
              {(meta?.pagu_induk ?? []).map((p) => (
                <option key={p.pagu_jenis_belanja_id} value={p.pagu_jenis_belanja_id}>
                  {p.label} — {formatDistribusiPagu(p.total_pagu)}
                </option>
              ))}
            </Select>
          </FieldLabel>
        </div>
      </Card>

      {summary && selectedInduk && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Pagu Induk"
            value={formatDistribusiPagu(summary.pagu_induk_total)}
          />
          <SummaryCard
            label="Terdistribusi"
            value={formatDistribusiPagu(summary.terdistribusi)}
            accent="success"
          />
          <SummaryCard
            label="Sisa Belum Distribusi"
            value={formatDistribusiPagu(summary.sisa)}
            accent={summary.sisa > 0 ? "warning" : "default"}
          />
          <SummaryCard label="Jumlah KSRO" value={String(summary.jumlah_ksro)} />
        </div>
      )}

      {message && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm",
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              {editingId ? "Ubah Distribusi KSRO" : "Tambah Distribusi KSRO"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <FieldLabel label="KSRO" required error={formErrors.ksro_id}>
              <Select
                value={form.ksro_id}
                onChange={(e) => setForm((prev) => ({ ...prev, ksro_id: e.target.value }))}
                disabled={!!editingId}
              >
                <option value="">Pilih KSRO</option>
                {(meta?.ksro ?? []).map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kode_ksro} — {k.nama_ksro.slice(0, 60)}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            <FieldLabel label="Pagu Distribusi (Rp)" required error={formErrors.total_pagu}>
              <Input
                type="text"
                inputMode="numeric"
                value={form.total_pagu}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    total_pagu: e.target.value.replace(/[^\d]/g, ""),
                  }))
                }
              />
            </FieldLabel>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className={cn("!p-0", tableGridShellClassName)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau uraian KSRO..."
            className="max-w-xs"
            disabled={!paguIndukId}
          />
          <Button type="button" className="h-8 text-xs" onClick={openCreate} disabled={!paguIndukId}>
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah KSRO
          </Button>
        </div>

        {!paguIndukId ? (
          <EmptyState
            title="Pilih pagu induk terlebih dahulu"
            description="Filter unit PTK, kelompok, jenis belanja, lalu pilih pagu induk dari Input Pagu Unit."
            className="border-0 py-12"
          />
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat distribusi pagu...
          </div>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="Belum ada distribusi KSRO"
            description="Tambahkan pembagian pagu ke masing-masing KSRO di bawah pagu induk ini."
            action={
              <Button onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                Tambah KSRO
              </Button>
            }
            className="border-0 py-12"
          />
        ) : (
          <Table embedded>
            <THead>
              <TR>
                <TH className="w-14">No</TH>
                <TH className="w-48">Kode KSRO</TH>
                <TH>Uraian KSRO</TH>
                <TH className="text-right w-36">Pagu</TH>
                <TH className="w-24 text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {filteredRows.map((row, index) => (
                <TR key={row.id}>
                  <TD className="tabular-nums text-slate-400">{index + 1}</TD>
                  <TD className="font-mono text-xs text-slate-700">{row.kode_ksro}</TD>
                  <TD className="text-sm text-slate-800">{row.nama_ksro}</TD>
                  <TD className="text-right tabular-nums font-medium text-[#0d6e63]">
                    {formatDistribusiPagu(row.total_pagu)}
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(row)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Ubah"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(row)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
