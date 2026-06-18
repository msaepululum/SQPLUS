"use client";

import { PageFrame } from "@/components/layout/PageFrame";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { CardGrid } from "@/components/ui/CardGrid";
import { getPayrollPeriod, getPayrollPeriods } from "@/services/hr";
import type { PayrollPeriod } from "@/types/hr";
import { useEffect, useState } from "react";

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function PayrollPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selected, setSelected] = useState<PayrollPeriod | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayrollPeriods()
      .then((res) => {
        setPeriods(res.data);
        if (res.data[0]) {
          return getPayrollPeriod(res.data[0].id);
        }
        return null;
      })
      .then((detail) => setSelected(detail))
      .finally(() => setLoading(false));
  }, []);

  async function selectPeriod(id: number) {
    const detail = await getPayrollPeriod(id);
    setSelected(detail);
  }

  return (
    <PageFrame
      title="Penggajian"
      description="Periode gaji dan rincian slip karyawan."
    >
      {loading ? (
        <p className="text-sm text-slate-400">Memuat...</p>
      ) : (
        <CardGrid cols={3} className="lg:grid-cols-3">
          <div className="space-y-2">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPeriod(p.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  selected?.id === p.id
                    ? "border-sky-300 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">{p.code}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card variant="flat" padding={false} className="overflow-x-auto">
                <CardHeader className="border-b border-slate-100 px-4 py-3 sm:px-5">
                  <CardTitle>{selected.name}</CardTitle>
                  <CardDescription>
                    {selected.period_start} — {selected.period_end}
                  </CardDescription>
                </CardHeader>
                <CardContent scrollable>
                <table className="min-w-[40rem] w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Karyawan</th>
                      <th className="px-4 py-3 font-medium">Gaji pokok</th>
                      <th className="px-4 py-3 font-medium">Tunjangan</th>
                      <th className="px-4 py-3 font-medium">Potongan</th>
                      <th className="px-4 py-3 font-medium">Bersih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items ?? []).map((item) => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-4 py-3">{item.employee?.name}</td>
                        <td className="px-4 py-3">
                          {formatRupiah(item.base_salary)}
                        </td>
                        <td className="px-4 py-3">
                          {formatRupiah(item.allowances)}
                        </td>
                        <td className="px-4 py-3">
                          {formatRupiah(item.deductions)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatRupiah(item.net_salary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-slate-400">Pilih periode gaji.</p>
            )}
          </div>
        </CardGrid>
      )}
    </PageFrame>
  );
}
