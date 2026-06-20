"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BudgetSectionTabs } from "@/components/finance/budget/BudgetSectionTabs";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
} from "@/components/finance/budget/BudgetYearScope";
import { BlokirAnggaranCrud } from "@/components/finance/budget/perubahan/BlokirAnggaranCrud";
import { MonitoringPaguCrud } from "@/components/finance/budget/monitoring/MonitoringPaguCrud";
import { RiwayatPerubahanAnggaranCrud } from "@/components/finance/budget/monitoring/RiwayatPerubahanAnggaranCrud";
import { PergeseranPaguCrud } from "@/components/finance/budget/perubahan/PergeseranPaguCrud";
import { RevisiPaguCrud } from "@/components/finance/budget/perubahan/RevisiPaguCrud";
import { DistribusiPaguCrud } from "@/components/finance/budget/perencanaan/DistribusiPaguCrud";
import { RencanaPenarikanRealisasiCrud } from "@/components/finance/budget/perencanaan/RencanaPenarikanRealisasiCrud";
import { InputPaguUnitCrud } from "@/components/finance/budget/perencanaan/InputPaguUnitCrud";
import { SetupPaguCrud } from "@/components/finance/budget/perencanaan/SetupPaguCrud";
import { ProgramKegiatanCrud } from "@/components/finance/budget/referensi/ProgramKegiatanCrud";
import { FinanceMasterTable } from "@/components/finance/budget/referensi/FinanceMasterTable";
import { SumberDanaCrud } from "@/components/finance/budget/referensi/SumberDanaCrud";
import { TahunAnggaranCrud } from "@/components/finance/budget/referensi/TahunAnggaranCrud";
import { PageFrame } from "@/components/layout/PageFrame";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { BUDGET_YEAR_SCOPED_TABS, type BudgetModuleConfig } from "@/constants/budget-pages";
import { isFinanceMasterTab } from "@/types/finance-master";

type BudgetModulePageProps = {
  config: BudgetModuleConfig;
  initialTab?: string;
};

export function BudgetModulePage({ config, initialTab }: BudgetModulePageProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const defaultTab =
    config.sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ??
    config.sections[0]?.id ??
    "";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const next =
      config.sections.find((s) => s.id === tabFromUrl)?.id ?? config.sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, config.sections]);

  const sectionLabels = Object.fromEntries(
    config.sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const activeSection =
    config.sections.find((section) => section.id === activeTab) ?? config.sections[0];

  const isYearScoped = activeSection ? BUDGET_YEAR_SCOPED_TABS.has(activeSection.id) : false;

  const tabContent =
    activeSection?.id === "tahun-anggaran" ? (
      <TahunAnggaranCrud />
    ) : activeSection?.id === "sumber-dana" ? (
      <SumberDanaCrud />
    ) : activeSection?.id === "program-kegiatan" ? (
      <ProgramKegiatanCrud />
    ) : activeSection?.id === "setup-pagu" ? (
      <SetupPaguCrud />
    ) : activeSection?.id === "input-pagu-unit" ? (
      <InputPaguUnitCrud />
    ) : activeSection?.id === "distribusi-pagu" ? (
      <DistribusiPaguCrud />
    ) : activeSection?.id === "rencana-penarikan-realisasi" ? (
      <RencanaPenarikanRealisasiCrud />
    ) : activeSection?.id === "blokir-anggaran" ? (
      <BlokirAnggaranCrud />
    ) : activeSection?.id === "revisi-pagu" ? (
      <RevisiPaguCrud />
    ) : activeSection?.id === "pergeseran-pagu" ? (
      <PergeseranPaguCrud />
    ) : activeSection?.id === "monitoring-pagu" ? (
      <MonitoringPaguCrud />
    ) : activeSection?.id === "riwayat-perubahan-anggaran" ? (
      <RiwayatPerubahanAnggaranCrud />
    ) : activeSection && isFinanceMasterTab(activeSection.id) ? (
      <FinanceMasterTable tabId={activeSection.id} />
    ) : activeSection ? (
      <Card variant="dashed" className="mt-3 py-10 text-center sm:py-12">
        <CardTitle className="text-base sm:text-lg">
          {sectionLabels[activeSection.labelKey]}
        </CardTitle>
        <CardDescription className="mt-2">{activeSection.description}</CardDescription>
        <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
      </Card>
    ) : null;

  return (
    <PageFrame title={config.title} description={config.subtitle}>
      {isYearScoped ? (
        <BudgetYearScopeProvider>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
            <div className="min-w-0 flex-1">
              <BudgetSectionTabs
                sections={config.sections}
                labels={sectionLabels}
                activeId={activeTab}
                onChange={setActiveTab}
              />
            </div>
            <BudgetYearScopeBar compact className="lg:mb-0.5" />
          </div>
          <BudgetYearScopedContent>{tabContent}</BudgetYearScopedContent>
        </BudgetYearScopeProvider>
      ) : (
        <>
          <BudgetSectionTabs
            sections={config.sections}
            labels={sectionLabels}
            activeId={activeTab}
            onChange={setActiveTab}
          />
          {tabContent}
        </>
      )}
    </PageFrame>
  );
}
