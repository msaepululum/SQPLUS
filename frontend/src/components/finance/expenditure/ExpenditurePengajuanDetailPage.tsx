"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, cardClassName } from "@/components/ui/Card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { PageFrame } from "@/components/layout/PageFrame";
import { ExpenditureAjuTrackingPanel } from "@/components/finance/expenditure/ExpenditureAjuTracking";
import { ExpenditureProgressBelanjaShortcut } from "@/components/finance/expenditure/ExpenditureProgressBelanjaShortcut";
import {
  expenditureStageBadgeClass,
  type ExpenditureProcessStageId,
} from "@/constants/expenditure-process";
import { fetchExpenditureAjuDetail } from "@/services/expenditureAjuService";
import {
  formatExpenditureAjuAmount,
  formatExpenditureAjuDate,
  type ExpenditureAjuDetail,
} from "@/types/expenditure-aju";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";

const LIST_HREF = "/finance/expenditure/proses-belanja?tab=pengajuan";

type DetailTabId = "detail" | "riwayat";

const DETAIL_TABS: { id: DetailTabId; label: string }[] = [
  { id: "detail", label: "Data Detail" },
  { id: "riwayat", label: "Riwayat Persetujuan" },
];

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs text-slate-800">{value}</p>
    </div>
  );
}

function stageBadgeVariant(
  stage: ExpenditureProcessStageId
): "success" | "warning" | "danger" | "info" | "draft" {
  if (stage === "pembayaran-berhasil" || stage === "disetujui") return "success";
  if (stage === "ditolak") return "danger";
  if (stage === "rencana-bayar" || stage === "menunggu-persetujuan") return "warning";
  if (stage === "diajukan" || stage === "negosiasi" || stage === "surat-pesanan") return "info";
  return "draft";
}

