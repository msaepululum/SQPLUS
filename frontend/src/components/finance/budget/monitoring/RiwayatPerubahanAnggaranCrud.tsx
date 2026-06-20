"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { BudgetHistoryTimeline } from "@/components/finance/budget/perubahan/BudgetHistoryTimeline";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  fetchBudgetRiwayatEvents,
  fetchBudgetRiwayatPerubahan,
} from "@/services/budgetRiwayatPerubahanService";
import {
  formatRiwayatAmount,
  formatRiwayatDate,
  RIWAYAT_JENIS_OPTIONS,
  RIWAYAT_STATUS_OPTIONS,
  type BudgetRiwayatEvent,
  type BudgetRiwayatRow,
  type BudgetRiwayatSummary,
  type RiwayatJenis,
} from "@/types/budget-riwayat-perubahan";
import { cn } from "@/lib/cn";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { ChevronLeft, ChevronRight, History, Loader2, X } from "lucide-react";

function jenisBadgeVariant(jenis: RiwayatJenis): "info" | "warning" | "danger" {
  if (jenis === "revisi") return "info";
  if (jenis === "pergeseran") return "warning";
  return "danger";
}

function statusBadgeVariant(status: string): "success" | "warning" | "danger" | "info" | "draft" {
  if (status === "applied" || status === "O") return "success";
  if (status === "rejected") return "danger";
  if (status === "draft") return "draft";
  if (status === "in_review" || status === "P" || status === "T") return "info";
  return "warning";
}

export function RiwayatPerubahanAnggaranCrud() {
  const { budgetYearId, budgetYear } = useBudgetYearScope();
  const [rows, setRows] = useState<BudgetRiwayatRow[]>([]);
  const [summary, setSummary] = useState<BudgetRiwayatSummary | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BudgetRiwayatRow | null>(null);
  const [events, setEvents] = useState<BudgetRiwayatEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setSummary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchBudgetRiwayatPerubahan({
        budget_year_id: budgetYearId,
        jenis: filterJenis || undefined,
        status: filterStatus || undefined,
        search: search || undefined,
        page,
        per_page: 50,
      });
      setRows(result.rows);
      setSummary(result.summary);
      setLastPage(result.meta.last_page);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat riwayat perubahan.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, filterJenis, filterStatus, search, page]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [budgetYearId, filterJenis, filterStatus, search]);

  const openDetail = async (row: BudgetRiwayatRow) => {
    setSelected(row);
    setEventsLoading(true);
    setEvents([]);
    try {
      const data = await fetchBudgetRiwayatEvents(row.jenis, row.ref_id);
      setEvents(data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat detail riwayat.",
      });
    } finally {
      setEventsLoading(false);
    }
  };

  const kpiItems = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Total", value: String(summary.total), tone: "muted" as const },
      { label: "Revisi", value: String(summary.revisi), tone: "default" as const },
      { label: "Pergeseran", value: String(summary.pergeseran), tone: "actual" as const },
      { label: "Blokir", value: String(summary.blokir), tone: "plan" as const },
    ];
  }, [summary]);

  const hasActiveFilters = Boolean(filterJenis || filterStatus || search);

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell footer={summary ? <ToolbarKpi items={kpiItems} /> : undefined}>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
          <ToolbarFilter label="Jenis" value={filterJenis} onChange={setFilterJenis}>
            {RIWAYAT_JENIS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Status" value={filterStatus} onChange={setFilterStatus}>
            {RIWAYAT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarSearch value={search} onChange={setSearch} placeholder="No / unit / KSRO..." />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setFilterJenis("");
                setFilterStatus("");
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
            Audit trail · tahun {budgetYear.tahun}
          </p>
        )}
      </ToolbarShell>

      {message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {message.text}
        </div>
      )}

      {selected && (
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-b from-sky-50/60 to-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={jenisBadgeVariant(selected.jenis)} className="text-[10px]">
                  {selected.jenis_label}
                </Badge>
                <span className="font-mono text-[10px] text-slate-400">
                  {selected.nomor ?? `#${selected.ref_id}`}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-800">{selected.ringkasan}</p>
              {selected.detail && (
                <p className="mt-0.5 text-[11px] text-slate-500">{selected.detail}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 border-t border-sky-100 pt-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Timeline
            </p>
            <BudgetHistoryTimeline rows={events} loading={eventsLoading} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat riwayat...
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description="Riwayat blokir, revisi, dan pergeseran akan muncul di sini."
          className="mt-0"
        />
      ) : (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0", tableGridShellClassName),
          })}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <h3 className="text-xs font-semibold text-slate-800">Riwayat Perubahan Anggaran</h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[4.5rem] text-center tabular-nums">
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
          <Table embedded>
            <THead>
              <TR>
                <TH className="w-28">Waktu</TH>
                <TH>Jenis</TH>
                <TH>Ringkasan</TH>
                <TH className="text-right">Nilai</TH>
                <TH>Status</TH>
                <TH className="w-14 text-center">Detail</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR
                  key={row.key}
                  className={cn(selected?.key === row.key && "bg-sky-50/70")}
                >
                  <TD className="align-top text-[10px] tabular-nums text-slate-500">
                    {formatRiwayatDate(row.occurred_at)}
                  </TD>
                  <TD className="align-top">
                    <Badge variant={jenisBadgeVariant(row.jenis)} className="text-[10px]">
                      {row.jenis_label}
                    </Badge>
                  </TD>
                  <TD className="align-top text-[11px]">
                    <div className="font-mono text-[10px] text-slate-400">{row.nomor}</div>
                    <div className="font-medium text-slate-800">{row.ringkasan}</div>
                    {row.detail && (
                      <div className="line-clamp-1 text-[10px] italic text-slate-400">
                        {row.detail}
                      </div>
                    )}
                  </TD>
                  <TD className="text-right align-top tabular-nums text-[11px] font-medium text-[#0d6e63]">
                    {row.jenis === "revisi"
                      ? formatRiwayatAmount(row.nilai)
                      : row.jenis === "pergeseran"
                        ? formatRiwayatAmount(row.nilai).replace("+", "")
                        : String(row.nilai)}
                  </TD>
                  <TD className="align-top">
                    <Badge variant={statusBadgeVariant(row.status)} className="text-[10px]">
                      {row.status_label}
                    </Badge>
                  </TD>
                  <TD className="text-center align-top">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void openDetail(row)}
                      className="h-7 px-2 text-[10px]"
                    >
                      <History className="h-3 w-3" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
