"use client";

import { PageFrame } from "@/components/layout/PageFrame";
import { Card } from "@/components/ui/Card";
import { getAttendance } from "@/services/hr";
import type { AttendanceRecord } from "@/types/hr";
import { useEffect, useState } from "react";

const STATUS_LABEL: Record<string, string> = {
  present: "Hadir",
  late: "Terlambat",
  absent: "Tidak hadir",
  leave: "Cuti",
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAttendance({ date })
      .then((res) => setRecords(res.data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <PageFrame
      title="Absensi"
      description="Rekap kehadiran karyawan per tanggal."
    >
      <div className="mb-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <Card variant="flat" padding={false} className="overflow-x-auto">
        <table className="min-w-[40rem] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Check-in</th>
              <th className="px-4 py-3 font-medium">Check-out</th>
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
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Tidak ada data absensi.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.employee?.employee_code}
                  </td>
                  <td className="px-4 py-3">{r.employee?.name}</td>
                  <td className="px-4 py-3">{r.check_in?.slice(0, 5) ?? "—"}</td>
                  <td className="px-4 py-3">{r.check_out?.slice(0, 5) ?? "—"}</td>
                  <td className="px-4 py-3">
                    {STATUS_LABEL[r.status] ?? r.status}
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
