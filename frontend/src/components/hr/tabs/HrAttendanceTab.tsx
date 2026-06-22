"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getAttendance } from "@/services/hr";
import type { AttendanceRecord } from "@/types/hr";
import { attendanceStatusLabel, attendanceStatusVariant } from "@/types/hr";
import { CalendarClock, Loader2 } from "lucide-react";

type HrAttendanceTabProps = {
  hris?: boolean;
  fromHris?: boolean;
};

export function HrAttendanceTab({ hris = false, fromHris = false }: HrAttendanceTabProps) {
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [source, setSource] = useState("sqplus");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAttendance(
      hris ? { hris: true } : fromHris ? { fromHris: true, page: 1 } : { page: 1 }
    )
      .then((res) => {
        setRows(res.data);
        setSource(res.source ?? "sqplus");
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [hris, fromHris]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat data kehadiran{hris ? " dari HRIS" : ""}...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Belum ada data absensi"
        description={
          hris
            ? "Data absensi HRIS tidak ditemukan untuk akun Anda."
            : "Belum ada log absensi tercatat."
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <Badge variant="info">{source === "hris" ? "HRIS" : "SQ+"}</Badge>
      <Card variant="default" className="!p-0 overflow-hidden">
        <Table embedded>
          <THead>
            <TR>
              {(fromHris || rows.some((r) => r.employee?.name)) && <TH>Pegawai</TH>}
              <TH>Tanggal</TH>
              <TH>Masuk</TH>
              <TH>Pulang</TH>
                {(hris || fromHris) && <TH>Shift</TH>}
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((row, idx) => (
              <TR key={row.id ?? `${row.date}-${idx}`}>
                {(fromHris || row.employee?.name) && (
                  <TD>{row.employee?.name ?? row.employee?.employee_code ?? "—"}</TD>
                )}
                <TD>{row.date}</TD>
                <TD>{row.check_in?.slice(0, 5) ?? "—"}</TD>
                <TD>{row.check_out?.slice(0, 5) ?? "—"}</TD>
                {(hris || fromHris) && <TD>{row.shift || "—"}</TD>}
                <TD>
                  <Badge variant={attendanceStatusVariant(row.status)}>
                    {attendanceStatusLabel(row.status)}
                  </Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
