"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  FundingSourceApiError,
  createFundingSource,
  deleteFundingSource,
  fetchFundingSources,
  updateFundingSource,
} from "@/services/fundingSourceService";
import {
  EMPTY_FUNDING_SOURCE_FORM,
  FUNDING_SOURCE_JENIS_OPTIONS,
  JENIS_LABEL,
  fundingSourceToForm,
  type FundingSource,
  type FundingSourceFormData,
} from "@/types/funding-source";
import { cn } from "@/lib/cn";
import {
  tableGridShellClassName,
} from "@/components/ui/tableStyles";
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

export function SumberDanaCrud() {
  const [rows, setRows] = useState<FundingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FundingSourceFormData>(EMPTY_FUNDING_SOURCE_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadRows = useCallback(async (): Promise<FundingSource[]> => {
    setLoading(true);
    try {
      const data = await fetchFundingSources();
      setRows(data);
      return data;
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data sumber dana.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const resetForm = () => {
    setForm(EMPTY_FUNDING_SOURCE_FORM);
    setEditingId(null);
    setFormErrors({});
  };

  const patchForm = (patch: Partial<FundingSourceFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const isKodeTaken = (kode: string) => {
    const normalized = kode.trim().toUpperCase();
    return rows.some(
      (row) => row.kode.toUpperCase() === normalized && row.id !== editingId
    );
  };

  const handleEdit = (row: FundingSource) => {
    setEditingId(row.id);
    setForm(fundingSourceToForm(row));
    setFormErrors({});
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    const kode = form.kode.trim().toUpperCase();
    if (!kode) {
      setFormErrors({ kode: "Kode sumber dana wajib diisi." });
      setSaving(false);
      return;
    }

    if (isKodeTaken(kode)) {
      setFormErrors({
        kode: `Kode ${kode} sudah terdaftar. Pilih kode lain atau klik Ubah pada baris tersebut.`,
      });
      setMessage({ type: "error", text: `Kode ${kode} sudah ada di daftar sumber dana.` });
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateFundingSource(editingId, form);
        setMessage({ type: "success", text: "Sumber dana berhasil diperbarui." });
      } else {
        await createFundingSource(form);
        setMessage({ type: "success", text: "Sumber dana berhasil ditambahkan." });
      }
      resetForm();
      await loadRows();
    } catch (err) {
      if (err instanceof FundingSourceApiError && err.errors) {
        const mapped = Object.fromEntries(
          Object.entries(err.errors).map(([key, msgs]) => [key, msgs[0] ?? ""])
        );
        setFormErrors(mapped);
        setMessage({
          type: "error",
          text: mapped.kode ?? mapped.nama ?? err.message,
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

  const handleDelete = async (row: FundingSource) => {
    if (
      !window.confirm(
        `Hapus sumber dana ${row.kode} (${row.nama})? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setMessage(null);
    try {
      await deleteFundingSource(row.id);
      setMessage({ type: "success", text: "Sumber dana berhasil dihapus." });
      if (editingId === row.id) resetForm();
      await loadRows();
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
              {editingId ? "Ubah Sumber Dana" : "Tambah Sumber Dana"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Master data sumber pendanaan anggaran (RM, BLU, APBN, Hibah, dll.).
            </p>
          </div>
          {editingId && (
            <Button variant="ghost" icon={X} onClick={resetForm}>
              Batal
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          <FieldLabel
            label="Kode"
            required
            error={formErrors.kode}
            hint={editingId ? "Kode tidak dapat diubah saat edit." : "Contoh: RM, BLU, APBN"}
          >
            <Input
              value={form.kode}
              onChange={(e) => patchForm({ kode: e.target.value.toUpperCase() })}
              placeholder="BLU"
              required
              readOnly={!!editingId}
              className={editingId ? "bg-slate-50 uppercase text-slate-500" : "uppercase"}
              maxLength={20}
            />
          </FieldLabel>

          <FieldLabel label="Nama Sumber Dana" required error={formErrors.nama}>
            <Input
              value={form.nama}
              onChange={(e) => patchForm({ nama: e.target.value })}
              placeholder="Badan Layanan Umum"
              required
            />
          </FieldLabel>

          <FieldLabel label="Jenis" required error={formErrors.jenis}>
            <Select
              value={form.jenis}
              onChange={(e) =>
                patchForm({ jenis: e.target.value as FundingSourceFormData["jenis"] })
              }
            >
              {FUNDING_SOURCE_JENIS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FieldLabel>

          <FieldLabel label="Status" required error={formErrors.is_active}>
            <Select
              value={form.is_active}
              onChange={(e) => patchForm({ is_active: e.target.value })}
            >
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </Select>
          </FieldLabel>

          <FieldLabel label="Keterangan" error={formErrors.keterangan}>
            <textarea
              value={form.keterangan}
              onChange={(e) => patchForm({ keterangan: e.target.value })}
              rows={2}
              placeholder="Deskripsi atau catatan (opsional)"
              className="w-full rounded-lg border border-sq-border bg-white px-3 py-2 text-sm text-sq-dark placeholder:text-sq-slate/70 focus:border-sq-blue focus:outline-none focus:ring-2 focus:ring-sq-blue/20 md:col-span-2"
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
          <h3 className="text-sm font-semibold text-slate-800">Daftar Sumber Dana</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Belum ada sumber dana"
            description="Tambahkan sumber dana pertama menggunakan formulir di atas."
            className="py-10"
          />
        ) : (
          <Table embedded>
            <THead>
              <TR>
                <TH>Kode</TH>
                <TH>Nama</TH>
                <TH>Jenis</TH>
                <TH>Status</TH>
                <TH>Keterangan</TH>
                <TH className="text-right">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="font-semibold">{row.kode}</TD>
                  <TD>{row.nama}</TD>
                  <TD>{JENIS_LABEL[row.jenis]}</TD>
                  <TD>
                    <Badge variant={row.is_active ? "success" : "draft"}>
                      {row.is_active ? "Aktif" : "Nonaktif"}
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
                        aria-label={`Edit ${row.kode}`}
                      />
                      <Button
                        variant="ghost"
                        icon={Trash2}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void handleDelete(row)}
                        aria-label={`Hapus ${row.kode}`}
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
