"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
import { fetchFinanceTaxList, fetchFinanceTaxMeta } from "@/services/financeTaxService";
import {
  formatTaxAmount,
  formatTaxDate,
  TAX_PER_PAGE_OPTIONS,
  type FinanceTaxMeta,
  type TaxStageId,
} from "@/types/finance-tax";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

function amt(v: number) {
  return (
    <span className="font-medium tabular-nums text-slate-800">
      Rp {formatTaxAmount(v)}
    </span>
  );
}

type TaxTabCrudProps = {
  stage: TaxStageId;
  title: string;
  description: string;
};

export function TaxTabCrud({ stage, title, description }: TaxTabCrudProps) {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [meta, setMeta] = useState<FinanceTaxMeta | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isRekap = stage === "rekap-bulanan";

  useEffect(() => {
    if (!budgetYearId) return;
    void fetchFinanceTaxMeta(budgetYearId).then(setMeta).catch(() => setMeta(null));
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
      const result = await fetchFinanceTaxList({
        budget_year_id: budgetYearId,
        stage,
        bulan: bulan ? Number(bulan) : undefined,
        search: search || undefined,
        page: isRekap ? 1 : page,
        per_page: isRekap ? 12 : perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
      setTotal(result.meta.total);
      setFrom(result.meta.from);
      setTo(result.meta.to);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data pajak.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, stage, bulan, search, page, perPage, isRekap]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [budgetYearId, stage, bulan, search, perPage]);

  const kpiItems = useMemo(() => {
    if (stage === "rekap-bulanan") {
      return [
        { label: "PPN Tagihan (thn)", value: `Rp ${formatTaxAmount(summary.ppn_tagihan ?? 0)}`, tone: "plan" as const },
        { label: "PPN Faktur (thn)", value: `Rp ${formatTaxAmount(summary.ppn_faktur ?? 0)}`, tone: "default" as const },
        { label: "Setoran (thn)", value: `Rp ${formatTaxAmount(summary.setoran_pajak ?? 0)}`, tone: "actual" as const },
      ];
    }
    const jumlah = summary.jumlah ?? total;
    const ppn = summary.ppn ?? summary.ppn_tagihan ?? 0;
    return [
      { label: "Jumlah", value: String(jumlah), tone: "default" as const },
      { label: "Total PPN", value: `Rp ${formatTaxAmount(ppn)}`, tone: "plan" as const },
    ];
  }, [summary, stage, total]);

  if (!budgetYearId) {
    return (
      <EmptyState title="Pilih tahun anggaran" description={`${title} membutuhkan tahun anggaran.`} className="mt-0" />
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        <p className="mt-1 text-[10px] text-slate-400">
          Tahun {budgetYear?.tahun ?? meta?.tahun ?? "—"} · SIMARTDB / FINANCE
        </p>
      </div>

      <ToolbarShell>
        {!isRekap && (
          <ToolbarSearch value={search} onChange={setSearch} placeholder="Cari nomor, supplier, AJU..." />
        )}
        {!isRekap && (
          <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
            <option value="">Semua bulan</option>
            {meta?.bulan_options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </ToolbarFilter>
        )}
        <ToolbarKpi items={kpiItems} />
      </ToolbarShell>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="Tidak ada data" description="Belum ada data pajak untuk filter ini." className="mt-0" />
      ) : (
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                {stage === "rekap-bulanan" && (
                  <>
                    <TH>Bulan</TH>
                    <TH className="text-right">PPN Tagihan</TH>
                    <TH className="text-right">PPh22 Tagihan</TH>
                    <TH className="text-right">PPh23 Tagihan</TH>
                    <TH className="text-right">PPN Faktur</TH>
                    <TH className="text-right">PPh22 Faktur</TH>
                    <TH className="text-right">PPh23 Faktur</TH>
                    <TH className="text-right">Setoran</TH>
                  </>
                )}
                {(stage === "antrian-verifikasi" || stage === "detail-perhitungan") && (
                  <>
                    <TH>No. Beli</TH>
                    <TH>No. Faktur</TH>
                    <TH>Tukar Faktur</TH>
                    <TH>Tgl</TH>
                    <TH>Supplier</TH>
                    <TH className="text-right">DPP</TH>
                    <TH className="text-right">PPN</TH>
                    <TH className="text-center">Tarif</TH>
                    <TH className="text-right">PPh22</TH>
                    <TH className="text-right">PPh23</TH>
                    <TH className="text-right">Total Pajak</TH>
                    {stage === "detail-perhitungan" && <TH>Status</TH>}
                  </>
                )}
                {stage === "tagihan-pembelian" && (
                  <>
                    <TH>No. Beli</TH>
                    <TH>Tgl</TH>
                    <TH>Supplier</TH>
                    <TH className="text-right">DPP</TH>
                    <TH className="text-right">PPN</TH>
                    <TH className="text-center">Tarif</TH>
                    <TH className="text-right">PPh22</TH>
                    <TH className="text-right">PPh23</TH>
                    <TH className="text-right">Total</TH>
                  </>
                )}
                {stage === "tukar-faktur" && (
                  <>
                    <TH>No. Tukar Faktur</TH>
                    <TH>Tgl</TH>
                    <TH>Supplier</TH>
                    <TH className="text-center">Detail</TH>
                    <TH className="text-center">Blm Verif</TH>
                    <TH className="text-right">DPP</TH>
                    <TH className="text-right">PPN</TH>
                    <TH className="text-right">PPh23</TH>
                    <TH className="text-right">Total Bayar</TH>
                  </>
                )}
                {stage === "setoran-pajak" && (
                  <>
                    <TH>No. BKU</TH>
                    <TH>Tgl</TH>
                    <TH>Jenis</TH>
                    <TH>Keterangan</TH>
                    <TH className="text-right">Nilai</TH>
                    <TH>Jurnal</TH>
                  </>
                )}
                {stage === "pajak-pengajuan" && (
                  <>
                    <TH>No. AJU</TH>
                    <TH>Tgl</TH>
                    <TH>Uraian</TH>
                    <TH>Status</TH>
                    <TH className="text-right">DPP</TH>
                    <TH className="text-right">PPN</TH>
                    <TH className="text-center">Tarif</TH>
                    <TH className="text-right">Total</TH>
                  </>
                )}
              </TR>
            </THead>
            <TBody>
              {stage === "rekap-bulanan" &&
                rows.map((r) => (
                  <TR key={String(r.bulan)}>
                    <TD className="font-medium text-slate-800">{String(r.bulan_label)}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.ppn_tagihan))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph22_tagihan))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph23_tagihan))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.ppn_faktur))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph22_faktur))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph23_faktur))}</TD>
                    <TD className="text-right font-medium tabular-nums">{formatTaxAmount(Number(r.setoran_pajak))}</TD>
                  </TR>
                ))}

              {(stage === "antrian-verifikasi" || stage === "detail-perhitungan") &&
                rows.map((r, i) => (
                  <TR key={`${r.no_beli}-${i}`}>
                    <TD className="font-mono text-[10px]">{String(r.no_beli)}</TD>
                    <TD className="font-mono text-[10px] text-slate-600">{String(r.no_faktur)}</TD>
                    <TD className="font-mono text-[10px] text-violet-800">{String(r.no_tukar_faktur)}</TD>
                    <TD className="text-[11px]">{formatTaxDate(r.tgl as string | null)}</TD>
                    <TD className="text-[11px] max-w-[8rem] truncate">{String(r.supplier)}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.dpp))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.ppn))}</TD>
                    <TD className="text-center text-[10px] tabular-nums">{Number(r.tarif_ppn)}%</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph22))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph23))}</TD>
                    <TD className="text-right">{amt(Number(r.total_pajak))}</TD>
                    {stage === "detail-perhitungan" && (
                      <TD>
                        <Badge variant={r.status_verifikasi === "Sudah" ? "success" : "warning"} className="text-[10px]">
                          {String(r.status_verifikasi)}
                        </Badge>
                      </TD>
                    )}
                  </TR>
                ))}

              {stage === "tagihan-pembelian" &&
                rows.map((r, i) => (
                  <TR key={`${r.no_beli}-${i}`}>
                    <TD className="font-mono text-[10px]">{String(r.no_beli)}</TD>
                    <TD className="text-[11px]">{formatTaxDate(r.tgl as string | null)}</TD>
                    <TD className="text-[11px]">{String(r.supplier)}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.dpp))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.ppn))}</TD>
                    <TD className="text-center text-[10px]">{Number(r.tarif_ppn)}%</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph22))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph23))}</TD>
                    <TD className="text-right">{amt(Number(r.total))}</TD>
                  </TR>
                ))}

              {stage === "tukar-faktur" &&
                rows.map((r) => (
                  <TR key={String(r.no_tukar_faktur)}>
                    <TD className="font-mono text-[10px] font-semibold text-violet-800">{String(r.no_tukar_faktur)}</TD>
                    <TD className="text-[11px]">{formatTaxDate(r.tgl as string | null)}</TD>
                    <TD className="text-[11px]">{String(r.supplier)}</TD>
                    <TD className="text-center"><Badge variant="info" className="text-[10px]">{Number(r.jumlah_detail)}</Badge></TD>
                    <TD className="text-center">
                      <Badge variant={Number(r.belum_verifikasi) > 0 ? "danger" : "success"} className="text-[10px]">
                        {Number(r.belum_verifikasi)}
                      </Badge>
                    </TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.dpp))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.ppn))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.pph23))}</TD>
                    <TD className="text-right">{amt(Number(r.total_bayar))}</TD>
                  </TR>
                ))}

              {stage === "setoran-pajak" &&
                rows.map((r) => (
                  <TR key={String(r.no_bku)}>
                    <TD className="font-mono text-[10px] text-emerald-800">{String(r.no_bku)}</TD>
                    <TD className="text-[11px]">{formatTaxDate(r.tgl as string | null)}</TD>
                    <TD><Badge variant="info" className="text-[10px]">{String(r.jenis_pajak)}</Badge></TD>
                    <TD className="max-w-[12rem] truncate text-[11px] text-slate-600">{String(r.keterangan)}</TD>
                    <TD className="text-right text-emerald-800">{amt(Number(r.nilai))}</TD>
                    <TD className="font-mono text-[10px] text-slate-500">{String(r.no_jurnal ?? "—")}</TD>
                  </TR>
                ))}

              {stage === "pajak-pengajuan" &&
                rows.map((r) => (
                  <TR key={String(r.no_aju)}>
                    <TD className="font-mono text-[10px]">{String(r.no_aju)}</TD>
                    <TD className="text-[11px]">{formatTaxDate(r.tgl as string | null)}</TD>
                    <TD className="max-w-[10rem] truncate text-[11px]">{String(r.uraian)}</TD>
                    <TD><Badge variant="draft" className="text-[10px]">{String(r.status)}</Badge></TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.dpp))}</TD>
                    <TD className="text-right text-[11px] tabular-nums">{formatTaxAmount(Number(r.ppn))}</TD>
                    <TD className="text-center text-[10px]">{Number(r.tarif_ppn)}%</TD>
                    <TD className="text-right">{amt(Number(r.total))}</TD>
                  </TR>
                ))}
            </TBody>
          </Table>
        </div>
      )}

      {!loading && !isRekap && total > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-500">Menampilkan {from}–{to} dari {total}</p>
          <div className="flex items-center gap-2">
            <Select value={String(perPage)} onChange={(e) => setPerPage(Number(e.target.value))} className="h-8 w-20 text-xs">
              {TAX_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs">{page}/{lastPage}</span>
            <button type="button" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-white disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
