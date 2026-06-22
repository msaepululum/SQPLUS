"use client";

import { useCallback, useEffect, useState } from "react";
import { cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { tableGridShellClassName } from "@/components/ui/tableStyles";
import { fetchAccMapping } from "@/services/accountingService";
import { formatAccNumber } from "@/types/accounting";
import { Loader2 } from "lucide-react";

export function AccountingMappingTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchAccMapping>> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAccMapping());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat mapping akun...
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState title="Gagal memuat data" description="Tidak dapat mengambil mapping dari ACC2026." />
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {data.module_mappings.map((m) => (
          <div key={m.module} className={cardClassName({ variant: "default", className: "!p-3" })}>
            <p className="text-xs font-medium text-slate-700">{m.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">Prefix COA: {m.coa_prefix}</p>
            <p className="text-lg font-semibold text-slate-800">{formatAccNumber(m.account_count)} akun</p>
            <p className="mt-1 text-[10px] text-slate-400">{m.source}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Akun Kas (vkas)</h3>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Kode</TH>
                <TH>Nama Akun</TH>
              </TR>
            </THead>
            <TBody>
              {data.kas_accounts.map((r) => (
                <TR key={r.account_no}>
                  <TD className="font-mono text-xs">{r.account_no}</TD>
                  <TD>{r.account_name}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-slate-800">Akun Bank (tbbank)</h3>
        <div className={tableGridShellClassName}>
          <Table>
            <THead>
              <TR>
                <TH>Kode COA</TH>
                <TH>Nama / Bank</TH>
                <TH>No. Rekening</TH>
              </TR>
            </THead>
            <TBody>
              {data.bank_accounts.map((r) => (
                <TR key={`${r.account_no}-${r.bank_account}`}>
                  <TD className="font-mono text-xs">{r.account_no}</TD>
                  <TD>{r.account_name}</TD>
                  <TD className="font-mono text-xs">{r.bank_account || "—"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">Sumber: {data.source}</p>
    </div>
  );
}
