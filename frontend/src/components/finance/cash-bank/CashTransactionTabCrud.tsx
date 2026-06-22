"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { cardClassName } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import { CashTransactionDetailDrawer } from "@/components/finance/cash-bank/CashTransactionDetailDrawer";
import { CashTransactionFormModal } from "@/components/finance/cash-bank/CashTransactionFormModal";
import {
  createCashTransaction,
  deleteCashTransaction,
  fetchCashTransactionDetail,
  fetchCashTransactionMeta,
  fetchCashTransactions,
  postCashTransaction,
  updateCashTransaction,
} from "@/services/cashTransactionService";
import type {
  CashTransactionDetail,
  CashTransactionFlowType,
  CashTransactionMeta,
  CashTransactionRow,
  CashTransactionSummary,
} from "@/types/cash-transaction";
import {
  CASH_TRANSACTION_PER_PAGE_OPTIONS,
  formatCashAmount,
  formatCashDate,
  flowTypeLabel,
  sourceLabel,
} from "@/types/cash-transaction";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";

type CashTransactionTabCrudProps = {
  flowType: CashTransactionFlowType;
  title: string;
};

function TableIconButton({
  label,
  onClick,
  children,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "success" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        tone === "success" && "text-emerald-600 hover:bg-emerald-50",
        tone === "danger" && "text-red-500 hover:bg-red-50",
        tone === "default" && "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      )}
    >
      {children}
    </button>
  );
}

