"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { ToolbarKpi, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  advanceRevenueSetupStatus,
  fetchRevenueTargets,
  saveRevenueTargetsBulk,
} from "@/services/revenueTargetService";
import {
  formatRevenueSetupStatus,
  formatRevenueTargetAmount,
  formatRevenueTargetInput,
  parseRevenueTargetInput,
  type RevenueSetupMeta,
  type RevenueSetupStatus,
  type RevenueTargetRow,
  type RevenueTargetSummary,
} from "@/types/revenue-target";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { ArrowRight, Loader2, Save } from "lucide-react";

type TargetDraft = Record<string, string>;

function draftKey(phase: RevenueSetupStatus, categoryId: string): string {
  return `${phase}_${categoryId}`;
}

function getPhaseAmount(
  row: RevenueTargetRow,
  phase: RevenueSetupStatus,
  draft: TargetDraft
): number {
  const key = draftKey(phase, row.category_id);
  if (key in draft) {
    return parseRevenueTargetInput(draft[key]);
  }
  if (phase === "semula") return row.semula_amount;
  if (phase === "pergeseran") return row.pergeseran_amount;
  return row.perubahan_amount;
}

function computeMenjadi(row: RevenueTargetRow, phase: RevenueSetupStatus, draft: TargetDraft): number {
  const semula =
    phase === "semula" && draftKey("semula", row.category_id) in draft
      ? getPhaseAmount(row, "semula", draft)
      : row.semula_amount;
  const pergeseran =
    phase === "pergeseran" && draftKey("pergeseran", row.category_id) in draft
      ? getPhaseAmount(row, "pergeseran", draft)
      : row.pergeseran_amount;
  const perubahan =
    phase === "perubahan" && draftKey("perubahan", row.category_id) in draft
      ? getPhaseAmount(row, "perubahan", draft)
      : row.perubahan_amount;
  return semula + pergeseran + perubahan;
}

function StatusBadge({ setup }: { setup: RevenueSetupMeta }) {
  const tone =
    setup.setup_status === "semula"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : setup.setup_status === "pergeseran"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium", tone)}>
      Tahap: {formatRevenueSetupStatus(setup.setup_status)}
    </span>
  );
}

