"use client";

import { ChevronRight, Users } from "lucide-react";
import { HrInsightPanel } from "@/components/hr/HrInsightPanel";
import { InsightCardShell, SectionLink } from "@/components/beranda/BerandaCharts";
import type { HrDashboard } from "@/types/hr";

type InsightPersonaliaProps = {
  data: HrDashboard | null;
  loading?: boolean;
};

export function InsightPersonalia({ data, loading }: InsightPersonaliaProps) {
  return (
    <InsightCardShell
      icon={<Users className="h-4 w-4 text-violet-600" strokeWidth={2} />}
      iconBg="bg-violet-50"
      title="Insight Personalia"
      href="/hr"
    >
      <HrInsightPanel data={data} loading={loading} compact />

      <div className="mt-auto flex flex-wrap justify-center gap-3 text-center">
        <SectionLink href="/hr/data-pegawai">
          Data Pegawai <ChevronRight className="inline h-3 w-3" />
        </SectionLink>
        <SectionLink href="/hr/absensi">
          Absensi <ChevronRight className="inline h-3 w-3" />
        </SectionLink>
        <SectionLink href="/hr/payroll">
          Payroll <ChevronRight className="inline h-3 w-3" />
        </SectionLink>
      </div>
    </InsightCardShell>
  );
}