export function CashTransactionTabCrud({
  flowType,
  title,
}: CashTransactionTabCrudProps) {
  const { budgetYearId, budgetYear, loading: yearLoading } = useBudgetYearScope();

  const [meta, setMeta] = useState<CashTransactionMeta | null>(null);
  const [rows, setRows] = useState<CashTransactionRow[]>([]);
  const [summary, setSummary] = useState<CashTransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [lastPage, setLastPage] = useState(1);

  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState("");
  const [kasAccount, setKasAccount] = useState("");
  const [source, setSource] = useState("all");
  const [tanggalFrom, setTanggalFrom] = useState("");
  const [tanggalTo, setTanggalTo] = useState("");

  const [detail, setDetail] = useState<CashTransactionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CashTransactionDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canCreateManual = flowType === "masuk" || flowType === "keluar";
  const createFlowType = flowType === "keluar" ? "keluar" : "masuk";

  const accountOptions = useMemo(() => {
    if (!meta) return [];
    return [...meta.kas_account_options, ...meta.bank_account_options];
  }, [meta]);

  const loadMeta = useCallback(async () => {
    if (!budgetYearId) return;
    try {
      const data = await fetchCashTransactionMeta(budgetYearId);
      setMeta(data);
    } catch {
      // meta optional
    }
  }, [budgetYearId]);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await fetchCashTransactions(budgetYearId, {
        flow_type: flowType,
        bulan: bulan ? Number(bulan) : undefined,
        kas_account_no: kasAccount || undefined,
        source: source as "all" | "acc2026" | "manual",
        search: search || undefined,
        tanggal_from: tanggalFrom || undefined,
        tanggal_to: tanggalTo || undefined,
        page,
        per_page: perPage,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat transaksi kas.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    budgetYearId,
    flowType,
    bulan,
    kasAccount,
    source,
    search,
    tanggalFrom,
    tanggalTo,
    page,
    perPage,
  ]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
  }, [flowType, bulan, kasAccount, source, search, tanggalFrom, tanggalTo, budgetYearId]);

  const openDetail = async (row: CashTransactionRow) => {
    if (!budgetYearId) return;
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await fetchCashTransactionDetail(budgetYearId, row.id);
      setDetail(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat detail jurnal.",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async (payload: Parameters<
    typeof createCashTransaction
  >[0] extends infer P ? Omit<P, "budget_year_id" | "flow_type"> : never) => {
    if (!budgetYearId) return;
    setSaving(true);
    try {
      await createCashTransaction({
        ...payload,
        budget_year_id: budgetYearId,
        flow_type: createFlowType,
      });
      setFormOpen(false);
      setMessage({ type: "success", text: "Transaksi kas manual berhasil disimpan." });
      await loadRows();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (
    payload: Parameters<typeof updateCashTransaction>[1]
  ) => {
    if (!editTarget || !editTarget.id.match(/^\d+$/)) return;
    setSaving(true);
    try {
      await updateCashTransaction(Number(editTarget.id), payload);
      setEditTarget(null);
      setFormOpen(false);
      setMessage({ type: "success", text: "Transaksi kas berhasil diperbarui." });
      await loadRows();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: CashTransactionRow) => {
    if (!row.editable || !row.id.match(/^\d+$/)) return;
    if (!window.confirm(`Hapus jurnal ${row.no_jurnal}?`)) return;
    try {
      await deleteCashTransaction(Number(row.id));
      setMessage({ type: "success", text: "Transaksi dihapus." });
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus.",
      });
    }
  };

  const handlePost = async (row: CashTransactionRow) => {
    if (!row.editable || !row.id.match(/^\d+$/)) return;
    if (!window.confirm(`Posting jurnal ${row.no_jurnal}?`)) return;
    try {
      await postCashTransaction(Number(row.id));
      setMessage({ type: "success", text: "Transaksi berhasil diposting." });
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal posting.",
      });
    }
  };

  if (yearLoading || (loading && rows.length === 0)) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat {title.toLowerCase()}...
      </div>
    );
  }

  if (!budgetYearId || !budgetYear) {
    return (
      <EmptyState
        title="Pilih tahun anggaran"
        description={`${title} dikunci per tahun anggaran.`}
        className="mt-3"
      />
    );
  }

  const kpiItems =
    flowType === "riwayat"
      ? [
          { label: "Total Masuk", value: formatCashAmount(summary?.total_masuk ?? 0), tone: "plan" as const },
          { label: "Total Keluar", value: formatCashAmount(summary?.total_keluar ?? 0), tone: "actual" as const },
          { label: "Neto", value: formatCashAmount(summary?.saldo_netto ?? 0), tone: "default" as const },
          { label: "Baris", value: String(summary?.jumlah_baris ?? 0), tone: "muted" as const },
        ]
      : [
          {
            label: flowType === "masuk" ? "Total Masuk" : "Total Keluar",
            value: formatCashAmount(
              flowType === "masuk" ? (summary?.total_masuk ?? 0) : (summary?.total_keluar ?? 0)
            ),
            tone: flowType === "masuk" ? ("plan" as const) : ("actual" as const),
          },
          { label: "Transaksi", value: String(summary?.jumlah_baris ?? 0), tone: "muted" as const },
          { label: "Sumber", value: "ACC2026 + Manual", tone: "default" as const },
        ];

  const totalRows = summary?.jumlah_baris ?? 0;
  const from = totalRows === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, totalRows);

  return (
    <div className="mt-2 space-y-2">
      {message && (
        <div
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-xs",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <ToolbarKpi items={kpiItems} />
        {canCreateManual && (
          <Button
            type="button"
            className="h-8 shrink-0 gap-1 px-2.5 text-[11px]"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Manual
          </Button>
        )}
      </div>

      <ToolbarShell footer={null} className="!shadow-none">
        <div className="flex w-full flex-wrap items-end gap-x-2 gap-y-2">
          <ToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder="No jurnal, keterangan..."
            className="min-w-[9rem] flex-1"
          />
          <ToolbarFilter label="Bulan" value={bulan} onChange={setBulan}>
            <option value="">Semua</option>
            {(meta?.bulan_options ?? []).map((b) => (
              <option key={b.value} value={String(b.value)}>
                {b.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Rekening" value={kasAccount} onChange={setKasAccount}>
            <option value="">Semua</option>
            {accountOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Sumber" value={source} onChange={setSource}>
            {(meta?.source_options ?? [
              { value: "all", label: "Semua" },
              { value: "acc2026", label: "ACC2026" },
              { value: "manual", label: "Manual" },
            ]).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </ToolbarFilter>
          <label className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[0.625rem] font-semibold uppercase tracking-wider text-slate-400">
              Periode
            </span>
            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={tanggalFrom}
                onChange={(e) => setTanggalFrom(e.target.value)}
                className="h-[30px] w-[7.5rem] px-1.5 text-[11px]"
              />
              <span className="text-[10px] text-slate-400">–</span>
              <Input
                type="date"
                value={tanggalTo}
                onChange={(e) => setTanggalTo(e.target.value)}
                className="h-[30px] w-[7.5rem] px-1.5 text-[11px]"
              />
            </div>
          </label>
        </div>
      </ToolbarShell>

      {rows.length === 0 && !loading ? (
        <EmptyState
          title={`Belum ada data ${title.toLowerCase()}`}
          description="Data dari ACC2026 (JURNAL_H/E) dan input manual SQ+."
          className="mt-0 py-8"
        />
      ) : (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0", tableGridShellClassName),
          })}
        >
          {loading && (
            <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Memperbarui...
            </div>
          )}
          <Table embedded>
            <THead>
              <TR>
                <TH className="whitespace-nowrap">Tgl</TH>
                <TH>No. Jurnal</TH>
                <TH>Jenis</TH>
                {flowType === "riwayat" && <TH>Arus</TH>}
                <TH className="min-w-[8rem]">Keterangan</TH>
                <TH className="min-w-[7rem]">Rekening</TH>
                <TH className="text-right">Nominal</TH>
                <TH>Sumber</TH>
                <TH>Status</TH>
                <TH className="w-[4.5rem] text-center">Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="whitespace-nowrap tabular-nums text-[11px]">
                    {formatCashDate(row.tanggal)}
                  </TD>
                  <TD>
                    <button
                      type="button"
                      className="max-w-[7rem] truncate font-mono text-[10px] font-medium text-blue-700 hover:underline"
                      title={row.no_jurnal}
                      onClick={() => void openDetail(row)}
                    >
                      {row.no_jurnal}
                    </button>
                  </TD>
                  <TD>
                    <span className="whitespace-nowrap text-[10px] text-slate-600">
                      {row.journal_type}
                    </span>
                  </TD>
                  {flowType === "riwayat" && (
                    <TD>
                      <Badge variant={row.flow_type === "masuk" ? "success" : "warning"}>
                        {flowTypeLabel(row.flow_type)}
                      </Badge>
                    </TD>
                  )}
                  <TD className="max-w-[10rem] truncate text-[11px]" title={row.keterangan}>
                    {row.keterangan || "—"}
                  </TD>
                  <TD className="max-w-[8rem] truncate text-[10px] text-slate-600" title={row.kas_account_name}>
                    {row.kas_account_name || row.kas_account_no || "—"}
                  </TD>
                  <TD
                    className={cn(
                      "whitespace-nowrap text-right font-mono text-[11px] font-semibold tabular-nums",
                      row.flow_type === "masuk" ? "text-emerald-700" : "text-amber-700"
                    )}
                  >
                    {formatCashAmount(row.amount)}
                  </TD>
                  <TD>
                    <Badge variant={row.source === "acc2026" ? "draft" : "info"}>
                      {sourceLabel(row.source)}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge variant={row.posted ? "success" : "warning"}>
                      {row.posted ? "Posted" : row.status === "draft" ? "Draft" : row.status}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center justify-center gap-0.5">
                      <TableIconButton label="Detail jurnal" onClick={() => void openDetail(row)}>
                        <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                      </TableIconButton>
                      {row.editable && (
                        <>
                          <TableIconButton
                            label="Posting jurnal"
                            tone="success"
                            onClick={() => void handlePost(row)}
                          >
                            <Send className="h-3.5 w-3.5" strokeWidth={2} />
                          </TableIconButton>
                          <TableIconButton
                            label="Hapus jurnal"
                            tone="danger"
                            onClick={() => void handleDelete(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          </TableIconButton>
                        </>
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              {totalRows > 0
                ? `Menampilkan ${from}–${to} dari ${totalRows} transaksi`
                : "Tidak ada data"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                >
                  {CASH_TRANSACTION_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} / halaman
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[4.5rem] text-center text-[11px] tabular-nums text-slate-600">
                  {page} / {lastPage}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CashTransactionDetailDrawer
        detail={detail}
        loading={detailLoading}
        onClose={() => setDetail(null)}
      />

      {canCreateManual && (
        <CashTransactionFormModal
          open={formOpen}
          flowType={createFlowType}
          budgetYearId={budgetYearId}
          kasAccounts={meta?.kas_account_options ?? []}
          bankAccounts={meta?.bank_account_options ?? []}
          initial={editTarget}
          saving={saving}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
          onSubmit={async (payload) => {
            if (editTarget && editTarget.id.match(/^\d+$/)) {
              await handleUpdate(payload);
            } else {
              await handleCreate(payload);
            }
          }}
        />
      )}
    </div>
  );
}
