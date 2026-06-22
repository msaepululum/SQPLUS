"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { getLeaveRequests } from "@/services/hr";
import type { LeaveRequest } from "@/types/hr";
import { Loader2, Palmtree } from "lucide-react";

export function HrLeaveTab() {
  const [rows, setRows] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaveRequests()
      .then((res) => setRows(res.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat pengajuan cuti...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Palmtree}
        title="Belum ada pengajuan cuti"
        description="Pengajuan cuti baru dapat dibuat setelah modul workflow cuti HRIS terhubung penuh."
      />
    );
  }

  return (
    <Card variant="default" className="!p-0 overflow-hidden">
      <Table embedded>
        <THead>
          <TR>
            <TH>Pegawai</TH>
            <TH>Jenis</TH>
            <TH>Mulai</TH>
            <TH>Selesai</TH>
            <TH>Hari</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => (
            <TR key={row.id}>
              <TD>{row.employee?.name ?? `#${row.employee_id}`}</TD>
              <TD>{row.leave_type?.name ?? "—"}</TD>
              <TD>{row.start_date}</TD>
              <TD>{row.end_date}</TD>
              <TD>{row.days_count}</TD>
              <TD>
                <Badge variant={row.status === "approved" ? "success" : "warning"}>
                  {row.status}
                </Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
