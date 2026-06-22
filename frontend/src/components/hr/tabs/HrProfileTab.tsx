"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, cardClassName } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getEmployeeMe } from "@/services/hr";
import type { Employee } from "@/types/hr";
import { Loader2, UserCircle2 } from "lucide-react";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
}

export function HrProfileTab() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getEmployeeMe()
      .then(setEmployee)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat profil pegawai...
      </div>
    );
  }

  if (error || !employee) {
    return (
      <EmptyState
        icon={UserCircle2}
        title="Profil belum ditautkan"
        description="Akun login Anda belum terhubung ke data pegawai Payroll / HRIS. Hubungi SDM untuk penautan NRP."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card variant="default" className="!p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Data Kepegawaian</h3>
          <Badge variant="info">{employee.source_system === "payroll_tbpegawai" ? "Payroll" : "SQ+"}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="NRP / Kode" value={employee.employee_code} />
          <Field label="Nama" value={employee.name} />
          <Field label="Unit Kerja" value={employee.organizational_unit?.name} />
          <Field label="Jabatan" value={employee.position?.name} />
          <Field label="Status" value={employee.employment_status} />
          <Field label="Tanggal Masuk" value={employee.join_date} />
          <Field label="Email" value={employee.email} />
          <Field label="Telepon" value={employee.phone} />
        </div>
      </Card>

      {employee.leave_balances && employee.leave_balances.length > 0 && (
        <Card variant="default" className="!p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Saldo Cuti</h3>
          <div className="space-y-2">
            {employee.leave_balances.map((b) => (
              <div
                key={b.id}
                className={cardClassName({ variant: "default", className: "!p-3 flex justify-between" })}
              >
                <span className="text-sm text-slate-700">
                  {b.leave_type?.name ?? "Cuti"} ({b.year})
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {b.used_days}/{b.entitled_days} hari
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
