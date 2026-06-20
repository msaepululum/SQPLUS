"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  BudgetPaguSetupApiError,
  createBudgetPaguSetup,
  deleteBudgetPaguSetup,
  fetchBudgetPaguSetup,
  fetchBudgetPaguSetupMeta,
  updateBudgetPaguSetup,
} from "@/services/budgetPaguSetupService";
import {
  EMPTY_BUDGET_PAGU_FORM,
  budgetPaguToForm,
  formatPaguAmount,
  type BudgetPaguSetupFormData,
  type BudgetPaguSetupMeta,
  type BudgetPaguSetupRow,
} from "@/types/budget-pagu-setup";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
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

export function InputPaguUnitCrud() {
  const { budgetYear } = useBudgetYearScope();
  const scopedTahun = budgetYear ? String(budgetYear.tahun) : "";
  const [meta, setMeta] = useState<BudgetPaguSetupMeta | null>(null);
  const [rows, setRows] = useState<BudgetPaguSetupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterTahun, setFilterTahun] = useState("");
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [form, setForm] = useState<BudgetPaguSetupFormData>(EMPTY_BUDGET_PAGU_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  const loadMeta = useCallback(async () => {
    const data = await fetchBudgetPaguSetupMeta();
    setMeta(data);
    return data;
  }, []);

  useEffect(() => {
    if (scopedTahun) {
      setFilterTahun(scopedTahun);
    }
  }, [scopedTahun]);

  const loadRows = useCallback(async () => {
    if (!filterTahun) {
      setRows([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    try {
      const data = await fetchBudgetPaguSetup({
        tahun: filterTahun || undefined,
        ptk_id: filterPtk || undefined,
        kelompok_belanja_id: filterKelompok || undefined,
        jenis_belanja_id: filterJenis || undefined,
      });
      setRows(data);
      return data;
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data input pagu unit.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [filterTahun, filterPtk, filterKelompok, filterJenis]);

  useEffect(() => {
    void loadMeta().catch((err) => {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat referensi pagu unit.",
      });
    });
  }, [loadMeta]);

  useEffect(() => {
    if (meta) void loadRows();
  }, [meta, loadRows]);

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

  const formJenisOptions = useMemo(
    () => jenisOptionsForKelompok(form.kelompok_belanja_id),
    [form.kelompok_belanja_id, jenisOptionsForKelompok]
  );

  const totalPagu = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row.total_pagu || 0), 0),
    [rows]
  );

  const resetForm = () => {
    setForm({
      ...EMPTY_BUDGET_PAGU_FORM,
      tahun: scopedTahun,
    });
    setEditingId(null);
    setFormErrors({});
    setShowForm(false);
  };

  const patchForm = (patch: Partial<BudgetPaguSetupFormData>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.kelompok_belanja_id !== undefined) {
        const validJenis = jenisOptionsForKelompok(patch.kelompok_belanja_id);
        if (!validJenis.some((j) => String(j.id) === next.jenis_belanja_id)) {
          next.jenis_belanja_id = "";
        }
      }
      return next;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_BUDGET_PAGU_FORM,
      tahun: scopedTahun,
    });
    setFormErrors({});
    setMessage(null);
    setShowForm(true);
  };

  const handleEdit = (row: BudgetPaguSetupRow) => {
    setEditingId(row.id);
    setForm(budgetPaguToForm(row));
    setFormErrors({});
    setMessage(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    const payload = { ...form, tahun: scopedTahun };

    try {
      if (editingId) {
        await updateBudgetPaguSetup(editingId, payload.total_pagu);
        setMessage({ type: "success", text: "Pagu unit berhasil diperbarui." });
      } else {
        await createBudgetPaguSetup(payload);
        setMessage({ type: "success", text: "Pagu unit berhasil ditambahkan." });
      }
      resetForm();
      await loadRows();
    } catch (err) {
      if (err instanceof BudgetPaguSetupApiError && err.errors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(err.errors)) {
          flat[key] = msgs[0] ?? "Validasi gagal.";
        }
        setFormErrors(flat);
      }
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan pagu unit.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: BudgetPaguSetupRow) => {
    if (
      !window.confirm(
        `Hapus pagu ${row.kode_jenis_belanja} untuk ${row.nama_satuan_ptk} (${row.tahun})?`
      )
    ) {
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await deleteBudgetPaguSetup(row.id);
      setMessage({ type: "success", text: "Pagu unit berhasil dihapus." });
      if (editingId === row.id) resetForm();
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus pagu unit.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Input Pagu Unit</h3>
            <p className="mt-1 text-xs text-slate-500">
              Data FINANCE — pagu tahun <strong>{scopedTahun || "—"}</strong> per unit PTK,
              kelompok belanja, dan jenis belanja
            </p>
          </div>
          <Button type="button" className="h-8 text-xs" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Pagu Unit
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FieldLabel label="Unit PTK">
            <Select value={filterPtk} onChange={(e) => setFilterPtk(e.target.value)}>
              <option value="">Semua Unit</option>
              {(meta?.ptk ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_satuan_ptk}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Kelompok Belanja">
            <Select
              value={filterKelompok}
              onChange={(e) => {
                setFilterKelompok(e.target.value);
                setFilterJenis("");
              }}
            >
              <option value="">Semua Kelompok</option>
              {(meta?.kelompok_belanja ?? []).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.kode_kelompok_belanja}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Jenis Belanja">
            <Select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
              <option value="">Semua Jenis</option>
              {jenisOptionsForKelompok(filterKelompok || "").map((j) => (
                <option key={j.id} value={j.id}>
                  {j.kode_jenis_belanja}
                </option>
              ))}
            </Select>
          </FieldLabel>
        </div>
      </Card>

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
              {editingId ? "Ubah Pagu Unit" : "Tambah Pagu Unit"}
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
            <FieldLabel label="Tahun Anggaran" required error={formErrors.tahun}>
              <Input value={scopedTahun} readOnly disabled className="bg-slate-50" />
            </FieldLabel>

            <FieldLabel label="Unit PTK" required error={formErrors.ptk_id}>
              <Select
                value={form.ptk_id}
                onChange={(e) => patchForm({ ptk_id: e.target.value })}
                disabled={!!editingId}
              >
                <option value="">Pilih unit PTK</option>
                {(meta?.ptk ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_satuan_ptk}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            <FieldLabel label="Kelompok Belanja" required error={formErrors.kelompok_belanja_id}>
              <Select
                value={form.kelompok_belanja_id}
                onChange={(e) => patchForm({ kelompok_belanja_id: e.target.value })}
                disabled={!!editingId}
              >
                <option value="">Pilih kelompok belanja</option>
                {(meta?.kelompok_belanja ?? []).map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.kode_kelompok_belanja}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            <FieldLabel label="Jenis Belanja" required error={formErrors.jenis_belanja_id}>
              <Select
                value={form.jenis_belanja_id}
                onChange={(e) => patchForm({ jenis_belanja_id: e.target.value })}
                disabled={!!editingId || !form.kelompok_belanja_id}
              >
                <option value="">Pilih jenis belanja</option>
                {formJenisOptions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.kode_jenis_belanja}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            <FieldLabel
              label="Total Pagu (Rp)"
              required
              error={formErrors.total_pagu}
              hint="Nilai pagu per unit, kelompok, dan jenis belanja"
            >
              <Input
                type="text"
                inputMode="numeric"
                value={form.total_pagu}
                onChange={(e) =>
                  patchForm({ total_pagu: e.target.value.replace(/[^\d]/g, "") })
                }
                placeholder="0"
              />
            </FieldLabel>

            <div className="flex items-end gap-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Simpan Perubahan" : "Simpan"}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm} disabled={saving}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className={cn("overflow-hidden p-0", tableGridShellClassName)}>
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Daftar Pagu Unit</h3>
            <p className="text-xs text-slate-500">{rows.length} baris</p>
          </div>
          <p className="text-xs text-slate-600">
            Total: <strong className="tabular-nums">Rp {formatPaguAmount(totalPagu)}</strong>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memuat data...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Belum ada pagu unit"
            description="Tambahkan pagu unit baru atau ubah filter tahun."
            className="py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table embedded>
              <THead>
                <TR>
                  <TH>Tahun</TH>
                  <TH>Unit PTK</TH>
                  <TH>Kelompok Belanja</TH>
                  <TH>Jenis Belanja</TH>
                  <TH className="text-right">Total Pagu</TH>
                  <TH className="w-24 text-center">Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.id}>
                    <TD className="tabular-nums">{row.tahun}</TD>
                    <TD>
                      <div className="max-w-[14rem]">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {row.nama_satuan_ptk}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">{row.nama_ptk}</p>
                      </div>
                    </TD>
                    <TD className="text-xs text-slate-600">{row.kode_kelompok_belanja}</TD>
                    <TD className="text-xs text-slate-600">{row.kode_jenis_belanja}</TD>
                    <TD className="text-right tabular-nums font-medium text-slate-800">
                      Rp {formatPaguAmount(row.total_pagu)}
                    </TD>
                    <TD>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-teal-600"
                          aria-label="Ubah"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(row)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Hapus"
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
