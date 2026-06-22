"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarFilter, ToolbarSearch, ToolbarShell } from "@/components/finance/budget/BudgetToolbar";
import { ReportDataShell } from "@/components/finance/reports/shared/ReportDataShell";
import { ReportExportBar } from "@/components/finance/reports/shared/ReportExportBar";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { fetchAccJurnalOtomatis, fetchAccJurnalUmum } from "@/services/accountingService";
import { fetchCashTransactionMeta, fetchCashTransactions } from "@/services/cashTransactionService";
import { formatAccAmount, formatAccDate } from "@/types/accounting";
import { formatCashAmount, formatCashDate } from "@/types/cash-transaction";
import { formatReportAmount } from "@/utils/reportExport";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export type ReportTransaksiVariant = "pembayaran" | "jurnal";

export function ReportTransaksiTab({ variant }: { variant: ReportTransaksiVariant }) {
  if (variant === "pembayaran") return <ReportPembayaranContent />;
  return <ReportJurnalContent />;
}

function ReportPembayaranContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [bulan, setBulan] = useState("");
  const [flowType, setFlowType] = useState("");
  const [bulanOptions, setBulanOptions] = useState<{ value: string; label: string }[]>([]);
  const [flowOptions, setFlowOptions] = useState<{ value: string; label: string }[]>([]);
  const [rows, setRows] = useState<
    {
      no_jurnal: string;
      tanggal: string | null;
      flow_type: string;
      journal_type_label: string;
      keterangan: string;
      kas_account_name: string;
      amount: number;
      status: string;
    }[]
  >([]);
  const [summary, setSummary] = useState<{
    total_masuk: number;
    total_keluar: number;
    saldo_netto: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchCashTransactionMeta(budgetYearId).then((meta) => {
      setBulanOptions([
        { value: "", label: "Semua bulan" },
        ...meta.bulan_options.map((o) => ({ value: String(o.value), label: o.label })),
      ]);
      setFlowOptions([
        { value: "", label: "Semua arah" },
        ...meta.flow_type_options.map((o) => ({ value: o.value, label: o.label })),
      ]);
    });
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCashTransactions(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
        flow_type: flowType === "masuk" || flowType === "keluar" ? flowType : undefined,
        per_page: 100,
      });
      setRows(result.rows);
      setSummary(result.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan, flowType]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: "Laporan Pembayaran / Transaksi Kas",
      subtitle: `Tahun ${budgetYear.tahun}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "no_jurnal", label: "No. Jurnal" },
        { key: "tanggal", label: "Tanggal", format: (v: unknown) => formatCashDate(v as string | null) },
        { key: "flow_type", label: "Arah" },
        { key: "journal_type_label", label: "Jenis" },
        { key: "keterangan", label: "Keterangan" },
        { key: "kas_account_name", label: "Rekening" },
        { key: "amount", label: "Nominal", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "status", label: "Status" },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear]);

  return (
    <div className="space-y-3">
      <ToolbarShell>
        <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
          {bulanOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </ToolbarFilter>
        <ToolbarFilter label="Arah" value={flowType} onChange={setFlowType}>
          {flowOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </ToolbarFilter>
      </ToolbarShell>
      <div className="flex justify-end">
        <ReportExportBar payload={exportPayload} filename={`laporan-pembayaran-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        {summary && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total Masuk", value: summary.total_masuk, icon: ArrowDownLeft, color: "text-emerald-700" },
              { label: "Total Keluar", value: summary.total_keluar, icon: ArrowUpRight, color: "text-rose-700" },
              { label: "Netto", value: summary.saldo_netto, icon: ArrowDownLeft, color: "text-slate-900" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-violet-600 text-white">
                    <Icon className="h-3 w-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p className={`mt-0.5 text-sm font-bold tabular-nums ${item.color}`}>
                    {formatCashAmount(item.value)}
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
                <TH>No. Jurnal</TH>
                <TH>Tanggal</TH>
                <TH>Arah</TH>
                <TH>Jenis</TH>
                <TH>Keterangan</TH>
                <TH>Rekening</TH>
                <TH className="text-right">Nominal</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.no_jurnal}>
                  <TD className="font-mono text-xs">{row.no_jurnal}</TD>
                  <TD className="text-xs">{formatCashDate(row.tanggal)}</TD>
                  <TD>
                    <Badge variant={row.flow_type === "masuk" ? "success" : "danger"} className="text-[10px]">
                      {row.flow_type}
                    </Badge>
                  </TD>
                  <TD className="text-xs">{row.journal_type_label}</TD>
                  <TD className="max-w-[160px] truncate text-xs">{row.keterangan}</TD>
                  <TD className="text-xs">{row.kas_account_name}</TD>
                  <TD className="text-right tabular-nums text-xs font-semibold">{formatCashAmount(row.amount)}</TD>
                  <TD className="text-xs text-slate-500">{row.status}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}

function ReportJurnalContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [mode, setMode] = useState<"umum" | "otomatis">("umum");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<
    {
      no_jurnal: string;
      tanggal: string | null;
      keterangan: string;
      journal_type_label: string;
      debet: number;
      kredit: number;
      posted: boolean;
    }[]
  >([]);
  const [summary, setSummary] = useState({ total_debet: 0, total_kredit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const fetcher = mode === "umum" ? fetchAccJurnalUmum : fetchAccJurnalOtomatis;
      const result = await fetcher(budgetYearId, { search: search || undefined, per_page: 100 });
      setRows(result.rows);
      setSummary({
        total_debet: result.summary.total_debet ?? 0,
        total_kredit: result.summary.total_kredit ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, mode, search]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: `Laporan Jurnal ${mode === "umum" ? "Umum" : "Otomatis"}`,
      subtitle: `Tahun ${budgetYear.tahun}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "no_jurnal", label: "No. Jurnal" },
        { key: "tanggal", label: "Tanggal", format: (v: unknown) => formatAccDate(v as string | null) },
        { key: "journal_type_label", label: "Jenis" },
        { key: "keterangan", label: "Keterangan" },
        { key: "debet", label: "Debet", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "kredit", label: "Kredit", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "posted", label: "Posted", format: (v: unknown) => (v ? "Ya" : "Tidak") },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear, mode]);

  return (
    <div className="space-y-3">
      <ToolbarShell>
        <ToolbarFilter
          label="Sumber jurnal"
          value={mode}
          onChange={(v) => setMode(v as "umum" | "otomatis")}
        >
          <option value="umum">Jurnal Umum (BKA)</option>
          <option value="otomatis">Jurnal Otomatis</option>
        </ToolbarFilter>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari no. jurnal / keterangan..." />
      </ToolbarShell>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Total debet {formatAccAmount(summary.total_debet)} · kredit {formatAccAmount(summary.total_kredit)}
        </p>
        <ReportExportBar payload={exportPayload} filename={`laporan-jurnal-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>No. Jurnal</TH>
                <TH>Tanggal</TH>
                <TH>Jenis</TH>
                <TH>Keterangan</TH>
                <TH className="text-right">Debet</TH>
                <TH className="text-right">Kredit</TH>
                <TH>Posted</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.no_jurnal}>
                  <TD className="font-mono text-xs">{row.no_jurnal}</TD>
                  <TD className="text-xs">{formatAccDate(row.tanggal)}</TD>
                  <TD className="text-xs">{row.journal_type_label}</TD>
                  <TD className="max-w-[180px] truncate text-xs">{row.keterangan}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatAccAmount(row.debet)}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatAccAmount(row.kredit)}</TD>
                  <TD>
                    <Badge variant={row.posted ? "success" : "warning"} className="text-[10px]">
                      {row.posted ? "Posted" : "Draft"}
                    </Badge>
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
