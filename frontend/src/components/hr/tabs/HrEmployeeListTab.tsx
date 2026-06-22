"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getEmployees } from "@/services/hr";
import type { Employee } from "@/types/hr";
import { formatHrNumber } from "@/types/hr";
import { Loader2, Search } from "lucide-react";

export function HrEmployeeListTab() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState("payroll");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees({ search: query || undefined, page, source: "payroll" });
      setRows(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
      setSource(res.source ?? "sqplus");
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[14rem] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">Cari pegawai</label>
          <Input
            placeholder="Nama, NRP, atau unit..."
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
        <Badge variant="info">{source === "payroll" ? "Payroll SIMRS" : "SQ+"}</Badge>
      </div>

      <Card variant="default" className="!p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat daftar pegawai...
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="Tidak ada pegawai" description="Coba ubah kata kunci pencarian." />
        ) : (
          <Table embedded>
            <THead>
              <TR>
                <TH>NRP</TH>
                <TH>Nama</TH>
                <TH>Unit</TH>
                <TH>Jabatan</TH>
                <TH>Profesi</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={`${row.employee_code}-${row.name}`}>
                  <TD className="font-mono text-xs">{row.employee_code}</TD>
                  <TD className="font-medium">{row.name}</TD>
                  <TD>{row.organizational_unit?.name || "—"}</TD>
                  <TD>{row.position?.name || "—"}</TD>
                  <TD>{row.profession || row.employee_type || "—"}</TD>
                  <TD>
                    <Badge variant="success">{row.employment_status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {total > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {formatHrNumber(total)} pegawai · halaman {page} / {lastPage}
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
    </div>
  );
}
