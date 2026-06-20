"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  TableLegend,
  ToolbarFilter,
  ToolbarKpi,
  ToolbarSearch,
  ToolbarSegmented,
  ToolbarShell,
} from "@/components/finance/budget/BudgetToolbar";
import { useBudgetYearScope } from "@/components/finance/budget/BudgetYearScope";
import {
  BudgetPenarikanDanaApiError,
  fetchBudgetPenarikanDana,
  fetchBudgetPenarikanDanaMeta,
  saveBudgetPenarikanDanaBulk,
} from "@/services/budgetPenarikanDanaService";
import {
  formatPenarikanAmount,
  parsePenarikanInput,
  type BudgetPenarikanDanaMeta,
  type BudgetPenarikanDanaRow,
} from "@/types/budget-penarikan-dana";
import { cn } from "@/lib/cn";
import { tableGridHeaderClassName, tableGridShellClassName } from "@/components/ui/tableStyles";
import { LayoutGrid, List, Loader2, Save } from "lucide-react";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

type ViewMode = "rekap" | "detail";
type RencanaDraft = Record<string, string>;

function draftKey(paguKsroId: number, bulan: number) {
  return `${paguKsroId}-${bulan}`;
}

function getRencanaForCell(
  row: BudgetPenarikanDanaRow,
  bulan: number,
  draft: RencanaDraft
): number {
  const key = draftKey(row.pagu_ksro_id, bulan);
  if (key in draft) return parsePenarikanInput(draft[key]);
  const month = row.months.find((m) => m.bulan === bulan);
  return month?.rencana ?? 0;
}

type RecapRow = {
  bulan: number;
  nama_bulan: string;
  rencana: number;
  realisasi: number;
  selisih: number;
  capaian_pct: number | null;
};

function buildRecapRows(rows: BudgetPenarikanDanaRow[], draft: RencanaDraft): RecapRow[] {
  return MONTHS.map((bulan) => {
    let rencana = 0;
    let realisasi = 0;
    for (const row of rows) {
      rencana += getRencanaForCell(row, bulan, draft);
      const month = row.months.find((m) => m.bulan === bulan);
      realisasi += month?.realisasi ?? 0;
    }
    return {
      bulan,
      nama_bulan:
        rows[0]?.months.find((m) => m.bulan === bulan)?.nama_bulan ?? MONTH_NAMES[bulan],
      rencana,
      realisasi,
      selisih: rencana - realisasi,
      capaian_pct: rencana > 0 ? (realisasi / rencana) * 100 : null,
    };
  });
}

