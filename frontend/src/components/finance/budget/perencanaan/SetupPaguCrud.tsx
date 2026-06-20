"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BudgetProgramApiError,
  fetchBudgetPrograms,
  updateBudgetProgramPagu,
} from "@/services/budgetProgramService";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  buildProgramTree,
  computePaguTotal,
  formatPaguNilai,
  paguAmountStyles,
  rowStyles,
  sumSubKegiatanAnggaran,
  type BudgetProgram,
  type BudgetProgramJenis,
  type BudgetProgramTreeNode,
} from "@/types/budget-program";
import { cn } from "@/lib/cn";
import { ChevronDown, ChevronRight, Loader2, Menu, Pencil, X } from "lucide-react";

import {
  tableGridHeaderClassName,
  tableGridRowClassName,
  tableGridShellClassName,
} from "@/components/ui/tableStyles";

const TABLE_GRID =
  "grid grid-cols-[1.25rem_9.5rem_minmax(0,1fr)_9.5rem_9.5rem_2rem] gap-x-3 px-4 sm:grid-cols-[1.25rem_11rem_minmax(0,1fr)_10.5rem_10.5rem_2rem]";

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

function kodeIndent(depth: number): string {
  if (depth === 0) return "pl-0";
  if (depth === 1) return "pl-5";
  return "pl-10";
}

function PaguAmount({
  value,
  jenis,
}: {
  value: number;
  jenis: BudgetProgramJenis;
}) {
  if (value <= 0) return <span className="text-slate-300">—</span>;
  return (
    <span className={cn("tabular-nums", paguAmountStyles(jenis))}>
      {formatPaguNilai(value)}
    </span>
  );
}

type TreeRowsProps = {
  nodes: BudgetProgramTreeNode[];
  depth?: number;
  collapsed: Set<number>;
  onToggle: (id: number) => void;
  onEditPagu: (row: BudgetProgram) => void;
  rowIndexRef: React.MutableRefObject<number>;
};

function TreeRows({
  nodes,
  depth = 0,
  collapsed,
  onToggle,
  onEditPagu,
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
        const paguTotal = computePaguTotal(node);
        const stripeIdx = rowIndexRef.current++;

        return (
          <div key={node.id}>
            <div
              className={cn(
                TABLE_GRID,
                tableGridRowClassName(stripeIdx, "items-center py-3"),
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

              <div
                className={cn(
                  "truncate text-[13px] tabular-nums text-[#0d6e63]",
                  kodeIndent(depth),
                  node.jenis === "sub_kegiatan" && "text-slate-700"
                )}
              >
                {node.kode}
              </div>

              <div className={cn("min-w-0 text-[13px] leading-snug", rowStyles(node.jenis))}>
                {node.uraian}
              </div>

              <div className="text-right text-[13px]">
                <PaguAmount value={paguTotal} jenis={node.jenis} />
              </div>

              <div className="text-right text-[13px]">
                <PaguAmount value={paguTotal} jenis={node.jenis} />
              </div>

              <div className="flex justify-end">
                {node.jenis === "sub_kegiatan" ? (
                  <button
                    type="button"
                    onClick={() => onEditPagu(node)}
                    className="rounded-md p-1 text-slate-400 hover:bg-sky-100 hover:text-sky-600"
                    aria-label="Ubah pagu"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="p-1 text-slate-200">
                    <Menu className="h-4 w-4" />
                  </span>
                )}
              </div>
            </div>

            {hasChildren && !isCollapsed && (
              <TreeRows
                nodes={node.children}
                depth={depth + 1}
                collapsed={collapsed}
                onToggle={onToggle}
                onEditPagu={onEditPagu}
                rowIndexRef={rowIndexRef}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function SetupPaguCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [rows, setRows] = useState<BudgetProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [editingRow, setEditingRow] = useState<BudgetProgram | null>(null);
  const [paguInput, setPaguInput] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
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
        text: err instanceof Error ? err.message : "Gagal memuat struktur pagu.",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    const matched = new Set<number>();
    for (const row of rows) {
      if (row.kode.toLowerCase().includes(q) || row.uraian.toLowerCase().includes(q)) {
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
  const totalPagu = useMemo(() => sumSubKegiatanAnggaran(rows), [rows]);

  const openEditPagu = (row: BudgetProgram) => {
    setEditingRow(row);
    setPaguInput(row.jumlah_anggaran ? String(Math.trunc(Number(row.jumlah_anggaran))) : "");
    setFormError("");
    setMessage(null);
  };

  const closeEditPagu = () => {
    setEditingRow(null);
    setPaguInput("");
    setFormError("");
  };

  const handleSavePagu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    if (!paguInput.trim()) {
      setFormError("Jumlah pagu wajib diisi.");
      return;
    }

    setSaving(true);
    setFormError("");
    setMessage(null);

    try {
      await updateBudgetProgramPagu(editingRow.id, paguInput);
      setMessage({ type: "success", text: "Pagu sub kegiatan berhasil diperbarui." });
      closeEditPagu();
      await loadRows();
    } catch (err) {
      if (err instanceof BudgetProgramApiError && err.errors?.jumlah_anggaran) {
        setFormError(err.errors.jumlah_anggaran[0] ?? "Validasi gagal.");
      } else {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal menyimpan pagu.",
        });
      }
    } finally {
      setSaving(false);
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
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau uraian..."
            className="max-w-xs"
          />
          {budgetYear && (
            <span className="text-xs text-slate-500">
              Tahun anggaran: <strong>{budgetYear.tahun}</strong>
            </span>
          )}
        </div>
        {rows.length > 0 && (
          <p className="text-xs text-slate-500">
            Total pagu induk:{" "}
            <strong className="tabular-nums text-[#0d6e63]">
              {formatPaguNilai(totalPagu)}
            </strong>
          </p>
        )}
      </div>

      {editingRow && (
        <Card variant="default" className="!p-4 sm:!p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Ubah Pagu Sub Kegiatan</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {editingRow.kode} — {editingRow.uraian}
              </p>
            </div>
            <Button variant="ghost" icon={X} onClick={closeEditPagu}>
              Tutup
            </Button>
          </div>

          <form onSubmit={handleSavePagu} className="flex flex-wrap items-end gap-3">
            <FieldLabel label="Pagu (Rp)" required error={formError}>
              <Input
                type="text"
                inputMode="numeric"
                value={paguInput}
                onChange={(e) => setPaguInput(e.target.value.replace(/[^\d]/g, ""))}
                className="min-w-[12rem]"
                autoFocus
              />
            </FieldLabel>
            <Button type="submit" icon={Pencil} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </Card>
      )}

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className={cn(TABLE_GRID, tableGridHeaderClassName)}>
          <div />
          <div>Kode</div>
          <div>Uraian</div>
          <div className="text-right">Pagu</div>
          <div className="text-right">Sisa Pagu</div>
          <div />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 bg-white py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            Memuat data...
          </div>
        ) : tree.length === 0 ? (
          <EmptyState
            title="Belum ada struktur program"
            description="Tambahkan program, kegiatan, dan sub kegiatan di menu Referensi Anggaran terlebih dahulu."
            className="border-0 bg-white py-12"
          />
        ) : (
          <TreeRows
            nodes={tree}
            collapsed={collapsed}
            onToggle={toggleCollapse}
            onEditPagu={openEditPagu}
            rowIndexRef={rowIndexRef}
          />
        )}
      </div>
    </div>
  );
}
