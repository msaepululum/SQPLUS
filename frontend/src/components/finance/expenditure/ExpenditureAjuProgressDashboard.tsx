"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  fetchExpenditureAjuMeta,
  fetchExpenditureAjuMonitoring,
} from "@/services/expenditureAjuService";
import type {
  ExpenditureAjuProgressDashboard,
  ExpenditureAjuProgressStep,
} from "@/types/expenditure-aju-monitoring";
import { cn } from "@/lib/cn";

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof RefreshCw;
  tone: "blue" | "red" | "green";
}) {
  const tones = {
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  const iconTones = {
    blue: "bg-sky-600",
    red: "bg-red-500",
    green: "bg-emerald-600",
  };

  return (
    <div className={cn("rounded-lg border p-3", tones[tone])}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium opacity-80">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-white",
            iconTones[tone]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ProgressStepRow({
  step,
  expanded,
  onToggle,
}: {
  step: ExpenditureAjuProgressStep;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasHolders = step.holders.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasHolders}
        className={cn(
          "flex w-full items-start gap-3 border-l-4 border-l-sky-500 px-3 py-3 text-left transition-colors",
          hasHolders && "hover:bg-slate-50/80",
          !hasHolders && "cursor-default"
        )}
      >
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
          {step.step_no}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
              {step.title}
            </p>
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              {step.total_aju} AJU
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">{step.subtitle}</p>
        </div>
        {hasHolders && (
          <span className="mt-1 text-slate-400">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        )}
      </button>

      {expanded && hasHolders && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 space-y-2">
          {step.holders.map((holder) => (
            <div
              key={`${holder.departemen_id}-${holder.jabatan}`}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200/80 bg-white px-3 py-2 text-[11px]"
            >
              <span className="font-medium text-slate-700">{holder.jabatan}</span>
              <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 font-semibold tabular-nums text-sky-700">
                {holder.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExpenditureAjuProgressDashboard({
  defaultScope = "own",
}: {
  defaultScope?: "own" | "all";
}) {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [data, setData] = useState<ExpenditureAjuProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [scope, setScope] = useState<"own" | "all">(defaultScope);
  const [canViewAll, setCanViewAll] = useState(false);

  useEffect(() => {
    void fetchExpenditureAjuMeta(budgetYearId ?? undefined)
      .then((meta) => setCanViewAll(Boolean(meta.can_view_progress_all)))
      .catch(() => setCanViewAll(false));
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExpenditureAjuMonitoring(budgetYearId, scope);
      setData(result);
      setExpandedStep(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat progres AJU.");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!budgetYearId) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description="Dashboard progres AJU membutuhkan tahun anggaran aktif."
        className="mt-0"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        {error}
      </p>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className={cardClassName({ variant: "default", className: "!p-4" })}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Dashboard Progres Belanja</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {scope === "all"
                ? `Monitoring seluruh pengajuan belanja — tahun ${budgetYear?.tahun ?? data.tahun}`
                : `Monitoring pengajuan belanja Anda — tahun ${budgetYear?.tahun ?? data.tahun}`}
            </p>
          </div>
          {canViewAll && (
            <div className="w-full sm:w-52">
              <Select
                value={scope}
                onChange={(event) => setScope(event.target.value as "own" | "all")}
                className="h-9 text-xs"
              >
                <option value="own">Pengajuan saya</option>
                <option value="all">Seluruh unit (pimpinan)</option>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <KpiCard label="AJU Proses" value={data.kpi.proses} icon={RefreshCw} tone="blue" />
        <KpiCard label="AJU Reject" value={data.kpi.reject} icon={Ban} tone="red" />
        <KpiCard label="AJU Close" value={data.kpi.close} icon={CheckCircle2} tone="green" />
      </div>

      {data.steps.length === 0 ? (
        <EmptyState
          title="Workflow belum dikonfigurasi"
          description="Tidak ada definisi tahapan di workflow_aju untuk tahun ini."
          className="mt-0"
        />
      ) : (
        <div className="space-y-2">
          {data.steps.map((step) => {
            const key = `${step.step_order}-${step.title}`;
            return (
              <ProgressStepRow
                key={key}
                step={step}
                expanded={expandedStep === key}
                onToggle={() => setExpandedStep((current) => (current === key ? null : key))}
              />
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-400">
        Posisi dihitung dari workflow_aju, riwayat aju_status, dan departemen penanggung jawab
        tahap berikutnya.
      </p>
    </div>
  );
}