function CapaianCell({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-slate-300">—</span>;
  const clamped = Math.min(pct, 100);
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 md:block">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-emerald-500" : pct >= 75 ? "bg-blue-500" : "bg-amber-400"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="min-w-[2.5rem] tabular-nums text-[11px] font-medium text-slate-600">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function PenarikanRekapitulasiTable({ rows: recapRows }: { rows: RecapRow[] }) {
  const totals = useMemo(
    () =>
      recapRows.reduce(
        (acc, r) => ({
          rencana: acc.rencana + r.rencana,
          realisasi: acc.realisasi + r.realisasi,
        }),
        { rencana: 0, realisasi: 0 }
      ),
    [recapRows]
  );
  const totalCapaian =
    totals.rencana > 0 ? (totals.realisasi / totals.rencana) * 100 : null;

  return (
    <div className={cardClassName({ variant: "default", className: cn("!p-0", tableGridShellClassName) })}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">Rekapitulasi Bulanan</h3>
          <p className="text-[10px] text-slate-500">Januari — Desember</p>
        </div>
        <TableLegend
          items={[
            { color: "bg-emerald-500", label: "Rencana" },
            { color: "bg-blue-500", label: "Realisasi" },
          ]}
        />
      </div>
      <Table embedded>
        <THead>
          <TR>
            <TH className="w-14">Bln</TH>
            <TH className="text-right">Rencana</TH>
            <TH className="text-right">Realisasi</TH>
            <TH className="text-right">Selisih</TH>
            <TH className="w-32 text-right">Capaian</TH>
          </TR>
        </THead>
        <TBody>
          {recapRows.map((row) => {
            const hasData = row.rencana > 0 || row.realisasi > 0;
            return (
              <TR key={row.bulan}>
                <TD className="font-semibold text-slate-700">{row.nama_bulan}</TD>
                <TD className="text-right tabular-nums font-medium text-[#0d6e63]">
                  {hasData ? formatPenarikanAmount(row.rencana) : "—"}
                </TD>
                <TD className="text-right tabular-nums font-medium text-blue-700">
                  {hasData ? formatPenarikanAmount(row.realisasi) : "—"}
                </TD>
                <TD
                  className={cn(
                    "text-right tabular-nums text-[11px]",
                    !hasData
                      ? "text-slate-300"
                      : row.selisih < 0
                        ? "font-medium text-amber-700"
                        : "text-slate-600"
                  )}
                >
                  {hasData ? formatPenarikanAmount(row.selisih) : "—"}
                </TD>
                <TD className="text-right">
                  <CapaianCell pct={hasData ? row.capaian_pct : null} />
                </TD>
              </TR>
            );
          })}
          <TR className="bg-gradient-to-r from-sky-50/80 to-slate-50/50 font-semibold">
            <TD className="text-slate-800">Total</TD>
            <TD className="text-right tabular-nums text-[#0d6e63]">
              {formatPenarikanAmount(totals.rencana)}
            </TD>
            <TD className="text-right tabular-nums text-blue-700">
              {formatPenarikanAmount(totals.realisasi)}
            </TD>
            <TD className="text-right tabular-nums text-slate-700">
              {formatPenarikanAmount(totals.rencana - totals.realisasi)}
            </TD>
            <TD className="text-right">
              <CapaianCell pct={totalCapaian} />
            </TD>
          </TR>
        </TBody>
      </Table>
    </div>
  );
}

export function RencanaPenarikanRealisasiCrud() {
  const { budgetYearId } = useBudgetYearScope();
  const [meta, setMeta] = useState<BudgetPenarikanDanaMeta | null>(null);
  const [rows, setRows] = useState<BudgetPenarikanDanaRow[]>([]);
  const [draft, setDraft] = useState<RencanaDraft>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("rekap");
  const [filterPtk, setFilterPtk] = useState("");
  const [filterKelompok, setFilterKelompok] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    void fetchBudgetPenarikanDanaMeta()
      .then(setMeta)
      .catch((err) => {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Gagal memuat referensi.",
        });
      });
  }, []);

  const loadRows = useCallback(async () => {
    if (!budgetYearId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchBudgetPenarikanDana({
        budget_year_id: budgetYearId,
        ptk_id: filterPtk || undefined,
        kelompok_belanja_id: filterKelompok || undefined,
        jenis_belanja_id: filterJenis || undefined,
      });
      setRows(result.rows);
      setDraft({});
      setDirtyKeys(new Set());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memuat rencana penarikan dana.",
      });
    } finally {
      setLoading(false);
    }
  }, [budgetYearId, filterPtk, filterKelompok, filterJenis]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const jenisOptionsForKelompok = useCallback(
    (kelompokId: string) => {
      if (!meta) return [];
      if (!kelompokId) return meta.jenis_belanja;
      return meta.jenis_belanja.filter(
        (jb) => String(jb.kelompok_belanja_id) === kelompokId
      );
    },
    [meta]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.nama_satuan_ptk.toLowerCase().includes(q) ||
        row.kode_ksro.toLowerCase().includes(q) ||
        row.nama_ksro.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const recapRows = useMemo(
    () => buildRecapRows(filteredRows, draft),
    [filteredRows, draft]
  );

  const kpiTotals = useMemo(() => {
    const rencana = recapRows.reduce((s, r) => s + r.rencana, 0);
    const realisasi = recapRows.reduce((s, r) => s + r.realisasi, 0);
    const capaian = rencana > 0 ? `${((realisasi / rencana) * 100).toFixed(1)}%` : "—";
    return { rencana, realisasi, capaian };
  }, [recapRows]);

  const hasActiveFilters = Boolean(filterPtk || filterKelompok || filterJenis || search);

  const resetFilters = () => {
    setFilterPtk("");
    setFilterKelompok("");
    setFilterJenis("");
    setSearch("");
  };

  const getRencanaValue = (row: BudgetPenarikanDanaRow, bulan: number) => {
    const key = draftKey(row.pagu_ksro_id, bulan);
    if (key in draft) return draft[key];
    const month = row.months.find((m) => m.bulan === bulan);
    return month && month.rencana > 0 ? String(Math.trunc(month.rencana)) : "";
  };

  const patchRencana = (paguKsroId: number, bulan: number, value: string) => {
    const key = draftKey(paguKsroId, bulan);
    setDraft((prev) => ({ ...prev, [key]: value.replace(/[^\d]/g, "") }));
    setDirtyKeys((prev) => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (!budgetYearId || dirtyKeys.size === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      const items = Array.from(dirtyKeys).map((key) => {
        const [paguKsroId, bulan] = key.split("-");
        return {
          pagu_ksro_id: Number(paguKsroId),
          bulan: Number(bulan),
          rencana_penarikan: parsePenarikanInput(draft[key] ?? "0"),
        };
      });
      await saveBudgetPenarikanDanaBulk(budgetYearId, items);
      setMessage({ type: "success", text: "Rencana penarikan dana berhasil disimpan." });
      await loadRows();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof BudgetPenarikanDanaApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gagal menyimpan rencana.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <ToolbarShell
        footer={
          !loading && filteredRows.length > 0 ? (
            <ToolbarKpi
              items={[
                { label: "Baris", value: String(filteredRows.length), tone: "muted" },
                {
                  label: "Rencana",
                  value: formatPenarikanAmount(kpiTotals.rencana),
                  tone: "plan",
                },
                {
                  label: "Realisasi",
                  value: formatPenarikanAmount(kpiTotals.realisasi),
                  tone: "actual",
                },
                { label: "Capaian", value: kpiTotals.capaian, tone: "default" },
              ]}
            />
          ) : undefined
        }
      >
        <div className="flex flex-wrap items-end gap-2">
          <ToolbarSegmented<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                value: "rekap",
                label: "Rekapitulasi",
                shortLabel: "Rekap",
                icon: <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.25} />,
                hint: "Ringkasan agregat per bulan",
              },
              {
                value: "detail",
                label: "Detail KSRO",
                shortLabel: "Detail",
                icon: <List className="h-3.5 w-3.5" strokeWidth={2.25} />,
                hint: "Input rencana per baris KSRO",
              },
            ]}
          />
          {viewMode === "detail" && dirtyKeys.size > 0 && (
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="h-[30px] px-2.5 text-[11px]"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              {saving ? "..." : `Simpan (${dirtyKeys.size})`}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-x-3 gap-y-2 lg:border-l lg:border-slate-200/80 lg:pl-4">
          <ToolbarFilter label="Unit PTK" value={filterPtk} onChange={setFilterPtk}>
            <option value="">Semua</option>
            {(meta?.ptk ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_satuan_ptk}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter
            label="Kelompok"
            value={filterKelompok}
            onChange={(v) => {
              setFilterKelompok(v);
              setFilterJenis("");
            }}
          >
            <option value="">Semua</option>
            {(meta?.kelompok_belanja ?? []).map((k) => (
              <option key={k.id} value={k.id}>
                {k.kode_kelompok_belanja}
              </option>
            ))}
          </ToolbarFilter>
          <ToolbarFilter label="Jenis" value={filterJenis} onChange={setFilterJenis}>
            <option value="">Semua</option>
            {jenisOptionsForKelompok(filterKelompok).map((j) => (
              <option key={j.id} value={j.id}>
                {j.kode_jenis_belanja}
              </option>
            ))}
          </ToolbarFilter>
          {viewMode === "detail" && (
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="KSRO / unit..."
            />
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mb-0.5 text-[10px] font-medium text-sky-600 hover:text-sky-800 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </ToolbarShell>

      {message && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          )}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data...
        </div>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title="Belum ada data distribusi KSRO"
          description="Lengkapi Input Pagu Unit dan Distribusi Pagu terlebih dahulu."
          className="mt-0"
        />
      ) : viewMode === "rekap" ? (
        <PenarikanRekapitulasiTable rows={recapRows} />
      ) : (
        <div
          className={cardClassName({
            variant: "default",
            className: cn("!p-0 overflow-x-auto", tableGridShellClassName),
          })}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-800">Detail per KSRO</span>
              <TableLegend
                items={[
                  { color: "bg-emerald-400", label: "Rencana (input)" },
                  { color: "bg-blue-500", label: "Realisasi AJU" },
                ]}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleSave()}
              disabled={saving || dirtyKeys.size === 0}
              className="h-7 text-[11px]"
            >
              <Save className="mr-1 h-3.5 w-3.5" />
              Simpan
            </Button>
          </div>
          <table className="min-w-[1200px] w-full border-collapse text-xs">
            <thead>
              <tr className={tableGridHeaderClassName}>
                <th className="sticky left-0 z-10 min-w-[9rem] bg-gradient-to-b from-sky-500 to-sky-600 px-2.5 py-2 text-left text-[11px] font-semibold text-white">
                  Unit
                </th>
                <th className="min-w-[11rem] px-2.5 py-2 text-left text-[11px] font-semibold">
                  KSRO
                </th>
                <th className="min-w-[5.5rem] px-2 py-2 text-right text-[11px] font-semibold">
                  Pagu
                </th>
                {MONTHS.map((bulan) => (
                  <th
                    key={bulan}
                    className="min-w-[5.25rem] px-1 py-2 text-center text-[11px] font-semibold"
                  >
                    {MONTH_NAMES[bulan]}
                  </th>
                ))}
                <th className="min-w-[5rem] px-2 py-2 text-right text-[11px] font-semibold">
                  Σ
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rowIdx) => (
                <tr
                  key={row.pagu_ksro_id}
                  className={cn(
                    "border-b border-slate-100",
                    rowIdx % 2 === 1 ? "bg-slate-50/60" : "bg-white"
                  )}
                >
                  <td className="sticky left-0 z-[1] bg-inherit px-2.5 py-1 align-top text-[11px] font-medium text-slate-700">
                    {row.nama_satuan_ptk}
                  </td>
                  <td className="px-2.5 py-1 align-top">
                    <div className="font-mono text-[10px] text-slate-400">{row.kode_ksro}</div>
                    <div className="line-clamp-1 text-[11px] text-slate-800">{row.nama_ksro}</div>
                  </td>
                  <td className="px-2 py-1 text-right align-top tabular-nums text-[11px] font-medium text-[#0d6e63]">
                    {formatPenarikanAmount(row.pagu_ksro_total)}
                  </td>
                  {MONTHS.map((bulan) => {
                    const month = row.months.find((m) => m.bulan === bulan);
                    const realisasi = month?.realisasi ?? 0;
                    return (
                      <td key={bulan} className="px-0.5 py-1 align-top">
                        <Input
                          value={getRencanaValue(row, bulan)}
                          onChange={(e) =>
                            patchRencana(row.pagu_ksro_id, bulan, e.target.value)
                          }
                          className="h-6 border-slate-200/90 px-1 text-right text-[10px] tabular-nums shadow-none focus:ring-1"
                          placeholder="0"
                        />
                        <div className="mt-px text-right text-[9px] tabular-nums text-blue-600">
                          {realisasi > 0 ? formatPenarikanAmount(realisasi) : ""}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-right align-top tabular-nums">
                    <div className="text-[11px] font-medium text-[#0d6e63]">
                      {formatPenarikanAmount(row.total_rencana)}
                    </div>
                    <div className="text-[9px] text-blue-600">
                      {formatPenarikanAmount(row.total_realisasi)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
