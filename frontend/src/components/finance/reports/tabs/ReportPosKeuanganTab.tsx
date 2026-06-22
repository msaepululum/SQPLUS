"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { ToolbarFilter } from "@/components/finance/budget/BudgetToolbar";
import { ReportDataShell } from "@/components/finance/reports/shared/ReportDataShell";
import { ReportExportBar } from "@/components/finance/reports/shared/ReportExportBar";
import { cardClassName } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { fetchCashSaldoMeta, fetchPosisiSaldo, fetchRekapBulanan } from "@/services/cashSaldoRekapService";
import { fetchHpMeta, fetchPiutangDaftar, fetchHutangPerAkun } from "@/services/hutangPiutangService";
import { formatCashAmount } from "@/types/cash-transaction";
import { formatSaldoAmount } from "@/types/cash-saldo-rekap";
import { formatHpAmount, formatHpDate } from "@/types/hutang-piutang";
import { formatReportAmount } from "@/utils/reportExport";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { Banknote, TrendingDown, TrendingUp } from "lucide-react";

export type ReportPosKeuanganVariant = "kas-bank" | "saldo-bulanan" | "hutang" | "piutang";

export function ReportPosKeuanganTab({ variant }: { variant: ReportPosKeuanganVariant }) {
  if (variant === "kas-bank") return <ReportKasBankContent />;
  if (variant === "saldo-bulanan") return <ReportSaldoBulananContent />;
  if (variant === "hutang") return <ReportHutangContent />;
  return <ReportPiutangContent />;
}

function ReportKasBankContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [bulan, setBulan] = useState("");
  const [bulanOptions, setBulanOptions] = useState<{ value: string; label: string }[]>([]);
  const [rows, setRows] = useState<
    { account_no: string; account_name: string; saldo_awal: number; masuk: number; keluar: number; saldo_akhir: number }[]
  >([]);
  const [summary, setSummary] = useState<{
    saldo_awal: number;
    total_masuk: number;
    total_keluar: number;
    saldo_akhir: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchCashSaldoMeta(budgetYearId).then((meta) => {
      setBulanOptions([
        { value: "", label: "Kumulatif tahun" },
        ...meta.bulan_options.map((o) => ({ value: String(o.value), label: o.label })),
      ]);
    });
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPosisiSaldo(budgetYearId, {
        bulan: bulan ? Number(bulan) : undefined,
      });
      setRows(result.rows);
      setSummary(result.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, bulan]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: "Laporan Kas & Bank",
      subtitle: `Tahun ${budgetYear.tahun}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "account_no", label: "No. Rekening" },
        { key: "account_name", label: "Nama Rekening" },
        { key: "saldo_awal", label: "Saldo Awal", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "masuk", label: "Masuk", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "keluar", label: "Keluar", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "saldo_akhir", label: "Saldo Akhir", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
      ],
      rows: rows as unknown as Record<string, unknown>[],
      footerRows: summary
        ? [
            {
              account_no: "",
              account_name: "TOTAL",
              saldo_awal: summary.saldo_awal,
              masuk: summary.total_masuk,
              keluar: summary.total_keluar,
              saldo_akhir: summary.saldo_akhir,
            },
          ]
        : undefined,
    };
  }, [rows, summary, budgetYear]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
          {bulanOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </ToolbarFilter>
        <ReportExportBar payload={exportPayload} filename={`laporan-kas-bank-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        {summary && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Saldo Awal", value: summary.saldo_awal, icon: Banknote },
              { label: "Total Masuk", value: summary.total_masuk, icon: TrendingUp },
              { label: "Total Keluar", value: summary.total_keluar, icon: TrendingDown },
              { label: "Saldo Akhir", value: summary.saldo_akhir, icon: Banknote },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-sky-600 text-white">
                    <Icon className="h-3 w-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-xs font-bold tabular-nums">{formatSaldoAmount(item.value)}</p>
                </div>
              );
            })}
          </div>
        )}
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Rekening</TH>
                <TH>Nama</TH>
                <TH className="text-right">Saldo Awal</TH>
                <TH className="text-right">Masuk</TH>
                <TH className="text-right">Keluar</TH>
                <TH className="text-right">Saldo Akhir</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-xs">{row.account_no}</TD>
                  <TD className="text-xs">{row.account_name}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatSaldoAmount(row.saldo_awal)}</TD>
                  <TD className="text-right tabular-nums text-xs text-emerald-700">{formatSaldoAmount(row.masuk)}</TD>
                  <TD className="text-right tabular-nums text-xs text-rose-700">{formatSaldoAmount(row.keluar)}</TD>
                  <TD className="text-right tabular-nums text-xs font-semibold">{formatSaldoAmount(row.saldo_akhir)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}

function ReportSaldoBulananContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<
    { bulan_label: string; saldo_awal: number; masuk: number; keluar: number; saldo_akhir: number }[]
  >([]);
  const [summary, setSummary] = useState<{ total_masuk: number; total_keluar: number; saldo_akhir_tahun: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRekapBulanan(budgetYearId);
      setRows(result.rows);
      setSummary(result.summary);
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
      title: "Laporan Saldo Bulanan Kas & Bank",
      subtitle: `Tahun ${budgetYear.tahun}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "bulan_label", label: "Bulan" },
        { key: "saldo_awal", label: "Saldo Awal", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "masuk", label: "Masuk", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "keluar", label: "Keluar", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
        { key: "saldo_akhir", label: "Saldo Akhir", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ReportExportBar payload={exportPayload} filename={`laporan-saldo-bulanan-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        {summary && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total Masuk", value: summary.total_masuk },
              { label: "Total Keluar", value: summary.total_keluar },
              { label: "Saldo Akhir Tahun", value: summary.saldo_akhir_tahun },
            ].map((item) => (
              <div key={item.label} className={cardClassName({ variant: "default", className: "!p-2.5" })}>
                <p className="text-[10px] text-slate-500">{item.label}</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums">{formatSaldoAmount(item.value)}</p>
              </div>
            ))}
          </div>
        )}
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Bulan</TH>
                <TH className="text-right">Saldo Awal</TH>
                <TH className="text-right">Masuk</TH>
                <TH className="text-right">Keluar</TH>
                <TH className="text-right">Saldo Akhir</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.bulan_label}>
                  <TD className="text-xs font-medium">{row.bulan_label}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatSaldoAmount(row.saldo_awal)}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatSaldoAmount(row.masuk)}</TD>
                  <TD className="text-right tabular-nums text-xs">{formatSaldoAmount(row.keluar)}</TD>
                  <TD className="text-right tabular-nums text-xs font-semibold">{formatSaldoAmount(row.saldo_akhir)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </ReportDataShell>
    </div>
  );
}

function ReportHutangContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [jenis, setJenis] = useState("");
  const [jenisOptions, setJenisOptions] = useState<{ value: string; label: string }[]>([]);
  const [rows, setRows] = useState<
    { account_no: string; account_name: string; jumlah: number; saldo: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchHpMeta(budgetYearId).then((meta) => {
      setJenisOptions([
        { value: "", label: "Semua jenis" },
        ...meta.hutang_jenis_options.map((o) => ({ value: o.value, label: o.label })),
      ]);
    });
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHutangPerAkun(budgetYearId, { jenis: jenis || undefined });
      setRows(result.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, jenis]);

  useEffect(() => {
    if (!yearLoading && budgetYearId) void load();
  }, [yearLoading, budgetYearId, load]);

  const exportPayload = useMemo(() => {
    if (!budgetYear) return null;
    return {
      title: "Laporan Hutang",
      subtitle: `Tahun ${budgetYear.tahun}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "account_no", label: "No. Akun" },
        { key: "account_name", label: "Nama Akun" },
        { key: "jumlah", label: "Jumlah Transaksi", align: "right" as const },
        { key: "saldo", label: "Saldo Hutang", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <ToolbarFilter label="Jenis hutang" value={jenis} onChange={setJenis}>
          {jenisOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </ToolbarFilter>
        <ReportExportBar payload={exportPayload} filename={`laporan-hutang-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>No. Akun</TH>
                <TH>Nama Akun</TH>
                <TH className="text-right">Jumlah</TH>
                <TH className="text-right">Saldo Hutang</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.account_no}>
                  <TD className="font-mono text-xs">{row.account_no}</TD>
                  <TD className="text-xs">{row.account_name}</TD>
                  <TD className="text-right tabular-nums text-xs">{row.jumlah}</TD>
                  <TD className="text-right tabular-nums text-xs font-semibold text-rose-700">
                    {formatHpAmount(row.saldo)}
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

function ReportPiutangContent() {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();
  const [rows, setRows] = useState<
    { no_jurnal: string; tanggal: string | null; keterangan: string; account_name: string; amount: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!budgetYearId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPiutangDaftar(budgetYearId, { per_page: 100 });
      setRows(
        result.rows.map((r) => ({
          no_jurnal: r.no_jurnal,
          tanggal: r.tanggal,
          keterangan: r.keterangan,
          account_name: r.account_name,
          amount: r.amount,
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
      title: "Laporan Piutang",
      subtitle: `Tahun ${budgetYear.tahun}`,
      generatedAt: new Date().toLocaleString("id-ID"),
      columns: [
        { key: "no_jurnal", label: "No. Jurnal" },
        { key: "tanggal", label: "Tanggal", format: (v: unknown) => formatHpDate(v as string | null) },
        { key: "keterangan", label: "Keterangan" },
        { key: "account_name", label: "Akun" },
        { key: "amount", label: "Outstanding", align: "right" as const, format: (v: unknown) => formatReportAmount(Number(v)) },
      ],
      rows: rows as unknown as Record<string, unknown>[],
    };
  }, [rows, budgetYear]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ReportExportBar payload={exportPayload} filename={`laporan-piutang-${budgetYear?.tahun}`} />
      </div>
      <ReportDataShell loading={loading || yearLoading} error={error} empty={rows.length === 0}>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>No. Jurnal</TH>
                <TH>Tanggal</TH>
                <TH>Keterangan</TH>
                <TH>Akun</TH>
                <TH className="text-right">Outstanding</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, i) => (
                <TR key={`${row.no_jurnal}-${i}`}>
                  <TD className="font-mono text-xs">{row.no_jurnal}</TD>
                  <TD className="text-xs">{formatHpDate(row.tanggal)}</TD>
                  <TD className="max-w-[180px] truncate text-xs">{row.keterangan}</TD>
                  <TD className="text-xs">{row.account_name}</TD>
                  <TD className="text-right tabular-nums text-xs font-semibold text-emerald-700">
                    {formatHpAmount(row.amount)}
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
