"use client";

import { useEffect, useState } from "react";
import { HrPayrollTaxMeCard } from "@/components/hr/tabs/HrPayrollTaxTab";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getPayrollMe, getPayrollPeriods } from "@/services/hr";
import type { PayrollItem, PayrollPeriod } from "@/types/hr";
import { Banknote, Loader2 } from "lucide-react";

function formatRp(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function HrSlipGajiTab() {
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPayrollMe()
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat slip gaji...
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <EmptyState
        icon={Banknote}
        title="Slip gaji belum tersedia"
        description="Slip gaji personal akan ditampilkan setelah akun ditautkan ke data pegawai Payroll."
      />
    );
  }

  return (
    <div className="space-y-3">
      <HrPayrollTaxMeCard />
      <Badge variant="info">SQ+ Payroll</Badge>
      <Card variant="default" className="!p-0 overflow-hidden">
        <Table embedded>
          <THead>
            <TR>
              <TH>Periode</TH>
              <TH>Gaji Pokok</TH>
              <TH>Tunjangan</TH>
              <TH>Potongan</TH>
              <TH>Netto</TH>
            </TR>
          </THead>
          <TBody>
            {items.map((item) => (
              <TR key={item.id}>
                <TD>{item.payroll_period?.name ?? item.payroll_period?.code ?? "—"}</TD>
                <TD>{formatRp(item.base_salary)}</TD>
                <TD>{formatRp(item.allowances)}</TD>
                <TD>{formatRp(item.deductions)}</TD>
                <TD className="font-semibold">{formatRp(item.net_salary)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}

export function HrPayrollPeriodsTab() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayrollPeriods()
      .then((res) => setPeriods(res.data))
      .catch(() => setPeriods([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat periode payroll...
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <EmptyState
        icon={Banknote}
        title="Belum ada periode payroll"
        description="Periode gaji akan muncul setelah proses payroll di SQ+ atau Payroll SIMRS."
      />
    );
  }

  return (
    <Card variant="default" className="!p-0 overflow-hidden">
      <Table embedded>
        <THead>
          <TR>
            <TH>Kode</TH>
            <TH>Nama</TH>
            <TH>Mulai</TH>
            <TH>Selesai</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {periods.map((p) => (
            <TR key={p.id}>
              <TD className="font-mono text-xs">{p.code}</TD>
              <TD>{p.name}</TD>
              <TD>{p.period_start}</TD>
              <TD>{p.period_end}</TD>
              <TD>
                <Badge variant={p.status === "closed" ? "draft" : "success"}>{p.status}</Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
