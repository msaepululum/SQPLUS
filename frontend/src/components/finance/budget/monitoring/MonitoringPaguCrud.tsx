"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Clock,
  FileText,
  Lock,
  PieChart,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  ToolbarFilter,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { MonitoringPaguCharts } from "@/components/finance/budget/monitoring/MonitoringPaguCharts";
import { RiwayatPerubahanAnggaranCrud } from "@/components/finance/budget/monitoring/RiwayatPerubahanAnggaranCrud";
import {
  fetchBudgetMonitoringMeta,
  fetchBudgetMonitoringPagu,
} from "@/services/budgetMonitoringPaguService";
import {
  formatMonitoringAmount,
  formatMonitoringAmountFull,
  formatMonitoringDate,
  formatMonitoringPct,
  MONITORING_PERIODE_OPTIONS,
  MONITORING_VIEW_TABS,
  monitoringPctClass,
  monitoringStatusVariant,
  type BudgetMonitoringCharts,
  type BudgetMonitoringInsights,
  type BudgetMonitoringKpi,
  type BudgetMonitoringMeta,
  type BudgetMonitoringRow,
  type MonitoringView,
} from "@/types/budget-monitoring-pagu";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Loader2 } from "lucide-react";

function MonitoringPct({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("tabular-nums", monitoringPctClass(value), className)}>
      {formatMonitoringPct(value)}
    </span>
  );
}

const KPI_CONFIG: {
  key: keyof BudgetMonitoringKpi;
  label: string;
  icon: typeof Wallet;
  iconBg: string;
  format: (v: number) => string;
}[] = [
  { key: "total_pagu", label: "Total Pagu", icon: Wallet, iconBg: "bg-blue-600", format: formatMonitoringAmount },
  { key: "total_realisasi", label: "Total Realisasi", icon: TrendingUp, iconBg: "bg-emerald-600", format: formatMonitoringAmount },
  { key: "sisa_pagu", label: "Sisa Pagu", icon: Banknote, iconBg: "bg-amber-500", format: formatMonitoringAmount },
  { key: "pct_realisasi", label: "% Realisasi", icon: PieChart, iconBg: "bg-sky-500", format: formatMonitoringPct },
  { key: "terblokir", label: "Anggaran Terblokir", icon: Lock, iconBg: "bg-violet-600", format: formatMonitoringAmount },
  { key: "komitmen", label: "Komitmen Belanja", icon: FileText, iconBg: "bg-teal-600", format: formatMonitoringAmount },
  { key: "menunggu_pembayaran", label: "Menunggu Pembayaran", icon: Clock, iconBg: "bg-yellow-500", format: formatMonitoringAmount },
  { key: "sisa_efektif", label: "Estimasi Sisa Efektif", icon: Target, iconBg: "bg-[#1e40af]", format: formatMonitoringAmount },
];

