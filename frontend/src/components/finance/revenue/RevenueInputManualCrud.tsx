"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { useTranslation } from "@/components/providers/LocaleProvider";
import {
  REVENUE_CATEGORIES,
  type RevenueCategoryId,
} from "@/constants/revenue-categories";
import {
  createRevenueRealization,
  deleteRevenueRealization,
  fetchRevenueRealizations,
} from "@/services/revenueCollectService";
import type { RevenueRealizationRow } from "@/types/revenue-collect";
import {
  formatRevenueTargetAmount,
  formatRevenueTargetInput,
  parseRevenueTargetInput,
} from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Plus, Trash2 } from "lucide-react";

type RevenueInputManualCrudProps = {
  activeCategory?: RevenueCategoryId | "";
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RevenueInputManualCrud({ activeCategory = "" }: RevenueInputManualCrudProps) {
  const { t } = useTranslation();
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueRealizationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryId, setCategoryId] = useState<RevenueCategoryId>(
    activeCategory || "jasa-rs"
  );
  const [tanggal, setTanggal] = useState(todayIso());
  const [amountInput, setAmountInput] = useState("");
  const [referenceNote, setReferenceNote] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (activeCategory) setCategoryId(activeCategory);
  }, [activeCategory]);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueRealizations(budgetYearId, {
        category_id: activeCategory || undefined,
      });
      setRows(result.rows.filter((r) => r.source === "manual"));
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat data manual.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, activeCategory]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const totalManual = useMemo(() => rows.reduce((s, r) => s + r.amount, 0), [rows]);

  const handleAdd = async () => {
    if (!budgetYearId) return;
    const amount = parseRevenueTargetInput(amountInput);
    if (amount <= 0) {
      setMessage({ type: "error", text: "Nominal wajib diisi." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await createRevenueRealization({
        budget_year_id: budgetYearId,
        category_id: categoryId,
        tanggal,
        amount,
        reference_note: referenceNote || undefined,
      });
      setAmountInput("");
      setReferenceNote("");
      setMessage({ type: "success", text: "Realisasi manual berhasil ditambahkan." });
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus entri realisasi ini?")) return;
    try {
      await deleteRevenueRealization(id);
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus.",
      });
    }
  };

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat input manual...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Input manual dikunci per tahun anggaran."
        className="mt-3"
      />
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell
        footer={
          <ToolbarKpi
            items={[
              { label: "Entri Manual", value: String(rows.length), tone: "muted" },
              {
                label: "Total Realisasi",
                value: `Rp ${formatRevenueTargetAmount(totalManual)}`,
                tone: "plan",
              },
            ]}
          />
        }
      >
        <p className="text-[10px] text-slate-400">
          Entri realisasi manual · tahun {budgetYear.tahun} — wajib kategori BLU (P01–P08)
        </p>
      </ToolbarShell>

      <div className={cardClassName({ variant: "default", className: "!p-4" })}>
        <h3 className="text-xs font-semibold text-slate-800">Tambah Realisasi</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-[10px] text-slate-500">
            Tanggal
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </label>
          <label className="text-[10px] text-slate-500 sm:col-span-2">
            Kategori Pendapatan
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value as RevenueCategoryId)}
              className="mt-1 h-9 text-xs"
              disabled={Boolean(activeCategory)}
            >
              {REVENUE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.kode} — {t(c.labelKey)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-[10px] text-slate-500">
            Nominal (Rp)
            <Input
              value={formatRevenueTargetInput(parseRevenueTargetInput(amountInput))}
              onChange={(e) => setAmountInput(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="0"
              className="mt-1 h-9 text-right text-sm tabular-nums"
            />
          </label>
          <label className="text-[10px] text-slate-500">
            Keterangan
            <Input
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="Opsional"
              className="mt-1 h-9 text-xs"
            />
          </label>
        </div>
        <Button
          type="button"
          onClick={() => void handleAdd()}
          disabled={saving}
          className="mt-3 h-8 text-xs"
        >
          {saving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="mr-1.5 h-3.5 w-3.5" />
          )}
          Tambah Entri
        </Button>
      </div>

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

      <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-800">Daftar Entri Manual</h3>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH>Tanggal</TH>
              <TH>Kode</TH>
              <TH>Kategori</TH>
              <TH className="text-right">Nominal (Rp)</TH>
              <TH>Keterangan</TH>
              <TH className="w-12"> </TH>
            </TR>
          </THead>
          <TBody>
            {rows.length === 0 ? (
              <TR>
                <TD colSpan={6} className="py-8 text-center text-xs text-slate-400">
                  Belum ada entri manual
                </TD>
              </TR>
            ) : (
              rows.map((row) => (
                <TR key={row.id}>
                  <TD className="text-[11px] tabular-nums">{row.tanggal}</TD>
                  <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
                  <TD className="text-[11px] font-medium text-slate-700">{row.label}</TD>
                  <TD className="text-right tabular-nums text-[11px] font-medium text-[#0d6e63]">
                    {formatRevenueTargetAmount(row.amount)}
                  </TD>
                  <TD className="max-w-[12rem] truncate text-[10px] text-slate-500">
                    {row.reference_note ?? "—"}
                  </TD>
                  <TD>
                    <button
                      type="button"
                      onClick={() => void handleDelete(row.id)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
