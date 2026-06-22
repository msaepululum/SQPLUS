"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  fetchPaymentWorkflowList,
  fetchPaymentWorkflowMeta,
} from "@/services/paymentWorkflowService";
import {
  formatPaymentAmount,
  formatPaymentDate,
  PAYMENT_PER_PAGE_OPTIONS,
  type PaymentSelesaiRow,
  type PaymentTagihanRow,
  type PaymentTukarFakturRow,
  type PaymentWorkflowMeta,
  type PaymentWorkflowStageId,
} from "@/types/payment-workflow-data";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

type PaymentWorkflowTabCrudProps = {
  stage: PaymentWorkflowStageId;
  title: string;
  description: string;
};

function amountCell(value: number, className?: string) {
  return (
    <span className={cn("font-medium tabular-nums text-slate-800", className)}>
      Rp {formatPaymentAmount(value)}
    </span>
  );
}

export function PaymentWorkflowTabCrud({ stage, title, description }: PaymentWorkflowTabCrudProps) {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<PaymentWorkflowMeta | null>(null);
  const [rows, setRows] = useState<
    (PaymentTagihanRow | PaymentTukarFakturRow | PaymentSelesaiRow)[]
  >([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchPaymentWorkflowMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
  }, [budgetYearId]);

  const load = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPaymentWorkflowList({
        budget_year_id: budgetYearId,
        stage,
        bulan: bulan ? Number(bulan) : undefined,
        search: search || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
      setTotal(result.meta.total);
      setFrom(result.meta.from);
      setTo(result.meta.to);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data pembayaran.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, stage, bulan, search, page, perPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, stage, bulan, search, perPage]);

  const kpiItems = useMemo(() => {
    const items = [
      {
        label: "Jumlah Data",
        value: String(summary.jumlah_tagihan ?? summary.jumlah_tukar_faktur ?? summary.jumlah_pembayaran ?? total),
        tone: "default" as const,
      },
      {
        label: "Total Nilai",
        value: `Rp ${formatPaymentAmount(summary.total_nilai ?? 0)}`,
        tone: "plan" as const,
      },
    ];
    return items;
  }, [summary, total]);

  if (!budgetYearId) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description={`${title} membutuhkan tahun anggaran aktif.`}
        className="mt-0"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        <p className="mt-1 text-[10px] text-slate-400">
          Sumber: SIMARTDB · Tahun {budgetYear?.tahun ?? meta?.tahun ?? "—"}
        </p>
      </div>

      <ToolbarShell>
        <ToolbarSearch
          value={search}
          onChange={setSearch}
          placeholder={
            stage === "belum-proses-tagihan"
              ? "Cari no beli, supplier, AJU..."
              : stage === "pembayaran-selesai"
                ? "Cari tukar faktur, BKU, supplier..."
                : "Cari no tukar faktur, supplier..."
          }
        />
        <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
          <option value="">Semua bulan</option>
          {meta?.bulan_options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </ToolbarFilter>
        <ToolbarKpi items={kpiItems} />
      </ToolbarShell>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada data"
          description={`Belum ada data pada tahap ini untuk filter yang dipilih.`}
          className="mt-0"
        />
      ) : (
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                {stage === "belum-proses-tagihan" && (
                  <>
                    <TH className="w-[8.5rem]">No. Beli</TH>
                    <TH className="w-[6.5rem]">Tgl Terima</TH>
                    <TH>Supplier</TH>
                    <TH>Kelompok</TH>
                    <TH className="min-w-[10rem]">Uraian / AJU</TH>
                    <TH className="text-right w-[7rem]">PPN</TH>
                    <TH className="text-right w-[7rem]">PPH23</TH>
                    <TH className="text-right w-[8rem]">Total</TH>
                    <TH className="w-[6.5rem]">Jatuh Tempo</TH>
                  </>
                )}
                {(stage === "permintaan-bayar" ||
                  stage === "rencana-bayar" ||
                  stage === "verifikasi-pajak") && (
                  <>
                    <TH className="w-[9rem]">No. Tukar Faktur</TH>
                    <TH className="w-[6.5rem]">Tgl</TH>
                    <TH>Supplier</TH>
                    <TH className="text-center w-[4rem]">Faktur</TH>
                    <TH className="text-center w-[4rem]">Rencana</TH>
                    {stage === "verifikasi-pajak" && (
                      <TH className="text-center w-[5rem]">Belum Pajak</TH>
                    )}
                    <TH className="text-right w-[7rem]">DPP</TH>
                    <TH className="text-right w-[7rem]">PPH23</TH>
                    <TH className="text-right w-[8rem]">Total Bayar</TH>
                    <TH className="w-[6.5rem]">Rencana Bayar</TH>
                  </>
                )}
                {stage === "pembayaran-selesai" && (
                  <>
                    <TH className="w-[9rem]">No. Tukar Faktur</TH>
                    <TH className="w-[7rem]">No. BKU</TH>
                    <TH className="w-[6.5rem]">Tgl Bayar</TH>
                    <TH>Supplier</TH>
                    <TH className="w-[7rem]">No. Beli</TH>
                    <TH className="min-w-[9rem]">Uraian</TH>
                    <TH className="text-right w-[8rem]">Nilai Bayar</TH>
                    <TH className="w-[6rem]">Jurnal</TH>
                  </>
                )}
              </TR>
            </THead>
            <TBody>
              {stage === "belum-proses-tagihan" &&
                (rows as PaymentTagihanRow[]).map((row) => (
                  <TR key={row.no_beli}>
                    <TD className="font-mono text-[10px] text-sky-800">{row.no_beli}</TD>
                    <TD className="text-[11px]">{formatPaymentDate(row.tgl_beli)}</TD>
                    <TD>
                      <p className="text-[11px] font-medium text-slate-800">{row.nama_supplier}</p>
                      <p className="text-[10px] text-slate-400">{row.kode_supplier}</p>
                    </TD>
                    <TD className="text-[11px] text-slate-600">{row.kelompok_belanja || "—"}</TD>
                    <TD>
                      <p className="line-clamp-2 text-[11px] text-slate-700">
                        {row.uraian || row.no_dokumen || "—"}
                      </p>
                      {row.no_aju && (
                        <p className="mt-0.5 font-mono text-[10px] text-slate-400">{row.no_aju}</p>
                      )}
                    </TD>
                    <TD className="text-right text-[11px] tabular-nums">
                      {formatPaymentAmount(row.ppn)}
                    </TD>
                    <TD className="text-right text-[11px] tabular-nums">
                      {formatPaymentAmount(row.pph23)}
                    </TD>
                    <TD className="text-right">{amountCell(row.total)}</TD>
                    <TD className="text-[11px]">{formatPaymentDate(row.jatuh_tempo)}</TD>
                  </TR>
                ))}

              {(stage === "permintaan-bayar" ||
                stage === "rencana-bayar" ||
                stage === "verifikasi-pajak") &&
                (rows as PaymentTukarFakturRow[]).map((row) => (
                  <TR key={row.no_tukar_faktur}>
                    <TD className="font-mono text-[10px] font-semibold text-sky-800">
                      {row.no_tukar_faktur}
                    </TD>
                    <TD className="text-[11px]">{formatPaymentDate(row.tgl_tukar_faktur)}</TD>
                    <TD>
                      <p className="text-[11px] font-medium text-slate-800">{row.nama_supplier}</p>
                      <p className="text-[10px] text-slate-400">{row.kode_supplier}</p>
                    </TD>
                    <TD className="text-center">
                      <Badge variant="info" className="text-[10px]">
                        {row.jumlah_faktur}
                      </Badge>
                    </TD>
                    <TD className="text-center">
                      <Badge variant="warning" className="text-[10px]">
                        {row.jumlah_rencana}
                      </Badge>
                    </TD>
                    {stage === "verifikasi-pajak" && (
                      <TD className="text-center">
                        <Badge
                          variant={row.jumlah_belum_pajak > 0 ? "danger" : "success"}
                          className="text-[10px]"
                        >
                          {row.jumlah_belum_pajak}
                        </Badge>
                      </TD>
                    )}
                    <TD className="text-right text-[11px] tabular-nums">
                      {formatPaymentAmount(row.total_dpp)}
                    </TD>
                    <TD className="text-right text-[11px] tabular-nums">
                      {formatPaymentAmount(row.total_pph23)}
                    </TD>
                    <TD className="text-right">{amountCell(row.total_bayar)}</TD>
                    <TD className="text-[11px]">{formatPaymentDate(row.tgl_rencana_bayar)}</TD>
                  </TR>
                ))}

              {stage === "pembayaran-selesai" &&
                (rows as PaymentSelesaiRow[]).map((row) => (
                  <TR key={`${row.no_tukar_faktur}-${row.no_bku}-${row.no_beli}`}>
                    <TD className="font-mono text-[10px] text-sky-800">{row.no_tukar_faktur}</TD>
                    <TD className="font-mono text-[10px] text-emerald-800">{row.no_bku}</TD>
                    <TD className="text-[11px]">{formatPaymentDate(row.tgl_bayar)}</TD>
                    <TD className="text-[11px] font-medium text-slate-800">{row.nama_supplier}</TD>
                    <TD className="font-mono text-[10px] text-slate-600">{row.no_beli}</TD>
                    <TD>
                      <p className="line-clamp-2 text-[11px] text-slate-700">
                        {row.uraian || row.keterangan || "—"}
                      </p>
                      {row.kelompok_belanja && (
                        <p className="text-[10px] text-slate-400">{row.kelompok_belanja}</p>
                      )}
                    </TD>
                    <TD className="text-right">{amountCell(row.nilai_keluar, "text-emerald-800")}</TD>
                    <TD className="font-mono text-[10px] text-slate-500">
                      {row.no_jurnal?.trim() || "—"}
                    </TD>
                  </TR>
                ))}
            </TBody>
          </Table>
        </div>
      )}

      {!loading && total > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">
            Menampilkan {from}–{to} dari {total} data
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(perPage)}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="h-8 w-20 text-xs"
            >
              {PAYMENT_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[4rem] text-center text-xs text-slate-600">
                {page} / {lastPage}
              </span>
              <button
                type="button"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
