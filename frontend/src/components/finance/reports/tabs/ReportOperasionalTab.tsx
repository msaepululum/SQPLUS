"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { RevenueCategoryFilter } from "@/components/finance/revenue/RevenueCategoryFilter";
import { ReportDataShell } from "@/components/finance/reports/shared/ReportDataShell";
import { ReportExportBar } from "@/components/finance/reports/shared/ReportExportBar";
import { cardClassName } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { RevenueCategoryId } from "@/constants/revenue-categories";
import { fetchAccCoa } from "@/services/accountingService";
import { fetchRevenueAnalysis, fetchRevenueDashboard } from "@/services/revenueCollectService";
import { fetchBudgetMonitoringPagu } from "@/services/budgetMonitoringPaguService";
import { revenuePctClass } from "@/types/revenue-collect";
import { formatRevenueTargetAmount } from "@/types/revenue-target";
import { REVENUE_MONTH_NAMES } from "@/types/revenue-plan";
import {
  formatReportAmount,
  formatReportPct,
  type ReportExportColumn,
} from "@/utils/reportExport";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Target, TrendingUp, Wallet } from "lucide-react";

export type ReportOperasionalVariant = "pendapatan" | "pendapatan-per-akun" | "belanja";

export function ReportOperasionalTab({ variant }: { variant: ReportOperasionalVariant }) {
  if (variant === "pendapatan") return <ReportPendapatanContent />;
  if (variant === "pendapatan-per-akun") return <ReportPendapatanPerAkunContent />;
  return <ReportBelanjaContent />;
}

function ReportPendapatanContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [bulan, setBulan] = useState("");
  const [category, setCategory] = useState<RevenueCategoryId | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total_rencana: number;
    total_realisasi: number;
    capaian_rencana_pct: number | null;
  } | null>(null);
  const [rows, setRows] = useState<
    {
      kode: string;
      label: string;
      rencana_amount: number;
      realisasi_amount: number;
      capaian_rencana_pct: number | null;
    }[]
  >([]);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRevenueDashboard(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        category_id: category || undefined,
      });
      setSummary(result.summary);
      setRows(result.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, category]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    const cols: ReportExportColumn[] = [
      { key: "kode", label: "Kode" },
      { key: "label", label: "Kategori BLU" },
      { key: "rencana_amount", label: "Rencana", align: "right", format: (v) => formatReportAmount(Number(v)) },
      { key: "realisasi_amount", label: "Realisasi", align: "right", format: (v) => formatReportAmount(Number(v)) },
      { key: "capaian_rencana_pct", label: "Capaian", align: "right", format: (v) => formatReportPct(v as number | null) },
    ];
    return {
      title: "Laporan Pendapatan",
      subtitle: `Tahun ${budgetYear.tahun}${bulan ? ` · ${REVENUE_MONTH_NAMES[Number(bulan) - 1]}` : ""}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: cols,
      rows: rows as unknown as Record<string, unknown>[],
      footerRows: summary
        ? [
            {
              kode: "",
              label: "TOTAL",
              rencana_amount: summary.total_rencana,
              realisasi_amount: summary.total_realisasi,
              capaian_rencana_pct: summary.capaian_rencana_pct,
            },
          ]
        : undefined,
    };
  }, [rows, summary, budgetYear, bulan]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
            <option value="">Tahunan</option>
            {REVENUE_MONTH_NAMES.map((l, i) => (
              <option key={l} value={String(i + 1)}>
                {l}
              </option>
            ))}
          </ToolbarFilter>
          <RevenueCategoryFilter value={category} onChange={setCategory} />
        </div>
        <ReportExportBar payload={exportPayload} filename={`laporan-pendapatan-${budgetYear?.tahun}`} />
      </div>

      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        {summary && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: "Total Rencana", value: summary.total_rencana, icon: Target },
              { label: "Total Realisasi", value: summary.total_realisasi, icon: TrendingUp },
              { label: "Capaian", value: summary.capaian_rencana_pct, icon: Wallet, pct: true },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-white">
                    <Icon className="h-3 w-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p className={cn("mt-0.5 text-sm font-bold tabular-nums", item.pct && revenuePctClass(item.value as number))}>
                    {item.pct
                      ? formatReportPct(item.value as number | null)
                      : `Rp ${formatRevenueTargetAmount(item.value as number)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Kode</TH>
                <TH>Kategori BLU</TH>
                <TH className="text-right">Rencana</TH>
                <TH className="text-right">Realisasi</TH>
                <TH className="text-right">Capaian</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.kode}>
                  <TD className="font-mono text-xs">{row.kode}</TD>
                  <TD className="text-xs">{row.label}</TD>
                  <TD className="text-right tabular-nums text-xs">
                    Rp {formatRevenueTargetAmount(row.rencana_amount)}
                  </TD>
                  <TD className="text-right tabular-nums text-xs">
                    Rp {formatRevenueTargetAmount(row.realisasi_amount)}
                  </TD>
                  <TD className={cn("text-right tabular-nums text-xs", revenuePctClass(row.capaian_rencana_pct))}>
                    {formatReportPct(row.capaian_rencana_pct)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}

function ReportPendapatanPerAkunContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<{ account_no: string; account_name: string; saldo: number }[]>([]);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAccCoa(budgetYearId, { kelompok: "4", detail_only: true, per_page: 200 });
      const filtered = result.rows
        .filter((r) => r.saldo !== 0)
        .sort((a, b) => Math.abs(b.saldo) - Math.abs(a.saldo));
      setRows(filtered);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: "Laporan Pendapatan per Akun",
      subtitle: `Tahun ${budgetYear.tahun} · Akun pendapatan (kelompok 4)`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "account_no", label: "No. Akun" },
        { key: "account_name", label: "Nama Akun" },
        { key: "saldo", label: "Saldo", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ReportExportBar payload={exportPayload} filename={`laporan-pendapatan-akun-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>No. Akun</TH>
                <TH>Nama Akun</TH>
                <TH className="text-right">Saldo</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-xs">{row.account_no}</TD>
                  <TD className="text-xs">{row.account_name}</TD>
                  <TD className="text-right tabular-nums text-xs">
                    Rp {formatRevenueTargetAmount(row.saldo)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}

function ReportBelanjaContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    { kode: string; nama: string; pagu: number; realisasi: number; serap_pct: number }[]
  >([]);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBudgetMonitoringPagu({
        budget_year_id: budgetYearId,
        view: "per_akun",
        bulan_from: 1,
        bulan_to: 12,
      });
      setRows(
        result.rows.map((r) => ({
          kode: r.kode,
          nama: r.nama,
          pagu: r.pagu,
          realisasi: r.realisasi,
          serap_pct: r.serap_pct,
        }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: "Laporan Belanja",
      subtitle: `Tahun ${budgetYear.tahun} · per jenis belanja`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "kode", label: "Kode" },
        { key: "nama", label: "Jenis Belanja" },
        { key: "pagu", label: "Pagu", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "realisasi", label: "Realisasi", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "serap_pct", label: "Serap", align: "right" as const, format: (v: unknown) => formatReportPct(Number(v)) },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ReportExportBar payload={exportPayload} filename={`laporan-belanja-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Kode</TH>
                <TH>Jenis Belanja</TH>
                <TH className="text-right">Pagu</TH>
                <TH className="text-right">Realisasi</TH>
                <TH className="text-right">Serap</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.kode}>
                  <TD className="font-mono text-xs">{row.kode}</TD>
                  <TD className="text-xs">{row.nama}</TD>
                  <TD className="text-right tabular-nums text-xs">Rp {formatRevenueTargetAmount(row.pagu)}</TD>
                  <TD className="text-right tabular-nums text-xs">Rp {formatRevenueTargetAmount(row.realisasi)}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatReportPct(row.serap_pct)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}