function DetailTabs({
  activeTab,
  onChange,
  riwayatCount,
}: {
  activeTab: DetailTabId;
  onChange: (tab: DetailTabId) => void;
  riwayatCount: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-slate-100 p-1 sq-scroll">
      <div className="flex min-w-max gap-0.5">
        {DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const countBadge = tab.id === "riwayat" && riwayatCount > 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:px-3.5 sm:text-[0.8125rem]",
                isActive
                  ? "bg-[#0d6e63] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-800"
              )}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
              {countBadge && (
                <span
                  className={cn(
                    "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums",
                    isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {riwayatCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ApprovalHistoryPanel({
  items,
}: {
  items: ExpenditureAjuDetail["approval_history"];
}) {
  if (items.length === 0) {
    return (
      <Card className="p-4 sm:p-5">
        <p className="text-xs text-slate-400">Belum ada riwayat persetujuan.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <p className="text-[10px] text-slate-500">Alur approval dari tabel aju_status</p>
      <div className="relative mt-3 space-y-0 pl-3">
        <div className="absolute bottom-1 left-[5px] top-1 w-px bg-slate-200" />
        {items.map((item) => (
          <div key={item.id} className="relative pb-2.5 pl-4">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-400 ring-1 ring-sky-200" />
            <div className="rounded-md border border-slate-100 bg-slate-50/60 px-2.5 py-2 text-[11px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700">{item.status_label}</span>
                  {item.flow_name && (
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
                      {item.flow_name}
                    </span>
                  )}
                </div>
                <span className="tabular-nums text-slate-400">
                  {formatDateTime(item.occurred_at)}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {item.actor_name}
                {item.jabatan ? ` · ${item.jabatan}` : ""}
                {item.no_absen ? ` (${item.no_absen})` : ""}
              </p>
              {item.catatan && (
                <p className="mt-1 text-[10px] italic text-slate-500">{item.catatan}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ExpenditurePengajuanDetailPage({ id }: { id: number }) {
  const [data, setData] = useState<ExpenditureAjuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTabId>("detail");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchExpenditureAjuDetail(id);
      setData(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail pengajuan.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <PageFrame title="Detail Pengajuan Belanja" breadcrumbs={[]}>
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </PageFrame>
    );
  }

  if (error || !data) {
    return (
      <PageFrame title="Detail Pengajuan Belanja" breadcrumbs={[]}>
        <div className="space-y-3">
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error ?? "Data tidak ditemukan."}
          </p>
          <Link
            href={LIST_HREF}
            className="inline-flex h-8 items-center rounded-md border border-sq-border bg-white px-3 text-xs text-sq-blue hover:bg-sq-soft"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Kembali ke daftar
          </Link>
        </div>
      </PageFrame>
    );
  }

  const stage = data.tahap_proses ?? data.status;

  return (
    <PageFrame
      title="Detail Pengajuan Belanja"
      description={data.no_pengajuan}
      breadcrumbs={[
        { label: "Finance", href: "/finance" },
        { label: "Proses Belanja", href: LIST_HREF },
        { label: data.no_pengajuan },
      ]}
      actions={
        <Link
          href={LIST_HREF}
          className="inline-flex h-8 items-center rounded-md border border-sq-border bg-white px-3 text-xs text-sq-blue hover:bg-sq-soft"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Kembali
        </Link>
      }
    >
      <div className="space-y-3">
        <ExpenditureProgressBelanjaShortcut context="proses-belanja" compact />
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-sm font-semibold text-slate-900">{data.no_pengajuan}</h2>
                <Badge
                  variant={stageBadgeVariant(stage)}
                  className={cn("text-[10px]", expenditureStageBadgeClass(stage))}
                >
                  {data.tahap_label}
                </Badge>
              </div>
              <p className="text-sm text-slate-700">{data.uraian}</p>
              {data.catatan && (
                <p className="text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Catatan:</span> {data.catatan}
                </p>
              )}
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-3 text-right sm:min-w-[18rem]">
              <div>
                <p className="text-[10px] text-slate-400">Sub Total</p>
                <p className="text-sm font-semibold tabular-nums text-slate-800">
                  Rp {formatExpenditureAjuAmount(data.sub_total)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Pajak</p>
                <p className="text-sm font-semibold tabular-nums text-slate-800">
                  Rp {formatExpenditureAjuAmount(data.pajak)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Total</p>
                <p className="text-sm font-bold tabular-nums text-slate-900">
                  Rp {formatExpenditureAjuAmount(data.total)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <DetailTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          riwayatCount={data.approval_history.length}
        />

        {activeTab === "detail" ? (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-slate-800">Informasi Pengajuan</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <InfoItem label="Tanggal" value={formatExpenditureAjuDate(data.tanggal)} />
              <InfoItem label="Tahun Anggaran" value={data.tahun} />
              <InfoItem label="Unit" value={data.unit} />
              <InfoItem label="Jenis Belanja" value={data.jenis_belanja} />
              <InfoItem
                label="Kode Rekening (KSRO)"
                value={
                  data.ksro_kode ? (
                    <>
                      <span className="font-mono">{data.ksro_kode}</span>
                      {data.ksro_nama && (
                        <span className="mt-0.5 block text-[11px] text-slate-500">{data.ksro_nama}</span>
                      )}
                    </>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoItem label="Pembuat" value={`${data.created_by_name} (${data.created_by})`} />
              <InfoItem label="Dibuat" value={formatDateTime(data.created_at)} />
              <InfoItem label="Diperbarui" value={formatDateTime(data.updated_at)} />
              {data.no_nego && <InfoItem label="No. Negosiasi" value={data.no_nego} />}
              {data.no_sppd && <InfoItem label="No. SPPD" value={data.no_sppd} />}
              {data.no_sppu && <InfoItem label="No. SPPU" value={data.no_sppu} />}
              {data.file_kap && <InfoItem label="File KAP" value={data.file_kap} />}
            </div>
          </Card>

          <ExpenditureAjuTrackingPanel steps={data.tracking} noPengajuan={data.no_pengajuan} />
        </div>

        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0", tableGridShellClassName),
          })}
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <h3 className="text-xs font-semibold text-slate-800">Rincian Belanja</h3>
            <p className="text-[10px] text-slate-500">Komponen dari tabel aju_detail</p>
          </div>
          {data.rincian.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-slate-400">
              Belum ada rincian komponen belanja.
            </p>
          ) : (
            <Table embedded>
              <THead>
                <TR>
                  <TH className="w-8">#</TH>
                  <TH>Komponen</TH>
                  <TH>Jenis</TH>
                  <TH>Spesifikasi</TH>
                  <TH className="text-right">Vol</TH>
                  <TH>Satuan</TH>
                  <TH className="text-right">Harga Satuan</TH>
                  <TH className="text-right">Sub Total</TH>
                  <TH className="text-right">Pajak</TH>
                  <TH className="text-right">Total</TH>
                </TR>
              </THead>
              <TBody>
                {data.rincian.map((item, index) => (
                  <TR key={item.id}>
                    <TD className="text-[10px] text-slate-400">{index + 1}</TD>
                    <TD className="min-w-[8rem] text-[11px]">
                      <span className="block font-medium text-slate-800">{item.nama_komponen}</span>
                      {item.merk && (
                        <span className="text-[10px] text-slate-400">
                          {item.merk}
                          {item.tipe ? ` · ${item.tipe}` : ""}
                        </span>
                      )}
                    </TD>
                    <TD className="text-[11px]">{item.jenis}</TD>
                    <TD className="max-w-[12rem] text-[11px] text-slate-600">
                      <span className="block truncate" title={item.spesifikasi}>
                        {item.spesifikasi || "—"}
                      </span>
                    </TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      {item.volume_nego ?? item.volume}
                    </TD>
                    <TD className="text-[11px]">{item.satuan}</TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      Rp {formatExpenditureAjuAmount(item.harga_satuan)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      Rp {formatExpenditureAjuAmount(item.sub_total)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px]">
                      Rp {formatExpenditureAjuAmount(item.pajak)}
                    </TD>
                    <TD className="text-right tabular-nums text-[11px] font-medium">
                      Rp {formatExpenditureAjuAmount(item.total)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          {data.rincian.length > 0 && (
            <div className="flex justify-end gap-6 border-t border-slate-100 px-3 py-2 text-[11px]">
              <span className="text-slate-500">
                Sub Total:{" "}
                <strong className="tabular-nums text-slate-800">
                  Rp {formatExpenditureAjuAmount(data.sub_total)}
                </strong>
              </span>
              <span className="text-slate-500">
                Pajak:{" "}
                <strong className="tabular-nums text-slate-800">
                  Rp {formatExpenditureAjuAmount(data.pajak)}
                </strong>
              </span>
              <span className="text-slate-700">
                Total:{" "}
                <strong className="tabular-nums text-slate-900">
                  Rp {formatExpenditureAjuAmount(data.total)}
                </strong>
              </span>
            </div>
          )}
        </div>
          </>
        ) : (
          <ApprovalHistoryPanel items={data.approval_history} />
        )}
      </div>
    </PageFrame>
  );
}
