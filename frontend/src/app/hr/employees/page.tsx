"use client";

import { PageFrame } from "@/components/layout/PageFrame";
import { Card } from "@/components/ui/Card";
import { getEmployees } from "@/services/hr";
import type { Employee } from "@/types/hr";
import { useEffect, useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  resigned: "Resign",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEmployees({ search: search || undefined })
      .then((res) => {
        setEmployees(res.data);
        setTotal(res.total);
      })
      .catch(() => {
        setEmployees([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <PageFrame
      title="Data Karyawan"
      description={`Daftar karyawan rumah sakit${total ? ` — ${total} pegawai` : ""}.`}
    >
      <div className="mb-3">
        <input
          type="search"
          placeholder="Cari nama atau kode pegawai..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <Card variant="flat" padding={false} className="overflow-x-auto">
        <table className="min-w-[40rem] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Unit Kerja</th>
              <th className="px-4 py-3 font-medium">Jabatan</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{emp.employee_code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {emp.name}
                  </td>
                  <td className="px-4 py-3">
                    {emp.organizational_unit?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{emp.position?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                      {STATUS_LABEL[emp.employment_status] ?? emp.employment_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </PageFrame>
  );
}
