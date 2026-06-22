"use client";

import { HrAttendanceTab } from "@/components/hr/tabs/HrAttendanceTab";
import { HrEmployeeListTab } from "@/components/hr/tabs/HrEmployeeListTab";
import { HrExecutiveTab } from "@/components/hr/tabs/HrExecutiveTab";
import { HrLeaveTab } from "@/components/hr/tabs/HrLeaveTab";
import { HrPayrollPeriodsTab, HrSlipGajiTab } from "@/components/hr/tabs/HrPayrollTab";
import { HrPayrollTaxTab } from "@/components/hr/tabs/HrPayrollTaxTab";
import { HrProfileTab } from "@/components/hr/tabs/HrProfileTab";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { HrPageConfig } from "@/constants/hr-pages";
import type { HrPagePath } from "@/constants/hr-navigation";

type HrPageContentProps = {
  path: HrPagePath;
  config: HrPageConfig;
  activeTab?: string;
};

const PAYROLL_TABS = new Set([
  "periode-payroll",
  "komponen-gaji",
  "skema-gaji",
  "skema-ter",
  "proses-payroll",
  "validasi-payroll",
  "slip-gaji",
  "posting-keuangan",
  "riwayat-payroll",
  "perhitungan-pajak",
]);

export function HrPageContent({ path, config, activeTab }: HrPageContentProps) {
  switch (path) {
    case "data-pegawai":
      return <HrEmployeeListTab />;
    case "pegawai/profil":
      return <HrProfileTab />;
    case "pegawai/kehadiran":
      return <HrAttendanceTab hris />;
    case "pegawai/slip-gaji":
      return activeTab === "slip-gaji" || !activeTab ? <HrSlipGajiTab /> : <HrSlipGajiTab />;
    case "kehadiran":
      return <HrAttendanceTab fromHris />;
    case "atasan/kehadiran-tim":
      return <HrAttendanceTab fromHris />;
    case "cuti-izin/pengajuan":
    case "cuti-izin/riwayat":
    case "cuti-izin/approval":
    case "pegawai/lembur":
      return <HrLeaveTab />;
    case "payroll":
      if (activeTab === "skema-ter") return <HrPayrollTaxTab mode="schema" />;
      if (activeTab === "periode-payroll" || activeTab === "komponen-gaji" || activeTab === "skema-gaji") {
        return <HrPayrollPeriodsTab />;
      }
      return <HrPayrollTaxTab mode="schema" />;
    case "payroll/proses":
      if (activeTab === "perhitungan-pajak") return <HrPayrollTaxTab mode="calculation" />;
      if (activeTab === "slip-gaji") return <HrSlipGajiTab />;
      if (activeTab && PAYROLL_TABS.has(activeTab)) return <HrPayrollPeriodsTab />;
      return <HrPayrollTaxTab mode="calculation" />;
    case "laporan/payroll":
      return <HrPayrollTaxTab mode="calculation" />;
    case "pimpinan":
      return <HrExecutiveTab />;
    case "laporan/pegawai":
    case "laporan/kehadiran":
    case "laporan/executive-summary":
      return <HrExecutiveTab />;
    default:
      return <HrPlaceholder config={config} activeTab={activeTab} />;
  }
}

function HrPlaceholder({ config, activeTab }: { config: HrPageConfig; activeTab?: string }) {
  const section = config.sections?.find((s) => s.id === activeTab);

  return (
    <Card variant="dashed" className="py-6 text-center sm:py-8">
      <CardTitle className="text-base sm:text-lg">
        {section?.description ? config.title : config.title}
      </CardTitle>
      <CardDescription className="mt-2">
        {section?.description ?? config.subtitle}
      </CardDescription>
      <p className="mt-4 text-xs text-slate-400">
        Modul ini akan terhubung ke Payroll SIMRS / HRIS pada tahap berikutnya.
      </p>
    </Card>
  );
}