function MonitoringKpiRow({ kpi }: { kpi: BudgetMonitoringKpi }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-8">
      {KPI_CONFIG.map((item) => {
        const Icon = item.icon;
        const value = kpi[item.key];
        return (
          <div key={item.key} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
            <div className={cn("mb-1.5 flex h-7 w-7 items-center justify-center rounded-md text-white", item.iconBg)}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-medium leading-tight text-slate-500">{item.label}</p>
            <p
              className={cn(
                "mt-0.5 text-xs font-bold tabular-nums",
                item.key === "pct_realisasi" ? monitoringPctClass(value) : "text-slate-900"
              )}
            >
              {item.key === "pct_realisasi" ? item.format(value) : `Rp ${item.format(value)}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MonitoringTable({
  rows,
  view,
}: {
  rows: BudgetMonitoringRow[];
  view: MonitoringView;
}) {
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          pagu: acc.pagu + r.pagu,
          realisasi: acc.realisasi + r.realisasi,
          sisa_pagu: acc.sisa_pagu + r.sisa_pagu,
          terblokir: acc.terblokir + r.terblokir,
          komitmen: acc.komitmen + r.komitmen,
          menunggu_pembayaran: acc.menunggu_pembayaran + r.menunggu_pembayaran,
          sisa_efektif: acc.sisa_efektif + r.sisa_efektif,
        }),
        {
          pagu: 0,
          realisasi: 0,
          sisa_pagu: 0,
          terblokir: 0,
          komitmen: 0,
          menunggu_pembayaran: 0,
          sisa_efektif: 0,
        }
      ),
    [rows]
  );
  const totalSerap = totals.pagu > 0 ? (totals.realisasi / totals.pagu) * 100 : 0;
  const showKsro = view === "komitmen";

  return (
    <Table embedded>
      <THead>
        <TR>
          <TH className="w-16">Kode</TH>
          <TH className="min-w-[9rem]">Unit / Akun</TH>
          <TH className="text-right">Pagu</TH>
          <TH className="text-right">Realisasi</TH>
          <TH className="text-right">Sisa</TH>
          <TH className="text-right w-14">% Serap</TH>
          <TH className="text-right">Terblokir</TH>
          <TH className="text-right">Komitmen</TH>
          <TH className="text-right">Menunggu</TH>
          <TH className="text-right">Sisa Efektif</TH>
          {showKsro && <TH className="text-right">Pagu RBA</TH>}
          <TH className="w-24">Updated</TH>
          <TH className="w-24">Status</TH>
        </TR>
      </THead>
      <TBody>
        {rows.map((row) => (
          <TR key={row.key}>
            <TD className="font-mono text-[10px] text-slate-500">{row.kode}</TD>
            <TD className="text-[11px]">
              <div className="font-medium text-slate-700">{row.nama}</div>
              {row.level === "ksro" && (
                <div className="text-[10px] text-slate-400">{row.nama_satuan_ptk}</div>
              )}
            </TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(row.pagu)}</TD>
            <TD className="text-right tabular-nums text-[11px] font-medium text-[#0d6e63]">
              {formatMonitoringAmountFull(row.realisasi)}
            </TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(row.sisa_pagu)}</TD>
            <TD className="text-right text-[11px]">
              <MonitoringPct value={row.serap_pct} />
            </TD>
            <TD className="text-right tabular-nums text-[11px] text-violet-700">
              {formatMonitoringAmountFull(row.terblokir)}
            </TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(row.komitmen)}</TD>
            <TD className="text-right tabular-nums text-[11px] text-amber-700">
              {formatMonitoringAmountFull(row.menunggu_pembayaran)}
            </TD>
            <TD className="text-right tabular-nums text-[11px] font-semibold">
              {formatMonitoringAmountFull(row.sisa_efektif)}
            </TD>
            {showKsro && (
              <TD className="text-right tabular-nums text-[10px] text-slate-500">
                {formatMonitoringAmountFull(row.pagu_rba)}
              </TD>
            )}
            <TD className="text-[10px] text-slate-400">{formatMonitoringDate(row.updated_at)}</TD>
            <TD>
              <Badge variant={monitoringStatusVariant(row.status)} className="text-[10px]">
                {row.status_label}
              </Badge>
            </TD>
          </TR>
        ))}
        {rows.length > 0 && (
          <TR className="bg-slate-50/80 font-semibold">
            <TD colSpan={2} className="text-[11px]">
              Total
            </TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.pagu)}</TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.realisasi)}</TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.sisa_pagu)}</TD>
            <TD className="text-right text-[11px]">
              <MonitoringPct value={totalSerap} />
            </TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.terblokir)}</TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.komitmen)}</TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.menunggu_pembayaran)}</TD>
            <TD className="text-right tabular-nums text-[11px]">{formatMonitoringAmountFull(totals.sisa_efektif)}</TD>
            {showKsro && <TD className="text-right text-[11px]">—</TD>}
            <TD colSpan={2} className="text-[11px]">—</TD>
          </TR>
        )}
      </TBody>
    </Table>
  );
}

function InsightTables({ insights }: { insights: BudgetMonitoringInsights }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className={cardClassName({ variant: "default", className: "!p-0" })}>
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-[11px] font-semibold text-slate-800">
            Top 10 Kode Akun dengan Realisasi Tertinggi
          </h3>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-8">No</TH>
              <TH>Kode</TH>
              <TH>Nama</TH>
              <TH className="text-right">Realisasi</TH>
              <TH className="text-right">% Serap</TH>
            </TR>
          </THead>
          <TBody>
            {insights.top_realisasi.map((row) => (
              <TR key={row.no}>
                <TD className="text-[10px] text-slate-400">{row.no}</TD>
                <TD className="font-mono text-[10px]">{row.kode}</TD>
                <TD className="max-w-[8rem] truncate text-[11px]">
                  <span title={row.nama}>{row.nama}</span>
                </TD>
                <TD className="text-right tabular-nums text-[11px]">
                  {formatMonitoringAmountFull(row.realisasi ?? 0)}
                </TD>
                <TD className="text-right text-[11px]">
                  <MonitoringPct value={row.serap_pct} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <div className={cardClassName({ variant: "default", className: "!p-0" })}>
        <div className="border-b border-slate-100 px-3 py-2">
          <h3 className="text-[11px] font-semibold text-slate-800">Daftar Anggaran Hampir Habis</h3>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH className="w-8">No</TH>
              <TH>Unit / Akun</TH>
              <TH className="text-right">Sisa Efektif</TH>
              <TH className="text-right">% Serap</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {insights.almost_empty.length === 0 ? (
              <TR>
                <TD colSpan={5} className="py-4 text-center text-[11px] text-slate-400">
                  Tidak ada anggaran kritis saat ini.
                </TD>
              </TR>
            ) : (
              insights.almost_empty.map((row) => (
                <TR key={row.no}>
                  <TD className="text-[10px] text-slate-400">{row.no}</TD>
                  <TD className="max-w-[9rem] truncate text-[11px]">
                    <span title={row.nama}>
                      <span className="font-mono text-[10px] text-slate-400">{row.kode}</span> {row.nama}
                    </span>
                  </TD>
                  <TD className="text-right tabular-nums text-[11px]">
                    {formatMonitoringAmountFull(row.sisa_pagu ?? 0)}
                  </TD>
                  <TD className="text-right text-[11px]">
                  <MonitoringPct value={row.serap_pct} />
                </TD>
                  <TD>
                    {row.status && (
                      <Badge variant={monitoringStatusVariant(row.status)} className="text-[10px]">
                        {row.status_label}
                      </Badge>
                    )}
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

export function MonitoringPaguCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<BudgetMonitoringMeta | null>(null);
  const [view, setView] = useState<MonitoringView>("monitoring");
  const [rows, setRows] = useState<BudgetMonitoringRow[]>([]);
  const [kpi, setKpi] = useState<BudgetMonitoringKpi | null>(null);
  const [charts, setCharts] = useState<BudgetMonitoringCharts | null>(null);
  const [insights, setInsights] = useState<BudgetMonitoringInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("1-12");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);

  const periode = MONITORING_PERIODE_OPTIONS.find((p) => p.value === filterPeriode) ?? MONITORING_PERIODE_OPTIONS[0];

  useEffect(() => {
    void fetchBudgetMonitoringMeta()
      .then(setMeta)
      .catch((err) => {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal memuat referensi.",
        });
      });
  }, []);

  const loadData = useCallback(async () => {
    if (!budgetYearId || view === "riwayat") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const apiView = view === "monitoring" ? "monitoring" : view;
      const result = await fetchBudgetMonitoringPagu({
        budget_year_id: budgetYearId,
        ptk_id: filterPtk ? Number(filterPtk) : undefined,
        kelompok_belanja_id: filterKelompok ? Number(filterKelompok) : undefined,
        jenis_belanja_id: filterJenis ? Number(filterJenis) : undefined,
        bulan_from: periode.from,
        bulan_to: periode.to,
        search: search || undefined,
        view: apiView,
      });
      setRows(result.rows);
      setKpi(result.kpi);
      setCharts(result.charts);
      setInsights(result.insights);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat monitoring pagu.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, filterPtk, filterKelompok, filterJenis, filterPeriode, search, view, periode.from, periode.to]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredJenis = useMemo(() => {
    if (!meta) return [];
    if (!filterKelompok) return meta.jenis_belanja;
    return meta.jenis_belanja.filter((j) => String(j.kelompok_belanja_id) === filterKelompok);
  }, [meta, filterKelompok]);

  const hasFilters = Boolean(filterPtk || filterKelompok || filterJenis || search || filterPeriode !== "1-12");

  if (view === "riwayat") {
    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
          {MONITORING_VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                view === tab.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <RiwayatPerubahanAnggaranCrud />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <ToolbarFilter label="Periode" value={filterPeriode} onChange={setFilterPeriode}>
            {MONITORING_PERIODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} {budgetYear?.tahun ?? ""}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Unit" value={filterPtk} onChange={setFilterPtk}>
            <option value="">Semua Unit</option>
            {meta?.ptk.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_satuan_ptk}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Kelompok" value={filterKelompok} onChange={setFilterKelompok}>
            <option value="">Semua Kelompok</option>
            {meta?.kelompok_belanja.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kode_kelompok_belanja}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Jenis Belanja" value={filterJenis} onChange={setFilterJenis}>
            <option value="">Semua Jenis</option>
            {filteredJenis.map((j) => (
              <option key={j.id} value={j.id}>
                {j.kode_jenis_belanja}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari unit / KSRO..." />
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setFilterPtk("");
                setFilterKelompok("");
                setFilterJenis("");
                setFilterPeriode("1-12");
                setSearch("");
              }}
              className="mb-0.5 text-[10px] font-medium text-sky-600 hover:text-sky-800 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        {budgetYear && (
          <p className="text-[10px] text-slate-400 lg:ml-auto lg:pb-1">
            Pagu FINANCE · tahun {budgetYear.tahun} · AJU = pengajuan belanja
          </p>
        )}
      </ToolbarShell>

      {message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {message.text}
        </div>
      )}

      {kpi && <MonitoringKpiRow kpi={kpi} />}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat monitoring anggaran...
        </div>
      ) : (
        <>
          {charts && <MonitoringPaguCharts charts={charts} />}

          <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
            {MONITORING_VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                  view === tab.id
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="Tidak ada data monitoring"
              description="Sesuaikan filter atau pastikan pagu tahun ini sudah diinput di FINANCE."
              className="mt-0"
            />
          ) : (
            <div
              className={cardClassName({
                variant: "default",
                className: cn("!p-0", tableGridShellClassName),
              })}
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <h3 className="text-xs font-semibold text-slate-800">
                  Daftar Monitoring Realisasi dan Sisa Pagu
                </h3>
                <p className="text-[10px] text-slate-400">
                  Realisasi dari AJU CLOSE · Komitmen DRAFT · Menunggu APPROVED · Terblokir dari RBA
                </p>
              </div>
              <MonitoringTable rows={rows} view={view} />
            </div>
          )}

          {insights && <InsightTables insights={insights} />}
        </>
      )}
    </div>
  );
}
