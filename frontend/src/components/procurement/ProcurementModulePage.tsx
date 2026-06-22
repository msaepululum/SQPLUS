"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BudgetYearScopeBar,
  BudgetYearScopeProvider,
  BudgetYearScopedContent,
} from "@/components/finance/budget/BudgetYearScope";
import { PageFrame } from "@/components/layout/PageFrame";
import { ProcurementSectionTabs } from "@/components/procurement/ProcurementSectionTabs";
import { ProcurementMonitoringTab } from "@/components/procurement/ProcurementMonitoringTab";
import { ProcurementNegosiasiTab } from "@/components/procurement/ProcurementNegosiasiTab";
import { ProcurementPenerimaanTab } from "@/components/procurement/ProcurementPenerimaanTab";
import { ProcurementPermintaanTab } from "@/components/procurement/ProcurementPermintaanTab";
import { ProcurementPoTab } from "@/components/procurement/ProcurementPoTab";
import { ProcurementVendorTab } from "@/components/procurement/ProcurementVendorTab";
import { useTranslation } from "@/components/providers/LocaleProvider";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import type { ProcurementModuleConfig } from "@/constants/procurement-pages";

const YEAR_SCOPED_SLUGS = new Set([
  "permintaan",
  "perencanaan",
  "hps-penawaran",
  "negosiasi",
  "po-spk-kontrak",
  "penerimaan",
  "monitoring",
  "laporan",
]);

type ProcurementModulePageProps = {
  config: ProcurementModuleConfig;
  initialTab?: string;
};

export function ProcurementModulePage({ config, initialTab }: ProcurementModulePageProps) {
  const isYearScoped = YEAR_SCOPED_SLUGS.has(config.slug);

  const inner = (
    <ProcurementModulePageInner
      config={config}
      initialTab={initialTab}
      isYearScoped={isYearScoped}
    />
  );

  if (!isYearScoped) {
    return inner;
  }

  return <BudgetYearScopeProvider>{inner}</BudgetYearScopeProvider>;
}

function ProcurementModulePageInner({
  config,
  initialTab,
  isYearScoped,
}: ProcurementModulePageProps & { isYearScoped: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sections = config.sections ?? [];
  const tabFromUrl = searchParams.get("tab");
  const defaultTab =
    sections.find((s) => s.id === (initialTab ?? tabFromUrl))?.id ?? sections[0]?.id ?? "";

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (!sections.length) return;
    const next = sections.find((s) => s.id === tabFromUrl)?.id ?? sections[0]?.id;
    if (next) setActiveTab(next);
  }, [tabFromUrl, sections]);

  const handleTabChange = useCallback(
    (id: string) => {
      setActiveTab(id);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const sectionLabels = Object.fromEntries(
    sections.map((section) => [section.labelKey, t(section.labelKey)])
  );

  const content = renderModuleContent(config.slug, activeTab, sections.length > 0);

  const body = (
    <PageFrame title={config.title} description={config.subtitle}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        <div className="min-w-0 flex-1">
          {sections.length > 1 && (
            <ProcurementSectionTabs
              sections={sections}
              labels={sectionLabels}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
        </div>
        {isYearScoped ? <BudgetYearScopeBar compact className="lg:mb-0.5" /> : null}
      </div>

      <div className={sections.length > 1 ? "mt-3" : ""}>{content}</div>
    </PageFrame>
  );

  if (!isYearScoped) {
    return body;
  }

  return <BudgetYearScopedContent>{body}</BudgetYearScopedContent>;
}

function renderModuleContent(slug: string, tab: string, hasSections: boolean) {
  switch (slug) {
    case "permintaan":
      return (
        <ProcurementPermintaanTab
          tab={(tab as "daftar" | "tracking" | "buat") || "daftar"}
        />
      );
    case "negosiasi":
      return <ProcurementNegosiasiTab />;
    case "po-spk-kontrak":
      return (
        <ProcurementPoTab
          jenis={
            tab === "spk" ? "spk" : tab === "kontrak" ? "kontrak" : tab === "po" ? "po" : "all"
          }
        />
      );
    case "penerimaan":
      return <ProcurementPenerimaanTab />;
    case "vendor":
      return <ProcurementVendorTab />;
    case "monitoring":
      return <ProcurementMonitoringTab />;
    default:
      return (
        <Card variant="dashed" className="py-6 text-center sm:py-8">
          <CardTitle className="text-base sm:text-lg">{slug}</CardTitle>
          <CardDescription className="mt-2">
            Modul {slug} — dalam pengembangan
          </CardDescription>
          {!hasSections ? (
            <p className="mt-4 text-xs text-slate-400">Dalam pengembangan</p>
          ) : null}
        </Card>
      );
  }
}