export function RevenueSetupTargetCrud() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [setup, setSetup] = useState<RevenueSetupMeta | null>(null);
  const [rows, setRows] = useState<RevenueTargetRow[]>([]);
  const [summary, setSummary] = useState<RevenueTargetSummary | null>(null);
  const [draft, setDraft] = useState<TargetDraft>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const activePhase = setup?.setup_status ?? "semula";

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setSetup(null);
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchRevenueTargets(budgetYearId);
      setSetup(result.setup);
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat target pendapatan.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const hasChanges = useMemo(() => {
    const prefix = `${activePhase}_`;
    return Object.keys(draft).some((key) => key.startsWith(prefix));
  }, [draft, activePhase]);

  const draftTotalMenjadi = useMemo(() => {
    return rows.reduce((sum, row) => sum + computeMenjadi(row, activePhase, draft), 0);
  }, [rows, draft, activePhase]);

  const kpiItems = useMemo(() => {
    const totalMenjadi = hasChanges ? draftTotalMenjadi : (summary?.total_target ?? 0);
    const items = [
      {
        label: "Total Menjadi",
        value: `Rp ${formatRevenueTargetAmount(totalMenjadi)}`,
        tone: "plan" as const,
      },
      {
        label: "Total Semula",
        value: `Rp ${formatRevenueTargetAmount(summary?.total_semula ?? 0)}`,
        tone: "muted" as const,
      },
    ];

    if (setup && setup.setup_status !== "semula") {
      items.push({
        label: "Total Pergeseran",
        value: `Rp ${formatRevenueTargetAmount(summary?.total_pergeseran ?? 0)}`,
        tone: "muted" as const,
      });
    }

    if (setup && setup.setup_status === "perubahan") {
      items.push({
        label: "Total Perubahan",
        value: `Rp ${formatRevenueTargetAmount(summary?.total_perubahan ?? 0)}`,
        tone: "muted" as const,
      });
    }

    return items;
  }, [summary, draftTotalMenjadi, hasChanges, setup]);

  const handleSave = async () => {
    if (!budgetYearId || !setup) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = rows.map((row) => ({
        category_id: row.category_id,
        amount: getPhaseAmount(row, activePhase, draft),
      }));
      const result = await saveRevenueTargetsBulk(budgetYearId, activePhase, items);
      setSetup(result.setup);
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan target.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdvance = async () => {
    if (!budgetYearId) return;
    setAdvancing(true);
    setMessage(null);
    try {
      const result = await advanceRevenueSetupStatus(budgetYearId);
      setSetup(result.setup);
      setRows(result.rows);
      setSummary(result.summary);
      setDraft({});
      setMessage({ type: "success", text: result.message });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal membuka tahap berikutnya.",
      });
    } finally {
      setAdvancing(false);
    }
  };

  const showPergeseranCol = setup && setup.setup_status !== "semula";
  const showPerubahanCol = setup && setup.setup_status === "perubahan";
  const showPerubahanPctCol = showPergeseranCol;

  const renderAmountCell = (
    row: RevenueTargetRow,
    phase: RevenueSetupStatus,
    editable: boolean
  ) => {
    const key = draftKey(phase, row.category_id);
    const stored =
      phase === "semula"
        ? row.semula_amount
        : phase === "pergeseran"
          ? row.pergeseran_amount
          : row.perubahan_amount;

    if (!editable) {
      return (
        <TD className="text-right tabular-nums text-[11px] text-slate-600">
          {formatRevenueTargetAmount(stored)}
        </TD>
      );
    }

    const display =
      key in draft
        ? formatRevenueTargetInput(parseRevenueTargetInput(draft[key]))
        : formatRevenueTargetInput(stored);

    return (
      <TD className="text-right">
        <Input
          value={display}
          onChange={(e) =>
            setDraft((prev) => ({
              ...prev,
              [key]: e.target.value.replace(/[^\d]/g, ""),
            }))
          }
          placeholder="0"
          disabled={saving}
          className="ml-auto h-9 w-full max-w-[14rem] text-right text-sm tabular-nums"
        />
      </TD>
    );
  };

  if (yearLoading || loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat target pendapatan...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear || !setup) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Target pendapatan dikunci per tahun anggaran. Pilih tahun di bar atas."
        className="mt-3"
      />
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell footer={<ToolbarKpi items={kpiItems} />}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] text-slate-400">
            Target tahun {budgetYear.tahun}
            {budgetYear.nama ? ` · ${budgetYear.nama}` : ""} — 8 kategori BLU
          </p>
          <StatusBadge setup={setup} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {setup.can_advance && setup.next_status_label && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleAdvance()}
              disabled={advancing || saving || hasChanges}
              className="h-8 text-xs"
              title={hasChanges ? "Simpan perubahan terlebih dahulu" : undefined}
            >
              {advancing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
              )}
              Buka Tahap {setup.next_status_label}
            </Button>
          )}
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || rows.length === 0}
            className="h-8 text-xs"
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
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

      <div
        className={cardClassName({
          variant: "default",
          className: cn("!p-0", tableGridShellClassName),
        })}
      >
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-slate-800">Target per Kategori Pendapatan</h3>
          <p className="text-[10px] text-slate-400">
            {setup.setup_status === "semula" &&
              "Isi target semula per kategori. Setelah selesai, buka tahap pergeseran."}
            {setup.setup_status === "pergeseran" &&
              "Semula terkunci. Isi nilai pergeseran (+/−) per kategori."}
            {setup.setup_status === "perubahan" &&
              "Semula dan pergeseran terkunci. Isi nilai perubahan per kategori."}
          </p>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-12">Kode</TH>
              <TH>Kategori Pendapatan</TH>
              <TH className="w-48 text-right">Semula (Rp)</TH>
              {showPergeseranCol && <TH className="w-48 text-right">Pergeseran (Rp)</TH>}
              {showPerubahanCol && <TH className="w-48 text-right">Perubahan (Rp)</TH>}
              {showPerubahanPctCol && <TH className="w-24 text-right">Perubahan %</TH>}
            </TR>
          </THead>
          <TBody>
            {rows.map((row) => (
              <TR key={row.category_id}>
                <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
                <TD className="text-[11px] font-medium text-slate-700">{row.label}</TD>
                {renderAmountCell(row, "semula", setup.can_edit_semula)}
                {showPergeseranCol &&
                  renderAmountCell(row, "pergeseran", setup.can_edit_pergeseran)}
                {showPerubahanCol &&
                  renderAmountCell(row, "perubahan", setup.can_edit_perubahan)}
                {showPerubahanPctCol && (
                  <TD className="text-right tabular-nums text-[11px] text-slate-600">
                    {row.perubahan_pct == null
                      ? "—"
                      : `${row.perubahan_pct.toFixed(2).replace(".", ",")}%`}
                  </TD>
                )}
              </TR>
            ))}
            <TR className="bg-slate-50/80 font-semibold">
              <TD colSpan={2} className="text-[11px]">
                Total
              </TD>
              <TD className="text-right text-[11px] tabular-nums text-slate-700">
                {formatRevenueTargetAmount(summary?.total_semula ?? 0)}
              </TD>
              {showPergeseranCol && (
                <TD className="text-right text-[11px] tabular-nums text-slate-700">
                  {formatRevenueTargetAmount(summary?.total_pergeseran ?? 0)}
                </TD>
              )}
              {showPerubahanCol && (
                <TD className="text-right text-[11px] tabular-nums text-slate-700">
                  {formatRevenueTargetAmount(summary?.total_perubahan ?? 0)}
                </TD>
              )}
              {showPerubahanPctCol && (
                <TD className="text-right text-[11px] tabular-nums text-[#0d6e63]">
                  {summary && summary.total_semula > 0
                    ? `${(
                        ((summary.total_pergeseran + summary.total_perubahan) /
                          summary.total_semula) *
                        100
                      )
                        .toFixed(2)
                        .replace(".", ",")}%`
                    : "—"}
                </TD>
              )}
            </TR>
          </TBody>
        </Table>
      </div>
    </div>
  );
}
