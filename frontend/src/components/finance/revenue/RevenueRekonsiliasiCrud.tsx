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
import {
  fetchRevenueReconciliations,
  saveRevenueReconciliationsBulk,
} from "@/services/revenueCollectService";
import {
  revenueStatusLabel,
  revenueStatusTone,
  type RevenueReconciliationRow,
} from "@/types/revenue-collect";
import { REVENUE_MONTH_NAMES } from "@/types/revenue-plan";
import {
  formatRevenueTargetAmount,
  formatRevenueTargetInput,
  parseRevenueTargetInput,
} from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2, Save } from "lucide-react";

type AkuntansiDraft = Record<string, string>;

function currentMonth(): number {
  return new Date().getMonth() + 1;
}

export function RevenueRekonsiliasiCrud() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<RevenueReconciliationRow[]>([]);
  const [summary, setSummary] = useState<{
    total_operasional: number;
    total_akuntansi: number;
    total_selisih: number;
    jumlah_belum: number;
    jumlah_sesuai: number;
    jumlah_selisih: number;
  } | null>(null);
  const [bulan, setBulan] = useState(String(currentMonth()));
  const [draft, setDraft] = useState<AkuntansiDraft>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueReconciliations(budgetYearId, Number(bulan));
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat rekonsiliasi.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const getAkuntansi = (row: RevenueReconciliationRow): number => {
    if (row.category_id in draft) {
      return parseRevenueTargetInput(draft[row.category_id]);
    }
    return row.akuntansi_amount;
  };

  const hasChanges = Object.keys(draft).length > 0;

  const draftSummary = useMemo(() => {
    let operasional = 0;
    let akuntansi = 0;
    for (const row of rows) {
      operasional += row.operasional_amount;
      akuntansi += getAkuntansi(row);
    }
    return { operasional, akuntansi, selisih: akuntansi - operasional };
  }, [rows, draft]);

  const handleSave = async () => {
    if (!budgetYearId) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = rows.map((row) => ({
        category_id: row.category_id,
        akuntansi_amount: getAkuntansi(row),
      }));
      const result = await saveRevenueReconciliationsBulk(
        budgetYearId,
        Number(bulan),
        items
      );
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan rekonsiliasi.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat rekonsiliasi...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Rekonsiliasi dikunci per tahun anggaran."
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
              {
                label: "Operasional",
                value: `Rp ${formatRevenueTargetAmount(
                  hasChanges ? draftSummary.operasional : (summary?.total_operasional ?? 0)
                )}`,
                tone: "muted",
              },
              {
                label: "Akuntansi",
                value: `Rp ${formatRevenueTargetAmount(
                  hasChanges ? draftSummary.akuntansi : (summary?.total_akuntansi ?? 0)
                )}`,
                tone: "plan",
              },
              {
                label: "Selisih",
                value: `Rp ${formatRevenueTargetAmount(
                  hasChanges ? draftSummary.selisih : (summary?.total_selisih ?? 0)
                )}`,
                tone: "default",
              },
              {
                label: "Sesuai / Selisih / Belum",
                value: summary
                  ? `${summary.jumlah_sesuai} / ${summary.jumlah_selisih} / ${summary.jumlah_belum}`
                  : "—",
                tone: "muted",
              },
            ]}
          />
        }
      >
        <label className="text-[10px] text-slate-500">
          Bulan Rekonsiliasi
          <Select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="mt-1 h-8 w-32 text-xs"
          >
            {REVENUE_MONTH_NAMES.slice(1).map((nama, idx) => (
              <option key={nama} value={String(idx + 1)}>
                {nama}
              </option>
            ))}
          </Select>
        </label>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="ml-auto h-8 text-xs"
        >
          {saving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" />
          )}
          Simpan Rekonsiliasi
        </Button>
      </ToolbarShell>

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
          <h3 className="text-xs font-semibold text-slate-800">Rekonsiliasi per Kategori BLU</h3>
          <p className="text-[10px] text-slate-400">
            Cocokkan realisasi operasional dengan jurnal akuntansi — {REVENUE_MONTH_NAMES[Number(bulan)]}{" "}
            {budgetYear.tahun}
          </p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-12">Kode</TH>
              <TH>Kategori</TH>
              <TH className="text-right">Operasional</TH>
              <TH className="text-right">Akuntansi</TH>
              <TH className="text-right">Selisih</TH>
              <TH className="w-24">Status</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => {
              const akuntansi = getAkuntansi(row);
              const selisih = akuntansi - row.operasional_amount;
              const display =
                row.category_id in draft
                  ? formatRevenueTargetInput(parseRevenueTargetInput(draft[row.category_id]))
                  : formatRevenueTargetInput(row.akuntansi_amount);

              return (
                <TR key={row.category_id}>
                  <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
                  <TD className="text-[11px] font-medium text-slate-700">{row.label}</TD>
                  <TD className="text-right tabular-nums text-[11px] text-slate-600">
                    {formatRevenueTargetAmount(row.operasional_amount)}
                  </TD>
                  <TD className="text-right">
                    <Input
                      value={display}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [row.category_id]: e.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                      className="ml-auto h-8 w-full max-w-[12rem] text-right text-sm tabular-nums"
                      placeholder="0"
                    />
                  </TD>
                  <TD
                    className={cn(
                      "text-right tabular-nums text-[11px]",
                      selisih === 0 ? "text-slate-400" : "font-medium text-amber-700"
                    )}
                  >
                    {formatRevenueTargetAmount(selisih)}
                  </TD>
                  <TD>
                    <span
                      className={cn(
                        "inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium",
                        revenueStatusTone(row.status)
                      )}
                    >
                      {revenueStatusLabel(row.status)}
                    </span>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
