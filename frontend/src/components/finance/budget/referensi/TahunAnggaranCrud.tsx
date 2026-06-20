"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  BudgetYearApiError,
  createBudgetYear,
  deleteBudgetYear,
  fetchBudgetYears,
  updateBudgetYear,
} from "@/services/budgetYearService";
import {
  BUDGET_YEAR_STATUS_OPTIONS,
  buildEmptyBudgetYearForm,
  budgetYearToForm,
  formatBudgetYearPeriod,
  type BudgetYear,
  type BudgetYearFormData,
  type BudgetYearStatus,
} from "@/types/budget-year";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

const STATUS_BADGE: Record<BudgetYearStatus, BadgeVariant> = {
  draft: "draft",
  active: "success",
  closed: "info",
};

const STATUS_LABEL: Record<BudgetYearStatus, string> = {
  draft: "Draft",
  active: "Aktif",
  closed: "Ditutup",
};

function FieldLabel({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

function defaultNama(tahun: string) {
  return tahun ? `Anggaran Tahun ${tahun}` : "";
}

export function TahunAnggaranCrud() {
  const [rows, setRows] = useState<BudgetYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BudgetYearFormData>(() => buildEmptyBudgetYearForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadRows = useCallback(async (): Promise<BudgetYear[]> => {
    setLoading(true);
    try {
      const data = await fetchBudgetYears();
      setRows(data);
      return data;
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data tahun anggaran.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows().then((data) => {
      setForm(buildEmptyBudgetYearForm(data.map((row) => row.tahun)));
    });
  }, [loadRows]);

  const resetForm = () => {
    setForm(buildEmptyBudgetYearForm(rows.map((row) => row.tahun)));
    setEditingId(null);
    setFormErrors({});
  };

  const patchForm = (patch: Partial<BudgetYearFormData>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };

      if (patch.tahun !== undefined && !editingId) {
        const tahun = patch.tahun;
        const prevYear = prev.tahun;
        const namaWasAuto = !prev.nama || prev.nama === defaultNama(prevYear);

        if (namaWasAuto) {
          next.nama = defaultNama(tahun);
        }

        if (
          prev.tanggal_mulai === `${prevYear}-01-01` &&
          prev.tanggal_selesai === `${prevYear}-12-31`
        ) {
          next.tanggal_mulai = `${tahun}-01-01`;
          next.tanggal_selesai = `${tahun}-12-31`;
        }
      }

      return next;
    });
  };

  const isTahunTaken = (tahun: number) =>
    rows.some((row) => row.tahun === tahun && row.id !== editingId);

  const handleEdit = (row: BudgetYear) => {
    setEditingId(row.id);
    setForm(budgetYearToForm(row));
    setFormErrors({});
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    const tahunNum = Number(form.tahun);
    if (isTahunTaken(tahunNum)) {
      setFormErrors({
        tahun: `Tahun ${tahunNum} sudah terdaftar. Pilih tahun lain atau klik Ubah pada baris tersebut.`,
      });
      setMessage({
        type: "error",
        text: `Tahun ${tahunNum} sudah ada di daftar tahun anggaran.`,
      });
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      nama: form.nama.trim() || defaultNama(form.tahun),
    };

    try {
      if (editingId) {
        await updateBudgetYear(editingId, payload);
        setMessage({ type: "success", text: "Tahun anggaran berhasil diperbarui." });
      } else {
        await createBudgetYear(payload);
        setMessage({ type: "success", text: "Tahun anggaran berhasil ditambahkan." });
      }
      setEditingId(null);
      setFormErrors({});
      const data = await loadRows();
      setForm(buildEmptyBudgetYearForm(data.map((row) => row.tahun)));
    } catch (err) {
      if (err instanceof BudgetYearApiError && err.errors) {
        const mapped = Object.fromEntries(
          Object.entries(err.errors).map(([key, msgs]) => [key, msgs[0] ?? ""])
        );
        setFormErrors(mapped);
        setMessage({
          type: "error",
          text: mapped.tahun ?? (err instanceof Error ? err.message : "Gagal menyimpan data."),
        });
      } else {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal menyimpan data.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: BudgetYear) => {
    if (
      !window.confirm(
        `Hapus tahun anggaran ${row.tahun} (${row.nama})? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setMessage(null);
    try {
      await deleteBudgetYear(row.id);
      setMessage({ type: "success", text: "Tahun anggaran berhasil dihapus." });
      if (editingId === row.id) {
        setEditingId(null);
      }
      const data = await loadRows();
      if (editingId !== row.id) {
        setForm(buildEmptyBudgetYearForm(data.map((item) => item.tahun)));
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus data.",
      });
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {message && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      <Card variant="default" className="!p-4 sm:!p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {editingId ? "Ubah Tahun Anggaran" : "Tambah Tahun Anggaran"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Isi periode fiskal dan status tahun anggaran rumah sakit.
            </p>
          </div>
          {editingId && (
            <Button variant="ghost" icon={X} onClick={resetForm}>
              Batal
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FieldLabel label="Tahun" required error={formErrors.tahun}>
            <Input
              type="number"
              min={2000}
              max={2100}
              value={form.tahun}
              onChange={(e) => patchForm({ tahun: e.target.value })}
              placeholder="2026"
              required
              readOnly={!!editingId}
              className={editingId ? "bg-slate-50 text-slate-500" : undefined}
            />
            {editingId ? (
              <span className="text-[11px] text-slate-400">
                Tahun tidak dapat diubah saat edit. Hapus lalu buat ulang jika perlu ganti tahun.
              </span>
            ) : isTahunTaken(Number(form.tahun)) ? (
              <span className="text-[11px] text-amber-600">
                Tahun ini sudah terdaftar — pilih tahun lain.
              </span>
            ) : null}
          </FieldLabel>

          <FieldLabel label="Nama Tahun Anggaran" required error={formErrors.nama}>
            <Input
              value={form.nama}
              onChange={(e) => patchForm({ nama: e.target.value })}
              placeholder="Anggaran Tahun 2026"
              required
            />
          </FieldLabel>

          <FieldLabel label="Status" required error={formErrors.status}>
            <Select
              value={form.status}
              onChange={(e) =>
                patchForm({ status: e.target.value as BudgetYearStatus })
              }
            >
              {BUDGET_YEAR_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FieldLabel>

          <FieldLabel label="Tanggal Mulai" required error={formErrors.tanggal_mulai}>
            <Input
              type="date"
              value={form.tanggal_mulai}
              onChange={(e) => patchForm({ tanggal_mulai: e.target.value })}
              required
            />
          </FieldLabel>

          <FieldLabel label="Tanggal Selesai" required error={formErrors.tanggal_selesai}>
            <Input
              type="date"
              value={form.tanggal_selesai}
              onChange={(e) => patchForm({ tanggal_selesai: e.target.value })}
              required
            />
          </FieldLabel>

          <FieldLabel label="Keterangan" error={formErrors.keterangan} >
            <textarea
              value={form.keterangan}
              onChange={(e) => patchForm({ keterangan: e.target.value })}
              rows={2}
              placeholder="Catatan tambahan (opsional)"
              className="w-full rounded-lg border border-sq-border bg-white px-3 py-2 text-sm text-sq-dark placeholder:text-sq-slate/70 focus:border-sq-blue focus:outline-none focus:ring-2 focus:ring-sq-blue/20"
            />
          </FieldLabel>

          <div className="flex items-end md:col-span-2 xl:col-span-3">
            <Button type="submit" icon={editingId ? Pencil : Plus} disabled={saving}>
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Data"}
            </Button>
          </div>
        </form>
      </Card>

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-800">Daftar Tahun Anggaran</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Belum ada tahun anggaran"
            description="Tambahkan tahun anggaran pertama menggunakan formulir di atas."
            className="py-10"
          />
        ) : (
          <Table embedded>
            <THead>
              <TR>
                <TH>Tahun</TH>
                <TH>Nama</TH>
                <TH>Periode</TH>
                <TH>Status</TH>
                <TH>Keterangan</TH>
                <TH className="text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="font-semibold tabular-nums">{row.tahun}</TD>
                  <TD>{row.nama}</TD>
                  <TD className="whitespace-nowrap text-slate-600">
                    {formatBudgetYearPeriod(row)}
                  </TD>
                  <TD>
                    <Badge variant={STATUS_BADGE[row.status]}>
                      {STATUS_LABEL[row.status]}
                    </Badge>
                  </TD>
                  <TD className="max-w-[12rem] truncate text-slate-500">
                    {row.keterangan || "—"}
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        icon={Pencil}
                        onClick={() => handleEdit(row)}
                        aria-label={`Edit ${row.tahun}`}
                      />
                      <Button
                        variant="ghost"
                        icon={Trash2}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void handleDelete(row)}
                        aria-label={`Hapus ${row.tahun}`}
                      />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
