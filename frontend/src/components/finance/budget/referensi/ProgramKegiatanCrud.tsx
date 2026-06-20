"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BudgetProgramApiError,
  createBudgetProgram,
  deleteBudgetProgram,
  fetchBudgetPrograms,
  updateBudgetProgram,
} from "@/services/budgetProgramService";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  JENIS_OPTIONS,
  buildProgramTree,
  emptyFormForParent,
  indentClass,
  programToForm,
  rowStyles,
  type BudgetProgram,
  type BudgetProgramFormData,
  type BudgetProgramJenis,
  type BudgetProgramTreeNode,
} from "@/types/budget-program";
import { cn } from "@/lib/cn";
import {
  tableGridHeaderClassName,
  tableGridRowClassName,
  tableGridShellClassName,
} from "@/components/ui/tableStyles";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Menu,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const TABLE_GRID =
  "grid grid-cols-[1.25rem_minmax(0,1fr)_2rem] gap-x-3 px-4";

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

type RowMenuProps = {
  node: BudgetProgramTreeNode;
  onEdit: (row: BudgetProgram) => void;
  onDelete: (row: BudgetProgram) => void;
  onAddChild: (parent: BudgetProgram) => void;
};

function RowActionMenu({ node, onEdit, onDelete, onAddChild }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Menu aksi"
      >
        <Menu className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {node.jenis === "program" && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => {
                onAddChild(node);
                setOpen(false);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Kegiatan
            </button>
          )}
          {node.jenis === "kegiatan" && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => {
                onAddChild(node);
                setOpen(false);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Sub Kegiatan
            </button>
          )}
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
            onClick={() => {
              onEdit(node);
              setOpen(false);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Ubah
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
            onClick={() => {
              onDelete(node);
              setOpen(false);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

type TreeRowsProps = {
  nodes: BudgetProgramTreeNode[];
  depth?: number;
  collapsed: Set<number>;
  onToggle: (id: number) => void;
  onEdit: (row: BudgetProgram) => void;
  onDelete: (row: BudgetProgram) => void;
  onAddChild: (parent: BudgetProgram) => void;
  rowIndexRef: React.MutableRefObject<number>;
};

function TreeRows({
  nodes,
  depth = 0,
  collapsed,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
  rowIndexRef,
}: TreeRowsProps) {
  if (depth === 0) {
    rowIndexRef.current = 0;
  }

  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isCollapsed = collapsed.has(node.id);
        const stripeIdx = rowIndexRef.current++;

        return (
          <div key={node.id}>
            <div
              className={cn(
                TABLE_GRID,
                tableGridRowClassName(stripeIdx, "items-center py-2.5"),
                depth === 0 && "border-l-[3px] border-l-sky-400"
              )}
            >
              <div className="flex justify-center">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => onToggle(node.id)}
                    className="rounded-md p-0.5 text-sky-500 hover:bg-sky-100 hover:text-sky-700"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="w-4" />
                )}
              </div>

              <div className={cn("min-w-0", indentClass(depth))}>
                <span className={cn("text-[13px] leading-snug", rowStyles(node.jenis))}>
                  <span className="mr-2 tabular-nums">{node.kode}</span>
                  {node.uraian}
                </span>
              </div>

              <div className="flex justify-end">
                <RowActionMenu
                  node={node}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                />
              </div>
            </div>

            {hasChildren && !isCollapsed && (
              <TreeRows
                nodes={node.children}
                depth={depth + 1}
                collapsed={collapsed}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                rowIndexRef={rowIndexRef}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function ProgramKegiatanCrud() {
  const { budgetYearId } = useBudgetYearScope();
  const [rows, setRows] = useState<BudgetProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BudgetProgramFormData>(() =>
    emptyFormForParent(null, budgetYearId ?? 0)
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const rowIndexRef = useRef(0);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setLoading(false);
      return [];
    }
    setLoading(true);
    try {
      const data = await fetchBudgetPrograms(budgetYearId);
      setRows(data);
      return data;
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat program & kegiatan.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadRows();
    if (budgetYearId) {
      setForm((prev) => ({ ...prev, budget_year_id: String(budgetYearId) }));
    }
  }, [loadRows, budgetYearId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    const matched = new Set<number>();
    for (const row of rows) {
      if (
        row.kode.toLowerCase().includes(q) ||
        row.uraian.toLowerCase().includes(q)
      ) {
        matched.add(row.id);
        let parentId = row.parent_id;
        while (parentId) {
          matched.add(parentId);
          parentId = rows.find((r) => r.id === parentId)?.parent_id ?? null;
        }
      }
    }

    return rows.filter((row) => matched.has(row.id));
  }, [rows, search]);

  const tree = useMemo(() => buildProgramTree(filteredRows), [filteredRows]);

  const programOptions = useMemo(
    () => rows.filter((r) => r.jenis === "program"),
    [rows]
  );

  const kegiatanOptions = useMemo(
    () => rows.filter((r) => r.jenis === "kegiatan"),
    [rows]
  );

  const openCreate = (parent: BudgetProgram | null) => {
    if (!budgetYearId) return;
    setEditingId(null);
    setForm(emptyFormForParent(parent, budgetYearId));
    setFormErrors({});
    setShowForm(true);
    setMessage(null);
  };

  const openEdit = (row: BudgetProgram) => {
    setEditingId(row.id);
    setForm(programToForm(row));
    setFormErrors({});
    setShowForm(true);
    setMessage(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyFormForParent(null, budgetYearId ?? 0));
    setFormErrors({});
  };

  const patchForm = (patch: Partial<BudgetProgramFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleJenisChange = (jenis: BudgetProgramJenis) => {
    setForm((prev) => ({
      ...prev,
      jenis,
      parent_id: jenis === "program" ? "" : prev.parent_id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    setMessage(null);

    try {
      if (editingId) {
        await updateBudgetProgram(editingId, form);
        setMessage({ type: "success", text: "Data berhasil diperbarui." });
      } else {
        await createBudgetProgram(form);
        setMessage({ type: "success", text: "Data berhasil ditambahkan." });
      }
      closeForm();
      await loadRows();
    } catch (err) {
      if (err instanceof BudgetProgramApiError && err.errors) {
        const mapped = Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, v[0] ?? ""])
        );
        setFormErrors(mapped);
        setMessage({
          type: "error",
          text: Object.values(mapped)[0] ?? err.message,
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

  const handleDelete = async (row: BudgetProgram) => {
    if (!window.confirm(`Hapus ${row.kode} — ${row.uraian}?`)) return;
    try {
      await deleteBudgetProgram(row.id);
      setMessage({ type: "success", text: "Data berhasil dihapus." });
      if (editingId === row.id) closeForm();
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus data.",
      });
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode atau uraian..."
          className="max-w-xs"
        />
        <Button variant="secondary" icon={Plus} onClick={() => openCreate(null)}>
          Tambah Program
        </Button>
      </div>

      {showForm && (
        <Card variant="default" className="!p-4 sm:!p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                {editingId ? "Ubah Data" : "Tambah Data"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Master struktur: Program → Kegiatan → Sub Kegiatan (tanpa nilai pagu).
              </p>
            </div>
            <Button variant="ghost" icon={X} onClick={closeForm}>
              Tutup
            </Button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          >
            <FieldLabel label="Jenis" required error={formErrors.jenis}>
              <Select
                value={form.jenis}
                disabled={!!editingId}
                onChange={(e) => handleJenisChange(e.target.value as BudgetProgramJenis)}
              >
                {JENIS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FieldLabel>

            {form.jenis !== "program" && (
              <FieldLabel
                label={form.jenis === "kegiatan" ? "Program Induk" : "Kegiatan Induk"}
                required
                error={formErrors.parent_id}
              >
                <Select
                  value={form.parent_id}
                  disabled={!!editingId}
                  onChange={(e) => {
                    const parent = rows.find((r) => String(r.id) === e.target.value) ?? null;
                    patchForm({
                      parent_id: e.target.value,
                      kode: parent ? `${parent.kode}.` : form.kode,
                    });
                  }}
                >
                  <option value="">— Pilih induk —</option>
                  {(form.jenis === "kegiatan" ? programOptions : kegiatanOptions).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kode} — {p.uraian.slice(0, 50)}
                    </option>
                  ))}
                </Select>
              </FieldLabel>
            )}

            <FieldLabel
              label="Kode"
              required
              error={formErrors.kode}
              hint="Program: 1.02.01 · Kegiatan: 1.02.01.1.06 · Sub: 1.02.01.1.06.0007"
            >
              <Input
                value={form.kode}
                onChange={(e) => patchForm({ kode: e.target.value })}
                required
                readOnly={!!editingId}
                className={editingId ? "bg-slate-50 text-slate-500" : undefined}
              />
            </FieldLabel>

            <FieldLabel label="Uraian" required error={formErrors.uraian}>
              <Input
                value={form.uraian}
                onChange={(e) => patchForm({ uraian: e.target.value })}
                required
                className={form.jenis === "program" ? "uppercase" : undefined}
              />
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
                className="w-full rounded-lg border border-sq-border bg-white px-3 py-2 text-sm"
              />
            </FieldLabel>

            <div className="flex items-end md:col-span-2 xl:col-span-3">
              <Button type="submit" icon={editingId ? Pencil : Plus} disabled={saving}>
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-800">Program & Kegiatan</h3>
          <span className="text-xs text-slate-400">Data master — nilai pagu diatur di Perencanaan Pagu</span>
        </div>

        <div className={cn(TABLE_GRID, tableGridHeaderClassName, "hidden sm:grid")}>
          <div />
          <div className="pl-3">Kode & Uraian</div>
          <div />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat data...
          </div>
        ) : tree.length === 0 ? (
          <EmptyState
            title="Belum ada program"
            description="Tambahkan program, lalu kegiatan dan sub kegiatan di bawahnya."
            action={
              <Button icon={Plus} onClick={() => openCreate(null)}>
                Tambah Program
              </Button>
            }
            className="border-0 py-12"
          />
        ) : (
          <TreeRows
            nodes={tree}
            collapsed={collapsed}
            onToggle={toggleCollapse}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddChild={openCreate}
            rowIndexRef={rowIndexRef}
          />
        )}
      </div>
    </div>
  );
}
