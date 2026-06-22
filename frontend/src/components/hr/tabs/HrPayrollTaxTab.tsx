"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/cards/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName, CardDescription, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  getPayrollTaxEmployees,
  getPayrollTaxSchema,
  getPayrollTaxSummary,
} from "@/services/hr";
import type { HrPayrollTaxRow, HrPayrollTaxSchema, HrPayrollTaxSummary } from "@/types/hr";
import { formatHrCurrency, formatHrNumber } from "@/types/hr";
import { ExternalLink, Loader2, Receipt, Search } from "lucide-react";

type HrPayrollTaxTabProps = {
  mode?: "calculation" | "schema";
};

const MONTHS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Agu" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Okt" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Des" },
];

export function HrPayrollTaxTab({ mode = "calculation" }: HrPayrollTaxTabProps) {
  const now = new Date();
  const [tahun, setTahun] = useState(now.getFullYear());
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [schema, setSchema] = useState<HrPayrollTaxSchema | null>(null);
  const [summary, setSummary] = useState<HrPayrollTaxSummary | null>(null);
  const [rows, setRows] = useState<HrPayrollTaxRow[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [schemaRes, summaryRes] = await Promise.all([
        schema ? Promise.resolve(schema) : getPayrollTaxSchema(),
        getPayrollTaxSummary({ tahun, bulan }),
      ]);
      setSchema(schemaRes);
      setSummary(summaryRes);

      if (mode === "calculation") {
        const listRes = await getPayrollTaxEmployees({
          tahun,
          bulan,
          search: query || undefined,
          page,
        });
        setRows(listRes.data);
        setLastPage(listRes.last_page);
      }
    } catch {
      setSummary(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [schema, tahun, bulan, query, page, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !summary && !schema) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat skema TER & perhitungan pajak...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">Skema TER · PMK 168/2023</Badge>
        {summary?.source === "payroll" && <Badge variant="success">Payroll SIMRS</Badge>}
      </div>

      {mode === "schema" && schema && <TerSchemaPanel schema={schema} />}

      {mode === "calculation" && (
        <>
          <PeriodToolbar
            tahun={tahun}
            bulan={bulan}
            onTahunChange={(v) => {
              setPage(1);
              setTahun(v);
            }}
            onBulanChange={(v) => {
              setPage(1);
              setBulan(v);
            }}
          />

          {summary && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Pegawai diproses"
                  value={formatHrNumber(summary.kpi.jumlah_pegawai)}
                  hint={summary.period_name}
                />
                <StatCard
                  label="Total bruto"
                  value={formatHrCurrency(summary.kpi.total_bruto)}
                />
                <StatCard
                  label="Total PPh 21"
                  value={formatHrCurrency(summary.kpi.total_pph21_all ?? summary.kpi.total_pph21)}
                  hint="Potongan pajak pegawai"
                />
                <StatCard
                  label="Total bersih"
                  value={formatHrCurrency(summary.kpi.total_bersih)}
                />
              </div>

              <FinanceLinkCard link={summary.finance_link} />
            </>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[14rem] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Cari pegawai
              </label>
              <Input
                placeholder="Nama atau NRP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    setQuery(search);
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPage(1);
                setQuery(search);
              }}
            >
              <Search className="h-4 w-4" />
              Cari
            </Button>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Belum ada perhitungan pajak"
              description="Data PPh 21 periode ini belum tersedia di Payroll SIMRS."
            />
          ) : (
            <Card variant="default" className="!p-0 overflow-hidden">
              <Table embedded>
                <THead>
                  <TR>
                    <TH>NRP</TH>
                    <TH>Nama</TH>
                    <TH>PTKP</TH>
                    <TH>TER</TH>
                    <TH>Bruto</TH>
                    <TH>Tarif TER</TH>
                    <TH>PPh 21</TH>
                    <TH>Simulasi TER</TH>
                    <TH>Bersih</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((row) => (
                    <TR key={`${row.employee_code}-${row.bulan}`}>
                      <TD className="font-mono text-xs">{row.employee_code}</TD>
                      <TD>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-[10px] text-slate-400">{row.unit}</div>
                      </TD>
                      <TD>
                        <Badge variant="draft">{row.ptkp_code}</Badge>
                      </TD>
                      <TD>Kat. {row.ter_category}</TD>
                      <TD>{formatHrCurrency(row.penghasilan_bruto)}</TD>
                      <TD>{row.ter_rate}%</TD>
                      <TD className="font-semibold text-red-600">
                        {formatHrCurrency(row.pph21_total)}
                      </TD>
                      <TD className="text-slate-500">
                        {formatHrCurrency(row.pph21_ter_simulasi)}
                      </TD>
                      <TD>{formatHrCurrency(row.penghasilan_bersih)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </Card>
          )}

          {rows.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Halaman {page} / {lastPage}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={page >= lastPage || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PeriodToolbar({
  tahun,
  bulan,
  onTahunChange,
  onBulanChange,
}: {
  tahun: number;
  bulan: number;
  onTahunChange: (v: number) => void;
  onBulanChange: (v: number) => void;
}) {
  const years = [tahun - 1, tahun, tahun + 1];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {years.map((y) => (
          <Button
            key={y}
            type="button"
            variant={y === tahun ? "primary" : "secondary"}
            onClick={() => onTahunChange(y)}
          >
            {y}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {MONTHS.map((m) => (
          <Button
            key={m.value}
            type="button"
            variant={m.value === bulan ? "primary" : "secondary"}
            onClick={() => onBulanChange(m.value)}
          >
            {m.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function TerSchemaPanel({ schema }: { schema: HrPayrollTaxSchema }) {
  return (
    <div className="space-y-3">
      <Card variant="default" className="!p-4">
        <CardTitle className="text-sm">Skema {schema.scheme} PPh 21</CardTitle>
        <CardDescription className="mt-1">
          {schema.formula} · Berlaku {schema.effective_year}
        </CardDescription>
        <p className="mt-2 text-xs text-slate-500">{schema.finance_link.note}</p>
      </Card>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {schema.categories.map((cat) => (
          <Card key={cat.code} variant="default" className="!p-4">
            <CardTitle className="text-sm">
              {cat.label} ({cat.code})
            </CardTitle>
            <CardDescription className="mt-1">{cat.description}</CardDescription>
            <div className="mt-3 max-h-64 overflow-y-auto sq-scroll">
              <Table embedded>
                <THead>
                  <TR>
                    <TH>Tier</TH>
                    <TH>Maks. Bruto</TH>
                    <TH>Tarif</TH>
                  </TR>
                </THead>
                <TBody striped={false}>
                  {cat.brackets.map((b) => (
                    <TR key={b.tier}>
                      <TD>{b.tier}</TD>
                      <TD>
                        {b.max_bruto ? formatHrCurrency(b.max_bruto) : "∞"}
                      </TD>
                      <TD>{b.rate}%</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
            {cat.bracket_count > cat.brackets.length && (
              <p className="mt-2 text-[10px] text-slate-400">
                +{cat.bracket_count - cat.brackets.length} tier lainnya
              </p>
            )}
          </Card>
        ))}
      </div>

      <Card variant="default" className="!p-0 overflow-hidden">
        <div className="border-b border-slate-100 px-4 py-2">
          <CardTitle className="text-sm">Referensi PTKP (Payroll)</CardTitle>
        </div>
        <Table embedded>
          <THead>
            <TR>
              <TH>Kode</TH>
              <TH>Status</TH>
              <TH>PTKP/Tahun</TH>
              <TH>Kategori TER</TH>
            </TR>
          </THead>
          <TBody>
            {schema.ptkp_reference.map((p) => (
              <TR key={p.code}>
                <TD className="font-mono text-xs">{p.code}</TD>
                <TD>{p.name}</TD>
                <TD>{formatHrCurrency(p.ptkp_tahunan)}</TD>
                <TD>Kat. {p.ter_category}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}

function FinanceLinkCard({
  link,
}: {
  link: HrPayrollTaxSummary["finance_link"];
}) {
  const href = link.query
    ? `${link.path}?tahun=${link.query.tahun}&bulan=${link.query.bulan}`
    : link.path;

  return (
    <div
      className={cardClassName({
        variant: "default",
        className: "!p-4 flex flex-wrap items-center justify-between gap-3 border-emerald-100 bg-emerald-50/40",
      })}
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">Integrasi Keuangan</p>
        <p className="mt-1 text-xs text-slate-600">{link.note}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Kunci rekonsiliasi: <code>{link.reconciliation_key}</code>
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold tabular-nums text-emerald-700">
          {formatHrCurrency(link.total_pph21_payroll)}
        </p>
        <Link
          href={href}
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#0d6e63] hover:underline"
        >
          {link.label}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

export function HrPayrollTaxMeCard() {
  const [row, setRow] = useState<HrPayrollTaxRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/services/hr")
      .then(({ getPayrollTaxMe }) => getPayrollTaxMe())
      .then(setRow)
      .catch(() => setRow(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat potongan PPh 21...
      </div>
    );
  }

  if (!row) return null;

  return (
    <Card variant="default" className="!p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm">Potongan PPh 21 (TER)</CardTitle>
        <Badge variant="info">Kat. {row.ter_category} · {row.ter_rate}%</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TaxMini label="Bruto" value={formatHrCurrency(row.penghasilan_bruto)} />
        <TaxMini label="PPh 21" value={formatHrCurrency(row.pph21_total)} accent />
        <TaxMini label="PTKP" value={row.ptkp_code} />
        <TaxMini label="Bersih" value={formatHrCurrency(row.penghasilan_bersih)} />
      </div>
    </Card>
  );
}

function TaxMini({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${accent ? "text-red-600" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}
